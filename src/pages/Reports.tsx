import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Chart, registerables } from 'chart.js';
import { useBarbershopReports } from '../hooks';
import styles from './Reports.module.css';

Chart.register(...registerables);

interface ReportsData {
  date_range: { start: string; end: string };
  revenue: {
    total_revenue: number;
    total_transactions: number;
    avg_transaction: number;
  };
  appointments: {
    total_appointments: number;
    completed_appointments: number;
    cancelled_appointments: number;
  };
  services: Array<{
    service: string;
    count: number;
    revenue: number;
  }>;
  staff_performance: Array<{
    barber_name: string;
    services_count: number;
    revenue: number;
  }>;
}

type DatePeriod = 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';

const Reports: React.FC = () => {
  const { loading, error, getReportsSummary, exportData, getDateRange } = useBarbershopReports();
  const [reportsData, setReportsData] = useState<ReportsData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<DatePeriod>('month');
  const [customDateRange, setCustomDateRange] = useState({
    start_date: '',
    end_date: ''
  });
  const [isExporting, setIsExporting] = useState(false);

  const serviceChartRef = useRef<HTMLCanvasElement>(null);
  const revenueChartRef = useRef<HTMLCanvasElement>(null);
  const serviceChartInstance = useRef<Chart | null>(null);
  const revenueChartInstance = useRef<Chart | null>(null);

  // Load reports data
  const loadReportsData = useCallback(async () => {
    try {
      let dateParams;
      if (selectedPeriod === 'custom') {
        if (!customDateRange.start_date || !customDateRange.end_date) return;
        dateParams = customDateRange;
      } else {
        dateParams = getDateRange(selectedPeriod);
      }

      const data = await getReportsSummary(dateParams);
      setReportsData(data);
    } catch (err) {
      console.error('Failed to load reports data:', err);
    }
  }, [selectedPeriod, customDateRange, getReportsSummary, getDateRange]);

  // Load data on mount and when period changes
  useEffect(() => {
    loadReportsData();
  }, [loadReportsData]);

  // Create service distribution chart
  useEffect(() => {
    if (serviceChartRef.current && reportsData?.services) {
      if (serviceChartInstance.current) {
        serviceChartInstance.current.destroy();
      }

      const ctx = serviceChartRef.current.getContext('2d');
      if (ctx && reportsData.services.length > 0) {
        serviceChartInstance.current = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: reportsData.services.map(s => s.service),
            datasets: [{
              data: reportsData.services.map(s => s.revenue),
              backgroundColor: [
                '#667eea', '#764ba2', '#f093fb', '#f5576c',
                '#4facfe', '#00f2fe', '#43e97b', '#38f9d7',
                '#fa709a', '#fee140', '#a8edea', '#fed6e3'
              ],
              borderWidth: 2,
              borderColor: '#fff'
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                  usePointStyle: true,
                  padding: 15,
                  font: { size: 12 }
                }
              },
              tooltip: {
                callbacks: {
                  label: (context) => {
                    const service = reportsData.services[context.dataIndex];
                    return `${service.service}: ₹${service.revenue.toLocaleString()} (${service.count} services)`;
                  }
                }
              }
            }
          }
        });
      }
    }

    return () => {
      if (serviceChartInstance.current) {
        serviceChartInstance.current.destroy();
      }
    };
  }, [reportsData?.services]);

  // Create revenue trend chart (simplified for now)
  useEffect(() => {
    if (revenueChartRef.current && reportsData?.revenue) {
      if (revenueChartInstance.current) {
        revenueChartInstance.current.destroy();
      }

      const ctx = revenueChartRef.current.getContext('2d');
      if (ctx) {
        revenueChartInstance.current = new Chart(ctx, {
          type: 'line',
          data: {
            labels: ['Revenue', 'Target'],
            datasets: [{
              label: 'Performance',
              data: [reportsData.revenue.total_revenue, reportsData.revenue.total_revenue * 1.2],
              borderColor: '#667eea',
              backgroundColor: 'rgba(102, 126, 234, 0.1)',
              tension: 0.4,
              fill: true
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false }
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  callback: (value) => `₹${Number(value).toLocaleString()}`
                }
              }
            }
          }
        });
      }
    }

    return () => {
      if (revenueChartInstance.current) {
        revenueChartInstance.current.destroy();
      }
    };
  }, [reportsData?.revenue]);

  const handlePeriodChange = (period: DatePeriod) => {
    setSelectedPeriod(period);
    if (period !== 'custom') {
      setCustomDateRange({ start_date: '', end_date: '' });
    }
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      let dateParams;
      if (selectedPeriod === 'custom') {
        dateParams = customDateRange;
      } else {
        dateParams = getDateRange(selectedPeriod);
      }

      const data = await exportData({ type: 'all', ...dateParams });
      
      // Create and download file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `barbershop-reports-${dateParams.start_date}-to-${dateParams.end_date}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const formatCurrency = (amount: number) => `₹${amount.toLocaleString()}`;
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString();

  if (error) {
    return (
      <div className={styles.reportsContainer}>
        <div className={styles.errorContainer}>
          <h3>Failed to load reports</h3>
          <p>{error}</p>
          <button className={styles.retryButton} onClick={loadReportsData}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.reportsContainer}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Business Reports</h1>
        <div className={styles.controls}>
          <div className={styles.dateRangeSelector}>
            {(['today', 'week', 'month', 'quarter', 'year', 'custom'] as DatePeriod[]).map(period => (
              <button
                key={period}
                className={`${styles.dateRangeButton} ${selectedPeriod === period ? styles.active : ''}`}
                onClick={() => handlePeriodChange(period)}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>
          
          {selectedPeriod === 'custom' && (
            <div className={styles.customDateRange}>
              <input
                type="date"
                className={styles.dateInput}
                value={customDateRange.start_date}
                onChange={(e) => setCustomDateRange(prev => ({ ...prev, start_date: e.target.value }))}
              />
              <span>to</span>
              <input
                type="date"
                className={styles.dateInput}
                value={customDateRange.end_date}
                onChange={(e) => setCustomDateRange(prev => ({ ...prev, end_date: e.target.value }))}
              />
            </div>
          )}

          <button
            className={styles.exportButton}
            onClick={handleExport}
            disabled={isExporting || loading}
          >
            {isExporting ? 'Exporting...' : '📊 Export Data'}
          </button>
        </div>
      </div>

      {loading && (
        <div className={styles.loadingContainer}>
          <p>Loading reports...</p>
        </div>
      )}

      {reportsData && (
        <>
          {/* Stats Cards */}
          <div className={styles.statsGrid}>
            <div className={styles.statsCard}>
              <div className={styles.statsContent}>
                <div className={`${styles.statsIcon} ${styles.revenue}`}>💰</div>
                <div className={styles.statsText}>
                  <div className={styles.statsTitle}>Total Revenue</div>
                  <div className={styles.statsValue}>
                    {formatCurrency(reportsData.revenue.total_revenue || 0)}
                  </div>
                  <div className={styles.statsSubtext}>
                    {reportsData.revenue.total_transactions || 0} transactions
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.statsCard}>
              <div className={styles.statsContent}>
                <div className={`${styles.statsIcon} ${styles.appointments}`}>📅</div>
                <div className={styles.statsText}>
                  <div className={styles.statsTitle}>Appointments</div>
                  <div className={styles.statsValue}>
                    {reportsData.appointments.total_appointments || 0}
                  </div>
                  <div className={styles.statsSubtext}>
                    {reportsData.appointments.completed_appointments || 0} completed
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.statsCard}>
              <div className={styles.statsContent}>
                <div className={`${styles.statsIcon} ${styles.services}`}>✂️</div>
                <div className={styles.statsText}>
                  <div className={styles.statsTitle}>Top Service</div>
                  <div className={styles.statsValue}>
                    {reportsData.services[0]?.service || 'N/A'}
                  </div>
                  <div className={styles.statsSubtext}>
                    {reportsData.services[0]?.count || 0} bookings
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.statsCard}>
              <div className={styles.statsContent}>
                <div className={`${styles.statsIcon} ${styles.performance}`}>📈</div>
                <div className={styles.statsText}>
                  <div className={styles.statsTitle}>Average Ticket</div>
                  <div className={styles.statsValue}>
                    {formatCurrency(reportsData.revenue.avg_transaction || 0)}
                  </div>
                  <div className={styles.statsSubtext}>
                    Period: {formatDate(reportsData.date_range.start)} - {formatDate(reportsData.date_range.end)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className={styles.chartsSection}>
            <div className={styles.chartCard}>
              <h3 className={styles.chartTitle}>📊 Service Distribution</h3>
              <div className={styles.chartContainer}>
                {reportsData.services.length > 0 ? (
                  <canvas ref={serviceChartRef}></canvas>
                ) : (
                  <div className={styles.noDataMessage}>No service data available</div>
                )}
              </div>
            </div>

            <div className={styles.chartCard}>
              <h3 className={styles.chartTitle}>💹 Revenue Overview</h3>
              <div className={styles.chartContainer}>
                <canvas ref={revenueChartRef}></canvas>
              </div>
            </div>
          </div>

          {/* Tables Section */}
          <div className={styles.tablesSection}>
            <div className={styles.tableCard}>
              <div className={styles.tableHeader}>
                <h3 className={styles.tableTitle}>Service Performance</h3>
              </div>
              <div className={styles.tableContent}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Service</th>
                      <th>Bookings</th>
                      <th>Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportsData.services.map((service, index) => (
                      <tr key={index}>
                        <td>{service.service}</td>
                        <td>{service.count}</td>
                        <td>{formatCurrency(service.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className={styles.tableCard}>
              <div className={styles.tableHeader}>
                <h3 className={styles.tableTitle}>Staff Performance</h3>
              </div>
              <div className={styles.tableContent}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Staff Member</th>
                      <th>Services</th>
                      <th>Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportsData.staff_performance.map((staff, index) => (
                      <tr key={index}>
                        <td>{staff.barber_name}</td>
                        <td>{staff.services_count}</td>
                        <td>
                          {formatCurrency(staff.revenue)}
                          <div className={styles.performanceBar}>
                            <div 
                              className={styles.performanceFill}
                              style={{ 
                                width: `${Math.min((staff.revenue / (reportsData.staff_performance[0]?.revenue || 1)) * 100, 100)}%` 
                              }}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Reports;
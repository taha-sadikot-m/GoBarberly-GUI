import React, { useState } from 'react';
import { useBarbershopReports } from '../hooks/useBarbershopReports';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Card from '../components/ui/Card';
import styles from './BarbershopReports.module.css';

const BarbershopReports: React.FC = () => {
  const {
    loading,
    error,
    generateReport,
    getReportsSummary
  } = useBarbershopReports();

  const [dateRange, setDateRange] = useState({
    start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0]
  });
  const [reportType, setReportType] = useState<'today' | 'week' | 'month' | 'quarter' | 'year'>('month');
  const [reportData, setReportData] = useState<any>(null);

  const handleGenerateReport = async () => {
    try {
      const data = await generateReport(reportType);
      console.log('Generated report data:', data);
      setReportData(data);
    } catch (error) {
      console.error('Failed to generate report:', error);
      alert('Failed to generate report. Please try again.');
    }
  };

  const handleGetSummary = async () => {
    try {
      const summary = await getReportsSummary(dateRange);
      console.log('Summary data:', summary);
      setReportData(summary);
    } catch (error) {
      console.error('Failed to get reports summary:', error);
      alert('Failed to get reports summary. Please try again.');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0);
  };

  if (loading) return <div className={styles.loading}>Loading reports...</div>;
  if (error) return <div className={styles.error}>Error loading reports: {error}</div>;

  return (
    <div className={styles.reports}>
      {/* Report Generation Controls */}
      <Card>
        <div className={styles.reportControls}>
          <h2>Generate Report</h2>
          <div className={styles.controlsGrid}>
            <label>
              Report Type
              <Select
                value={reportType}
                onChange={(e) => setReportType(e.target.value as any)}
                options={[
                  { value: 'today', label: "Today's Report" },
                  { value: 'week', label: 'Weekly Report' },
                  { value: 'month', label: 'Monthly Report' },
                  { value: 'quarter', label: 'Quarterly Report' },
                  { value: 'year', label: 'Yearly Report' }
                ]}
              />
            </label>

            <Button
              variant="primary"
              onClick={handleGenerateReport}
              className={styles.generateButton}
            >
              Generate Report
            </Button>
          </div>

          <div className={styles.summaryControls}>
            <h3>Custom Date Range Summary</h3>
            <div className={styles.dateControls}>
              <label>
                Start Date
                <Input
                  type="date"
                  value={dateRange.start_date}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start_date: e.target.value }))}
                />
              </label>

              <label>
                End Date
                <Input
                  type="date"
                  value={dateRange.end_date}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end_date: e.target.value }))}
                />
              </label>

              <Button
                variant="ghost"
                onClick={handleGetSummary}
              >
                Get Summary
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Report Results */}
      {reportData && (
        <>
          {/* Report Period Info */}
          {reportData.date_range && (
            <Card>
              <div style={{ textAlign: 'center', padding: '1rem' }}>
                <h3 style={{ margin: '0 0 0.5rem 0', color: '#334155' }}>
                  Report Period
                </h3>
                <p style={{ margin: 0, color: '#64748b', fontSize: '1.1rem' }}>
                  {new Date(reportData.date_range.start).toLocaleDateString()} - {new Date(reportData.date_range.end).toLocaleDateString()}
                </p>
              </div>
            </Card>
          )}

          {/* Key Metrics */}
          <div className={styles.metricsGrid}>
            <Card className={styles.metricCard}>
              <div className={styles.metricContent}>
                <div className={styles.metricText}>
                  <h3>Total Revenue</h3>
                  <p className={styles.metricValue}>
                    {formatCurrency(reportData.revenue?.total_revenue || 0)}
                  </p>
                  <p className={styles.metricPeriod}>Selected period</p>
                </div>
                <div className={styles.metricIcon}>💰</div>
              </div>
            </Card>

            <Card className={styles.metricCard}>
              <div className={styles.metricContent}>
                <div className={styles.metricText}>
                  <h3>Total Appointments</h3>
                  <p className={styles.metricValue}>
                    {reportData.appointments?.total_appointments || 0}
                  </p>
                  <p className={styles.metricPeriod}>Selected period</p>
                </div>
                <div className={styles.metricIcon}>📅</div>
              </div>
            </Card>

            <Card className={styles.metricCard}>
              <div className={styles.metricContent}>
                <div className={styles.metricText}>
                  <h3>Average Transaction</h3>
                  <p className={styles.metricValue}>
                    {formatCurrency(reportData.revenue?.avg_transaction || 0)}
                  </p>
                  <p className={styles.metricPeriod}>Per transaction</p>
                </div>
                <div className={styles.metricIcon}>📊</div>
              </div>
            </Card>

            <Card className={styles.metricCard}>
              <div className={styles.metricContent}>
                <div className={styles.metricText}>
                  <h3>Completed Appointments</h3>
                  <p className={styles.metricValue}>
                    {reportData.appointments?.completed_appointments || 0}
                  </p>
                  <p className={styles.metricPeriod}>
                    {reportData.appointments?.cancelled_appointments || 0} cancelled
                  </p>
                </div>
                <div className={styles.metricIcon}>✅</div>
              </div>
            </Card>
          </div>

          {/* Services Performance */}
          {reportData.services && reportData.services.length > 0 && (
            <Card>
              <h3>Services Performance</h3>
              <div className={styles.servicesGrid}>
                {reportData.services.map((service: any, index: number) => (
                  <div key={index} className={styles.serviceItem}>
                    <div className={styles.serviceName}>{service.service}</div>
                    <div className={styles.serviceRevenue}>
                      {formatCurrency(service.revenue)}
                    </div>
                    <div className={styles.serviceCount}>
                      {service.count} bookings
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Staff Performance */}
          {reportData.staff_performance && reportData.staff_performance.length > 0 && (
            <Card>
              <h3>Staff Performance</h3>
              <div className={styles.staffGrid}>
                {reportData.staff_performance.map((staff: any, index: number) => (
                  <div key={index} className={styles.staffItem}>
                    <div className={styles.staffName}>{staff.barber_name}</div>
                    <div className={styles.staffRevenue}>
                      {formatCurrency(staff.revenue)}
                    </div>
                    <div className={styles.staffCount}>
                      {staff.services_count} services
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}

      {!reportData && (
        <Card>
          <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon}>📊</div>
            <h3>No Report Generated</h3>
            <p>Generate a report to view analytics and business insights</p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default BarbershopReports;
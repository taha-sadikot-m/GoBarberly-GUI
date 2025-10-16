import React, { useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Chart, registerables } from 'chart.js';
import '../styles/globals.css';

Chart.register(...registerables);

const Reports: React.FC = () => {
  const { state } = useApp();
  const serviceChartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  // Calculate reports data
  const calculateReportsData = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Safely access data with fallback to empty arrays
    const sales = state.data?.sales || [];
    const appointments = state.data?.appointments || [];

    // Monthly revenue from current month sales
    const monthlyRevenue = sales
      .filter(sale => {
        const saleDate = new Date(sale.date);
        return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear;
      })
      .reduce((total, sale) => total + sale.amount, 0);

    // Service distribution from appointments
    const serviceCount: { [key: string]: number } = {};
    appointments.forEach(appointment => {
      serviceCount[appointment.service] = (serviceCount[appointment.service] || 0) + 1;
    });

    // Top service
    const topService = Object.entries(serviceCount).reduce((max, [service, count]) => 
      count > max.count ? { service, count } : max, { service: '—', count: 0 });

    // Barber performance from appointments
    const barberCount: { [key: string]: number } = {};
    appointments.forEach(appointment => {
      barberCount[appointment.barber] = (barberCount[appointment.barber] || 0) + 1;
    });

    // Top barber
    const topBarber = Object.entries(barberCount).reduce((max, [barber, count]) => 
      count > max.count ? { barber, count } : max, { barber: '—', count: 0 });

    // Average ticket from sales
    const avgTicket = sales.length > 0 
      ? sales.reduce((total, sale) => total + sale.amount, 0) / sales.length 
      : 0;

    return {
      monthlyRevenue,
      topService,
      topBarber,
      avgTicket,
      serviceCount
    };
  };

  const reportsData = calculateReportsData();

  // Create service distribution chart
  useEffect(() => {
    if (serviceChartRef.current) {
      // Destroy existing chart
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const ctx = serviceChartRef.current.getContext('2d');
      if (ctx) {
        const serviceNames = Object.keys(reportsData.serviceCount);
        const serviceCounts = Object.values(reportsData.serviceCount);

        // Only create chart if there's data
        if (serviceNames.length > 0) {
          chartInstance.current = new Chart(ctx, {
            type: 'doughnut',
            data: {
              labels: serviceNames,
              datasets: [{
                data: serviceCounts,
                backgroundColor: [
                  '#667eea',
                  '#ef4444',
                  '#10b981',
                  '#f59e0b',
                  '#8b5cf6',
                  '#22c55e',
                  '#06b6d4'
                ]
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'bottom',
                  labels: {
                    usePointStyle: true
                  }
                }
              }
            }
          });
        }
      }
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [reportsData.serviceCount]);

  return (
    <div className="section">
      {/* Reports Stats */}
      <div className="grid stats">
        <div className="card">
          <div className="stat-title">Monthly Revenue</div>
          <div className="stat-value">₹{reportsData.monthlyRevenue.toLocaleString()}</div>
        </div>
        <div className="card">
          <div className="stat-title">Top Service</div>
          <div className="stat-value">{reportsData.topService.service}</div>
          {reportsData.topService.count > 0 && (
            <div className="kicker">{reportsData.topService.count} bookings</div>
          )}
        </div>
        <div className="card">
          <div className="stat-title">Top Barber</div>
          <div className="stat-value">{reportsData.topBarber.barber}</div>
          {reportsData.topBarber.count > 0 && (
            <div className="kicker">{reportsData.topBarber.count} appointments</div>
          )}
        </div>
        <div className="card">
          <div className="stat-title">Average Ticket</div>
          <div className="stat-value">₹{Math.round(reportsData.avgTicket).toLocaleString()}</div>
        </div>
      </div>

      {/* Service Distribution Chart */}
      <div className="card" style={{ maxWidth: '560px', padding: '1rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Service Distribution</h3>
        <div style={{ height: '300px', width: '100%' }}>
          <canvas ref={serviceChartRef}></canvas>
        </div>
      </div>


    </div>
  );
};

export default Reports;
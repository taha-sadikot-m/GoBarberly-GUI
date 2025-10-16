import { Card } from '../../../components/ui';
import { BarChart, LineChart } from '../../../components/charts';
import { useAppointments, useSales } from '../../../hooks';
import type { ChartData } from '../../../types';

const DashboardCharts: React.FC = () => {
  const { appointments } = useAppointments();
  const { sales } = useSales();

  // Appointments by Service Chart Data
  const serviceStats = appointments.reduce((acc, appointment) => {
    acc[appointment.service] = (acc[appointment.service] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });

  const serviceChartData: ChartData = {
    labels: Object.keys(serviceStats),
    datasets: [
      {
        data: Object.values(serviceStats),
        backgroundColor: '#667eea',
        borderRadius: 4,
      },
    ],
  };

  // Appointments by Barber Chart Data
  const barberStats = appointments.reduce((acc, appointment) => {
    acc[appointment.barber] = (acc[appointment.barber] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });

  const barberChartData: ChartData = {
    labels: Object.keys(barberStats),
    datasets: [
      {
        data: Object.values(barberStats),
        backgroundColor: '#10b981',
        borderRadius: 4,
      },
    ],
  };

  // Weekly Sales Trend Chart Data
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dailySales = [0, 0, 0, 0, 0, 0, 0];

  sales.forEach(sale => {
    const day = new Date(sale.date).getDay();
    dailySales[day] += sale.amount;
  });

  const salesTrendData: ChartData = {
    labels: weekdays,
    datasets: [
      {
        label: 'Sales (₹)',
        data: dailySales,
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  return (
    <>
      <div className="grid charts">
        <Card className="chartwrap">
          <h3>Appointments by Service</h3>
          <BarChart data={serviceChartData} />
        </Card>

        <Card className="chartwrap">
          <h3>Appointments by Barber</h3>
          <BarChart data={barberChartData} />
        </Card>
      </div>

      <Card className="chartwrap">
        <h3>Weekly Sales Trend</h3>
        <LineChart data={salesTrendData} />
      </Card>
    </>
  );
};

export default DashboardCharts;
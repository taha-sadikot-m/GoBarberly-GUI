import BarbershopStatsCards from './components/BarbershopStatsCards';
import QuickActions from './components/QuickActions';
import DashboardCharts from './components/DashboardCharts';

const BarbershopDashboard: React.FC = () => {
  return (
    <>
      <BarbershopStatsCards />
      <QuickActions />
      <DashboardCharts />
    </>
  );
};

export default BarbershopDashboard;
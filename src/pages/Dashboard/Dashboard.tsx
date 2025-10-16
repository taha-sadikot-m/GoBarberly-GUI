import StatsCards from './components/StatsCards';
import QuickActions from './components/QuickActions';
import DashboardCharts from './components/DashboardCharts';

const Dashboard: React.FC = () => {
  return (
    <>
      <StatsCards />
      <QuickActions />
      <DashboardCharts />
    </>
  );
};

export default Dashboard;
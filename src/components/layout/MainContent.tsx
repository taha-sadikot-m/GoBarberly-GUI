import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Dashboard,
  Appointments,
  Sales,
  Staff,
  Inventory,
  Customers,
  Reports,
  History,
} from '../../pages';
import BarbershopDashboard from '../../pages/Dashboard/BarbershopDashboard';
import BarbershopAppointments from '../../pages/BarbershopAppointments';
import BarbershopSales from '../../pages/BarbershopSales';
import BarbershopStaff from '../../pages/BarbershopStaff';
import BarbershopInventory from '../../pages/BarbershopInventory';
import BarbershopCustomers from '../../pages/BarbershopCustomers';
import BarbershopReports from '../../pages/BarbershopReports';
import BarbershopHistory from '../../pages/BarbershopHistory';
import BarbershopServices from '../../pages/BarbershopServices';
import styles from '../../styles/components/MainContent.module.css';

const MainContent: React.FC = () => {
  const location = useLocation();
  const { state } = useAuth();
  
  const renderContent = () => {
    // 🚨 CRITICAL ROUTING DEBUG
    console.log('🗺️ MainContent Routing Debug:');
    console.log('📍 Current path:', location.pathname);
    console.log('👤 User:', state.user);
    console.log('🎭 User role:', state.user?.role);
    console.log('🔑 Is barbershop user?', state.user?.role === 'barbershop');
    
    switch (location.pathname) {
      case '/dashboard':
      case '/':
        // Use BarbershopDashboard for barbershop users, regular Dashboard for others
        const dashboardComponent = state.user?.role === 'barbershop' ? <BarbershopDashboard /> : <Dashboard />;
        console.log('🏠 Rendering Dashboard component for role:', state.user?.role);
        return dashboardComponent;
      case '/appointments':
        const appointmentComponent = state.user?.role === 'barbershop' ? <BarbershopAppointments /> : <Appointments />;
        console.log('📅 Rendering Appointment component for role:', state.user?.role, state.user?.role === 'barbershop' ? 'BarbershopAppointments' : 'Appointments');
        return appointmentComponent;
      case '/sales':
        return state.user?.role === 'barbershop' ? <BarbershopSales /> : <Sales />;
      case '/staff':
        return state.user?.role === 'barbershop' ? <BarbershopStaff /> : <Staff />;
      case '/inventory':
        return state.user?.role === 'barbershop' ? <BarbershopInventory /> : <Inventory />;
      case '/customers':
        return state.user?.role === 'barbershop' ? <BarbershopCustomers /> : <Customers />;
      case '/reports':
        return state.user?.role === 'barbershop' ? <BarbershopReports /> : <Reports />;
      case '/history':
        return state.user?.role === 'barbershop' ? <BarbershopHistory /> : <History />;
      case '/services':
        return state.user?.role === 'barbershop' ? <BarbershopServices /> : <div>Services not available for your role</div>;
      default:
        return state.user?.role === 'barbershop' ? <BarbershopDashboard /> : <Dashboard />;
    }
  };

  return (
    <main className={styles.main}>
      <section className={styles.content}>
        {renderContent()}
      </section>
    </main>
  );
};

export default MainContent;
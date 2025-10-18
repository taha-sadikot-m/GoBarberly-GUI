import { useLocation } from 'react-router-dom';
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
import styles from '../../styles/components/MainContent.module.css';

const MainContent: React.FC = () => {
  const location = useLocation();
  
  const renderContent = () => {
    switch (location.pathname) {
      case '/dashboard':
      case '/':
        return <Dashboard />;
      case '/appointments':
        return <Appointments />;
      case '/sales':
        return <Sales />;
      case '/staff':
        return <Staff />;
      case '/inventory':
        return <Inventory />;
      case '/customers':
        return <Customers />;
      case '/reports':
        return <Reports />;
      case '/history':
        return <History />;
      default:
        return <Dashboard />;
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
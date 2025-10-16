import { Routes, Route } from 'react-router-dom';
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
  return (
    <main className={styles.main}>
      <section className={styles.content}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/staff" element={<Staff />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/history" element={<History />} />
        </Routes>
      </section>
    </main>
  );
};

export default MainContent;
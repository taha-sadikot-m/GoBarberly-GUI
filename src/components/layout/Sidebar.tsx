import { Link, useLocation } from 'react-router-dom';
import styles from '../../styles/components/Sidebar.module.css';
import { clsx } from '../../utils';
import type { NavigationItem } from '../../types';

const navigationItems: NavigationItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊', path: '/dashboard' },
  { id: 'appointments', label: 'Appointments', icon: '📅', path: '/appointments' },
  { id: 'sales', label: 'Sales', icon: '💰', path: '/sales' },
  { id: 'staff', label: 'Staff', icon: '👥', path: '/staff' },
  { id: 'inventory', label: 'Inventory', icon: '📦', path: '/inventory' },
  { id: 'customers', label: 'Customers', icon: '👤', path: '/customers' },
  { id: 'reports', label: 'Reports', icon: '📈', path: '/reports' },
  { id: 'history', label: 'History', icon: '📋', path: '/history' },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen = true, onClose }) => {
  const location = useLocation();

  return (
    <aside className={clsx(styles.sidebar, isOpen && styles.open)}>
      <div className={styles.sidebarHeader}>
        <div className={styles.logo}>
          <span className={styles.icon}>💇</span>
          <span className={styles.text}>goBarberly</span>
        </div>
      </div>
      
      <nav className={styles.nav}>
        {navigationItems.map((item) => (
          <Link
            key={item.id}
            to={item.path}
            className={clsx(
              styles.navItem,
              location.pathname === item.path && styles.active
            )}
            onClick={onClose}
          >
            <span className={styles.ni}>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
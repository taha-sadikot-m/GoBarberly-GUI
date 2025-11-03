import { Link, useLocation } from 'react-router-dom';
import styles from '../../styles/components/Sidebar.module.css';
import { clsx } from '../../utils';
import type { NavigationItem } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useBarbershopProfile } from '../../hooks/useBarbershopProfile';

const navigationItems: NavigationItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊', path: '/dashboard' },
  { id: 'appointments', label: 'Appointments', icon: '📅', path: '/appointments' },
  { id: 'sales', label: 'Sales', icon: '💰', path: '/sales' },
  { id: 'services', label: 'Services', icon: '✂️', path: '/services' },
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
  const { state: authState } = useAuth();
  
  // Check if user is a barbershop user  
  const isBarbershopUser = authState.user?.role === 'barbershop';
  
  // Fetch barbershop profile for additional data
  const { profile: barbershopProfile } = useBarbershopProfile(isBarbershopUser);

  // Get barbershop logo, name, and owner info (auth data first, then profile data)
  const rawLogo = isBarbershopUser ? (
    authState.user?.shopLogo || 
    authState.user?.shop_logo || 
    barbershopProfile?.shop_logo
  ) : null;
  
  const barbershopName = isBarbershopUser ? (
    authState.user?.shopName || 
    authState.user?.shop_name || 
    barbershopProfile?.shop_name
  ) : null;

  const ownerName = isBarbershopUser ? (
    authState.user?.shopOwnerName || 
    authState.user?.shop_owner_name || 
    barbershopProfile?.shop_owner_name
  ) : null;
  
  // Handle logo URL - make it absolute if it's relative
  const barbershopLogo = rawLogo ? (
    rawLogo.startsWith('http') ? rawLogo : `http://127.0.0.1:8000${rawLogo.startsWith('/') ? '' : '/'}${rawLogo}`
  ) : null;

  return (
    <aside className={clsx(styles.sidebar, isOpen && styles.open)}>
      <div className={styles.sidebarHeader}>
        <div className={styles.logo}>
          {barbershopLogo ? (
            <>
              <img 
                src={barbershopLogo} 
                alt={barbershopName || 'Barbershop Logo'} 
                className={styles.logoImage}
                onError={(e) => {
                  // Fallback to default logo if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) {
                    fallback.classList.remove(styles.hidden);
                  }
                }}
              />
              <div className={clsx(styles.defaultLogo, styles.hidden)}>
                <span className={styles.icon}>💇</span>
                <span className={styles.text}>{barbershopName || 'goBarberly'}</span>
              </div>
            </>
          ) : isBarbershopUser && barbershopName ? (
            <div className={styles.barbershopBrand}>
              <div className={styles.shopIcon}>
                <span className={styles.icon}>💇‍♂️</span>
              </div>
              <div className={styles.shopInfo}>
                <span className={styles.shopName}>{barbershopName}</span>
                <span className={styles.shopTagline}>
                  {ownerName ? `Owned by ${ownerName}` : 'Barbershop Management'}
                </span>
              </div>
            </div>
          ) : (
            <>
              <span className={styles.icon}>💇</span>
              <span className={styles.text}>goBarberly</span>
            </>
          )}
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
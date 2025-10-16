import React from 'react';
import styles from '../../styles/components/Badge.module.css';
import { clsx } from '../../utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warn' | 'danger' | 'info';
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'info', 
  className 
}) => {
  return (
    <span className={clsx(styles.badge, styles[variant], className)}>
      {children}
    </span>
  );
};

export default Badge;
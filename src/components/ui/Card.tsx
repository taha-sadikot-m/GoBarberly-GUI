import React from 'react';
import styles from '../../styles/components/Card.module.css';
import { clsx } from '../../utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}

const Card: React.FC<CardProps> = ({ children, className, onClick, style }) => {
  return (
    <div 
      className={clsx(styles.card, className, onClick && styles.clickable)}
      onClick={onClick}
      style={style}
    >
      {children}
    </div>
  );
};

export default Card;
import React from 'react';
import type { ButtonProps } from '../../types';
import styles from '../../styles/components/Button.module.css';
import { clsx } from '../../utils';

const Button: React.FC<ButtonProps> = ({
  variant = 'ghost',
  size = 'md',
  children,
  onClick,
  disabled = false,
  type = 'button',
  className,
  ...props
}) => {
  return (
    <button
      type={type}
      className={clsx(
        styles.btn,
        styles[variant],
        styles[size],
        className
      )}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
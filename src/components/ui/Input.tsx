import React from 'react';
import type { InputProps } from '../../types';
import styles from '../../styles/components/Input.module.css';
import { clsx } from '../../utils';

const Input: React.FC<InputProps> = ({
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  className,
  id,
  name,
  step,
  disabled = false,
  ...props
}) => {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className={clsx(styles.input, className)}
      id={id}
      name={name}
      step={step}
      disabled={disabled}
      {...props}
    />
  );
};

export default Input;
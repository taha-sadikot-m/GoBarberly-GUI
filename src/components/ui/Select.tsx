import React from 'react';
import type { SelectProps } from '../../types';
import styles from '../../styles/components/Select.module.css';
import { clsx } from '../../utils';

const Select: React.FC<SelectProps> = ({
  value,
  onChange,
  options,
  className,
  id,
  required = false,
  ...props
}) => {
  return (
    <select
      value={value}
      onChange={onChange}
      className={clsx(styles.select, className)}
      id={id}
      required={required}
      {...props}
    >
      {options.map((option, index) => (
        <option 
          key={index} 
          value={option.value}
          data-price={option['data-price']}
        >
          {option.label}
        </option>
      ))}
    </select>
  );
};

export default Select;
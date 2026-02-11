
import { forwardRef, InputHTMLAttributes } from 'react';
import styles from './Input.module.scss';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, ...props }, ref) => (
    <div className={styles.wrapper}>
      {label && (
        <label className={styles.label}>
          {label}
          {props.required && <span className={styles.required}>*</span>}
        </label>
      )}
      <input ref={ref} className={`${styles.input} ${error ? styles.hasError : ''}`} {...props} />
      {error && <span className={styles.error}>{error}</span>}
    </div>
  )
);

Input.displayName = 'Input';

// src/components/ui/Card.tsx

import { ReactNode } from 'react';
import styles from './Card.module.scss';

interface CardProps {
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
  children: ReactNode;
}

export function Card({ title, subtitle, icon, children }: CardProps) {
  return (
    <div className={styles.card}>
      {(title || icon) && (
        <div className={styles.header}>
          {icon && <div className={styles.icon}>{icon}</div>}
          <div>
            {title && <h3 className={styles.title}>{title}</h3>}
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </div>
        </div>
      )}
      {children}
    </div>
  );
}

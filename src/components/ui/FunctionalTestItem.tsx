// src/components/ui/FunctionalTestItem.tsx

import { Check, X } from 'lucide-react';
import styles from './FunctionalTestItem.module.scss';

interface FunctionalTestItemProps {
  id: string;
  name: string;
  icon: string;
  result?: 'pass' | 'fail';
  onResult: (id: string, result: 'pass' | 'fail') => void;
}

export function FunctionalTestItem({ id, name, icon, result, onResult }: FunctionalTestItemProps) {
  return (
    <div className={`${styles.item} ${result ? styles[result] : ''}`}>
      <span className={styles.icon}>{icon}</span>
      <span className={styles.name}>{name}</span>
      <div className={styles.buttons}>
        <button
          type="button"
          className={`${styles.btn} ${styles.passBtn} ${result === 'pass' ? styles.active : ''}`}
          onClick={() => onResult(id, 'pass')}
        >
          <Check size={16} />
        </button>
        <button
          type="button"
          className={`${styles.btn} ${styles.failBtn} ${result === 'fail' ? styles.active : ''}`}
          onClick={() => onResult(id, 'fail')}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}

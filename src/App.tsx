import { useEffect } from 'react';
import { PTIForm } from './components/form/PTIForm';
import { useTelegram } from './hooks/useTelegram';
import styles from './App.module.scss';

function App() {
  const { user, theme } = useTelegram();

  useEffect(() => {
    if (theme) {
      const root = document.documentElement;
      if (theme.bg_color) root.style.setProperty('--tg-bg', theme.bg_color);
      if (theme.text_color) root.style.setProperty('--tg-text', theme.text_color);
    }
  }, [theme]);

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1 className={styles.title}>🚛 Pre-Trip Inspection</h1>
        {user && <p className={styles.greeting}>Hello, {user.first_name}</p>}
      </header>

      <main className={styles.main}>
        <PTIForm />
      </main>
    </div>
  );
}

export default App;

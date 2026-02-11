// hooks/useTelegram.ts
import { useEffect, useCallback, useState } from 'react';
import type { TelegramWebApp } from '../types';

export function useTelegram() {
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
      setWebApp(tg);
      setIsReady(true);
      console.log('Telegram WebApp ready', tg.initDataUnsafe?.user);
    } else {
      console.log('Not running inside Telegram WebApp');
      setIsReady(true); // allow normal browser
    }
  }, []);

  const sendData = useCallback(
    (data: object) => {
      if (webApp) {
        webApp.sendData(JSON.stringify(data));
        console.log('Telegram WebApp sendData:', data);
      } else {
        console.log('Send Data fallback:', data);
      }
    },
    [webApp]
  );

  const haptic = useCallback((type: 'success' | 'error' | 'light') => {
    try {
      if (!webApp?.HapticFeedback) return;
      if (type === 'success' || type === 'error') {
        webApp.HapticFeedback.notificationOccurred(type);
      } else {
        webApp.HapticFeedback.impactOccurred(type);
      }
    } catch (error) {
      console.log('Haptic error', error);
    }
  }, [webApp]);

  return {
    webApp,
    user: webApp?.initDataUnsafe?.user ?? null,
    theme: webApp?.themeParams,
    sendData,
    haptic,
    isReady,
  };
}

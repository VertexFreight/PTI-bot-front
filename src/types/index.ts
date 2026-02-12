// src/types/index.ts

export interface PhotoShot {
  id: string;
  name: string;
  description: string;
  category: 'tractor' | 'coupling' | 'trailer';
  required: boolean;
}

export interface PhotoData {
  file: File;
  preview: string;
}

export interface TelegramWebApp {
  ready: () => void;
  expand: () => void;
  close: () => void;
  sendData: (data: string) => void;
  HapticFeedback?: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy') => void;
    notificationOccurred: (type: 'success' | 'warning' | 'error') => void;
  };
  themeParams?: {
    bg_color?: string;
    text_color?: string;
    hint_color?: string;
    button_color?: string;
    secondary_bg_color?: string;
  };
  initDataUnsafe?: {
    user?: { id: number; first_name: string };
  };
}

declare global {
  interface Window {
    Telegram?: { WebApp: TelegramWebApp };
  }
}

export interface FormData {
  driverName: string;
  unitNumber: string;
  trailerNumber: string;
  odometer: number;
}

export interface CheckItem {
  id: string;
  label: string;
  description: string;
  category: string;
  critical: boolean;
}
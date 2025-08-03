import { Workbox } from 'workbox-window';

export function registerSW() {
  if ('serviceWorker' in navigator && import.meta.env?.PROD) {
    const wb = new Workbox('/sw.js');

    wb.addEventListener('installed', (event) => {
      if (event.isUpdate) {
        if (confirm('New version available! Click OK to refresh.')) {
          window.location.reload();
        }
      }
    });

    wb.addEventListener('waiting', () => {
      if (confirm('New version available! Click OK to refresh.')) {
        wb.messageSkipWaiting();
        window.location.reload();
      }
    });

    wb.register();
  }
}

export function saveGameState(key: string, data: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save game state:', error);
  }
}

export function loadGameState(key: string) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to load game state:', error);
    return null;
  }
}

export function clearGameState(key: string) {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to clear game state:', error);
  }
}
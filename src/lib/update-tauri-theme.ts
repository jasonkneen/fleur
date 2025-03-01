import { getCurrentWindow, Theme } from '@tauri-apps/api/window';

export const updateTauriTheme = async (theme: string) => {
  try {
    if (theme === 'dark' || theme === 'light' || theme === 'system') {
      const currentWindow = getCurrentWindow();
      
      if (theme === 'system' || theme === null) {
        await currentWindow.setTheme(null);
      } else {
        await currentWindow.setTheme(theme as Theme);
      }
    }
  } catch (error) {
    console.error('Failed to update Tauri window theme:', error);
  }
};
import { invoke } from '@tauri-apps/api/core';
import { Store } from '@tanstack/store';

import type { AppState } from '@/types/app-state';

const initialAppStatuses = {
  installed: {} as Record<string, boolean>,
  configured: {} as Record<string, boolean>,
};

export const appStore = new Store<AppState>({
  searchQuery: '',
  installedApps: [],
  hasInitializedInstalledApps: false,
  appStatuses: initialAppStatuses,
  isLoadingStatuses: true,
});

export const loadAppStatuses = async () => {
  try {
    const result = await invoke<{
      installed: Record<string, boolean>;
      configured: Record<string, boolean>;
    }>('get_app_statuses');

    appStore.setState((state) => ({
      ...state,
      appStatuses: {
        installed: result.installed ?? {},
        configured: result.configured ?? {},
      },
      isLoadingStatuses: false,
    }));
  } catch (error) {
    console.error('Failed to load app statuses:', error);
    appStore.setState((state) => ({
      ...state,
      appStatuses: initialAppStatuses,
      isLoadingStatuses: false,
    }));
  }
};

export const updateAppInstallation = (appName: string, isInstalled: boolean) => {
  appStore.setState((state) => ({
    ...state,
    appStatuses: {
      ...state.appStatuses,
      installed: {
        ...state.appStatuses.installed,
        [appName]: isInstalled,
      },
    },
  }));
};

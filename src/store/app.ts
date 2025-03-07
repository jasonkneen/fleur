import { invoke } from '@tauri-apps/api/core';
import { Store } from '@tanstack/store';

import type { AppState } from '@/types/app-state';
import type { App } from '@/types/components/app';
import { isOnboardingCompleted as checkOnboardingCompleted, markOnboardingCompleted as markOnboardingDone } from '@/lib/onboarding';

const initialAppStatuses = {
  installed: {} as Record<string, boolean>,
  configured: {} as Record<string, boolean>,
};

export const appStore = new Store<AppState>({
  installedApps: [],
  hasInitializedInstalledApps: false,
  appStatuses: initialAppStatuses,
  isLoadingStatuses: true,
  apps: [],
  isLoadingApps: true,
  isOnboardingCompleted: checkOnboardingCompleted(),
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

export const loadApps = async () => {
  try {
    appStore.setState((state) => ({
      ...state,
      isLoadingApps: true,
    }));

    // The Rust function returns a Value, which is a JSON value
    // We need to cast it to App[] after receiving it
    const result = await invoke('get_app_registry');
    const apps = result as App[];
    
    console.log('Loaded apps:', apps);
    
    appStore.setState((state) => ({
      ...state,
      apps,
      isLoadingApps: false,
    }));

    return apps;
  } catch (error) {
    console.error('Failed to load apps:', error);
    appStore.setState((state) => ({
      ...state,
      apps: [],
      isLoadingApps: false,
    }));
    return [];
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

export const refreshApps = async () => {
  try {
    appStore.setState((state) => ({
      ...state,
      isLoadingApps: true,
    }));

    const result = await invoke('refresh_app_registry');
    const apps = result as App[];
    
    console.log('Refreshed apps:', apps);
    
    appStore.setState((state) => ({
      ...state,
      apps,
      isLoadingApps: false,
    }));

    // Also refresh the app statuses
    await loadAppStatuses();

    return apps;
  } catch (error) {
    console.error('Failed to refresh apps:', error);
    appStore.setState((state) => ({
      ...state,
      isLoadingApps: false,
    }));
    throw error;
  }
};

export const completeOnboarding = () => {
  markOnboardingDone();
  appStore.setState((state) => ({
    ...state,
    isOnboardingCompleted: true,
  }));
};

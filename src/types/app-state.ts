import { App } from "./components/app";

interface AppState {
  installedApps: string[];
  hasInitializedInstalledApps: boolean;
  appStatuses: {
    installed: Record<string, boolean>;
    configured: Record<string, boolean>;
  };
  isLoadingStatuses: boolean;
  apps: App[];
  isLoadingApps: boolean;
}

export type { AppState };

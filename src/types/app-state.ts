interface AppState {
  searchQuery: string;
  installedApps: string[];
  hasInitializedInstalledApps: boolean;
  appStatuses: {
    installed: Record<string, boolean>;
    configured: Record<string, boolean>;
  };
  isLoadingStatuses: boolean;
}

export type { AppState };

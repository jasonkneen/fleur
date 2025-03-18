import { ClientType } from "@/types/clients";
import { App } from "@/types/components/app";

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
  isOnboardingCompleted: boolean;
  currentClient: ClientType;
}

export type { AppState };

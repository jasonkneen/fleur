import { LucideIcon } from 'lucide-react';

export interface App {
  name: string;
  description: string;
  stars: number;
  icon: {
    type: 'url' | 'lucide';
    url?: string;
    icon?: LucideIcon;
  };
  category: string;
  price: string;
  developer: string;
}

export interface AppListItemProps {
  app: App;
  isConfigured: boolean;
  isInstalled: boolean;
  onInstallationChange: (isInstalled: boolean) => void;
}

export interface AppIconProps {
  app: App;
}

export interface AppInstallButtonProps {
  app: App;
  isConfigured: boolean;
  isInstalled: boolean;
  onInstallationChange: (isInstalled: boolean) => void;
}

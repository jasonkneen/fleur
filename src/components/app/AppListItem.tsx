import { Link } from '@tanstack/react-router';
import { Card, CardContent } from '@/components/ui/card';
import { AppInstallButton } from './AppInstallButton';
import { AppIcon } from './AppIcon';

import type { App } from "@/types/components/app";

interface AppListItemProps {
  app: App;
  isConfigured: boolean;
  isInstalled: boolean;
  onAppSelect: (app: App) => void;
  onInstallationChange: (isInstalled: boolean) => void;
}

export function AppListItem({
  app,
  isConfigured,
  isInstalled,
  onInstallationChange,
}: AppListItemProps) {
  return (
    <Card className="border-transparent bg-transparent shadow-none hover:shadow-sm transition-shadow duration-200">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <Link
            className="flex-1 flex items-center gap-4"
            to="/app/$name"
            params={{ name: app.name }}
            >
            <div className="w-10 h-10 rounded-md overflow-hidden bg-gray-50 dark:bg-zinc-800 shadow-sm flex items-center justify-center">
              <AppIcon app={app} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base text-gray-900 dark:text-gray-100">
                {app.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{app.category}</p>
            </div>
          </Link>
          <AppInstallButton
            app={app}
            isConfigured={isConfigured}
            isInstalled={isInstalled}
            onInstallationChange={onInstallationChange}
            showConfigure={false}
          />
        </div>
      </CardContent>
    </Card>
  );
} 
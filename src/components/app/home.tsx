import { apps } from '@/lib/data';
import { Card, CardContent } from '@/components/ui/card';
import { AppInstallButton } from './AppInstallButton';
import { AppIcon } from './AppIcon';

import type { App } from "@/types/components/app";

interface HomeProps {
  configuredApps: { [key: string]: boolean };
  installedApps: { [key: string]: boolean };
  onAppSelect: (app: App) => void;
  onInstallationChange: (appName: string, isInstalled: boolean) => void;
}

export function Home({ 
  configuredApps, 
  installedApps, 
  onAppSelect, 
  onInstallationChange 
}: HomeProps) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-start">
        <h2 className="text-xl font-bold text-gray-900">
          Popular Apps
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1">
        {apps.map((app) => (
          <div
            key={app.name}
            onClick={() => onAppSelect(app)}
            style={{ viewTransitionName: `app-card-${app.name}` }}>
            <Card className="border-transparent bg-transparent shadow-none">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-md overflow-hidden bg-gray-50 shadow-sm flex items-center justify-center">
                    <AppIcon app={app} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base text-gray-900">
                      {app.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {app.category}
                    </p>
                  </div>
                  <AppInstallButton
                    app={app}
                    isConfigured={configuredApps[app.name]}
                    isInstalled={installedApps[app.name]}
                    onInstallationChange={(isInstalled) =>
                      onInstallationChange(app.name, isInstalled)
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </section>
  );
} 
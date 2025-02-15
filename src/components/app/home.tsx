import { apps } from '@/lib/data';
import { AppListItem } from '@/components/app/AppListItem';

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
  onInstallationChange,
}: HomeProps) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-start">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Popular Apps</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1">
        {apps.map((app) => (
          <AppListItem
            key={app.name}
            app={app}
            isConfigured={configuredApps[app.name]}
            isInstalled={installedApps[app.name]}
            onAppSelect={onAppSelect}
            onInstallationChange={(isInstalled) =>
              onInstallationChange(app.name, isInstalled)
            }
          />
        ))}
      </div>
    </section>
  );
}

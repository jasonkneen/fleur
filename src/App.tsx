import './app.css';
import { useEffect, useState } from 'react';
import { Chrome, HardDrive, Search, Youtube } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';
import { Label } from './components/ui/label';
import { Input } from './components/ui/input';
import { AppListItem } from './components/app/AppListItem';

import type { App } from './components/app/schema';

const apps: App[] = [
  {
    name: "Browser",
    description: "Web browser",
    icon: {
      type: 'lucide',
      icon: Chrome
    },
    category: "Utilities",
    price: "Get",
    developer: "Google LLC",
  },
  {
    name: "Gmail",
    description: "Email and messaging platform",
    icon: {
      type: 'url',
      url: `/servers/gmail.svg`
    },
    category: "Productivity",
    price: "Free",
    developer: "Google LLC",
  },
  {
    name: "Google Calendar",
    description: "Schedule and organize events",
    icon: {
      type: 'url',
      url: `/servers/gcal.svg`
    },
    category: "Productivity",
    price: "Free",
    developer: "Google LLC",
  },
  {
    name: "Google Drive",
    description: "Cloud storage and file sharing",
    icon: {
      type: 'lucide',
      icon: HardDrive
    },
    category: "Productivity",
    price: "Free",
    developer: "Google LLC",
  },
  {
    name: "YouTube",
    description: "Video streaming platform",
    icon: {
      type: 'lucide',
      icon: Youtube
    },
    category: "Entertainment",
    price: "Free",
    developer: "Google LLC",
  },
] as const;

function App() {
  const [uvVersion, setUvVersion] = useState<string | null>(null);
  const [bunVersion, setBunVersion] = useState<string | null>(null);
  const [configuredApps, setConfiguredApps] = useState<{
    [key: string]: boolean;
  }>({});
  const [installedApps, setInstalledApps] = useState<{
    [key: string]: boolean;
  }>({});

  // Check which apps are configured and installed when component mounts
  useEffect(() => {
    const checkAppStatuses = async () => {
      const configs: { [key: string]: boolean } = {};
      const installed: { [key: string]: boolean } = {};
      for (const app of apps) {
        configs[app.name] = await invoke("is_app_configured", {
          appName: app.name,
        });
        installed[app.name] = await invoke("is_app_installed", {
          appName: app.name,
        });
      }
      setConfiguredApps(configs);
      setInstalledApps(installed);
    };
    checkAppStatuses();
    checkUvVersion();
    checkBunVersion();
  }, []);

  const checkUvVersion = async () => {
    try {
      const version = await invoke("check_uv_version");
      setUvVersion(version as string);
    } catch (error) {
      setUvVersion(error as string);
    }
  };

  const checkBunVersion = async () => {
    try {
      const version = await invoke("check_bun_version");
      setBunVersion(version as string);
    } catch (error) {
      setBunVersion(error as string);
    }
  };

  const handleInstallationChange = (appName: string, isInstalled: boolean) => {
    setInstalledApps((prev) => ({ ...prev, [appName]: isInstalled }));
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <img src="/logo.svg" alt="Fleur" width={24} height={24} />
              <h1 className="text-xl font-bold">Fleur</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search apps..."
                  className="pl-8 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4">
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-start">
            <h2 className="text-xl font-bold text-gray-900">Popular Apps</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {apps.map((app) => (
              <AppListItem
                key={app.name}
                app={app}
                isConfigured={configuredApps[app.name]}
                isInstalled={installedApps[app.name]}
                onInstallationChange={(isInstalled) => handleInstallationChange(app.name, isInstalled)}
              />
            ))}
          </div>
          <div className="flex items-center gap-4 absolute bottom-0 left-0 w-full px-8 py-1 border-t border-gray-100">
            <div className="flex items-center">
              <Label className="text-xs">UV version</Label>
              {uvVersion ? (
                <p className="ml-2 text-xs text-gray-500">{uvVersion}</p>
              ) : (
                <p className="ml-2 text-xs text-gray-500">Not installed</p>
              )}
            </div>
            <p className="text-gray-200">|</p>
            <div className="flex items-center">
              <Label className="text-xs">Bun version</Label>
              {bunVersion ? (
                <p className="ml-2 text-xs text-gray-500">{bunVersion}</p>
              ) : (
                <p className="ml-2 text-xs text-gray-500">Not installed</p>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;

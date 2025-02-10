import './app.css';
import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';
import { apps } from './lib/data';
import { Loader } from './components/ui/loader';
import { Input } from './components/ui/input';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from './components/ui/breadcrumb';
import { Home } from './components/app/home';
import { AppDetail } from './components/app/AppDetail';

import type { App } from "@/types/components/app";

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [configuredApps, setConfiguredApps] = useState<{
    [key: string]: boolean;
  }>({});
  const [installedApps, setInstalledApps] = useState<{
    [key: string]: boolean;
  }>({});
  const [selectedApp, setSelectedApp] = useState<App | null>(null);

  // Check which apps are configured and installed when component mounts
  useEffect(() => {
    const initializeEnvironment = async () => {
      try {
        const result = await invoke("ensure_environment");
        console.log(result);
      } catch (error) {
        console.error("Failed to initialize environment:", error);
      }
    };

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
      setIsLoading(false);
    };

    initializeEnvironment();
    checkAppStatuses();
  }, []);

  const handleInstallationChange = (appName: string, isInstalled: boolean) => {
    setInstalledApps((prev) => ({ ...prev, [appName]: isInstalled }));
  };

  const handleAppSelect = (app: App) => {
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        setSelectedApp(app);
      });
    } else {
      setSelectedApp(app);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader className="text-gray-800" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-1">
                <img src="/logo.svg" alt="Fleur" width={24} height={24} />
                <h1 className="text-xl font-bold">Fleur</h1>
              </div>
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
          {selectedApp && (
            <div className="mt-2">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink
                      onClick={() => setSelectedApp(null)}
                      className="cursor-pointer">
                      Apps
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <span className="text-gray-900">{selectedApp.name}</span>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-4">
        <div className="view-transition-wrapper">
          {selectedApp ? (
            <div>
              <AppDetail
                app={selectedApp}
                isConfigured={configuredApps[selectedApp.name]}
                isInstalled={installedApps[selectedApp.name]}
                onInstallationChange={(isInstalled) =>
                  handleInstallationChange(selectedApp.name, isInstalled)
                }
              />
            </div>
          ) : (
            <Home 
              configuredApps={configuredApps}
              installedApps={installedApps}
              onAppSelect={handleAppSelect}
              onInstallationChange={handleInstallationChange}
            />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;

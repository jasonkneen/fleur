import "./app.css";
import { useEffect, useState } from "react";
import { Chrome, HardDrive, Search, Youtube } from "lucide-react";
import { invoke } from "@tauri-apps/api/core";
import { Input } from "./components/ui/input";
import { Card, CardContent } from "./components/ui/card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "./components/ui/breadcrumb";
import { AppInstallButton } from "./components/app/AppInstallButton";
import { AppIcon } from "./components/app/AppIcon";
import { AppDetail } from "./components/app/AppDetail";

import type { App } from "@/types/components/app";

const apps: App[] = [
  {
    name: "Browser",
    description: "Web browser",
    icon: {
      type: "lucide",
      icon: Chrome,
    },
    category: "Utilities",
    price: "Get",
    developer: "Google LLC",
  },
  {
    name: "Hacker News",
    description: "Hacker News",
    icon: {
      type: "url",
      url: `/servers/yc.svg`,
    },
    category: "Social",
    price: "Get",
    developer: "Y Combinator",
  },
  {
    name: "Gmail",
    description: "Email and messaging platform",
    icon: {
      type: "url",
      url: `/servers/gmail.svg`,
    },
    category: "Productivity",
    price: "Free",
    developer: "Google LLC",
  },
  {
    name: "Google Calendar",
    description: "Schedule and organize events",
    icon: {
      type: "url",
      url: `/servers/gcal.svg`,
    },
    category: "Productivity",
    price: "Free",
    developer: "Google LLC",
  },
  {
    name: "Google Drive",
    description: "Cloud storage and file sharing",
    icon: {
      type: "lucide",
      icon: HardDrive,
    },
    category: "Productivity",
    price: "Free",
    developer: "Google LLC",
  },
  {
    name: "YouTube",
    description: "Video streaming platform",
    icon: {
      type: "lucide",
      icon: Youtube,
    },
    category: "Entertainment",
    price: "Free",
    developer: "Google LLC",
  },
] as const;

function App() {
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
    };

    initializeEnvironment();
    checkAppStatuses();
  }, []);

  const handleInstallationChange = (appName: string, isInstalled: boolean) => {
    setInstalledApps((prev) => ({ ...prev, [appName]: isInstalled }));
  };

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
            <div style={{ viewTransitionName: "app-detail" }}>
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
                    onClick={() => {
                      if (document.startViewTransition) {
                        document.startViewTransition(() => {
                          setSelectedApp(app);
                        });
                      } else {
                        setSelectedApp(app);
                      }
                    }}
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
                              handleInstallationChange(app.name, isInstalled)
                            }
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;

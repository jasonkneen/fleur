import "./App.css";
import { useEffect, useState } from "react";
import { Calendar, Chrome, HardDrive, Mail, Search, Youtube } from "lucide-react";
import { invoke } from "@tauri-apps/api/core";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "./components/ui/label";
import { Input } from "./components/ui/input";

const apps = [
  {
    name: "Browser",
    description: "Web browser",
    icon: Chrome,
    category: "Utilities",
    price: "Get",
    developer: "Google LLC",
  },
  {
    name: "Gmail",
    description: "Email and messaging platform",
    icon: Mail,
    category: "Productivity",
    price: "Free",
    developer: "Google LLC",
  },
  {
    name: "Google Calendar",
    description: "Schedule and organize events",
    icon: Calendar,
    category: "Productivity",
    price: "Free",
    developer: "Google LLC",
  },
  {
    name: "Google Drive",
    description: "Cloud storage and file sharing",
    icon: HardDrive,
    category: "Productivity",
    price: "Free",
    developer: "Google LLC",
  },
  {
    name: "YouTube",
    description: "Video streaming platform",
    icon: Youtube,
    category: "Entertainment",
    price: "Free",
    developer: "Google LLC",
  },
];

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

  const handleGetClick = async (appName: string) => {
    try {
      // Call appropriate function based on installation status
      const result = await invoke(
        installedApps[appName] ? "handle_app_uninstall" : "handle_app_get",
        { appName }
      );
      console.log(result);

      // Refresh installation status after action
      const isInstalled = await invoke<boolean>("is_app_installed", {
        appName,
      });
      setInstalledApps((prev) => ({ ...prev, [appName]: isInstalled }));
    } catch (error) {
      console.error("Failed to handle app action:", error);
    }
  };

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

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">Fleur</h1>
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

      <main className="container mx-auto px-4 py-8">
        <section>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {apps.map((app) => (
              <Card
                key={app.name}
                className="rounded-md border-gray-100 shadow-none">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between space-x-4">
                    <div className="p-2 rounded-lg bg-gray-50">
                      <app.icon className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="flex w-full justify-between items-center">
                      <div>
                        <h3 className="font-semibold text-sm">{app.name}</h3>
                        <p className="text-xs text-gray-500">{app.category}</p>
                      </div>
                      <Button
                        size="sm"
                        className={`transition-colors ${
                          !configuredApps[app.name]
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : installedApps[app.name]
                            ? "bg-red-50 text-red-600 hover:bg-red-100"
                            : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                        }`}
                        disabled={!configuredApps[app.name]}
                        onClick={() => handleGetClick(app.name)}
                        variant="secondary">
                        {installedApps[app.name] ? "Uninstall" : "Get"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="flex items-center gap-4 absolute bottom-0 left-0 w-full px-4 py-1 border-t border-gray-200">
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

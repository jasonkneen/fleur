import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { createFileRoute } from "@tanstack/react-router";
import { Loader } from "../components/ui/loader";
import { Home } from "../components/app/home";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [configuredApps, setConfiguredApps] = useState<{
    [key: string]: boolean;
  }>({});
  const [installedApps, setInstalledApps] = useState<{
    [key: string]: boolean;
  }>({});

  useEffect(() => {
    const initializeEnvironment = async () => {
      try {
        const result = await invoke("ensure_environment");
        console.log(result);
      } catch (error) {
        console.error("Failed to initialize environment:", error);
      }
    };

    const loadAppStatuses = async () => {
      try {
        const result = await invoke<{
          installed: { [key: string]: boolean };
          configured: { [key: string]: boolean };
        }>("get_app_statuses");

        setConfiguredApps(result.configured);
        setInstalledApps(result.installed);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to load app statuses:", error);
        setIsLoading(false);
      }
    };

    initializeEnvironment();
    loadAppStatuses();
  }, []);

  const handleInstallationChange = (appName: string, isInstalled: boolean) => {
    setInstalledApps((prev) => ({ ...prev, [appName]: isInstalled }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader className="text-gray-800" size={48} />
      </div>
    );
  }

  return (
    <Home
      configuredApps={configuredApps}
      installedApps={installedApps}
      onAppSelect={() => {}}
      onInstallationChange={handleInstallationChange}
    />
  );
}

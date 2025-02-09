import { toast } from 'sonner';
import { invoke } from '@tauri-apps/api/core';
import { AppInstallButtonProps } from '@/types/components/app';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function AppInstallButton({
  app,
  isConfigured,
  isInstalled,
  onInstallationChange,
}: AppInstallButtonProps) {
  const handleGetClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      // Call appropriate function based on installation status
      const result = await invoke(
        isInstalled ? "handle_app_uninstall" : "handle_app_get",
        { appName: app.name }
      );
      console.log(result);

      // Refresh installation status after action
      const newIsInstalled = await invoke<boolean>("is_app_installed", {
        appName: app.name,
      });
      onInstallationChange(newIsInstalled);
      toast.success(`${app.name} ${!newIsInstalled ? "uninstalled" : "installed"}`);
    } catch (error) {
      console.error("Failed to handle app action:", error);
    }
  };

  return (
    <Button 
      size="sm" 
      className={cn(`transition-colors ${
        !isConfigured
          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
          : isInstalled
          ? "bg-red-50 text-red-600 hover:bg-red-100"
          : "bg-gray-50 text-gray-600 hover:bg-gray-100"
      }`, !isConfigured && "cursor-not-allowed")}
      disabled={!isConfigured} 
      onClick={handleGetClick}
      variant="secondary"
    >
      {isInstalled ? "Uninstall" : "Get"}
    </Button>
  );
} 
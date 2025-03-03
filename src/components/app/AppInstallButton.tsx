import { toast } from "sonner";
import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { AppInstallButtonProps } from "@/types/components/app";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function AppInstallButton({
  app,
  isConfigured,
  isInstalled,
  onInstallationChange,
}: AppInstallButtonProps) {
  const [envVars, setEnvVars] = useState<Record<string, string>>({});
  const [isOpen, setIsOpen] = useState(false);

  const handleInstall = async (envVars?: Record<string, string>) => {
    try {
      // Call appropriate function based on installation status
      const result = await invoke(isInstalled ? "uninstall" : "install", {
        appName: app.name,
        envVars,
      });
      console.log(result);

      // Refresh installation status after action
      const newIsInstalled = await invoke<boolean>("is_installed", {
        appName: app.name,
      });
      onInstallationChange(newIsInstalled);
      toast.success(
        `${app.name} ${!newIsInstalled ? "uninstalled" : "installed"}`
      );
      setIsOpen(false);
      setEnvVars({});
    } catch (error) {
      console.error("Failed to handle app action:", error);
      toast.error("Failed to install app");
    }
  };

  const handleGetClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isInstalled) {
      await handleInstall();
    } else if (app.envVars?.length) {
      setIsOpen(true);
    } else {
      await handleInstall();
    }
  };

  const handleEnvVarChange = (name: string, value: string) => {
    setEnvVars((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const isFormValid = () => {
    if (!app.envVars?.length) return true;
    return app.envVars.every((envVar) => envVars[envVar.name]);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            size="sm"
            className={cn(
              "transition-colors rounded-full px-6",
              !isConfigured
                ? "bg-muted text-muted-foreground cursor-not-allowed"
                : isInstalled
                  ? "bg-destructive/10 text-destructive hover:bg-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30"
                  : "bg-secondary hover:bg-secondary/80 text-blue-600 dark:text-blue-400"
            )}
            disabled={!isConfigured}
            onClick={handleGetClick}
            variant="secondary">
            {isInstalled ? "Uninstall" : "Get"}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter API Keys for {app.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {app.envVars?.map((envVar) => (
              <div key={envVar.name} className="space-y-2">
                <label className="text-sm font-medium">{envVar.label}</label>
                <Input
                  type="password"
                  placeholder={envVar.description}
                  value={envVars[envVar.name] || ""}
                  onChange={(e) =>
                    handleEnvVarChange(envVar.name, e.target.value)
                  }
                />
              </div>
            ))}
            <Button
              className="w-full"
              onClick={() => handleInstall(envVars)}
              disabled={!isFormValid()}>
              Install
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

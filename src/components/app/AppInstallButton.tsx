import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useNavigate } from '@tanstack/react-router';
import { AppInstallButtonProps } from '@/types/components/app';
import { cn } from '@/lib/utils';
import { hasConfig } from '@/lib/hasConfig';
import { Button } from '@/components/ui/button';
import { ConfigurationMenu } from './configuration';
import { Dialog, DialogContent, DialogTrigger } from '../ui/dialog';

export function AppInstallButton({
  app,
  isConfigured,
  isInstalled,
  onInstallationChange,
  showConfigure = true,
}: AppInstallButtonProps) {
  const navigate = useNavigate();
  const [setupValues, setSetupValues] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({
    all: false,
  });
  const [showConfigDialog, setShowConfigDialog] = useState(false);

  useEffect(() => {
    const loadEnvValues = async () => {
      if (app.setup && app.setup.length > 0) {
        try {
          const envValues = await invoke<Record<string, string>>(
            "get_app_env",
            {
              appName: app.name,
            }
          );
          setSetupValues(envValues || {});
        } catch (error) {
          console.error("Failed to load ENV values:", error);
        }
      }
    };

    loadEnvValues();
  }, [app.name, app.setup]);

  const handleGetClick = async (e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      if (isInstalled) {
        const result = await invoke("uninstall", {
          appName: app.name,
        });
        console.log(result);
      } else {
        if (hasConfig(app)) {
          // Show configuration dialog first instead of installing immediately
          setShowConfigDialog(true);
          return;
        }

        const result = await invoke("install", {
          appName: app.name,
          envVars: app.setup && app.setup.length > 0 ? setupValues : null,
        });
        console.log(result);
      }

      const newIsInstalled = await invoke<boolean>("is_installed", {
        appName: app.name,
      });
      onInstallationChange(newIsInstalled);

      toast.success(
        `${app.name} ${!newIsInstalled ? "uninstalled" : "installed"}`,
        {
          action: {
            label: "Relaunch Claude",
            onClick: async () => {
              try {
                await invoke("restart_claude_app");
                toast.success("Claude app is restarting...");
              } catch (error) {
                console.error("Failed to restart Claude app:", error);
                toast.error("Failed to restart Claude app");
              }
            },
          },
          duration: 10000,
        }
      );

      if (app.setup && app.setup.length > 0 && newIsInstalled) {
        navigate({ to: "/app/$name", params: { name: app.name } });
        return;
      }
    } catch (error) {
      console.error("Failed to handle app action:", error);
      toast.error(
        `Failed to ${isInstalled ? "uninstall" : "install"} ${app.name}`
      );
    }
  };

  const handleInputChange = (key: string, value: string) => {
    setSetupValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const saveAll = async () => {
    setIsLoading((prev) => ({ ...prev, all: true }));
    try {
      const result = await invoke("save_app_env", {
        appName: app.name,
        envValues: setupValues,
      });
      toast.success(`Saved all configuration values for ${app.name}`);
      console.log(result);
    } catch (error) {
      console.error("Failed to save ENV values:", error);
      toast.error(`Failed to save configuration values for ${app.name}`);
    } finally {
      setIsLoading((prev) => ({ ...prev, all: false }));
    }
  };

  return (
    <div className="flex items-center gap-2">
      {showConfigure && isInstalled && hasConfig(app) && (
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="transition-colors rounded-lg px-3 bg-transparent text-sand/20 dark:text-blue-400 border border-sand-100 border-border hover:bg-transparent dark:hover:ring-blue-100 dark:active:ring-blue-100 dark:hover:bg-blue-400/20"
              onClick={() =>
                navigate({ to: "/app/$name", params: { name: app.name } })
              }>
              Configure
            </Button>
          </DialogTrigger>
          <DialogContent>
            <ConfigurationMenu
              appName={app.name}
              setup={app.setup || []}
              setupValues={setupValues}
              onInputChange={handleInputChange}
              onSave={saveAll}
              isLoading={isLoading.all}
            />
          </DialogContent>
        </Dialog>
      )}
      <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
        <DialogContent>
          <ConfigurationMenu
            appName={app.name}
            setup={app.setup || []}
            setupValues={setupValues}
            onInputChange={handleInputChange}
            onSave={async () => {
              await saveAll();
              setShowConfigDialog(false);
              
              // Proceed with installation after configuration is saved
              try {
                const result = await invoke("install", {
                  appName: app.name,
                  envVars: app.setup && app.setup.length > 0 ? setupValues : null,
                });
                console.log(result);
                
                const newIsInstalled = await invoke<boolean>("is_installed", {
                  appName: app.name,
                });
                onInstallationChange(newIsInstalled);
                
                toast.success(`${app.name} installed`, {
                  action: {
                    label: "Relaunch Claude",
                    onClick: async () => {
                      try {
                        await invoke("restart_claude_app");
                        toast.success("Claude app is restarting...");
                      } catch (error) {
                        console.error("Failed to restart Claude app:", error);
                        toast.error("Failed to restart Claude app");
                      }
                    },
                  },
                  duration: 10000,
                });
                
                if (app.setup && app.setup.length > 0 && newIsInstalled) {
                  navigate({ to: "/app/$name", params: { name: app.name } });
                }
              } catch (error) {
                console.error("Failed to install app:", error);
                toast.error(`Failed to install ${app.name}`);
              }
            }}
            isLoading={isLoading.all}
          />
        </DialogContent>
      </Dialog>
      <Button
        key={isInstalled ? "installed" : "not-installed"}
        size="sm"
        className={cn(
          "transition-colors rounded-lg shadow-md dark:shadow-brushed-steel-highlight",
          !isConfigured
            ? "bg-transparent text-muted-foreground cursor-not-allowed"
            : isInstalled
              ? "text-sand/20 hover:bg-sand/50 hover:text-red-500 hover:bg-red-500/10"
              : "bg-sand px-6 border border-border hover:bg-sand/50 text-sand/20 dark:text-blue-400 dark:hover:ring-blue-100 dark:active:ring-blue-100 dark:hover:bg-blue-400/20"
        )}
        disabled={!isConfigured}
        onClick={handleGetClick}
        variant="ghost">
        {!isConfigured ? "Coming soon" : isInstalled ? "Remove" : "Get"}
      </Button>
    </div>
  );
}

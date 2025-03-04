import { toast } from 'sonner';
import { invoke } from '@tauri-apps/api/core';
import { AppInstallButtonProps } from '@/types/components/app';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useNavigate } from '@tanstack/react-router';
import { Dialog, DialogContent, DialogFooter, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { useState, useEffect } from 'react';

export function AppInstallButton({
  app,
  isConfigured,
  isInstalled,
  onInstallationChange,
  showConfigure = true,
}: AppInstallButtonProps) {
  const navigate = useNavigate();
  const [setupValues, setSetupValues] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({ all: false });

  // Load existing ENV values when component mounts
  useEffect(() => {
    const loadEnvValues = async () => {
      if (app.setup && app.setup.length > 0) {
        try {
          const envValues = await invoke<Record<string, string>>("get_app_env", {
            appName: app.name,
          });
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
        // Uninstall app
        const result = await invoke("uninstall", {
          appName: app.name,
        });
        console.log(result);
      } else {
        // Install app with environment variables if setup exists
        const result = await invoke("install", {
          appName: app.name,
          envVars: app.setup && app.setup.length > 0 ? setupValues : null,
        });
        console.log(result);
      }

      // Refresh installation status after action
      const newIsInstalled = await invoke<boolean>("is_installed", {
        appName: app.name,
      });
      onInstallationChange(newIsInstalled);
      toast.success(
        `${app.name} ${!newIsInstalled ? "uninstalled" : "installed"}`
      );
      if (app.setup && app.setup.length > 0 && newIsInstalled) {
        navigate({to: '/app/$name', params: {name: app.name}});
        return;
      }
    } catch (error) {
      console.error("Failed to handle app action:", error);
      toast.error(`Failed to ${isInstalled ? "uninstall" : "install"} ${app.name}`);
    }
  };

  const handleInputChange = (key: string, value: string) => {
    setSetupValues(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const saveAll = async () => {
    setIsLoading(prev => ({ ...prev, all: true }));
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
      setIsLoading(prev => ({ ...prev, all: false }));
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        key={isInstalled ? "installed" : "not-installed"}
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
        {!isConfigured ? "Coming soon" : isInstalled ? "Uninstall" : "Install"}
      </Button>
      {showConfigure && isInstalled && app.setup && app.setup.length > 0 && <Dialog>
        <DialogTrigger asChild>
          <Button
            size="sm"
            className="transition-colors rounded-full px-6"
            variant="secondary"
            onClick={() => navigate({to: '/app/$name', params: {name: app.name}})}
          >
            Configure
          </Button>
        </DialogTrigger>
        <DialogContent>
          <div className="flex gap-6 h-full">
            <div className="flex-1">
              <h2 className="text-lg font-semibold mb-2">Configure {app.name}</h2>
              <p className="mb-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">This app requires some setup to use. Please follow the steps below.</p>
              <div className="flex flex-col gap-4">
                {app.setup.map((setup) => setup?.type === 'text' ? (
                  <div key={setup.label} className="flex flex-col gap-2">
                    <p className="text-base font-medium">{setup.label}</p>
                    <p className="text-base leading-relaxed text-zinc-600 dark:text-zinc-400">{setup.value}</p>
                  </div>
                ) : (
                  <div key={setup.label} className="flex flex-col w-full gap-2">
                    <p className="text-base font-medium">{setup.label}</p>
                    <div className="flex gap-2">
                      <Input 
                        type={"text"}
                        placeholder={setup.placeholder} 
                        value={setupValues[setup.key || ''] || ''}
                        onChange={(e) => handleInputChange(setup.key || '', e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="secondary"
              onClick={saveAll}
              disabled={isLoading.all}
            >
              {isLoading.all ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>}
    </div>
  );
}

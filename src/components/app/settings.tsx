import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { openUrl } from '@tauri-apps/plugin-opener';
import { invoke } from '@tauri-apps/api/core';
import { getVersion } from '@tauri-apps/api/app';
import { refreshApps } from '@/store/app';
import { updateTauriTheme } from '@/lib/update-tauri-theme';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export function Settings() {
  const { theme, setTheme } = useTheme();
  const [version, setVersion] = useState<string>("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFleurEnabled, setIsFleurEnabled] = useState(false);
  const [isFleurToggling, setIsFleurToggling] = useState(false);

  useEffect(() => {
    getVersion().then(setVersion);
    checkFleurStatus();
  }, []);

  const checkFleurStatus = async () => {
    try {
      const statuses = await invoke<{ installed: Record<string, boolean> }>(
        "get_app_statuses"
      );
      setIsFleurEnabled(!!statuses.installed.fleur);
    } catch (error) {
      console.error("Failed to check Fleur status:", error);
    }
  };

  const toggleFleur = async (enabled: boolean) => {
    setIsFleurToggling(true);
    try {
      if (enabled) {
        await invoke("install_fleur_mcp");
        toast.success("Fleur onboarding enabled");
      } else {
        await invoke("uninstall_fleur_mcp");
        toast.success("Fleur onboarding disabled");
      }
      setIsFleurEnabled(enabled);
    } catch (error) {
      console.error(
        `Failed to ${enabled ? "install" : "uninstall"} Fleur MCP:`,
        error
      );
      toast.error(
        `Failed to ${enabled ? "enable" : "disable"} Fleur onboarding`,
        {
          description: String(error),
        }
      );
    } finally {
      setIsFleurToggling(false);
    }
  };

  const updateTheme = async (theme: string) => {
    setTheme(theme);
    await updateTauriTheme(theme);
  };

  const handleOpenRegistry = async () => {
    await openUrl("https://github.com/fleuristes/fleur");
  };

  const handleRefreshApps = async () => {
    try {
      setIsRefreshing(true);
      await refreshApps();
    } catch (error) {
      console.error("Failed to refresh apps:", error);
    } finally {
      setTimeout(() => {
        setIsRefreshing(false);
      }, 1000);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="flex items-center gap-2 cursor-pointer">
          <img src="/icons/cog.svg" className="h-4 w-4" />
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Apps</label>
              <p className="text-sm text-muted-foreground">
                Manage the apps listed in Fleur
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleRefreshApps}
                disabled={isRefreshing}>
                {isRefreshing ? "Updating..." : "Update"}
              </Button>
              <Button size="sm" variant="outline" onClick={handleOpenRegistry}>
                Add
              </Button>
            </div>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Theme</label>
              <p className="text-sm text-muted-foreground">
                Customize your interface color scheme
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline" className="capitalize">
                  {theme === "system"
                    ? "System"
                    : theme === "dark"
                      ? "Dark"
                      : "Light"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => {
                    void updateTheme("light");
                  }}>
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    void updateTheme("dark");
                  }}>
                  Dark
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    void updateTheme("system");
                  }}>
                  System
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Onboarding</label>
              <p className="text-sm text-muted-foreground">
                Enable Fleur onboarding in Claude
              </p>
            </div>
            <Switch
              checked={isFleurEnabled}
              disabled={isFleurToggling}
              onCheckedChange={toggleFleur}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Version</label>
              <p className="text-sm text-muted-foreground">
                Current Fleur version
              </p>
            </div>
            <div className="flex gap-2 items-center">
              <span className="text-sm font-mono">{version}</span>
              <div></div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

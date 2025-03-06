import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { getVersion } from "@tauri-apps/api/app";
import { updateTauriTheme } from "@/lib/update-tauri-theme";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function Settings() {
  const { theme, setTheme } = useTheme();
  const [version, setVersion] = useState<string>("");

  useEffect(() => {
    getVersion().then(setVersion);
  }, []);

  const updateTheme = async (theme: string) => {
    setTheme(theme);
    await updateTauriTheme(theme);
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
              <label className="text-sm font-medium">Theme</label>
              <p className="text-sm text-muted-foreground">
                Customize your interface color scheme
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="capitalize">
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
              <label className="text-sm font-medium">Version</label>
              <p className="text-sm text-muted-foreground">
                Current Fleur version
              </p>
            </div>
            <span className="text-sm font-mono">{version}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

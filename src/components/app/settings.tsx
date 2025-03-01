import { useTheme } from 'next-themes';
import { Settings as SettingsIcon } from 'lucide-react';
import { updateTauriTheme } from '@/lib/update-tauri-theme';
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

  const updateTheme = async (theme: string) => {
    setTheme(theme);
    await updateTauriTheme(theme);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <SettingsIcon className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
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
                {theme === 'system' ? 'System' : theme === 'dark' ? 'Dark' : 'Light'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => {
                void updateTheme('light');
              }}>
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                void updateTheme('dark');
              }}>
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                void updateTheme('system');
              }}>
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </DialogContent>
    </Dialog>
  );
} 
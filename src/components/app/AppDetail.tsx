import { App } from '@/types/components/app';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AppHeader } from './AppHeader';
import { AppDescription } from './AppDescription';

interface AppDetailProps {
  app: App;
  isConfigured: boolean;
  isInstalled: boolean;
  onInstallationChange: (isInstalled: boolean) => void;
}

export function AppDetail({ app, isConfigured, isInstalled, onInstallationChange }: AppDetailProps) {
  return (
    <div className="flex flex-col h-full">
      <AppHeader
        app={app}
        isConfigured={isConfigured}
        isInstalled={isInstalled}
        onInstallationChange={onInstallationChange}
      />

      <ScrollArea className="flex-1 h-full">
        <div className="py-2 space-y-12 min-h-full">
          <AppDescription app={app} />
        </div>
      </ScrollArea>
    </div>
  );
} 
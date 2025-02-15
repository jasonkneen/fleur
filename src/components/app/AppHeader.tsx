import { App } from '@/types/components/app';
import { Separator } from '@/components/ui/separator';
import { AppInstallButton } from './AppInstallButton';
import { AppIcon } from './AppIcon';

interface AppHeaderProps {
  app: App;
  isConfigured: boolean;
  isInstalled: boolean;
  onInstallationChange: (isInstalled: boolean) => void;
}

export function AppHeader({ app, isConfigured, isInstalled, onInstallationChange }: AppHeaderProps) {
  return (
    <>
      <div className="px-8 pt-8 pb-6">
        <div className="flex gap-6">
          {/* App Icon */}
          <div className="relative w-32 h-32 rounded-[2rem] overflow-hidden bg-gray-50 dark:bg-gray-800 shadow-sm">
            <AppIcon app={app} />
          </div>
          
          {/* App Info */}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-[2rem] font-semibold leading-tight text-gray-900 dark:text-gray-100 mb-1">
                  {app.name}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">{app.category}</p>
              </div>
              <div className="ml-6">
                <AppInstallButton
                  app={app}
                  isConfigured={isConfigured}
                  isInstalled={isInstalled}
                  onInstallationChange={onInstallationChange}
                />
              </div>
            </div>
            <div className="mt-6 flex items-center gap-4">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {app.stars} Stars
              </div>
            </div>
          </div>
        </div>
      </div>
      <Separator />
    </>
  );
} 
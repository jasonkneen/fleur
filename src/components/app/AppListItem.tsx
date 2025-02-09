import { Drawer, DrawerContent, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Card, CardContent } from '@/components/ui/card';
import { AppListItemProps } from './schema';
import { AppInstallButton } from './AppInstallButton';
import { AppIcon } from './AppIcon';

export function AppListItem({ app, isConfigured, isInstalled, onInstallationChange }: AppListItemProps) {
  return (
    <Drawer>
      <DrawerTrigger asChild onClick={(e) => {
        e.stopPropagation();
      }}>
        <Card className="rounded-md border-gray-100 shadow-none cursor-pointer hover:shadow-sm transition-all duration-300">
          <CardContent className="p-3">
            <div className="flex items-center justify-between space-x-4">
              <AppIcon app={app} />
              <div className="flex w-full justify-between items-center">
                <div>
                  <h3 className="font-semibold text-sm">{app.name}</h3>
                  <p className="text-xs text-gray-500">{app.category}</p>
                </div>
                <AppInstallButton
                  app={app}
                  isConfigured={isConfigured}
                  isInstalled={isInstalled}
                  onInstallationChange={onInstallationChange}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </DrawerTrigger>
      <DrawerContent className="h-[99%] px-4">
        <DrawerTitle>{app.name}</DrawerTitle> 
        <p className="text-sm text-gray-500">{app.description}</p>
      </DrawerContent>
    </Drawer>
  );
} 
import { useEffect, useState } from 'react';
import { useStore } from '@tanstack/react-store';
import { createFileRoute, Link } from '@tanstack/react-router';
import { appStore, loadAppStatuses, updateAppInstallation } from '@/store/app';
import { useApps } from '../appRegistry';
import { Loader } from '../components/ui/loader';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '../components/ui/breadcrumb';
import { AppDetail } from '../components/app/AppDetail';

import type { App } from "@/types/components/app";

export const Route = createFileRoute("/app/$name")({
  component: AppPage,
});

function AppPage() {
  const { name } = Route.useParams();
  const [app, setApp] = useState<App | null>(null);
  const appStatuses = useStore(appStore, (state) => state.appStatuses);
  const isLoadingStatuses = useStore(appStore, (state) => state.isLoadingStatuses);
  const { apps, isLoading: isLoadingApps } = useApps();

  useEffect(() => {
    const app = apps.find((a) => a.name === name);
    if (app) {
      setApp(app);
      if (!appStatuses?.installed?.[app.name] && !appStatuses?.configured?.[app.name]) {
        loadAppStatuses();
      }
    }
  }, [name, apps, appStatuses?.installed, appStatuses?.configured]);

  const handleInstallationChange = (isInstalled: boolean) => {
    if (app) {
      updateAppInstallation(app.name, isInstalled);
    }
  };

  if (isLoadingStatuses || isLoadingApps || !appStatuses) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader className="text-gray-800 dark:text-gray-200" />
      </div>
    );
  }

  if (!app) {
    return <div className="text-gray-900 dark:text-gray-100">App not found</div>;
  }

  return (
    <div>
      <div className="mb-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">Apps</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <span className="text-zinc-900 dark:text-zinc-100">{app.name}</span>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <AppDetail
        app={app}
        isConfigured={appStatuses.configured[app.name] ?? false}
        isInstalled={appStatuses.installed[app.name] ?? false}
        onInstallationChange={handleInstallationChange}
      />
    </div>
  );
}

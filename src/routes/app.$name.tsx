import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { createFileRoute, Link } from '@tanstack/react-router';
import { apps } from '../lib/data';
import { Loader } from '../components/ui/loader';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '../components/ui/breadcrumb';
import { AppDetail } from '../components/app/AppDetail';

import type { App } from '@/types/components/app'

export const Route = createFileRoute('/app/$name')({
  component: AppPage,
})

interface AppStatuses {
  installed: Record<string, boolean>;
  configured: Record<string, boolean>;
}

function AppPage() {
  const { name } = Route.useParams()
  const [app, setApp] = useState<App | null>(null)
  const [isConfigured, setIsConfigured] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const app = apps.find((a) => a.name === name)
    if (app) {
      setApp(app)
      // Check app status
      const checkStatus = async () => {
        try {
          const statuses = await invoke<AppStatuses>('get_all_app_statuses')
          setIsConfigured(statuses.configured[app.name] ?? false)
          setIsInstalled(statuses.installed[app.name] ?? false)
        } finally {
          setIsLoading(false)
        }
      }
      checkStatus()
    } else {
      setIsLoading(false)
    }
  }, [name])

  const handleInstallationChange = (isInstalled: boolean) => {
    setIsInstalled(isInstalled)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader />
      </div>
    )
  }

  if (!app) {
    return <div>App not found</div>
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
              <span className="text-gray-900">{app.name}</span>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <AppDetail
        app={app}
        isConfigured={isConfigured}
        isInstalled={isInstalled}
        onInstallationChange={handleInstallationChange}
      />
    </div>
  )
}

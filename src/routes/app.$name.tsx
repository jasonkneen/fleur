import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { createFileRoute, Link } from '@tanstack/react-router';
import { apps } from '../lib/data';
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

function AppPage() {
  const { name } = Route.useParams()
  const [app, setApp] = useState<App | null>(null)
  const [isConfigured, setIsConfigured] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    const app = apps.find((a) => a.name === name)
    if (app) {
      setApp(app)
      // Check app status
      const checkStatus = async () => {
        const configured = await invoke('is_app_configured', {
          appName: app.name,
        })
        const installed = await invoke('is_app_installed', {
          appName: app.name,
        })
        setIsConfigured(configured as boolean)
        setIsInstalled(installed as boolean)
      }
      checkStatus()
    }
  }, [name])

  const handleInstallationChange = (isInstalled: boolean) => {
    setIsInstalled(isInstalled)
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

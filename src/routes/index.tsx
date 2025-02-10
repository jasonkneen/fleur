import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { createFileRoute } from '@tanstack/react-router';
import { apps } from '../lib/data';
import { Loader } from '../components/ui/loader';
import { Home } from '../components/app/home';

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  const [isLoading, setIsLoading] = useState(true)
  const [configuredApps, setConfiguredApps] = useState<{
    [key: string]: boolean
  }>({})
  const [installedApps, setInstalledApps] = useState<{
    [key: string]: boolean
  }>({})

  useEffect(() => {
    const initializeEnvironment = async () => {
      try {
        const result = await invoke('ensure_environment')
        console.log(result)
      } catch (error) {
        console.error('Failed to initialize environment:', error)
      }
    }

    const checkAppStatuses = async () => {
      const configs: { [key: string]: boolean } = {}
      const installed: { [key: string]: boolean } = {}
      for (const app of apps) {
        configs[app.name] = await invoke('is_app_configured', {
          appName: app.name,
        })
        installed[app.name] = await invoke('is_app_installed', {
          appName: app.name,
        })
      }
      setConfiguredApps(configs)
      setInstalledApps(installed)
      setIsLoading(false)
    }

    initializeEnvironment()
    checkAppStatuses()
  }, [])

  const handleInstallationChange = (appName: string, isInstalled: boolean) => {
    setInstalledApps((prev) => ({ ...prev, [appName]: isInstalled }))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader className="text-gray-800" size={48} />
      </div>
    )
  }

  return (
    <Home
      configuredApps={configuredApps}
      installedApps={installedApps}
      onAppSelect={() => {}}
      onInstallationChange={handleInstallationChange}
    />
  )
}

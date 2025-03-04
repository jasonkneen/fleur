import type { App } from "@/types/components/app";
import { appStore, loadApps } from "@/store/app";
import { useStore } from "@tanstack/react-store";

// Default apps array to use as fallback
const defaultApps: App[] = [];

// Function to get apps from the store
export function useApps(): { apps: App[], isLoading: boolean } {
  const apps = useStore(appStore, (state) => state.apps);
  const isLoading = useStore(appStore, (state) => state.isLoadingApps);
  
  return { apps, isLoading };
}

// Export the apps getter function
export function getApps(): App[] {
  return appStore.state.apps.length > 0 ? appStore.state.apps : defaultApps;
}

// Initialize apps by loading them if needed
// This is executed when the module is imported
if (typeof window !== 'undefined' && 
    appStore.state.apps.length === 0 && 
    !appStore.state.isLoadingApps) {
  loadApps().catch(error => {
    console.error("Failed to initialize apps:", error);
  });
}

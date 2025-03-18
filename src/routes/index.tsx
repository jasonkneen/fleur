import { useEffect } from "react";
import { useTheme } from "next-themes";
import { invoke } from "@tauri-apps/api/core";
import { useStore } from "@tanstack/react-store";
import { createFileRoute } from "@tanstack/react-router";
import { appStore, loadApps, loadAppStatuses } from "@/store/app";
import { updateTauriTheme } from "@/lib/update-tauri-theme";
import { Home } from "../components/app/home";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const hasInitializedInstalledApps = useStore(
    appStore,
    (state) => state.hasInitializedInstalledApps
  );
  const { theme } = useTheme();

  useEffect(() => {
    if (theme === "light" || theme === "dark") {
      updateTauriTheme(theme);
    }
  }, [theme]);

  useEffect(() => {
    let mounted = true;

    const initializeEnvironment = async () => {
      if (!mounted || hasInitializedInstalledApps) return;

      try {
        await invoke("ensure_environment");

        if (mounted) {
          await loadAppStatuses(appStore.state.currentClient);
          if (mounted) {
            await loadApps();
            if (mounted) {
              appStore.setState((state) => ({
                ...state,
                hasInitializedInstalledApps: true,
              }));
            }
          }
        }
      } catch (error) {
        console.error("Failed to initialize environment:", error);
      }
    };

    initializeEnvironment();

    return () => {
      mounted = false;
    };
  }, []);

  return <Home />;
}

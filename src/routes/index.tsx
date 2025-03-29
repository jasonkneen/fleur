import { useEffect } from "react";
import { useTheme } from "next-themes";
import { invoke } from "@tauri-apps/api/core";
import { useStore } from "@tanstack/react-store";
import { createFileRoute } from "@tanstack/react-router";
import { appStore, loadApps, loadAppStatuses } from "@/store/app";
import { updateTauriTheme } from "@/lib/update-tauri-theme";
import { Home } from "@/components/app/home";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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

    const tryEnsureEnvironment = async (retries = 3): Promise<string> => {
      try {
        const result = await invoke<string>("ensure_environment");
        if (result.includes("failed") || result.includes("error")) {
          console.warn(
            `Environment setup attempt failed: ${result}, retries left: ${retries}`
          );
          throw new Error(result);
        }
        console.log("Environment setup successful");
        return result;
      } catch (error) {
        if (retries > 0) {
          console.warn(
            `Retrying environment setup in 2 seconds, ${retries} attempts remaining`
          );
          await delay(2000);
          return tryEnsureEnvironment(retries - 1);
        }
        throw error;
      }
    };

    const initializeEnvironment = async () => {
      if (!mounted || hasInitializedInstalledApps) return;

      try {
        await tryEnsureEnvironment();
        if (!mounted) return;

        await loadAppStatuses(appStore.state.currentClient);
        if (!mounted) return;

        await loadApps();
        if (!mounted) return;

        appStore.setState((state) => ({
          ...state,
          hasInitializedInstalledApps: true,
        }));
      } catch (error) {
        console.error("Failed to initialize environment after retries:", error);
      }
    };

    initializeEnvironment();

    return () => {
      mounted = false;
    };
  }, []);

  return <Home />;
}

import "./App.css";
import { useEffect, useState } from "react";
import { Calendar, ChevronRight, Chrome, HardDrive, Mail, Search, Youtube } from "lucide-react";
import { invoke } from "@tauri-apps/api/core";
import { Separator } from "@radix-ui/react-separator";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@radix-ui/react-hover-card";

const apps = [
  {
    name: "Browser",
    description: "Web browser",
    icon: <Chrome className="w-16 h-16 text-blue-500" />,
    category: "Utilities",
    price: "Get",
    developer: "Google LLC",
  },
  {
    name: "Gmail",
    description: "Email and messaging platform",
    icon: <Mail className="w-16 h-16 text-red-500" />,
    category: "Productivity",
    price: "Free",
    developer: "Google LLC",
  },
  {
    name: "Google Calendar",
    description: "Schedule and organize events",
    icon: <Calendar className="w-16 h-16 text-green-500" />,
    category: "Productivity",
    price: "Free",
    developer: "Google LLC",
  },
  {
    name: "Google Drive",
    description: "Cloud storage and file sharing",
    icon: <HardDrive className="w-16 h-16 text-yellow-500" />,
    category: "Productivity",
    price: "Free",
    developer: "Google LLC",
  },
  {
    name: "YouTube",
    description: "Video streaming platform",
    icon: <Youtube className="w-16 h-16 text-red-600" />,
    category: "Entertainment",
    price: "Free",
    developer: "Google LLC",
  },
];

function App() {
  const [uvVersion, setUvVersion] = useState<string | null>(null);
  const [bunVersion, setBunVersion] = useState<string | null>(null);
  const [configuredApps, setConfiguredApps] = useState<{
    [key: string]: boolean;
  }>({});

  // Check which apps are configured when component mounts
  useEffect(() => {
    const checkAppConfigurations = async () => {
      const configs: { [key: string]: boolean } = {};
      for (const app of apps) {
        configs[app.name] = await invoke("is_app_configured", {
          appName: app.name,
        });
      }
      setConfiguredApps(configs);
    };
    checkAppConfigurations();
  }, []);

  const handleGetClick = async (appName: string) => {
    try {
      const result = await invoke("handle_app_get", { appName });
      console.log(result);
    } catch (error) {
      console.error("Failed to handle get:", error);
    }
  };

  const checkUvVersion = async () => {
    try {
      const version = await invoke("check_uv_version");
      setUvVersion(version as string);
    } catch (error) {
      setUvVersion(error as string);
    }
  };

  const checkBunVersion = async () => {
    try {
      const version = await invoke("check_bun_version");
      setBunVersion(version as string);
    } catch (error) {
      setBunVersion(error as string);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Mac App Store</h1>
            <div className="flex items-center space-x-4">
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <button
                    onClick={checkUvVersion}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                    Check UV
                  </button>
                  {uvVersion && (
                    <span className="text-sm mt-1">{uvVersion}</span>
                  )}
                </div>
                <div className="flex flex-col items-center">
                  <button
                    onClick={checkBunVersion}
                    className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors">
                    Check Bun
                  </button>
                  {bunVersion && (
                    <span className="text-sm mt-1">{bunVersion}</span>
                  )}
                </div>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search apps..."
                  className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Featured Apps</h2>
            <button className="text-blue-500 hover:text-blue-600 flex items-center">
              See All
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {apps.map((app) => (
              <HoverCard key={app.name}>
                <HoverCardTrigger asChild>
                  <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-start space-x-4">
                      <div className="bg-gray-50 p-2 rounded-xl">
                        {app.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{app.name}</h3>
                        <p className="text-sm text-gray-500">{app.category}</p>
                        <button
                          onClick={() => handleGetClick(app.name)}
                          disabled={!configuredApps[app.name]}
                          className={`mt-2 px-6 py-1.5 rounded-full text-sm font-medium transition-colors ${
                            configuredApps[app.name]
                              ? "bg-blue-50 text-blue-600 hover:bg-blue-100"
                              : "bg-gray-100 text-gray-400 cursor-not-allowed"
                          }`}>
                          Get
                        </button>
                      </div>
                    </div>
                  </div>
                </HoverCardTrigger>
                <HoverCardContent className="w-80 p-4 bg-white rounded-lg shadow-lg">
                  <div className="space-y-2">
                    <h4 className="font-semibold">{app.name}</h4>
                    <p className="text-sm text-gray-500">{app.description}</p>
                    <Separator className="my-2" />
                    <p className="text-xs text-gray-400">By {app.developer}</p>
                  </div>
                </HoverCardContent>
              </HoverCard>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;

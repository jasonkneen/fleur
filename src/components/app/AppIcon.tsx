import { useTheme } from "next-themes";
import { AppIconProps } from "@/types/components/app";

export function AppIcon({ app }: AppIconProps) {
  const { theme } = useTheme();

  if (app.icon.type === "lucide" && app.icon.icon) {
    const Icon = app.icon.icon;
    return <Icon className="h-6 w-6" />;
  }

  if (app.icon.type === "url" && app.icon.url) {
    return (
      <div className="w-full h-full flex items-center justify-center p-2 bg-gray-50 dark:bg-zinc-800">
        <img
          src={theme === "dark" ? app.icon.url.dark : app.icon.url.light}
          alt={app.name}
          className="w-full h-full object-contain"
        />
      </div>
    );
  }

  return null;
}

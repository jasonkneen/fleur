import { App } from './schema';

interface AppIconProps {
  app: App;
}

export function AppIcon({ app }: AppIconProps) {
  if (app.icon.type === 'url') {
    return (
      <div className="p-2 rounded-lg bg-gray-50">
        <img src={app.icon.url} alt={app.name} className="w-5 h-5" />
      </div>
    );
  }

  const Icon = app.icon.icon;
  return (
    <div className="p-2 rounded-lg bg-gray-50">
      <Icon className="w-5 h-5 text-gray-600" />
    </div>
  );
} 
import { AppIconProps } from '@/types/components/app';

export function AppIcon({ app }: AppIconProps) {
  if (app.icon.type === 'url') {
    return (
      <div className="w-full h-full flex items-center justify-center p-2 bg-gray-50">
        <img src={app.icon.url} alt={app.name} className="w-full h-full object-contain" />
      </div>
    );
  }

  const Icon = app.icon.icon;
  if (!Icon) return null;
  
  return (
    <div className="w-full h-full flex items-center justify-center p-2 bg-gray-50">
      <Icon className="w-full h-full text-gray-600" />
    </div>
  );
} 
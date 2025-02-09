import { App } from '@/types/components/app';

interface AppDescriptionProps {
  app: App;
}

export function AppDescription({ app }: AppDescriptionProps) {
  return (
    <section>
      <h2 className="text-xl font-semibold mb-4">About this app</h2>
      <p className="text-base leading-relaxed text-gray-600">{app.description}</p>
    </section>
  );
} 
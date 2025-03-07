import { App } from '@/types/components/app';

export const hasConfig = (app: App) => {
  return app.setup && app.setup.length > 0;
};


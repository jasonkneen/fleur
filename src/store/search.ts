import { Store } from '@tanstack/react-store';
import { AppState } from '@/types/app-state';

export const appStore = new Store<AppState>({
  searchQuery: '',
});

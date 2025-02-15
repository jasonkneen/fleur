import { Search } from 'lucide-react';
import { useStore } from '@tanstack/react-store';
import { appStore } from '@/store/search';
import { Input } from '@/components/ui/input';

export const SearchInput = () => {
  const searchQuery = useStore(appStore, (state) => state.searchQuery);

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
      <Input
        type="text"
        placeholder="Search apps..."
        className="pl-8 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={searchQuery}
        onChange={(e) => appStore.setState((state) => ({ ...state, searchQuery: e.target.value }))}
      />
    </div>
  );
}; 
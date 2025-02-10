import '../app.css';
import { Search } from 'lucide-react';
import { createRootRoute, Outlet } from '@tanstack/react-router';
import { Input } from '../components/ui/input';

export const Route = createRootRoute({
  component: () => (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-1">
                <img src="/logo.svg" alt="Fleur" width={24} height={24} />
                <h1 className="text-xl font-bold">Fleur</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search apps..."
                  className="pl-8 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4">
        <div className="view-transition-wrapper">
          <Outlet />
        </div>
      </main>
    </div>
  ),
})
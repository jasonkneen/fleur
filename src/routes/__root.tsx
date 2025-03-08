import '../app.css';
import { ThemeProvider } from 'next-themes';
import { useStore } from '@tanstack/react-store';
import { createRootRoute, Outlet } from '@tanstack/react-router';
import { appStore, completeOnboarding } from '@/store/app';
import { DragRegion } from '@/components/ui/drag-region';
import { OnboardingScreen } from '@/components/onboarding/OnboardingScreen';
import { Settings } from '@/components/app/settings';
import { Feedback } from '@/components/app/feedback';

export const Route = createRootRoute({
  component: () => {
    const isOnboardingCompleted = useStore(appStore, (state) => state.isOnboardingCompleted);

    const handleOnboardingComplete = () => {
      completeOnboarding();
    };

    return (
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <DragRegion className="absolute z-overlay top-0 left-0 right-0" />
        <div className="min-h-screen bg-sand-100 text-foreground">
          <div className="bg-sand-100 shadow-lg border border-border h-screen p-2 pt-7">
            <div className="bg-background h-full rounded-lg">
              
              <header className="sticky top-0 border-b border-border z-10">
                <div className="container mx-auto px-4 py-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center space-x-1">
                        <img src="/logo.svg" alt="Fleur" className="w-6 h-6" />
                        <h1 className="text-xl font-serif -tracking-[1px]">Fleur</h1>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Feedback />
                      <Settings />
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
          </div>
        </div>

        <OnboardingScreen 
          isOpen={!isOnboardingCompleted} 
          onComplete={handleOnboardingComplete} 
        />
      </ThemeProvider>
    );
  },
});

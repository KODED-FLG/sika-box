import { Outlet } from 'react-router-dom';
import { NavigationBar } from './NavigationBar';
import { IndicateurConnexion } from '@/components/common/IndicateurConnexion';
import { Toaster } from '@/components/ui/toaster';

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b bg-background px-4">
        <h1 className="text-lg font-bold text-foreground">Sika Box</h1>
        <IndicateurConnexion />
      </header>

      {/* Main content */}
      <main className="flex-1 px-4 pb-20 pt-4 md:pb-4">
        <Outlet />
      </main>

      {/* Bottom navigation (mobile) */}
      <NavigationBar />

      {/* Toast notifications */}
      <Toaster />
    </div>
  );
}

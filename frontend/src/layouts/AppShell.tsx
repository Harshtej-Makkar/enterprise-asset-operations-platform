import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/navigation/Sidebar';
import { TopBar } from '@/components/navigation/TopBar';
import { Sheet, SheetContent } from '@/components/ui/sheet';

/**
 * Authenticated application shell.
 *
 * - Desktop: persistent 280px sidebar + top bar + scrollable content area
 * - Mobile:  sidebar collapses into a Sheet drawer triggered from TopBar
 *
 * Content area padding follows doc 13 §9 (32px desktop, 16px tablet).
 */
export function AppShell() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-bg-primary">
      {/* Desktop sidebar (md and up) */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile sidebar drawer */}
      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent side="left" className="w-[280px] p-0">
          <Sidebar onNavigate={() => setMobileNavOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main column */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar onOpenMobileNav={() => setMobileNavOpen(true)} />
        <main className="eaop-scroll flex-1 overflow-y-auto bg-bg-primary p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

import { Sidebar } from '@/components/dashboard/sidebar';
import { BottomNav } from '@/components/dashboard/bottom-nav';

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar - hidden on mobile */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-auto p-4 pt-6 lg:p-6 pb-20 lg:pb-6">
        {children}
      </main>

      {/* Mobile Bottom Nav - hidden on desktop */}
      <BottomNav />
    </div>
  );
}

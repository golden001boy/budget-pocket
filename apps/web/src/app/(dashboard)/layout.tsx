import { Sidebar } from '@/components/dashboard/Sidebar';
import { EmailVerificationBanner } from '@/components/dashboard/EmailVerificationBanner';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <EmailVerificationBanner />
        <main className="flex-1 overflow-y-auto bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}

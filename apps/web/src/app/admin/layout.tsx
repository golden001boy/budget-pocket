import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Users, Settings, ShieldCheck } from 'lucide-react';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') redirect('/dashboard');

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Admin sidebar */}
      <aside className="w-56 flex-shrink-0 border-r bg-slate-950 text-slate-200 flex flex-col">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-800">
          <ShieldCheck className="h-5 w-5 text-amber-400" />
          <span className="font-bold">Admin</span>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {[
            { href: '/admin',        label: 'Vue globale',  icon: LayoutDashboard },
            { href: '/admin/users',  label: 'Utilisateurs', icon: Users           },
            { href: '/settings',     label: 'Paramètres',   icon: Settings        },
          ].map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <Link href="/dashboard" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
            ← Retour à l&apos;app
          </Link>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import {
  LayoutDashboard, CreditCard, Target, TrendingUp, Brain,
  Link2, PieChart, Settings, LogOut, Wallet, Clock,
} from 'lucide-react';
import { cn } from '@/utils/cn';

const NAV_ITEMS = [
  { href: '/dashboard',       label: 'Tableau de bord',  icon: LayoutDashboard },
  { href: '/expenses',        label: 'Dépenses',          icon: CreditCard       },
  { href: '/budgets',         label: 'Budgets',           icon: Wallet           },
  { href: '/analysis',        label: 'Analyses',          icon: PieChart         },
  { href: '/analysis/goals',  label: 'Objectifs',         icon: Target           },
  { href: '/investments',     label: 'Investissements',   icon: TrendingUp       },
  { href: '/advisor',         label: 'Simulateurs',        icon: Brain            },
  { href: '/accounts',        label: 'Mes comptes',       icon: Link2            },
  { href: '/planning',        label: 'Planification',     icon: Clock            },
  { href: '/settings',        label: 'Paramètres',        icon: Settings         },
];

export function Sidebar() {
  const pathname   = usePathname();
  const { data: session } = useSession();

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-5 border-b border-sidebar-border">
        <Wallet className="h-6 w-6 text-blue-400" />
        <span className="font-bold text-lg">Budget-Pocket</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    active
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
                  )}
                >
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  {item.label}
                  {item.href === '/advisor' && (
                    <span className="ml-auto text-xs bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded">Bêta</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User footer */}
      <div className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-medium text-white">
            {session?.user.name?.[0]?.toUpperCase() ?? session?.user.email?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{session?.user.name ?? 'Utilisateur'}</p>
            <p className="text-xs text-sidebar-foreground/60 truncate">{session?.user.email}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}

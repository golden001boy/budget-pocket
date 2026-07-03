import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { SessionProvider } from '@/components/layout/SessionProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title:       { default: 'Budget-Pocket', template: '%s | Budget-Pocket' },
  description: 'Gérez votre budget, suivez vos dépenses et planifiez votre avenir financier.',
  keywords:    ['budget', 'finance', 'épargne', 'investissement', 'BRVM', 'Côte d\'Ivoire'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={inter.className}>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}

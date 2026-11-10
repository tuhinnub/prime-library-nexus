import type { ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { LogIn } from 'lucide-react';
import { Logo } from '@/components/shared/Logo';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { AppLayout } from './AppLayout';

export function PublicLibraryLayout({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  if (user) return <AppLayout>{children}</AppLayout>;
  return <div className="min-h-screen bg-background">
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur-xl">
      <div className="mx-auto flex min-h-20 max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-3 md:px-6">
        <Link to="/" aria-label="গ্রন্থাগার home"><Logo /></Link>
        <nav aria-label="Public library" className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm"><Link to="/explore">Explore</Link></Button>
          <Button asChild size="sm"><Link to="/login"><LogIn className="size-4" />Login</Link></Button>
        </nav>
      </div>
    </header>
    <main className="mx-auto max-w-6xl px-5 py-8 md:px-6 md:py-10">{children}</main>
  </div>;
}

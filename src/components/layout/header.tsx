'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Logo } from '../logo';
import { UserNav } from '@/components/user-nav';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { PlusSquare } from 'lucide-react';

const menuItems = [
  { href: '/dashboard', label: 'Browse Items' },
  { href: '/dashboard/items/my-items', label: 'My Items' },
  { href: '/dashboard/messages', label: 'Messages' },
];

export function Header() {
  const pathname = usePathname();
  const { user } = useAuth();

  const finalMenuItems = menuItems.map(item => ({
    ...item,
    href: item.href.startsWith('/dashboard/profile') ? `/dashboard/profile/${user?.id}` : item.href,
  }));

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <Link href="/dashboard" className="mr-6 flex items-center gap-2">
        <Logo />
      </Link>
      <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
        {finalMenuItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              'transition-colors hover:text-foreground',
              pathname === item.href ? 'text-foreground' : 'text-muted-foreground'
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="ml-auto flex items-center gap-4">
        <Button asChild size="sm">
            <Link href="/dashboard/items/new">
                <PlusSquare className="mr-2 h-4 w-4" />
                List Item
            </Link>
        </Button>
        <UserNav />
      </div>
    </header>
  );
}

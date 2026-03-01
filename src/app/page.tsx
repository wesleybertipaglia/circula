'use client';

import Link from 'next/link';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-background px-4">
      <div className="flex flex-col items-center gap-6 text-center">
        <Logo />
        
        <h1 className="text-4xl font-bold tracking-tight">Circula</h1>
        
        <p className="max-w-md text-lg text-muted-foreground">
          A local mini-economy platform where communities can donate, exchange, and borrow items from each other.
        </p>
      </div>

      <div className="flex gap-4">
        <Button asChild size="lg">
          <Link href="/signup">Sign Up</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/login">Sign In</Link>
        </Button>
      </div>
    </div>
  );
}

import { Recycle } from 'lucide-react';

export function Logo() {
  return (
    <div className="flex items-center gap-2" aria-label="Circula Home">
      <Recycle className="h-6 w-6 text-primary" />
      <h1 className="font-headline text-2xl font-bold tracking-tighter text-foreground">Circula</h1>
    </div>
  );
}

'use client';

import React, { useMemo } from 'react';
import { ItemCard } from '@/components/item-card';
import { getItems } from '@/lib/data.client';
import { useAuth } from '@/hooks/use-auth';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlusSquare } from 'lucide-react';

export default function MyItemsPage() {
  const { user } = useAuth();

  const myItems = useMemo(() => {
    if (!user) return [];
    return getItems().filter(item => item.ownerId === user.id);
  }, [user]);

  return (
    <div className="container mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-headline font-bold tracking-tight">
            My Listed Items
            </h1>
            <p className="text-muted-foreground">
            Manage your donations, exchanges, and loans.
            </p>
        </div>
      </div>

      {myItems.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {myItems.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 py-20 text-center">
            <h3 className="text-xl font-semibold text-muted-foreground">You haven't listed any items yet.</h3>
            <p className="mt-2 text-sm text-muted-foreground">Ready to share with your community?</p>
            <Button asChild className="mt-4">
                <Link href="/dashboard/items/new">
                  <PlusSquare className="mr-2 h-4 w-4" />
                  List Your First Item
                </Link>
              </Button>
        </div>
      )}
    </div>
  );
}

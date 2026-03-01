'use client';

import React, { useState, useMemo } from 'react';
import { ItemCard } from '@/components/item-card';
import { getItems } from '@/lib/data.client';
import { useAuth } from '@/hooks/use-auth';
import type { Item, ExchangeType } from '@/lib/types';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

const ITEMS_PER_PAGE = 8;

export default function DashboardPage() {
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState<ExchangeType | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const allItems = useMemo(() => {
    if (!user) return [];
    return getItems(); 
  }, [user]);

  const filteredItems = useMemo(() => {
    let itemsToFilter = allItems;
    
    if (activeFilter !== 'all') {
      itemsToFilter = itemsToFilter.filter(item => item.exchangeType === activeFilter);
    }

    if (searchTerm) {
        itemsToFilter = itemsToFilter.filter(item => 
            item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
            item.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }
    
    return itemsToFilter.filter(item => item.status === 'available');
  }, [allItems, activeFilter, searchTerm]);

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredItems.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredItems, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filterOptions: { label: string; value: ExchangeType | 'all' }[] = [
    { label: 'All', value: 'all' },
    { label: 'Donations', value: 'donate' },
    { label: 'Exchanges', value: 'exchange' },
    { label: 'For Loan', value: 'borrow' },
  ];

  return (
    <div className="container mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-headline font-bold tracking-tight">
          Available in {user?.city}
        </h1>
        <p className="text-muted-foreground">
          Browse items shared by your neighbors.
        </p>
      </div>
      
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative w-full sm:w-1/3">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search for items..."
              className="w-full appearance-none bg-background pl-8"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
        </div>
        <Tabs value={activeFilter} onValueChange={(value) => { setActiveFilter(value as any); setCurrentPage(1); }}>
          <TabsList className="grid w-full grid-cols-2 sm:w-auto sm:grid-cols-4">
             {filterOptions.map(opt => (
                <TabsTrigger key={opt.value} value={opt.value}>{opt.label}</TabsTrigger>
             ))}
          </TabsList>
        </Tabs>
      </div>

      {filteredItems.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {paginatedItems.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
          
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? 'default' : 'ghost'}
                    size="icon"
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 py-20 text-center">
            <h3 className="text-xl font-semibold text-muted-foreground">No items found</h3>
            <p className="mt-2 text-sm text-muted-foreground">Try adjusting your filters or check back later!</p>
        </div>
      )}
    </div>
  );
}

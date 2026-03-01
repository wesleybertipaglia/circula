'use client';

import { useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getItem, getUser, findOrCreateConversation } from '@/lib/data.client';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, MessageSquare, Edit } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

const exchangeTypeLabels: Record<string, string> = {
  donate: 'Donation',
  exchange: 'Exchange',
  borrow: 'Request',
};

export default function ItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { id } = params;
  const { user: currentUser } = useAuth();

  const item = useMemo(() => (typeof id === 'string' ? getItem(id) : undefined), [id]);
  const owner = useMemo(() => (item ? getUser(item.ownerId) : undefined), [item]);

  const handleInquire = () => {
    if (!currentUser) {
        toast({
            variant: 'destructive',
            title: 'Please log in',
            description: 'You must be logged in to inquire about an item.',
        });
        router.push('/login');
        return;
    }

    if (!item || !owner || currentUser.id === owner.id) return;

    const conversation = findOrCreateConversation(item.id, currentUser.id, owner.id);
    router.push(`/dashboard/messages/${conversation.id}`);
  };

  if (!item || !owner) {
    return (
      <div className="container mx-auto text-center py-10">
        <h2 className="text-xl font-semibold">Item not found</h2>
        <Link href="/dashboard" className="text-primary hover:underline mt-4 inline-block">
          Back to browsing
        </Link>
      </div>
    );
  }

  const isOwner = currentUser?.id === owner.id;

  return (
    <div className="container mx-auto max-w-4xl">
        <div className="mb-4">
            <Button variant="ghost" asChild>
                <Link href="/dashboard" className="text-muted-foreground">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to all items
                </Link>
            </Button>
        </div>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <Card className="overflow-hidden">
          <div className="relative w-full h-full">
            <Image
              src={item.imageUrl || '/imgs/placeholder.webp'}
              alt={item.title}
              fill
              className="h-full w-full object-cover"
              data-ai-hint={item.imageHint || 'placeholder'}
              unoptimized
            />
          </div>
        </Card>

        <div className="flex flex-col gap-6">
            <div>
                <Badge variant="secondary">{exchangeTypeLabels[item.exchangeType]}</Badge>
                <h1 className="mt-2 font-headline text-3xl font-bold">{item.title}</h1>
                <p className="mt-4 text-muted-foreground">{item.description}</p>
            </div>
            
            <Separator />
          
            <Card>
                <CardHeader>
                    <h3 className="font-semibold">Listed by</h3>
                </CardHeader>
                <CardContent>
                    <Link href={`/dashboard/profile/${owner.id}`} className="flex items-center gap-4 rounded-lg p-2 transition-colors hover:bg-muted">
                        <Avatar className="h-12 w-12">
                            <AvatarImage src={`https://api.dicebear.com/9.x/thumbs/svg?seed=${owner.email}`} alt={owner.name} />
                            <AvatarFallback>{owner.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-semibold">{owner.name}</p>
                            <p className="text-sm text-muted-foreground">
                            {owner.reputation}% Positive Feedback ({owner.completedTransactions})
                            </p>
                        </div>
                    </Link>
                </CardContent>
            </Card>

            {isOwner ? (
                <Button>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Listing
                </Button>
            ) : (
                <Button size="lg" onClick={handleInquire}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    {item.exchangeType === 'borrow' ? 'Offer to Lend' : 'Inquire about this item'}
                </Button>
            )}
        </div>
      </div>
    </div>
  );
}

import Link from 'next/link';
import Image from 'next/image';
import type { Item } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getUser } from '@/lib/data.client';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { ArrowRight } from 'lucide-react';

const exchangeTypeLabels: Record<Item['exchangeType'], string> = {
  donate: 'Donation',
  exchange: 'Exchange',
  borrow: 'Request',
};

export function ItemCard({ item }: { item: Item }) {
  const owner = getUser(item.ownerId);
  const hasValidImage = item.imageUrl && item.imageUrl.length > 0;
  const imageSrc = hasValidImage ? item.imageUrl : '/imgs/placeholder.webp';
  const imageHint = hasValidImage ? item.imageHint : 'placeholder';

  return (
    <Card className="flex h-full flex-col overflow-hidden transition-all hover:shadow-lg">
      <CardHeader className="p-0">
        <Link href={`/dashboard/items/${item.id}`} className="block">
          <div className="relative h-48 w-full">
              <Image
                src={imageSrc}
                alt={item.title}
                fill
                className="h-full w-full object-cover"
                data-ai-hint={imageHint}
                unoptimized
              />
          </div>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-start mb-2">
            <Badge variant="secondary">
                {exchangeTypeLabels[item.exchangeType]}
            </Badge>
        </div>
        <CardTitle className="mb-1 text-lg font-headline">
          <Link href={`/dashboard/items/${item.id}`} className="hover:text-primary transition-colors">
            {item.title}
          </Link>
        </CardTitle>
        <CardDescription className="line-clamp-2 text-sm">
          {item.description}
        </CardDescription>
      </CardContent>
      <CardFooter className="flex justify-between">
        {owner && (
           <div className="flex items-center gap-2 text-sm">
             <Avatar className="h-6 w-6">
               <AvatarImage src={`https://api.dicebear.com/9.x/thumbs/svg?seed=${owner.email}`} alt={owner.name} />
               <AvatarFallback>{owner.name.charAt(0)}</AvatarFallback>
             </Avatar>
             <span className="text-muted-foreground">{owner.name}</span>
           </div>
        )}
         <Link href={`/dashboard/items/${item.id}`} className="text-sm font-semibold text-primary hover:underline flex items-center gap-1">
            Details <ArrowRight className="w-4 h-4"/>
        </Link>
      </CardFooter>
    </Card>
  );
}

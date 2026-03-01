'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/hooks/use-auth';
import { getConversationsForUser, getUser, getItem } from '@/lib/data.client';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { MessageSquare, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function MessagesPage() {
  const { user: currentUser } = useAuth();

  if (!currentUser) {
    return null; // Or a loading/login prompt
  }

  const conversations = getConversationsForUser(currentUser.id);

  return (
    <div className="container mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-headline font-bold tracking-tight">
          Messages
        </h1>
        <p className="text-muted-foreground">
          Your conversations about items.
        </p>
      </div>

      {conversations.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <div className="flex flex-col">
              {conversations.map((convo) => {
                const otherUserId = convo.participantIds.find(pId => pId !== currentUser.id);
                const otherUser = otherUserId ? getUser(otherUserId) : null;
                const item = getItem(convo.itemId);
                const lastMessage = convo.messages[convo.messages.length - 1];

                return (
                  <Link href={`/dashboard/messages/${convo.id}`} key={convo.id}>
                    <div className="flex items-center gap-4 border-b p-4 transition-colors hover:bg-muted/50">
                      {item && item.imageUrl && (
                         <Image
                            src={item.imageUrl}
                            alt={item.title}
                            width={64}
                            height={64}
                            className="h-16 w-16 rounded-md object-cover"
                         />
                      )}
                      <div className="flex-1 overflow-hidden">
                        <p className="font-semibold truncate">{item?.title}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                           {otherUser && <Avatar className="h-5 w-5">
                                <AvatarImage src={`https://api.dicebear.com/9.x/thumbs/svg?seed=${otherUser.email}`} alt={otherUser.name}/>
                                <AvatarFallback>{otherUser.name.charAt(0)}</AvatarFallback>
                            </Avatar>}
                          <span>{otherUser ? otherUser.name : 'Unknown User'}</span>
                        </div>
                        {lastMessage && (
                             <p className="mt-1 text-sm text-muted-foreground truncate">
                                {lastMessage.senderId === currentUser.id ? 'You: ' : ''}
                                {lastMessage.text}
                            </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2 text-right">
                        {lastMessage && (
                             <p className="text-xs text-muted-foreground whitespace-nowrap">
                                {formatDistanceToNow(new Date(lastMessage.timestamp), { addSuffix: true })}
                            </p>
                        )}
                         <ArrowRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="mt-10">
          <CardContent className="flex flex-col items-center justify-center gap-4 p-10 text-center">
              <MessageSquare className="w-16 h-16 text-muted-foreground/50"/>
            <h3 className="text-xl font-semibold">No messages yet</h3>
            <p className="text-muted-foreground">
              When you inquire about an item, your conversations will appear here.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

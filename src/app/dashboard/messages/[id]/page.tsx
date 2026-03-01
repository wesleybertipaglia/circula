'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/hooks/use-auth';
import { getConversation, addMessage, getItem, getUser } from '@/lib/data.client';
import type { Conversation, Message as MessageType, User, Item } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Send } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function ConversationPage() {
  const params = useParams();
  const { id } = params;
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [conversation, setConversation] = useState<Conversation | null | undefined>(undefined);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const conversationId = typeof id === 'string' ? id : '';

  useEffect(() => {
    if (conversationId) {
      setConversation(getConversation(conversationId));
    }
  }, [conversationId]);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation?.messages]);

  const otherUser = useMemo(() => {
    if (!conversation || !currentUser) return null;
    const otherUserId = conversation.participantIds.find(pId => pId !== currentUser.id);
    return otherUserId ? getUser(otherUserId) : null;
  }, [conversation, currentUser]);

  const item = useMemo(() => {
    if (!conversation) return null;
    return getItem(conversation.itemId);
  }, [conversation]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser || !conversation) return;
    
    const updatedConversation = addMessage(conversation.id, currentUser.id, newMessage.trim());

    if (updatedConversation) {
      setConversation(updatedConversation);
      setNewMessage('');
    } else {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Failed to send message.',
        });
    }
  };

  const suggestions = useMemo(() => {
    if (!conversation || !currentUser || !item) return [];

    let initialSuggestions: string[] = [];
    let replySuggestions: string[] = [];
    const isOwner = currentUser.id === item.ownerId;

    if (item.exchangeType === 'borrow') {
        if (isOwner) { // I am the requester
            replySuggestions = [
                'That would be amazing! Thank you!',
                'When would be a good time to pick it up?',
                'Perfect, thanks!'
            ];
        } else { // I am the potential lender
            initialSuggestions = [
                `Hi, I have a ${item.title.toLowerCase()} I can lend you.`,
                'I can help with this. When do you need it?'
            ];
            replySuggestions = [
                'Yes, that works for me.',
                'How about tomorrow afternoon?',
                'Great!'
            ];
        }
    } else { // Donate or Exchange
        initialSuggestions = [
            'Hi! Is this item still available?',
            'Hello, I\'m interested in this item.',
        ];
        replySuggestions = [
            'Yes, it is.',
            'Sounds good!',
            'When are you available to meet?',
        ];
    }

    if (conversation.messages.length === 0) {
        // If I am the requester of a borrow item, I don't make the first move.
        if (item.exchangeType === 'borrow' && isOwner) {
            return [];
        }
        return initialSuggestions;
    }

    const lastMessage = conversation.messages[conversation.messages.length - 1];

    if (lastMessage.senderId !== currentUser.id) {
        return replySuggestions;
    }

    return [];
}, [conversation, currentUser, item]);


  if (conversation === undefined) {
    return <div className="container p-4">Loading conversation...</div>;
  }
  
  if (conversation === null) {
     return <div className="container p-4">Conversation not found.</div>;
  }

  if (!currentUser || !otherUser || !item) {
     return <div className="container p-4">Error loading conversation details.</div>;
  }
  
  return (
    <div className="container mx-auto max-w-4xl h-[calc(100vh-10rem)] flex flex-col">
        <div className="mb-4">
            <Button variant="ghost" asChild>
                <Link href="/dashboard/messages" className="text-muted-foreground">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to all messages
                </Link>
            </Button>
        </div>

        <Card className="flex-1 flex flex-col">
            <CardHeader className="flex flex-row items-center gap-4 border-b">
                <Avatar>
                    <AvatarImage src={`https://api.dicebear.com/9.x/thumbs/svg?seed=${otherUser.email}`} alt={otherUser.name} />
                    <AvatarFallback>{otherUser.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                    <CardTitle className="text-lg">{otherUser.name}</CardTitle>
                    <CardDescription className="line-clamp-1">
                        Regarding: <Link href={`/dashboard/items/${item.id}`} className="hover:underline font-medium text-foreground">{item.title}</Link>
                    </CardDescription>
                </div>
                 <Link href={`/dashboard/items/${item.id}`}>
                    {item.imageUrl && (
                        <Image src={item.imageUrl} alt={item.title} width={48} height={48} className="h-12 w-12 rounded-md object-cover" />
                    )}
                 </Link>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-6 space-y-6">
                {conversation.messages.map((message, index) => {
                    const isCurrentUser = message.senderId === currentUser.id;
                    const sender = isCurrentUser ? currentUser : otherUser;
                    return (
                        <div key={message.id} className={cn('flex items-end gap-3', isCurrentUser && 'justify-end')}>
                             {!isCurrentUser && (
                                 <Avatar className="h-8 w-8">
                                     <AvatarImage src={`https://api.dicebear.com/9.x/thumbs/svg?seed=${sender.email}`} alt={sender.name} />
                                     <AvatarFallback>{sender.name.charAt(0)}</AvatarFallback>
                                 </Avatar>
                             )}
                            <div className={cn(
                                'max-w-xs lg:max-w-md rounded-lg p-3 text-sm',
                                isCurrentUser ? 'bg-primary text-primary-foreground' : 'bg-muted'
                            )}>
                                <p>{message.text}</p>
                                <p className={cn(
                                    'text-xs mt-2',
                                    isCurrentUser ? 'text-primary-foreground/70' : 'text-muted-foreground'
                                )}>
                                    {format(new Date(message.timestamp), 'p')}
                                </p>
                            </div>
                            {isCurrentUser && (
                                 <Avatar className="h-8 w-8">
                                     <AvatarImage src={`https://api.dicebear.com/9.x/thumbs/svg?seed=${sender.email}`} alt={sender.name} />
                                     <AvatarFallback>{sender.name.charAt(0)}</AvatarFallback>
                                 </Avatar>
                             )}
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </CardContent>
            <div className="border-t p-4 bg-background">
                {suggestions.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                        {suggestions.map((text) => (
                            <Button
                                key={text}
                                variant="outline"
                                size="sm"
                                className="h-auto px-2 py-1 text-xs"
                                onClick={() => setNewMessage(text)}
                            >
                                {text}
                            </Button>
                        ))}
                    </div>
                )}
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <Input 
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        autoComplete="off"
                    />
                    <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                        <Send className="h-4 w-4" />
                        <span className="sr-only">Send</span>
                    </Button>
                </form>
            </div>
        </Card>
    </div>
  );
}

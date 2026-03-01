'use client';

import React, { useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getUser, getItems } from '@/lib/data.client';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ItemCard } from '@/components/item-card';
import { ArrowLeft, CheckCircle, Star } from 'lucide-react';

export default function ProfilePage() {
    const params = useParams();
    const { id } = params;

    const user = useMemo(() => (typeof id === 'string' ? getUser(id) : undefined), [id]);
    const userItems = useMemo(() => {
        if (!user) return [];
        return getItems().filter(item => item.ownerId === user.id);
    }, [user]);

    if (!user) {
        return (
            <div className="container mx-auto text-center py-10">
                <h2 className="text-xl font-semibold">User not found</h2>
                <Link href="/dashboard" className="text-primary hover:underline mt-4 inline-block">
                    Back to browsing
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-5xl">
            <div className="mb-6">
                <Button variant="ghost" asChild>
                    <Link href="/dashboard" className="text-muted-foreground">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to browsing
                    </Link>
                </Button>
            </div>

            <Card className="mb-8">
                <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
                    <Avatar className="h-24 w-24 border-4 border-background shadow-md">
                        <AvatarImage src={`https://api.dicebear.com/9.x/thumbs/svg?seed=${user.email}`} alt={user.name} />
                        <AvatarFallback className="text-3xl">{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="text-center md:text-left">
                        <h1 className="font-headline text-3xl font-bold">{user.name}</h1>
                        <p className="text-muted-foreground">{user.city}, {user.state}</p>
                        <div className="mt-2 flex items-center justify-center md:justify-start gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 text-yellow-500" />
                                <span>{user.reputation}% Positive</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <span>{user.completedTransactions} transactions</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div>
                <h2 className="text-2xl font-headline font-bold mb-4">{user.name}'s Listings</h2>
                {userItems.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {userItems.map(item => <ItemCard key={item.id} item={item} />)}
                    </div>
                ) : (
                    <p className="text-muted-foreground">This user has not listed any items yet.</p>
                )}
            </div>
        </div>
    );
}

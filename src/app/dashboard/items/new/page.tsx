'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/use-auth';
import { addItem } from '@/lib/data.client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const itemSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.string().min(1, 'Category is required'),
  exchangeType: z.enum(['donate', 'exchange', 'borrow']),
  imageUrl: z.string().optional(),
  imageHint: z.string().optional(),
});

type ItemFormData = z.infer<typeof itemSchema>;

export default function NewItemPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const { register, handleSubmit, control, setValue, watch, formState: { errors } } = useForm<ItemFormData>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
        imageUrl: "",
    }
  });

  const imagePreview = watch('imageUrl');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast({
            variant: 'destructive',
            title: 'Image too large',
            description: 'Please select an image smaller than 2MB.',
        });
        e.target.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setValue('imageUrl', dataUrl, { shouldValidate: true });
      };
      reader.readAsDataURL(file);
    }
  };


  const onSubmit = (data: ItemFormData) => {
    if (!user) {
      toast({ title: 'Error', description: 'You must be logged in to list an item.', variant: 'destructive' });
      return;
    }
    try {
      const newItem = addItem({ 
        ...data, 
        status: 'available', 
        ownerId: user.id, 
        imageHint: data.title,
        imageUrl: data.imageUrl || '',
      }, user);
      toast({ title: 'Success!', description: 'Your item has been listed.' });
      router.push(`/dashboard/items/${newItem.id}`);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to list your item. Please try again.', variant: 'destructive' });
    }
  };

  return (
    <div className="container mx-auto max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">List a New Item</CardTitle>
          <CardDescription>Share something with your community. Fill out the details below.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Item Title <span className="text-destructive">*</span></Label>
              <Input id="title" {...register('title')} placeholder="e.g., Vintage Denim Jacket" />
              {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="exchangeType">Listing Type <span className="text-destructive">*</span></Label>
                <Controller
                  name="exchangeType"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a type..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="donate">Donate</SelectItem>
                        <SelectItem value="exchange">Exchange</SelectItem>
                        <SelectItem value="borrow">Request to Borrow</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                 {errors.exchangeType && <p className="text-sm text-destructive">{errors.exchangeType.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category <span className="text-destructive">*</span></Label>
                <Input id="category" {...register('category')} placeholder="e.g., Clothes, Books, Electronics" />
                 {errors.category && <p className="text-sm text-destructive">{errors.category.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="image">Item Image</Label>
                <Input 
                    id="image" 
                    type="file" 
                    accept="image/png, image/jpeg, image/gif, image/webp" 
                    onChange={handleImageChange} 
                    className="file:border-0 file:bg-transparent file:text-sm file:font-medium"
                />
                {errors.imageUrl && <p className="text-sm text-destructive">{errors.imageUrl.message}</p>}
            </div>

            {imagePreview && (
                <div className="space-y-2">
                    <Label>Image Preview</Label>
                    <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted">
                        <Image src={imagePreview} alt="Item image preview" fill className="h-full w-full object-cover" />
                    </div>
                </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="description">Description <span className="text-destructive">*</span></Label>
              <Textarea id="description" {...register('description')} rows={5} placeholder="Describe your item..." />
              {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
            </div>

            <div className="flex justify-end">
              <Button type="submit">List Item</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

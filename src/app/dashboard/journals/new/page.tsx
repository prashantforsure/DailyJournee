
'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Book, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Icons } from "@/components/ui/icons";

const journalSchema = z.object({
  name: z.string().min(1, "Journal name is required").max(100, "Journal name must be 100 characters or less"),
  description: z.string().max(500, "Description must be 500 characters or less").optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid color format").optional(),
  icon: z.string().max(50, "Icon name must be 50 characters or less").optional(),
  categoryId: z.string().optional(),
});

type JournalFormData = z.infer<typeof journalSchema>;

interface Category {
  id: string;
  name: string;
}

const iconOptions = [
  { value: 'book', label: 'Book' },
  { value: 'pen', label: 'Pen' },
  { value: 'notebook', label: 'Notebook' },
  { value: 'calendar', label: 'Calendar' },
  { value: 'star', label: 'Star' },
];

export default function NewJournalPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, control, formState: { errors } } = useForm<JournalFormData>({
    resolver: zodResolver(journalSchema),
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get<Category[]>('/api/categories');
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast.error('Failed to load categories');
      }
    };

    fetchCategories();
  }, []);

  const onSubmit = async (data: JournalFormData) => {
    setIsSubmitting(true);
    try {
      await axios.post('/api/journals', data);
      toast.success('Journal created successfully!');
      router.push('/dashboard/journals');
    } catch (error) {
      console.error('Error creating journal:', error);
      toast.error('Failed to create journal');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Create New Journal</CardTitle>
          <CardDescription>Fill in the details to create your new journal.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Journal Name</Label>
              <Input id="name" {...register('name')} placeholder="My Awesome Journal" />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Write a brief description of your journal..."
                rows={3}
              />
              {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="color"
                  type="color"
                  {...register('color')}
                  className="w-12 h-12 p-1 rounded-md"
                />
                <Input
                  {...register('color')}
                  placeholder="#FFFFFF"
                  className="flex-grow"
                />
              </div>
              {errors.color && <p className="text-sm text-red-500">{errors.color.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="icon">Icon</Label>
              <Controller
                name="icon"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an icon" />
                    </SelectTrigger>
                    <SelectContent>
                      {iconOptions.map((icon) => (
                        <SelectItem key={icon.value} value={icon.value}>
                          <div className="flex items-center">
                            <Icons.icon className="mr-2 h-4 w-4" />
                            <span>{icon.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.icon && <p className="text-sm text-red-500">{errors.icon.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoryId">Category</Label>
              <Controller
                name="categoryId"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Book className="mr-2 h-4 w-4" />
                  Create Journal
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
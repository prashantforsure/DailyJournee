// app/(dashboard)/journals/[journalId]/edit/page.tsx

'use client'

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Book, Loader2, Save, ArrowRight } from 'lucide-react';
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

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
 
} from "@/components/ui/dialog";
import {  Pen, Notebook, Calendar, Star } from "lucide-react";

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


type IconOption = {
    value: keyof typeof Icons;
    label: string;
  };
  const Icons = {
    book: Book,
    pen: Pen,
    notebook: Notebook,
    calendar: Calendar,
    star: Star,
  } as const;
  
  const iconOptions: IconOption[] = [
    { value: 'book', label: 'Book' },
    { value: 'pen', label: 'Pen' },
    { value: 'notebook', label: 'Notebook' },
    { value: 'calendar', label: 'Calendar' },
    { value: 'star', label: 'Star' },
  ];

export default function EditJournalPage() {
  const params = useParams();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [journals, setJournals] = useState<{ id: string; name: string }[]>([]);
  const [targetJournalId, setTargetJournalId] = useState<string>('');

  const { register, handleSubmit, control, setValue, formState: { errors } } = useForm<JournalFormData>({
    resolver: zodResolver(journalSchema),
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [journalResponse, categoriesResponse, journalsResponse] = await Promise.all([
          axios.get(`/api/journals/${params.journalId}`),
          axios.get<Category[]>('/api/categories'),
          axios.get<{ id: string; name: string }[]>('/api/journals'),
        ]);

        const journal = journalResponse.data;
        setValue('name', journal.name);
        setValue('description', journal.description);
        setValue('color', journal.color);
        setValue('icon', journal.icon);
        setValue('categoryId', journal.categoryId);

        setCategories(categoriesResponse.data);
        setJournals(journalsResponse.data.filter(j => j.id !== params.journalId));
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load journal data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [params.journalId, setValue]);

  const onSubmit = async (data: JournalFormData) => {
    setIsSubmitting(true);
    try {
      await axios.put(`/api/journals/${params.journalId}`, data);
      toast.success('Journal updated successfully!');
      router.push(`/dashboard/journals/${params.journalId}`);
    } catch (error) {
      console.error('Error updating journal:', error);
      toast.error('Failed to update journal');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/journals/${params.journalId}`);
      toast.success('Journal deleted successfully');
      router.push('/dashboard/journals');
    } catch (error) {
      console.error('Error deleting journal:', error);
      toast.error('Failed to delete journal');
    }
  };

  const handleTransfer = async () => {
    if (!targetJournalId) {
      toast.error('Please select a target journal');
      return;
    }

    try {
      await axios.post(`/api/journals/${params.journalId}`, { targetJournalId });
      toast.success('Entries transferred successfully');
      router.push(`/dashboard/journals/${targetJournalId}`);
    } catch (error) {
      console.error('Error transferring entries:', error);
      toast.error('Failed to transfer entries');
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Edit Journal</CardTitle>
          <CardDescription>Update your journal details or manage its entries.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Journal Name</Label>
              <Input id="name" {...register('name')} />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register('description')}
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
      {iconOptions.map((icon) => {
        const IconComponent = Icons[icon.value];
        return (
          <SelectItem key={icon.value} value={icon.value}>
            <div className="flex items-center">
              <IconComponent className="mr-2 h-4 w-4" />
              <span>{icon.label}</span>
            </div>
          </SelectItem>
        );
      })}
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
                  <Select onValueChange={field.onChange} value={field.value || undefined}>
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
          <CardFooter className="flex justify-between">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
            <div className="space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsTransferDialogOpen(true)}>
                Transfer Entries
              </Button>
              <Button type="button" variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
                Delete Journal
              </Button>
            </div>
          </CardFooter>
        </form>
      </Card>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure you want to delete this journal?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the journal and all its entries.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isTransferDialogOpen} onOpenChange={setIsTransferDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transfer Entries to Another Journal</DialogTitle>
            <DialogDescription>
              Select a journal to transfer all entries from this journal to. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <Select onValueChange={setTargetJournalId} value={targetJournalId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a journal" />
            </SelectTrigger>
            <SelectContent>
              {journals.map((journal) => (
                <SelectItem key={journal.id} value={journal.id}>
                  {journal.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTransferDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleTransfer}>
              <ArrowRight className="mr-2 h-4 w-4" />
              Transfer Entries
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
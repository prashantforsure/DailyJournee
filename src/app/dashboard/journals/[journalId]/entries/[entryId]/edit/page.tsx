
'use client'

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSession } from 'next-auth/react';
import { Editor } from '@tinymce/tinymce-react';
import { 
  Save, 
  Loader2, 
  Image as ImageIcon, 
  Trash2, 
  ArrowLeft,
  Plus,
  X
} from 'lucide-react';
import { toast } from 'react-hot-toast';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const entrySchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title must be 255 characters or less"),
  content: z.string().min(1, "Content is required"),
  mood: z.string().optional(),
  categoryId: z.string().optional(),
  tagIds: z.array(z.string()),
  mediaUrls: z.array(z.string().url()),
  isQuickEntry: z.boolean(),
  isFavorite: z.boolean(),
});

type EntryFormData = z.infer<typeof entrySchema>;

interface Category {
  id: string;
  name: string;
}

interface Tag {
  id: string;
  name: string;
}

const moodOptions = [
  'Happy', 'Sad', 'Excited', 'Anxious', 'Calm', 'Angry', 'Neutral'
];

export default function EditEntryPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isMediaDialogOpen, setIsMediaDialogOpen] = useState(false);
  const [newMediaUrl, setNewMediaUrl] = useState('');

  const { register, handleSubmit, control, setValue, watch, reset, formState: { errors } } = useForm<EntryFormData>({
    resolver: zodResolver(entrySchema),
    defaultValues: {
      tagIds: [],
      mediaUrls: [],
      isQuickEntry: false,
      isFavorite: false,
    },
  });

  const watchedMediaUrls = watch('mediaUrls');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [entryResponse, categoriesResponse, tagsResponse] = await Promise.all([
          axios.get(`/api/journals/${params.journalId}/entries/${params.entryId}`),
          axios.get<Category[]>('/api/categories'),
          axios.get<Tag[]>('/api/tags'),
        ]);

        const entry = entryResponse.data;
        reset({
          title: entry.title,
          content: entry.content,
          mood: entry.mood,
          categoryId: entry.category?.id,
          tagIds: entry.tags.map((tag: Tag) => tag.id),
          mediaUrls: entry.media.map((media: { url: string }) => media.url),
          isQuickEntry: entry.isQuickEntry,
          isFavorite: entry.isFavorite,
        });

        setCategories(categoriesResponse.data);
        setTags(tagsResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load entry data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [params.journalId, params.entryId, reset]);

  const onSubmit = async (data: EntryFormData) => {
    setIsSubmitting(true);
    try {
      await axios.put(`/api/journals/${params.journalId}/entries/${params.entryId}`, data);
      toast.success('Entry updated successfully!');
      router.push(`/journals/${params.journalId}/entries/${params.entryId}`);
    } catch (error) {
      console.error('Error updating entry:', error);
      toast.error('Failed to update entry');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/journals/${params.journalId}/entries/${params.entryId}`);
      toast.success('Entry deleted successfully');
      router.push(`/journals/${params.journalId}/entries`);
    } catch (error) {
      console.error('Error deleting entry:', error);
      toast.error('Failed to delete entry');
    }
  };

  const handleAddMedia = () => {
    if (newMediaUrl) {
      setValue('mediaUrls', [...watchedMediaUrls, newMediaUrl]);
      setNewMediaUrl('');
      setIsMediaDialogOpen(false);
    }
  };

  const handleRemoveMedia = (urlToRemove: string) => {
    setValue('mediaUrls', watchedMediaUrls.filter(url => url !== urlToRemove));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Edit Entry</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                {...register('title')}
                className="text-xl font-semibold"
              />
              {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Controller
                name="content"
                control={control}
                render={({ field }) => (
                  <Editor
                    apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
                    init={{
                      height: 500,
                      menubar: false,
                      plugins: [
                        'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                        'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                        'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                      ],
                      toolbar: 'undo redo | blocks | ' +
                        'bold italic forecolor | alignleft aligncenter ' +
                        'alignright alignjustify | bullist numlist outdent indent | ' +
                        'removeformat | help',
                      content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
                    }}
                    onEditorChange={(content) => field.onChange(content)}
                    value={field.value}
                  />
                )}
              />
              {errors.content && <p className="text-sm text-red-500">{errors.content.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mood">Mood</Label>
                <Controller
                  name="mood"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your mood" />
                      </SelectTrigger>
                      <SelectContent>
                        {moodOptions.map((mood) => (
                          <SelectItem key={mood} value={mood}>{mood}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
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
                          <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <label key={tag.id} className="flex items-center space-x-2">
                    <Checkbox
                      checked={watch('tagIds').includes(tag.id)}
                      onCheckedChange={(checked) => {
                        const currentTags = watch('tagIds');
                        if (checked) {
                          setValue('tagIds', [...currentTags, tag.id]);
                        } else {
                          setValue('tagIds', currentTags.filter(id => id !== tag.id));
                        }
                      }}
                    />
                    <span>{tag.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Media</Label>
              <div className="flex flex-wrap gap-2">
                {watchedMediaUrls.map((url, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    <span className="max-w-[200px] truncate">{url}</span>
                    <button type="button" onClick={() => handleRemoveMedia(url)} className="text-red-500 hover:text-red-700">
                      <X className="h-4 w-4" />
                    </button>
                  </Badge>
                ))}
              </div>
              <Button type="button" variant="outline" onClick={() => setIsMediaDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Media
              </Button>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isQuickEntry"
                {...register('isQuickEntry')}
              />
              <Label htmlFor="isQuickEntry">Quick Entry</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isFavorite"
                {...register('isFavorite')}
              />
              <Label htmlFor="isFavorite">Favorite</Label>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Entry
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Update Entry
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure you want to delete this entry?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the entry and all its associated data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isMediaDialogOpen} onOpenChange={setIsMediaDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Media</DialogTitle>
            <DialogDescription>
              Enter the URL of the media you want to add to your entry.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={newMediaUrl}
            onChange={(e) => setNewMediaUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMediaDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddMedia}>Add Media</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
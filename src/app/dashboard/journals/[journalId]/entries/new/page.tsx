'use client'

import React, { useState, useEffect, useRef } from 'react';
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
  Smile, 
  Tag, 
  Folder,
  Wand2
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface Category {
  id: string;
  name: string;
}

interface Tag {
  id: string;
  name: string;
}

const entrySchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title must be 255 characters or less"),
  content: z.string().min(1, "Content is required"),
  mood: z.string().optional(),
  categoryId: z.string().optional(),
  tagIds: z.array(z.string()).optional(),
  mediaUrls: z.array(z.string().url()).optional(),
});

type EntryFormData = z.infer<typeof entrySchema>;

const moodOptions = [
  'Happy', 'Sad', 'Excited', 'Anxious', 'Calm', 'Angry', 'Neutral'
];

export default function NewEntryPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMediaDialogOpen, setIsMediaDialogOpen] = useState(false);
  const [mediaUrl, setMediaUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const editorRef = useRef<any>(null);
  

  const { register, handleSubmit, control, setValue, watch, formState: { errors } } = useForm<EntryFormData>({
    resolver: zodResolver(entrySchema),
    defaultValues: {
      tagIds: [],
      mediaUrls: [],
    },
  });

  
  const content = watch('content')

  const watchedMediaUrls = watch('mediaUrls');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesResponse, tagsResponse] = await Promise.all([
          axios.get<Category[]>('/api/journals/[journalId]/categories'),
          axios.get<Tag[]>('/api/tags'),
        ]);

        setCategories(categoriesResponse.data);
        setTags(tagsResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load categories and tags');
      }
    };

    fetchData();
  }, []);

  const onSubmit = async (data: EntryFormData) => {
    setIsSubmitting(true);
    try {
      await axios.post(`/api/journals/${params.journalId}/entries`, data);
      toast.success('Entry created successfully!');
      router.push(`/dashboard/journals/${params.journalId}/entries`);
    } catch (error) {
      console.error('Error creating entry:', error);
      toast.error('Failed to create entry');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddMedia = () => {
    if (mediaUrl) {
      setValue('mediaUrls', [...(watchedMediaUrls || []), mediaUrl]);
      setMediaUrl('');
      setIsMediaDialogOpen(false);
    }
  };

  const handleRemoveMedia = (urlToRemove: string) => {
    setValue('mediaUrls', watchedMediaUrls?.filter(url => url !== urlToRemove) || []);
  };

  const handleGenerateContent = async () => {
    setIsGenerating(true);
    try {
      const currentContent = watch('content');
      const prompt = currentContent ? `Continue this journal entry: ${currentContent}` : "Generate a journal entry";
      const response = await axios.post('/api/ai/generate', { prompt });
      const generatedContent = response.data.content;
      setValue("content", currentContent + generatedContent, { shouldValidate: true });
      toast.success('Content generated successfully!');
    } catch (error) {
      console.error('Error generating content:', error);
      toast.error('Failed to generate content');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">New Entry</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                {...register('title')}
                className="text-xl font-semibold"
                placeholder="Enter your entry title..."
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
                    onInit={(evt, editor) => editorRef.current = editor}
                    initialValue={field.value}
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
                      content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
                      directionality: 'ltr',
                    }}
                    onEditorChange={(content) => field.onChange(content)}
                  />
                )}
              />
              {errors.content && <p className="text-sm text-red-500">{errors.content.message}</p>}
              <Button 
                type="button" 
                onClick={handleGenerateContent} 
                disabled={isGenerating}
                className="mt-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Generate Content
                  </>
                )}
              </Button>
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
                          <SelectItem key={mood} value={mood}>
                            <div className="flex items-center">
                              <Smile className="mr-2 h-4 w-4" />
                              <span>{mood}</span>
                            </div>
                          </SelectItem>
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
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            <div className="flex items-center">
                              <Folder className="mr-2 h-4 w-4" />
                              <span>{category.name}</span>
                            </div>
                          </SelectItem>
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
                    <input
                      type="checkbox"
                      value={tag.id}
                      {...register('tagIds')}
                      className="form-checkbox h-4 w-4 text-blue-600"
                    />
                    <span>{tag.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Media</Label>
              <div className="flex flex-wrap gap-2">
                {watchedMediaUrls?.map((url, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    <span className="max-w-[200px] truncate">{url}</span>
                    <button 
                      type="button" 
                      onClick={() => handleRemoveMedia(url)} 
                      className="text-red-500 hover:text-red-700"
                    >
                      &times;
                    </button>
                  </Badge>
                ))}
              </div>
              <Button type="button" variant="outline" onClick={() => setIsMediaDialogOpen(true)}>
                <ImageIcon className="mr-2 h-4 w-4" />
                Add Media
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Create Entry
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Dialog open={isMediaDialogOpen} onOpenChange={setIsMediaDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Media</DialogTitle>
            <DialogDescription>
              Enter the URL of the media you want to add to your entry.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={mediaUrl}
            onChange={(e) => setMediaUrl(e.target.value)}
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
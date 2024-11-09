'use client'

import React, { useState } from 'react';
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
  ArrowLeft,
  Bold,
  Italic,
  List,
  ListOrdered,
  Smile
} from 'lucide-react';
import { toast } from 'react-hot-toast';

import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const quickEntrySchema = z.object({
  content: z.string().min(1, "Content is required"),
  mood: z.string().optional(),
  isFavorite: z.boolean(),
});

type QuickEntryFormData = z.infer<typeof quickEntrySchema>;

const moodOptions = [
  'Happy', 'Sad', 'Excited', 'Anxious', 'Calm', 'Angry', 'Neutral'
];

export default function QuickEntryPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [useRichText, setUseRichText] = useState(false);

  const { register, handleSubmit, control, setValue, watch, formState: { errors } } = useForm<QuickEntryFormData>({
    resolver: zodResolver(quickEntrySchema),
    defaultValues: {
      content: '',
      isFavorite: false,
    },
  });

  const onSubmit = async (data: QuickEntryFormData) => {
    setIsSubmitting(true);
    try {
      await axios.post(`/api/journals/${params.journalId}/quick-entry`, {
        ...data,
        isQuickEntry: true,
      });
      toast.success('Quick entry saved successfully!');
      router.push(`/journals/${params.journalId}/entries`);
    } catch (error) {
      console.error('Error saving quick entry:', error);
      toast.error('Failed to save quick entry');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormatText = (format: string) => {
    if (useRichText) return; // Don't apply formatting in rich text mode

    const textarea = document.getElementById('content') as HTMLTextAreaElement;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    let formattedText = '';

    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        break;
      case 'bullet':
        formattedText = `\n- ${selectedText}`;
        break;
      case 'number':
        formattedText = `\n1. ${selectedText}`;
        break;
    }

    const newContent = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
    setValue('content', newContent);
  };

  return (
    <div className="container mx-auto py-10">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Quick Entry</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="content">Content</Label>
                <div className="flex items-center space-x-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => handleFormatText('bold')}
                          disabled={useRichText}
                        >
                          <Bold className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Bold</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => handleFormatText('italic')}
                          disabled={useRichText}
                        >
                          <Italic className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Italic</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => handleFormatText('bullet')}
                          disabled={useRichText}
                        >
                          <List className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Bullet List</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => handleFormatText('number')}
                          disabled={useRichText}
                        >
                          <ListOrdered className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Numbered List</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
              {useRichText ? (
                <Controller
                  name="content"
                  control={control}
                  render={({ field }) => (
                    <Editor
                      apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
                      init={{
                        height: 300,
                        menubar: false,
                        plugins: [
                          'advlist', 'autolink', 'lists', 'link', 'charmap', 'preview',
                          'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                          'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                        ],
                        toolbar: 'undo redo | blocks | ' +
                          'bold italic | alignleft aligncenter ' +
                          'alignright alignjustify | bullist numlist outdent indent | ' +
                          'removeformat',
                        content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
                      }}
                      onEditorChange={(content) => field.onChange(content)}
                      value={field.value}
                    />
                  )}
                />
              ) : (
                <Textarea
                  id="content"
                  {...register('content')}
                  rows={10}
                  placeholder="What's on your mind?"
                />
              )}
              {errors.content && <p className="text-sm text-red-500">{errors.content.message}</p>}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="useRichText"
                checked={useRichText}
                onCheckedChange={(checked) => setUseRichText(checked as boolean)}
              />
              <Label htmlFor="useRichText">Use Rich Text Editor</Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mood">Mood</Label>
              <Controller
                name="mood"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="How are you feeling?" />
                    </SelectTrigger>
                    <SelectContent>
                      {moodOptions.map((mood) => (
                        <SelectItem key={mood} value={mood}>
                          <div className="flex items-center">
                            <Smile className="mr-2 h-4 w-4" />
                            {mood}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isFavorite"
                {...register('isFavorite')}
              />
              <Label htmlFor="isFavorite">Mark as Favorite</Label>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Quick Entry
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
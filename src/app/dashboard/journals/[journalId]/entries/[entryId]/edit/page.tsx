'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import axios from 'axios'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { 
  Save, 
  Loader2, 
  Image as ImageIcon, 
  Smile, 
  Folder,
  Wand2,
  Trash2,
} from 'lucide-react'
import { toast } from 'react-hot-toast'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface Category {
  id: string
  name: string
}

interface EntryFormData {
  title: string
  content: string
  mood?: string
  categoryId?: string
  mediaUrls?: string[]
  isFavorite: boolean
}

const entrySchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title must be 255 characters or less"),
  content: z.string().min(1, "Content is required"),
  mood: z.string().optional(),
  categoryId: z.string().optional(),
  mediaUrls: z.array(z.string().url()).optional(),
  isFavorite: z.boolean(),
})

const moodOptions = [
  'Happy', 'Sad', 'Excited', 'Anxious', 'Calm', 'Angry', 'Neutral'
]

export default function EditEntryPage() {
  const params = useParams<{ journalId: string; entryId: string }>()
  const router = useRouter()
  
  const [categories, setCategories] = useState<Category[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isMediaDialogOpen, setIsMediaDialogOpen] = useState(false)
  const [mediaUrl, setMediaUrl] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const { register, handleSubmit, control, setValue, watch, formState: { errors } } = useForm<EntryFormData>({
    resolver: zodResolver(entrySchema),
    defaultValues: {
      mediaUrls: [],
      isFavorite: false,
    },
  })

  const watchedMediaUrls = watch('mediaUrls')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesResponse, entryResponse] = await Promise.all([
          axios.get<Category[]>(`/api/journals/${params.journalId}/categories`),
          axios.get(`/api/journals/${params.journalId}/entries/${params.entryId}`)
        ])
        setCategories(categoriesResponse.data)
        
        const entryData = entryResponse.data
        setValue('title', entryData.title)
        setValue('content', entryData.content)
        setValue('mood', entryData.mood)
        setValue('categoryId', entryData.categoryId)
        setValue('mediaUrls', entryData.mediaUrls || [])
        setValue('isFavorite', entryData.isFavorite)
      } catch (error) {
        console.error('Error fetching data:', error)
        toast.error('Failed to load entry data')
      }
    }

    fetchData()
  }, [params.journalId, params.entryId, setValue])

  const onSubmit = async (data: EntryFormData) => {
    setIsSubmitting(true)
    try {
      await axios.put(`/api/journals/${params.journalId}/entries/${params.entryId}`, data)
      toast.success('Entry updated successfully!')
      router.push(`/dashboard/journals/${params.journalId}/entries/${params.entryId}`)
    } catch (error) {
      console.error('Error updating entry:', error)
      toast.error('Failed to update entry')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddMedia = () => {
    if (mediaUrl) {
      setValue('mediaUrls', [...(watchedMediaUrls || []), mediaUrl])
      setMediaUrl('')
      setIsMediaDialogOpen(false)
    }
  }

  const handleRemoveMedia = (urlToRemove: string) => {
    setValue('mediaUrls', watchedMediaUrls?.filter(url => url !== urlToRemove) || [])
  }

  const handleGenerateContent = async () => {
    setIsGenerating(true);
    try {
      const content = watch('content'); 
      const response = await axios.post('/api/ai/generate', { prompt: content });
      const generatedContent = response.data.content;
      setValue("content", generatedContent, { shouldValidate: true });
      toast.success('Content generated successfully!');
    } catch (error) {
      console.error('Error generating content:', error);
      toast.error('Failed to generate content');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteEntry = async () => {
    try {
      await axios.delete(`/api/journals/${params.journalId}/entries/${params.entryId}`)
      toast.success('Entry deleted successfully!')
      router.push(`/dashboard/journals/${params.journalId}/entries`)
    } catch (error) {
      console.error('Error deleting entry:', error)
      toast.error('Failed to delete entry')
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] py-3 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-4xl mx-auto shadow-lg p-3">
        <div className='grid justify-items-end'>
          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogTrigger asChild>
                  <Button
                    type="button"
                    variant="destructive"
                    className="bg-red-500   text-white hover:bg-red-600 transition-colors duration-200"
                  ><Trash2 className="mr-2 h-4 w-4 " /></Button>
                    
                 
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure you want to delete this entry?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your journal entry.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteEntry} className="bg-red-500 text-white hover:bg-red-600">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-6 pt-6">
          <div className="space-y-2">
              <div className="relative">
                <input
                  type="text"
                  id="title"
                  {...register('title')}
                  className="w-full text-lg font-semibold border-b-2 border-[#ccc] bg-transparent outline-none py-2 px-0 transition-all duration-300 focus:border-[#333] peer"
                  placeholder=" "
                />
                <label
                  htmlFor="title"
                  className="absolute left-0 top-2 text-gray-500 duration-300 transform -translate-y-6 scale-75 origin-[0] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:text-[#333] peer-focus:scale-75 peer-focus:-translate-y-6"
                >
                  Title
                </label>
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#333] transform scale-x-0 transition-transform duration-300 origin-bottom-left peer-focus:scale-x-100"></div>
              </div>
              {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
            </div>


            <div className="space-y-2">
              <div className="relative">
                <textarea
                  id="content"
                  {...register('content')}
                  className="w-full min-h-[200px] text-base border-b-2 border-[#ccc] bg-transparent outline-none py-2 px-0 transition-all duration-300 focus:border-[#333] peer"
                  placeholder="Press // to write prompt for AI Assistance"
                />
                <label
                  htmlFor="content"
                  className="absolute left-0 top-2 text-gray-500 duration-300 transform -translate-y-6 scale-75 origin-[0] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:text-[#333] peer-focus:scale-75 peer-focus:-translate-y-6"
                >
                  
                </label>
                {/* <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#333] transform scale-x-0 transition-transform duration-300 origin-bottom-left peer-focus:scale-x-100"></div> */}
              </div>
              {errors.content && <p className="text-sm text-red-500">{errors.content.message}</p>}
              <Button 
                type="button" 
                onClick={handleGenerateContent} 
                disabled={isGenerating}
                className="mt-2 bg-[#98FF98] text-gray-800 hover:bg-[#7AE47A] transition-colors duration-200"
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mood" className="text-lg font-semibold text-gray-700">Mood</Label>
                <Controller
                  name="mood"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="border-2 border-[#FFFFD1] focus:border-[#98FF98] focus:ring-[#98FF98]">
                        <SelectValue placeholder="Select your mood" />
                      </SelectTrigger>
                      <SelectContent>
                        {moodOptions.map((mood) => (
                          <SelectItem key={mood} value={mood}>
                            <div className="flex items-center">
                              <Smile className="mr-2 h-4 w-4 text-[#FFD1DC]" />
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
                <Label htmlFor="categoryId" className="text-lg font-semibold text-gray-700">Category</Label>
                <Controller
                  name="categoryId"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="border-2 border-[#BFEAF5] focus:border-[#98FF98] focus:ring-[#98FF98]">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            <div className="flex items-center">
                              <Folder className="mr-2 h-4 w-4 text-[#BFEAF5]" />
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
              <Label className="text-lg font-semibold text-gray-700">Media</Label>
              <div className="flex flex-wrap gap-2">
                {watchedMediaUrls?.map((url, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-2 bg-[#FFD1DC] text-gray-800">
                    <ImageIcon className="h-4 w-4" />
                    <span className="max-w-[200px] truncate">{url}</span>
                    <button 
                      type="button" 
                      onClick={() => handleRemoveMedia(url)} 
                      className="text-red-500 hover:text-red-700 transition-colors duration-200"
                    >
                      &times;
                    </button>
                  </Badge>
                ))}
              </div>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsMediaDialogOpen(true)}
                className="border-2 border-[#BFEAF5] text-gray-800 hover:bg-[#BFEAF5] transition-colors duration-200"
              >
                <ImageIcon className="mr-2 h-4 w-4" />
                Add Media
              </Button>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isFavorite"
                {...register('isFavorite')}
                className="rounded border-gray-300 text-[#98FF98] focus:ring-[#98FF98]"
              />
              <Label htmlFor="isFavorite" className="text-lg font-semibold text-gray-700">Mark as Favorite</Label>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between ">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.back()}
              className="border-2 border-[#FFD1DC] text-gray-800 hover:bg-[#FFD1DC] transition-colors duration-200"
            >
              Cancel
            </Button>
            <div className="space-x-2">
              {/* <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogTrigger asChild>
                  <Button
                    type="button"
                    variant="destructive"
                    className="bg-red-500 text-white hover:bg-red-600 transition-colors duration-200"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure you want to delete this entry?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your journal entry.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteEntry} className="bg-red-500 text-white hover:bg-red-600">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog> */}
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-[#98FF98] text-gray-800 hover:bg-[#7AE47A] transition-colors duration-200"
              >
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
            </div>
          </CardFooter>
        </form>
      </Card>

      <Dialog open={isMediaDialogOpen} onOpenChange={setIsMediaDialogOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-800">Add Media</DialogTitle>
            <DialogDescription className="text-gray-600">
              Enter the URL of the media you want to add to your entry.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={mediaUrl}
            onChange={(e) => setMediaUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="border-2 border-[#BFEAF5] focus:border-[#98FF98] focus:ring-[#98FF98]"
          />
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsMediaDialogOpen(false)}
              className="border-2 border-[#FFD1DC] text-gray-800 hover:bg-[#FFD1DC] transition-colors duration-200"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddMedia}
              className="bg-[#98FF98] text-gray-800 hover:bg-[#7AE47A] transition-colors duration-200"
            >
              Add Media
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
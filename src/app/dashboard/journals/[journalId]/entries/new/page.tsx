'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import axios from 'axios'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useSession } from 'next-auth/react'
import { EditorState, convertToRaw, ContentState } from 'draft-js'
import dynamic from 'next/dynamic'
import draftToHtml from 'draftjs-to-html'
import htmlToDraft from 'html-to-draftjs'
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css'
import { 
  Save, 
  Loader2, 
  Image as ImageIcon, 
  Smile, 
  Tag, 
  Folder,
  Wand2,
} from 'lucide-react'
import { toast } from 'react-hot-toast'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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

// Dynamically import the Editor component
const Editor = dynamic(
  () => import('react-draft-wysiwyg').then((mod) => mod.Editor),
  { ssr: false }
)

interface Category {
  id: string
  name: string
}

interface Tag {
  id: string
  name: string
}

interface EntryFormData {
  title: string
  content: string
  mood?: string
  categoryId?: string
  tagIds?: string[]
  mediaUrls?: string[]
}

const entrySchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title must be 255 characters or less"),
  content: z.string().min(1, "Content is required"),
  mood: z.string().optional(),
  categoryId: z.string().optional(),
  tagIds: z.array(z.string()).optional(),
  mediaUrls: z.array(z.string().url()).optional(),
})

const moodOptions = [
  'Happy', 'Sad', 'Excited', 'Anxious', 'Calm', 'Angry', 'Neutral'
]

export default function NewEntryPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isMediaDialogOpen, setIsMediaDialogOpen] = useState(false)
  const [mediaUrl, setMediaUrl] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [editorState, setEditorState] = useState(() => EditorState.createEmpty())
  const [isEditorMounted, setIsEditorMounted] = useState(false)

  const { register, handleSubmit, control, setValue, watch, formState: { errors } } = useForm<EntryFormData>({
    resolver: zodResolver(entrySchema),
    defaultValues: {
      tagIds: [],
      mediaUrls: [],
    },
  })

  const watchedMediaUrls = watch('mediaUrls')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesResponse, tagsResponse] = await Promise.all([
          axios.get<Category[]>('/api/journals/[journalId]/categories'),
          axios.get<Tag[]>('/api/tags'),
        ])

        setCategories(categoriesResponse.data)
        setTags(tagsResponse.data)
      } catch (error) {
        console.error('Error fetching data:', error)
        toast.error('Failed to load categories and tags')
      }
    }

    fetchData()
    setIsEditorMounted(true)
  }, [])

  const onSubmit = async (data: EntryFormData) => {
    setIsSubmitting(true)
    try {
      const contentHtml = draftToHtml(convertToRaw(editorState.getCurrentContent()))
      await axios.post(`/api/journals/${params.journalId}/entries`, { ...data, content: contentHtml })
      toast.success('Entry created successfully!')
      router.push(`/dashboard/journals/${params.journalId}/entries`)
    } catch (error) {
      console.error('Error creating entry:', error)
      toast.error('Failed to create entry')
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
    const currentContent = editorState.getCurrentContent().getPlainText()
    const prompt = currentContent || "Generate a journal entry"

    setIsGenerating(true)
    try {
      const response = await axios.post('/api/ai/generate', { prompt })
      const generatedContent = response.data.content
      const contentBlock = htmlToDraft(generatedContent)
      if (contentBlock) {
        const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks)
        const newEditorState = EditorState.push(editorState, contentState, 'insert-characters')
        setEditorState(newEditorState)
      }
      toast.success('Content generated successfully!')
    } catch (error) {
      console.error('Error generating content:', error)
      toast.error('Failed to generate content')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] py-10 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-4xl mx-auto shadow-lg">
        <CardHeader className="bg-[#BFEAF5] text-gray-800">
          <CardTitle className="text-3xl font-bold">New Entry</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-lg font-semibold text-gray-700">Title</Label>
              <Input
                id="title"
                {...register('title')}
                className="text-xl font-semibold border-2 border-[#FFD1DC] focus:border-[#98FF98] focus:ring-[#98FF98]"
                placeholder="Enter your entry title..."
              />
              {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="content" className="text-lg font-semibold text-gray-700">Content</Label>
              {isEditorMounted && (
                <Editor
                  editorState={editorState}
                  onEditorStateChange={setEditorState}
                  wrapperClassName="border-2 border-[#FFD1DC] rounded-md"
                  editorClassName="min-h-[300px] px-4 py-2"
                  toolbar={{
                    options: ['inline', 'blockType', 'list', 'textAlign', 'link', 'emoji', 'image', 'history'],
                    inline: { inDropdown: true },
                    list: { inDropdown: true },
                    textAlign: { inDropdown: true },
                    link: { inDropdown: true },
                    history: { inDropdown: true },
                  }}
                />
              )}
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
              <Label className="text-lg font-semibold text-gray-700">Tags</Label>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <label key={tag.id} className="flex items-center space-x-2 bg-[#FFFFD1] rounded-full px-3 py-1 text-sm">
                    <input
                      type="checkbox"
                      value={tag.id}
                      {...register('tagIds')}
                      className="form-checkbox h-4 w-4 text-[#98FF98]"
                    />
                    <span>{tag.name}</span>
                  </label>
                ))}
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
          </CardContent>
          <CardFooter className="flex justify-between bg-[#BFEAF5]">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.back()}
              className="border-2 border-[#FFD1DC] text-gray-800 hover:bg-[#FFD1DC] transition-colors duration-200"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-[#98FF98] text-gray-800 hover:bg-[#7AE47A] transition-colors duration-200"
            >
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
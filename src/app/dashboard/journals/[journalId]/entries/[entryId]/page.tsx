'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import axios from 'axios'
import { format } from 'date-fns'

import { 
  Calendar,
  Clock,
  Edit,
  Heart,
  Share2,
  Tag,
  Folder,

  ArrowLeft,
  Loader2,
} from 'lucide-react'
import { toast } from 'react-hot-toast'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,

} from "@/components/ui/dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import Loader from '@/components/Loader'

interface Entry {
  id: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
  mood: string
  isFavorite: boolean
  tags: { id: string; name: string }[]
  media: { id: string; url: string }[]
  category: { id: string; name: string } | null
}

interface RelatedEntry {
  id: string
  title: string
  createdAt: string
}

const moodColors = {
  Happy: 'bg-yellow-100 text-yellow-800',
  Sad: 'bg-blue-100 text-blue-800',
  Excited: 'bg-green-100 text-green-800',
  Anxious: 'bg-purple-100 text-purple-800',
  Calm: 'bg-teal-100 text-teal-800',
  Angry: 'bg-red-100 text-red-800',
  Neutral: 'bg-gray-100 text-gray-800',
}

export default function EntryDetailsPage() {
  const params = useParams()
  const router = useRouter()

  const [entry, setEntry] = useState<Entry | null>(null)
  const [relatedEntries, setRelatedEntries] = useState<RelatedEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)

  useEffect(() => {
    const fetchEntryDetails = async () => {
      setIsLoading(true)
      try {
        const response = await axios.get(`/api/journals/${params.journalId}/entries/${params.entryId}`)
        setEntry(response.data.entry)
        setRelatedEntries(response.data.relatedEntries)
      } catch (error) {
        console.error('Error fetching entry details:', error)
        toast.error('Failed to load entry details')
      } finally {
        setIsLoading(false)
      }
    }

    fetchEntryDetails()
  }, [params.journalId, params.entryId])

  const handleToggleFavorite = async () => {
    try {
      const response = await axios.put(`/api/journals/${params.journalId}/entries/${params.entryId}`, {
        isFavorite: !entry?.isFavorite,
      })
      setEntry(prevEntry => ({ ...prevEntry!, isFavorite: response.data.isFavorite }))
      toast.success(entry?.isFavorite ? 'Removed from favorites' : 'Added to favorites')
    } catch (error) {
      console.error('Error toggling favorite:', error)
      toast.error('Failed to update favorite status')
    }
  }

  const handleShare = (platform: string) => {
    // Implement sharing logic here
    console.log(`Sharing to ${platform}`)
    toast.success(`Shared to ${platform}`)
    setIsShareDialogOpen(false)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
         <Loader />
      </div>
    )
  }

  if (!entry) {
    return <div className="text-center text-2xl text-gray-500 mt-8">Entry not found</div>
  }

  return (
    <div className="container mx-auto py-3 px-4 sm:px-6 lg:px-8 space-y-8">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4 hover:bg-transparent hover:text-primary transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Entries
      </Button>

      <Card className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-purple-100 to-pink-100 p-6">
          <div className="flex justify-between items-center">
            <CardTitle className="text-3xl font-bold text-primary">{entry.title}</CardTitle>
            <div className="flex space-x-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" onClick={handleToggleFavorite} className="bg-white hover:bg-gray-100">
                      <Heart className={`h-4 w-4 ${entry.isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {entry.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" onClick={() => router.push(`/dashboard/journals/${params.journalId}/entries/${params.entryId}/edit`)} className="bg-white hover:bg-gray-100">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    Edit entry
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" onClick={() => setIsShareDialogOpen(true)} className="bg-white hover:bg-gray-100">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    Share entry
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600">
            <div className="flex items-center">
              <Calendar className="mr-1 h-4 w-4" />
              {format(new Date(entry.createdAt), 'MMMM d, yyyy')}
            </div>
            <div className="flex items-center">
              <Clock className="mr-1 h-4 w-4" />
              {format(new Date(entry.createdAt), 'h:mm a')}
            </div>
            {entry.mood && (
              <Badge variant="secondary" className={`ml-2 ${moodColors[entry.mood as keyof typeof moodColors]}`}>
                {entry.mood}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="prose max-w-none text-gray-800" dangerouslySetInnerHTML={{ __html: entry.content }} />

          {entry.media.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-primary">Attached Media</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {entry.media.map((media) => (
                  <div key={media.id} className="relative aspect-square rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
                    <img
                      src={media.url}
                      alt="Attached media"
                      className="object-cover w-full h-full"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
            {entry.category && (
              <div className="flex items-center">
                <Folder className="h-4 w-4 mr-2" />
                <span>{entry.category.name}</span>
              </div>
            )}

            {entry.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <Tag className="h-4 w-4" />
                {entry.tags.map((tag) => (
                  <Badge key={tag.id} variant="outline" className="bg-gray-100">
                    {tag.name}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {relatedEntries.length > 0 && (
        <Card className="max-w-4xl mx-auto mt-8 bg-white shadow-md">
          <CardHeader className="bg-gradient-to-r from-blue-100 to-green-100 p-6">
            <CardTitle className="text-2xl font-bold text-primary">Related Entries</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ul className="space-y-4">
              {relatedEntries.map((relatedEntry) => (
                <li key={relatedEntry.id} className="flex justify-between items-center p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                  <Button
                    variant="link"
                    onClick={() => router.push(`/dashboard/journals/${params.journalId}/entries/${relatedEntry.id}`)}
                    className="text-left text-primary hover:text-primary-dark"
                  >
                    {relatedEntry.title}
                  </Button>
                  <span className="text-sm text-gray-500">
                    {format(new Date(relatedEntry.createdAt), 'MMMM d, yyyy')}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-primary">Share Entry</DialogTitle>
            <DialogDescription className="text-gray-600">
              Choose a platform to share your entry.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <Button onClick={() => handleShare('Twitter')} className="bg-blue-400 hover:bg-blue-500 text-white">Twitter</Button>
            <Button onClick={() => handleShare('Facebook')} className="bg-blue-600 hover:bg-blue-700 text-white">Facebook</Button>
            <Button onClick={() => handleShare('LinkedIn')} className="bg-blue-700 hover:bg-blue-800 text-white">LinkedIn</Button>
            <Button onClick={() => handleShare('Email')} className="bg-gray-500 hover:bg-gray-600 text-white">Email</Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsShareDialogOpen(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
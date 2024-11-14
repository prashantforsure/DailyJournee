'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import axios from 'axios'
import { format } from 'date-fns'
import { Edit, Star, Trash2, PlusCircle, BarChart2, FileText, Heart, MoreVertical, Loader2, Clock, Plus } from 'lucide-react'
import { toast } from 'react-hot-toast'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,

} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from 'next/link'

interface Entry {
  id: string
  title: string
  content: string
  createdAt: string
  mood: string
  isFavorite: boolean
}

interface JournalDetails {
  id: string
  name: string
  description: string | null
  color: string | null
  icon: string | null
  createdAt: string
  updatedAt: string
  category: { id: string; name: string } | null
  entries: Entry[]
  statistics: {
    entryCount: number
    favoriteCount: number
    totalWordCount: number
    moodDistribution: { [key: string]: number }
  }
}

const cardColors = [
  'bg-pink-50',
  'bg-blue-50',
  'bg-green-50',
  'bg-yellow-50',
  'bg-purple-50',
  'bg-indigo-50',
  'bg-red-50',
  'bg-teal-50',
  'bg-orange-50',
]

export default function JournalDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [journal, setJournal] = useState<JournalDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isNewEntryDialogOpen, setIsNewEntryDialogOpen] = useState(false)
  const [newEntry, setNewEntry] = useState({ title: '', content: '', mood: '' })

  useEffect(() => {
    const fetchJournalDetails = async () => {
      setIsLoading(true)
      try {
        const response = await axios.get<JournalDetails>(`/api/journals/${params.journalId}`)
        setJournal(response.data)
      } catch (error) {
        console.error('Error fetching journal details:', error)
        toast.error('Failed to load journal details')
      } finally {
        setIsLoading(false)
      }
    }

    fetchJournalDetails()
  }, [params.journalId])

  const handleDeleteJournal = async () => {
    try {
      await axios.delete(`/api/journals/${params.journalId}`)
      toast.success('Journal deleted successfully')
      router.push('/dashboard/journals')
    } catch (error) {
      console.error('Error deleting journal:', error)
      toast.error('Failed to delete journal')
    }
  }

  const handleCreateEntry = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await axios.post(`/api/journals/${params.journalId}/entries`, newEntry)
      toast.success('Entry created successfully')
      setIsNewEntryDialogOpen(false)
     
      const response = await axios.get<JournalDetails>(`/api/journals/${params.journalId}`)
      setJournal(response.data)
    } catch (error) {
      console.error('Error creating entry:', error)
      toast.error('Failed to create entry')
    }
  }

  if (isLoading) {
    return  <div className="flex justify-center items-center h-64">
    <Loader2 className="h-8 w-8 animate-spin text-[#BFEAF5]" />
  </div>
  }

  if (!journal) {
    return <div className="flex justify-center items-center h-screen">Journal not found</div>
  }

  return (
    <div className="container mx-auto py-3 px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary">
          {journal.icon && <span className="mr-2">{journal.icon}</span>}
          {journal.name}
        </h1>
        <div className="flex items-center space-x-2">
          {/* <Button onClick={() => router.push(`/dashboard/journals/${journal.id}/edit`)} className="hidden sm:inline-flex">
            <Edit className="mr-2 h-4 w-4" /> Edit Journal
          </Button>
          <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)} className="hidden sm:inline-flex">
            <Trash2 className="mr-2 h-4 w-4" /> Delete Journal
          </Button> */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push(`/dashboard/journals/${journal.id}/edit`)}>
                <Edit className="mr-2 h-4 w-4" /> Edit Journal
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push(`/dashboard/journals/${journal.id}/categories`)}>
                <Edit className="mr-2 h-4 w-4" /> Journal Categories
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)}>
                <Trash2 className="mr-2 h-4 w-4" /> Delete Journal
              </DropdownMenuItem>
              
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {journal.description && (
        <p className="text-gray-600 mt-2">{journal.description}</p>
      )}

      {journal.category && (
        <Badge variant="secondary">{journal.category.name}</Badge>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className={cardColors[0]}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{journal.statistics.entryCount}</div>
          </CardContent>
        </Card>
        <Card className={cardColors[1]}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Favorite Entries</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{journal.statistics.favoriteCount}</div>
          </CardContent>
        </Card>
        <Card className={cardColors[2]}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Words</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{journal.statistics.totalWordCount}</div>
          </CardContent>
        </Card>
        <Card className={cardColors[3]}>
  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
    <CardTitle className="text-sm font-medium">Most Common Mood</CardTitle>
    <BarChart2 className="h-4 w-4 text-muted-foreground" />
  </CardHeader>
  <CardContent>
    <div className="text-2xl font-bold">
      {Object.keys(journal.statistics.moodDistribution).length > 0 ? (
        Object.entries(journal.statistics.moodDistribution).reduce((a, b) => a[1] > b[1] ? a : b)[0]
      ) : (
        'N/A'
      )}
    </div>
  </CardContent>
</Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Recent Entries</CardTitle>
            <Button onClick={() => router.push(`/dashboard/journals/${journal.id}/entries/new`)}>
              <PlusCircle className="mr-2 h-4 w-4" /> New Entry
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {journal.entries.map((entry, index) => (
              <Card 
                key={entry.id} 
                className={`${cardColors[index % cardColors.length]} hover:shadow-lg transition-shadow duration-300 cursor-pointer`}
                onClick={() => router.push(`/dashboard/journals/${journal.id}/entries/${entry.id}`)}
              >
                <CardHeader>
                  <CardTitle className="text-lg">{entry.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 line-clamp-3">{entry.content}</p>
                </CardContent>
                <CardFooter className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">{format(new Date(entry.createdAt), 'MMM d, yyyy')}</span>
                  {entry.isFavorite && <Star className="h-4 w-4 text-yellow-400" />}
                </CardFooter>
              </Card>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full" onClick={() => router.push(`/dashboard/journals/${journal.id}/entries`)}>
            View All Entries
          </Button>
        </CardFooter>
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
            <Button variant="destructive" onClick={handleDeleteJournal}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isNewEntryDialogOpen} onOpenChange={setIsNewEntryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Entry</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateEntry}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newEntry.title}
                  onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={newEntry.content}
                  onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="mood">Mood</Label>
                <Input
                  id="mood"
                  value={newEntry.mood}
                  onChange={(e) => setNewEntry({ ...newEntry, mood: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button type="submit">Create Entry</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
           
            <Button
              variant="outline"
              className="fixed bottom-16 right-8 mb-12 rounded-full w-12 h-12 bg-[#BFEAF5] text-gray-800 hover:bg-[#A0D8E8] transition-colors duration-200"
              onClick={() => router.push(`/dashboard/journals/${params.journalId}/entries/new`)}
            >
              <Plus className="h-6 w-6" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>create enrty</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}
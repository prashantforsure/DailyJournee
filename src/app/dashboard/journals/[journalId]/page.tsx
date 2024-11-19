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
import Loader from '@/components/Loader'

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
  'bg-pink-100',
  'bg-blue-100',
  'bg-green-100',
  'bg-yellow-100',
  'bg-purple-100',
  'bg-indigo-100',
  'bg-red-100',
  'bg-teal-100',
  'bg-orange-100',
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
    return <div className="flex justify-center items-center min-h-screen">
      <Loader />
    </div>
  }

  if (!journal) {
    return <div className="flex justify-center items-center">Journal not found</div>
  }

  const cardData = [
    { title: 'Total Entries', value: journal.statistics.entryCount, icon: FileText, color: '#f89b29', gradient: 'from-[#f89b29] to-[#ff0f7b]' },
    { title: 'Favorite Entries', value: journal.statistics.favoriteCount, icon: Heart, color: '#ff0f7b', gradient: 'from-[#ff0f7b] to-[#f89b29]' },
    { title: 'Total Words', value: journal.statistics.totalWordCount, icon: FileText, color: '#00ddeb', gradient: 'from-[#00ddeb] to-[#5b42f3]' },
    { title: 'Most Common Mood', value: Object.keys(journal.statistics.moodDistribution).length > 0 ? Object.entries(journal.statistics.moodDistribution).reduce((a, b) => a[1] > b[1] ? a : b)[0] : 'N/A', icon: BarChart2, color: '#5b42f3', gradient: 'from-[#5b42f3] to-[#00ddeb]' },
  ]

  return (
    <div className="container mx-auto py-3 px-4 sm:px-6 lg:px-8 space-y-8 mb-8">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-extrabold text-primary">{journal.name}</h1>
        <div className="flex items-center space-x-2">
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
              <DropdownMenuItem onClick={() => router.push(`/dashboard/journals/${journal.id}/favorites`)}>
                <Edit className="mr-2 h-4 w-4" /> Favorites
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)}>
                <Trash2 className="mr-2 h-4 w-4" /> Delete Journal
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* {journal.description && (
        <p className="text-gray-600 mt-2">{journal.description}</p>
      )} */}

      {journal.category && (
        <Badge variant="secondary">{journal.category.name}</Badge>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {cardData.map((item, index) => (
          <div key={index} className="e-card playing" style={{width: '100%', height: '200px', margin: '0'}}>
            <div className="image"></div>
            <div className={`wave bg-gradient-to-br ${item.gradient}`}></div>
            <div className={`wave bg-gradient-to-br ${item.gradient}`}></div>
            <div className={`wave bg-gradient-to-br ${item.gradient}`}></div>
            <div className="infotop">
              <div className="icon-wrapper">
              <item.icon className="icon size-8" style={{color: 'white'}} />
              </div>
              <div className="title">{item.title}</div>
              <div className="value">{item.value}</div>
            </div>
          </div>
        ))}
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
            <p>Create entry</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <style jsx>{`
        .e-card {
          background: transparent;
          box-shadow: 0px 8px 28px -9px rgba(0,0,0,0.45);
          position: relative;
          overflow: hidden;
          border-radius: 16px;
        }

        .wave {
          position: absolute;
          width: 540px;
          height: 700px;
          opacity: 0.6;
          left: 0;
          top: 0;
          margin-left: -50%;
          margin-top: -70%;
        }

        .icon-wrapper {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          height: 60px;
        }

        .icon {
          width: 3em;
          height: 3em;
        }

        .infotop {
          text-align: center;
          font-size: 20px;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: rgb(255, 255, 255);
          font-weight: 600;
          width: 100%;
        }

        .title {
          font-size: 16px;
          margin-top: 10px;
        }

        .value {
          font-size: 24px;
          font-weight: bold;
          margin-top: 5px;
        }

        .wave:nth-child(2),
        .wave:nth-child(3) {
          top: 210px;
        }

        .playing .wave {
          border-radius: 40%;
          animation: wave 3000ms infinite linear;
        }

        .wave {
          border-radius: 40%;
          animation: wave 55s infinite linear;
        }

        .playing .wave:nth-child(2) {
          animation-duration: 4000ms;
        }

        .wave:nth-child(2) {
          animation-duration: 50s;
        }

        .playing .wave:nth-child(3) {
          animation-duration: 5000ms;
        }

        .wave:nth-child(3) {
          animation-duration: 45s;
        }

        @keyframes wave {
          0% {
            transform: rotate(0deg);
          }

          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  )
}
'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import axios from 'axios'
import { format } from 'date-fns'

import { Search, Plus, Trash2, Edit3, Loader2, Eye } from 'lucide-react'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Loader from '@/components/Loader'

interface Entry {
  id: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
  mood: string
  tags: { id: string; name: string }[]
}

const moodColors = {
  Happy: 'bg-yellow-100',
  Sad: 'bg-blue-100',
  Excited: 'bg-green-100',
  Anxious: 'bg-purple-100',
  Calm: 'bg-teal-100',
  Angry: 'bg-red-100',
  Neutral: 'bg-gray-100',
}

export default function EntryManagementPage() {
  const params = useParams()
  const router = useRouter()

  const [entries, setEntries] = useState<Entry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedEntries, setSelectedEntries] = useState<string[]>([])
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const fetchEntries = async () => {
    setIsLoading(true)
    try {
      const response = await axios.get(`/api/journals/${params.journalId}/entries`, {
        params: {
          page: currentPage,
          limit: 9,
          sortBy,
          sortOrder,
          search: searchTerm,
        },
      })
      setEntries(response.data.entries)
      setTotalPages(response.data.totalPages)
    } catch (error) {
      console.error('Error fetching entries:', error)
      toast.error('Failed to load entries')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchEntries()
  }, [params.journalId, currentPage, sortBy, sortOrder, searchTerm])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  const handleDeleteEntries = async () => {
    try {
      await axios.delete(`/api/journals/${params.journalId}/entries`, {
        params: { ids: selectedEntries.join(',') },
      })
      toast.success('Entries deleted successfully')
      setSelectedEntries([])
      fetchEntries()
    } catch (error) {
      console.error('Error deleting entries:', error)
      toast.error('Failed to delete entries')
    } finally {
      setIsDeleteDialogOpen(false)
    }
  }

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-8 mb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
       <div className='text-transparent'>.</div>
        <Button onClick={() => router.push(`/dashboard/journals/${params.journalId}/entries/new`)} className="bg-green-500 hover:bg-green-600 text-white">
          <Plus className="mr-2 h-4 w-4" /> New Entry
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative flex-1 w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search entries..."
            value={searchTerm}
            onChange={handleSearch}
            className="pl-10 pr-4 py-2 w-full"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt">Date Created</SelectItem>
              <SelectItem value="updatedAt">Date Updated</SelectItem>
              <SelectItem value="title">Title</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="w-[100px]"
          >
            {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
             <Loader />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {entries.map((entry) => (
              <Card 
                key={entry.id} 
                className={`${moodColors[entry.mood as keyof typeof moodColors] || 'bg-gray-100'} hover:shadow-lg transition-shadow duration-300`}
              >
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-primary">{entry.title}</CardTitle>
                  <p className="text-sm text-gray-500">
                    Created: {format(new Date(entry.createdAt), 'MMM d, yyyy')}
                  </p>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 line-clamp-3">{entry.content}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {entry.tags.map((tag) => (
                      <Badge key={tag.id} variant="secondary">{tag.name}</Badge>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between items-center">
                  <Badge variant="outline">{entry.mood}</Badge>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => router.push(`/dashboard/journals/${params.journalId}/entries/${entry.id}`)}
                    >
                       <Eye className="h-4 w-4 mr-2" /> View
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setSelectedEntries([entry.id])
                        setIsDeleteDialogOpen(true)
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>

          <div className="flex justify-between items-center mt-8">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-500">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </>
      )}

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure you want to delete {selectedEntries.length} {selectedEntries.length === 1 ? 'entry' : 'entries'}?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the selected {selectedEntries.length === 1 ? 'entry' : 'entries'}.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteEntries}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
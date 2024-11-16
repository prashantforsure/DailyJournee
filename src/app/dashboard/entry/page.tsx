'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { format } from 'date-fns'
import { Star, Search, Calendar, Eye, Loader2 } from 'lucide-react'
import { toast } from 'react-hot-toast'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"

interface Entry {
  id: string
  title: string
  content: string
  createdAt: string
  mood: string
  isFavorite: boolean
  journal: {
    id: string
  }
  category: {
    name: string
    color: string
  } | null
}

interface ApiResponse {
  entries: Entry[]
  currentPage: number
  totalPages: number
  totalCount: number
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

export default function EntriesPage() {
  const router = useRouter()
  const [entries, setEntries] = useState<Entry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [dateRange, setDateRange] = useState({ from: undefined, to: undefined })
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchEntries()
  }, [searchTerm, dateRange, currentPage])

  const fetchEntries = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        search: searchTerm,
      })
      if (dateRange.from) params.append('startDate', dateRange.from.toISOString())
      if (dateRange.to) params.append('endDate', dateRange.to.toISOString())

      const response = await axios.get<ApiResponse>(`/api/entries?${params.toString()}`)
      setEntries(response.data.entries)
      setTotalPages(response.data.totalPages)
    } catch (error) {
      console.error('Error fetching entries:', error)
      toast.error('Failed to load entries')
      setEntries([])
    } finally {
      setIsLoading(false)
    }
  }

  const toggleFavorite = async (entryId: string) => {
    try {
      await axios.post(`/api/entries/${entryId}/favorite`)
      setEntries(entries.map(entry => 
        entry.id === entryId ? { ...entry, isFavorite: !entry.isFavorite } : entry
      ))
      toast.success('Favorite status updated')
    } catch (error) {
      console.error('Error toggling favorite:', error)
      toast.error('Failed to update favorite status')
    }
  }

  return (
    <div className="container mx-auto py-4 mb-8">
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-grow relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search entries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full"
          />
        </div>
        <DatePickerWithRange
          dateRange={dateRange}
          setDateRange={setDateRange}
          className="w-full md:w-auto"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
           <Loader2 className="h-8 w-8 animate-spin text-[#5ad7f7]" />
        </div>
      ) : entries.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {entries.map((entry) => (
            <Card 
              key={entry.id} 
              className={`${moodColors[entry.mood as keyof typeof moodColors] || 'bg-gray-100'} hover:shadow-lg transition-shadow duration-200`}
            >
              <CardHeader className="p-4">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl font-semibold text-primary truncate">
                    {entry.title || "Untitled Entry"}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleFavorite(entry.id)}
                    className={`hover:bg-white/50 ${entry.isFavorite ? 'text-yellow-400' : 'text-gray-500'}`}
                  >
                    <Star className="h-4 w-4 fill-current" />
                  </Button>
                </div>
                <p className="text-sm text-gray-600 flex items-center mt-2">
                  <Calendar className="h-4 w-4 mr-2" />
                  {format(new Date(entry.createdAt), 'PPP')}
                </p>
              </CardHeader>
              <CardContent className="p-4">
                <p className="text-gray-700 line-clamp-3">{entry.content}</p>
                {entry.mood && (
                  <Badge className="mt-2" variant="secondary">
                    {entry.mood}
                  </Badge>
                )}
                {entry.category && (
                  <Badge className="mt-2 ml-2" style={{ backgroundColor: entry.category.color }}>
                    {entry.category.name}
                  </Badge>
                )}
              </CardContent>
              <CardFooter className="p-4 flex justify-between items-center">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => router.push(`/dashboard/journals/${entry.journal.id}/entries/${entry.id}`)}
                  className="hover:bg-white/50"
                >
                  <Eye className="h-4 w-4 mr-2" /> View
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 mt-8">
          No entries found. Try adjusting your search or date range.
        </div>
      )}
      
      {totalPages > 1 && (
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
      )}
    </div>
  )
}
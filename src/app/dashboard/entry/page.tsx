
'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { format } from 'date-fns'
import { Star, Search, Calendar, Eye, Plus } from 'lucide-react'
import { toast } from 'react-hot-toast'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { Loader2 } from 'lucide-react'

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

  useEffect(() => {
    fetchEntries()
  }, [searchTerm, dateRange])

  const fetchEntries = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (dateRange.from) params.append('startDate', dateRange.from.toISOString())
      if (dateRange.to) params.append('endDate', dateRange.to.toISOString())

      const response = await axios.get(`/api/entries?${params.toString()}`)
      setEntries(response.data)
    } catch (error) {
      console.error('Error fetching entries:', error)
      toast.error('Failed to load entries')
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
      {/* <h1 className="text-3xl font-bold mb-8">Your Entries</h1> */}
      
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-grow">
          <Input
            type="text"
            placeholder="Search entries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
            //@ts-expect-error there is some type error
            icon={<Search className="h-4 w-4 text-gray-500" />}
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
      ) : (
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
      
      )}
      
    </div>
  )
}
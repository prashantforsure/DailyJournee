'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import axios from 'axios'
import { format } from 'date-fns'
import { Star, ChevronDown, ChevronUp, Loader2, Search,  Eye} from 'lucide-react'
import { toast } from 'react-hot-toast'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

interface FavoriteEntry {
  id: string
  title: string
  content: string
  mood: string | null
  createdAt: string
  updatedAt: string
  isQuickEntry: boolean
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

export default function FavoritesPage() {
  const params = useParams()
  const router = useRouter()
  const [favorites, setFavorites] = useState<FavoriteEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchFavorites()
  }, [sortBy, sortOrder, currentPage, searchTerm])

  const fetchFavorites = async () => {
    setIsLoading(true)
    try {
      const response = await axios.get(`/api/journals/${params.journalId}/favorites`, {
        params: {
          sortBy,
          order: sortOrder,
          page: currentPage,
          limit: 9,
          search: searchTerm,
        },
      })
      setFavorites(response.data.favorites)
      setTotalPages(response.data.totalPages)
    } catch (error) {
      console.error('Error fetching favorites:', error)
      toast.error('Failed to load favorite entries')
    } finally {
      setIsLoading(false)
    }
  }

  // const handleSort = (column: string) => {
  //   if (sortBy === column) {
  //     setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
  //   } else {
  //     setSortBy(column)
  //     setSortOrder('asc')
  //   }
  // }

  const handleRemoveFavorite = async (entryId: string) => {
    try {
      await axios.put(`/api/journals/${params.journalId}/favorites`, {
        entryId,
        isFavorite: false,
      })
      toast.success('Entry removed from favorites')
      fetchFavorites()
    } catch (error) {
      console.error('Error removing favorite:', error)
      toast.error('Failed to remove entry from favorites')
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  return (
    <div className="container mx-auto py-3 px-4 sm:px-6 lg:px-8 space-y-8 mb-8">
      {/* <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary">Favorite Entries</h1>
      </div> */}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative flex-1 w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search favorites..."
            value={searchTerm}
            onChange={handleSearch}
            className="pl-10 pr-4 py-2 w-full sm:max-w-xs"
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
          <Button variant="outline" onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
            {sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-[#86d0e2]" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((entry, index) => (
            <Card 
              key={entry.id} 
              className={`${cardColors[index % cardColors.length]} hover:shadow-lg transition-shadow duration-300`}
            >
              <CardHeader className="p-4">
                <CardTitle className="text-xl font-semibold text-primary truncate">
                  {entry.title || "Untitled Entry"}
                </CardTitle>
                <p className="text-sm text-gray-600">
                  {format(new Date(entry.createdAt), 'PPP')}
                </p>
              </CardHeader>
              <CardContent className="p-4">
                <p className="text-gray-700 line-clamp-3">{entry.content}</p>
                {entry.mood && (
                  <Badge className={`mt-2 ${moodColors[entry.mood as keyof typeof moodColors]}`}>
                    {entry.mood}
                  </Badge>
                )}
              </CardContent>
              <CardFooter className="p-4 flex justify-between items-center">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => router.push(`/dashboard/journals/${params.journalId}/entries/${entry.id}`)}
                  className="hover:bg-white/50"
                >
                  <Eye className="h-4 w-4 mr-2" /> View
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleRemoveFavorite(entry.id)}
                  className="hover:bg-white/50"
                >
                  <Star className="h-4 w-4 fill-current text-yellow-400" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <div className="flex justify-between items-center mt-8">
        <Button
          variant="outline"
          onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        <span className="text-sm text-gray-600">
          Page {currentPage} of {totalPages}
        </span>
        <Button
          variant="outline"
          onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
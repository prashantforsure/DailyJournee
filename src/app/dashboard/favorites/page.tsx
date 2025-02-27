'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { format } from 'date-fns'
import { Star, ChevronDown, ChevronUp, Loader2, Search, Eye } from 'lucide-react'
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
import Loader from '@/components/Loader'

interface FavoriteEntry {
  id: string
  title: string
  content: string
  mood: string | null
  createdAt: string
  updatedAt: string
  isQuickEntry: boolean
  journalId: string
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
const SearchInput = () => {
  return (
    <form className="relative w-full max-w-[300-px]">
      <button className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400">
        <Search className="w-4 h-4" />
      </button>
      <input 
        className="w-full h-10 pl-8 pr-8 text-sm bg-white border-2 border-[#2f2ee9] rounded-[30px] focus:outline-none focus:border-[#2f2ee9] transition-all duration-300"
        placeholder="Search favorites..." 
        required 
        type="text"
      />
      <button className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 opacity-0 transition-opacity duration-300" type="reset">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </form>
  )
}

const CustomButton = ({ children, onClick, disabled }: { children: React.ReactNode, onClick?: () => void, disabled?: boolean }) => {
  return (
    <button
    disabled={disabled}
      className="relative flex items-center px-4 py-2 text-sm font-semibold text-[#2890f1] border border-[#2890f1] rounded-full overflow-hidden transition-colors duration-300 hover:text-white group"
      onClick={onClick}
    >
      <span className="relative z-10">{children}</span>
      <span className="absolute inset-0 w-full h-full bg-[#2890f1] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
    </button>
  )
}

export default function FavoritesPage() {
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
      const response = await axios.get('/api/favorites', {
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

  

  const handleRemoveFavorite = async (entryId: string, journalId: string) => {
    try {
      await axios.put(`/api/journals/${journalId}/entries/${entryId}`, {
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
    <div className="container mx-auto py-4 px-4 sm:px-6 lg:px-8 space-y-8 mb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <SearchInput />
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
          <CustomButton onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
            <div className='flex'>
              <span> {sortOrder === 'asc' ? <ChevronUp className="h-4 w-4 mr-2" /> : <ChevronDown className="h-4 w-4 mr-2" />}</span>
              <span>Sort</span>
            </div>
           
            
          </CustomButton>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader />
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
                <CustomButton onClick={() => router.push(`/dashboard/journals/${entry.journalId}/entries/${entry.id}`)}>
                  <Eye className="h-4 w-4 mr-2" /> View
                </CustomButton>
                <CustomButton onClick={() => handleRemoveFavorite(entry.id, entry.journalId)}>
                  <Star className="h-4 w-4 fill-current text-yellow-400 mr-2" /> Unfavorite
                </CustomButton>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <div className="flex justify-between items-center mt-8">
        <CustomButton onClick={() => handlePageChange(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>
          Previous
        </CustomButton>
        <span className="text-sm text-gray-600">
          Page {currentPage} of {totalPages}
        </span>
        <CustomButton onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}>
          Next
        </CustomButton>
      </div>
    </div>
  )
}
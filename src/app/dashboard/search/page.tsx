'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { format } from 'date-fns'
import { Search, Calendar, Loader2, BookOpen, Book } from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar1 } from "@/components/ui/calendar"


interface SearchResult {
  id: string
  title: string
  content?: string
  createdAt: string
  type: 'journal' | 'entry'
  journalName?: string
}

export default function SearchPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (searchTerm || date) {
      handleSearch()
    }
  }, [searchTerm, date])

  const handleSearch = async () => {
    setIsLoading(true)
    try {
      const response = await axios.get('/api/search', {
        params: {
          q: searchTerm,
          date: date?.toISOString(),
        }
      })
      setResults(response.data)
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResultClick = (result: SearchResult) => {
    if (result.type === 'journal') {
      router.push(`/dashboard/journals/${result.id}`)
    } else {
      router.push(`/dashboard/journals/entries/${result.id}`)
    }
  }

  return (
    <div className="container mx-auto py-3 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Search Journals and Entries</h1>
      
      <div className="mb-8 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Label htmlFor="searchTerm" className="mb-2 block text-sm font-medium text-gray-700">
            Search Term
          </Label>
          <div className="relative">
            <Input
              id="searchTerm"
              type="text"
              placeholder="Enter keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-2 border-[#BFEAF5] focus:border-[#98FF98] focus:ring-[#98FF98]"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>
        
        <div>
          <Label htmlFor="date" className="mb-2 block text-sm font-medium text-gray-700">
            Date
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant="outline"
                className={`w-[240px] justify-start text-left font-normal border-2 border-[#BFEAF5] focus:border-[#98FF98] focus:ring-[#98FF98] ${
                  !date && "text-muted-foreground"
                }`}
              >
                <Calendar className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar1
                mode="single"
                selected={date}
                onSelect={setDate}
                
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-[#98FF98]" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((result) => (
            <Card 
              key={result.id} 
              className="bg-white shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer"
              onClick={() => handleResultClick(result)}
            >
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-800 truncate">
                  {result.title}
                </CardTitle>
                <CardDescription className="text-sm text-gray-500">
                  {format(new Date(result.createdAt), 'PPP')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {result.type === 'entry' && result.content && (
                  <p className="text-gray-600 line-clamp-3">{result.content}</p>
                )}
                {result.type === 'entry' && result.journalName && (
                  <p className="text-sm text-gray-500 mt-2">Journal: {result.journalName}</p>
                )}
              </CardContent>
              <CardFooter>
                <Badge className={`${result.type === 'journal' ? 'bg-[#BFEAF5]' : 'bg-[#FFD1DC]'} text-gray-800`}>
                  {result.type === 'journal' ? (
                    <>
                      <Book className="mr-1 h-4 w-4" />
                      Journal
                    </>
                  ) : (
                    <>
                      <BookOpen className="mr-1 h-4 w-4" />
                      Entry
                    </>
                  )}
                </Badge>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {results.length === 0 && !isLoading && searchTerm && (
        <p className="text-center text-gray-600 mt-8">No results found. Try adjusting your search criteria.</p>
      )}
    </div>
  )
}
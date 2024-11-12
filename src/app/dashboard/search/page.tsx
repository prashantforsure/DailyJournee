'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import axios from 'axios'
import { format } from 'date-fns'
import { 
  Search, 
  Calendar, 
  Smile, 
  Tag, 
  Folder, 
  Save, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  Loader2 
} from 'lucide-react'
import { toast } from 'react-hot-toast'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover"

import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar1 } from "@/components/ui/calendar"

interface SearchResult {
  id: string
  title: string
  content: string
  mood: string
  category: string
  createdAt: string
  updatedAt: string
}

interface SavedSearch {
  id: string
  name: string
  query: string
}

const moodOptions = [
  'Happy', 'Sad', 'Excited', 'Anxious', 'Calm', 'Angry', 'Neutral'
]

export default function SearchPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState('')
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [selectedMood, setSelectedMood] = useState<string | undefined>(undefined)
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined)
  const [categories, setCategories] = useState<string[]>([])
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([])
  const [newSearchName, setNewSearchName] = useState('')
  const [isAdvancedSearch, setIsAdvancedSearch] = useState(false)

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [categoriesResponse, savedSearchesResponse] = await Promise.all([
          axios.get('/api/categories'),
          axios.get('/api/saved-searches')
        ])
        setCategories(categoriesResponse.data)
        setSavedSearches(savedSearchesResponse.data)

        const initialSearchTerm = searchParams.get('q') || ''
        const initialStartDate = searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined
        const initialEndDate = searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined
        const initialMood = searchParams.get('mood') || undefined
        const initialCategory = searchParams.get('category') || undefined

        setSearchTerm(initialSearchTerm)
        setStartDate(initialStartDate)
        setEndDate(initialEndDate)
        setSelectedMood(initialMood)
        setSelectedCategory(initialCategory)

        if (initialSearchTerm || initialStartDate || initialEndDate || initialMood || initialCategory) {
          performSearch({
            searchTerm: initialSearchTerm,
            startDate: initialStartDate,
            endDate: initialEndDate,
            mood: initialMood,
            category: initialCategory
          })
        }
      } catch (error) {
        console.error('Error fetching initial data:', error)
        toast.error('Failed to load initial data')
      }
    }

    fetchInitialData()
  }, [searchParams])

  const performSearch = async (searchParams: {
    searchTerm: string,
    startDate?: Date,
    endDate?: Date,
    mood?: string,
    category?: string
  }) => {
    setIsLoading(true)
    try {
      const response = await axios.get('/api/search', { params: {
        q: searchParams.searchTerm,
        startDate: searchParams.startDate?.toISOString(),
        endDate: searchParams.endDate?.toISOString(),
        mood: searchParams.mood,
        category: searchParams.category,
        sortBy,
        sortOrder
      }})
      setResults(response.data)
    } catch (error) {
      console.error('Error performing search:', error)
      toast.error('Search failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = () => {
    performSearch({
      searchTerm,
      startDate,
      endDate,
      mood: selectedMood,
      category: selectedCategory
    })

 
    const searchParams = new URLSearchParams()
    if (searchTerm) searchParams.set('q', searchTerm)
    if (startDate) searchParams.set('startDate', startDate.toISOString())
    if (endDate) searchParams.set('endDate', endDate.toISOString())
    if (selectedMood) searchParams.set('mood', selectedMood)
    if (selectedCategory) searchParams.set('category', selectedCategory)

    router.push(`/search?${searchParams.toString()}`)
  }

  const handleSortChange = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('asc')
    }
  }

  const handleSaveSearch = async () => {
    if (!newSearchName) {
      toast.error('Please enter a name for your saved search')
      return
    }

    try {
      const searchToSave = {
        name: newSearchName,
        query: `?q=${searchTerm}&startDate=${startDate?.toISOString() || ''}&endDate=${endDate?.toISOString() || ''}&mood=${selectedMood || ''}&category=${selectedCategory || ''}`
      }
      const response = await axios.post('/api/saved-searches', searchToSave)
      setSavedSearches([...savedSearches, response.data])
      setNewSearchName('')
      toast.success('Search saved successfully')
    } catch (error) {
      console.error('Error saving search:', error)
      toast.error('Failed to save search')
    }
  }

  const handleDeleteSavedSearch = async (id: string) => {
    try {
      await axios.delete(`/api/saved-searches/${id}`)
      setSavedSearches(savedSearches.filter(search => search.id !== id))
      toast.success('Saved search deleted successfully')
    } catch (error) {
      console.error('Error deleting saved search:', error)
      toast.error('Failed to delete saved search')
    }
  }

  const handleLoadSavedSearch = (query: string) => {
    router.push(`/search${query}`)
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold mb-8 text-gray-800">Search Journals</h1>
      
      <Card className="mb-8 bg-white shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-gray-700">Search Criteria</CardTitle>
          <CardDescription>Use the fields below to filter your journal entries</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
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
            
            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="dateRange" className="mb-2 block text-sm font-medium text-gray-700">
                Date Range
              </Label>
              <div className="flex items-center space-x-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-[140px] justify-start text-left font-normal border-2 border-[#BFEAF5] focus:border-[#98FF98] focus:ring-[#98FF98] ${
                        !startDate && "text-muted-foreground"
                      }`}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : "Start date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar1
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                     
                    />
                  </PopoverContent>
                </Popover>
                <span>to</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-[140px] justify-start text-left font-normal border-2 border-[#BFEAF5] focus:border-[#98FF98] focus:ring-[#98FF98] ${
                        !endDate && "text-muted-foreground"
                      }`}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : "End date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar1
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                     
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="mood" className="mb-2 block text-sm font-medium text-gray-700">
                Mood
              </Label>
              <Select value={selectedMood} onValueChange={setSelectedMood}>
                <SelectTrigger className="border-2 border-[#FFD1DC] focus:border-[#98FF98] focus:ring-[#98FF98]">
                  <SelectValue placeholder="Select mood" />
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
            </div>

            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="category" className="mb-2 block text-sm font-medium text-gray-700">
                Category
              </Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="border-2 border-[#FFFFD1] focus:border-[#98FF98] focus:ring-[#98FF98]">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      <div className="flex items-center">
                        <Folder className="mr-2 h-4 w-4 text-[#FFFFD1]" />
                        <span>{category}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => setIsAdvancedSearch(!isAdvancedSearch)}
            className="border-2 border-[#BFEAF5] text-gray-700 hover:bg-[#BFEAF5] transition-colors duration-200"
          >
            {isAdvancedSearch ? 'Hide Advanced' : 'Show Advanced'}
          </Button>
          <Button 
            onClick={handleSearch}
            className="bg-[#98FF98] text-gray-800 hover:bg-[#7AE47A] transition-colors duration-200"
          >
            Search
          </Button>
        </CardFooter>
      </Card>

      {isAdvancedSearch && (
        <Card className="mb-8 bg-white shadow-md">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-gray-700">Advanced Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox id="exactMatch" />
              <Label htmlFor="exactMatch">Exact match</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="searchTitles" />
              <Label htmlFor="searchTitles">Search in titles only</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="caseSensitive" />
              <Label htmlFor="caseSensitive">Case sensitive</Label>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mb-8 flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-700">Search Results</h2>
        <div className="flex items-center space-x-2">
          <Label htmlFor="sortBy" className="text-sm font-medium text-gray-700">Sort by:</Label>
          <Select value={sortBy} onValueChange={(value) => handleSortChange(value)}>
            <SelectTrigger className="w-[180px] border-2 border-[#BFEAF5] focus:border-[#98FF98] focus:ring-[#98FF98]">
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
            size="icon"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="border-2 border-[#BFEAF5] focus:border-[#98FF98] focus:ring-[#98FF98]"
          >
            {sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-[#98FF98]" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((result) => (
            <Card key={result.id} className="bg-white shadow-md hover:shadow-lg transition-shadow duration-200">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-800 truncate">{result.title}</CardTitle>
                <CardDescription className="text-sm text-gray-500">
                  {format(new Date(result.createdAt), 'PPP')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 line-clamp-3">{result.content}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge className="bg-[#FFD1DC] text-gray-800">{result.mood}</Badge>
                  <Badge className="bg-[#BFEAF5] text-gray-800">{result.category}</Badge>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  onClick={() => router.push(`/journals/${result.id}`)}
                  className="w-full border-2 border-[#98FF98] text-gray-700 hover:bg-[#98FF98] transition-colors duration-200"
                >
                  View Entry
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {results.length === 0 && !isLoading && (
        <p className="text-center text-gray-600 mt-8">No results found. Try adjusting your search criteria.</p>
      )}

      <div className="mt-12">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Saved Searches</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {savedSearches.map((search) => (
            <Card key={search.id} className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-700">{search.name}</CardTitle>
              </CardHeader>
              <CardFooter className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => handleLoadSavedSearch(search.query)}
                  className="border-2 border-[#BFEAF5] text-gray-700 hover:bg-[#BFEAF5] transition-colors duration-200"
                >
                  Load
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleDeleteSavedSearch(search.id)}
                  className="border-2 border-[#FFD1DC] text-gray-700 hover:bg-[#FFD1DC] transition-colors duration-200"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button className="mt-4 bg-[#98FF98] text-gray-800 hover:bg-[#7AE47A] transition-colors duration-200">
              <Save className="mr-2 h-4 w-4" />
              Save Current Search
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Save Search</DialogTitle>
              <DialogDescription>
                Give your search a name to save it for future use.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={newSearchName}
                  onChange={(e) => setNewSearchName(e.target.value)}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSaveSearch} className="bg-[#98FF98] text-gray-800 hover:bg-[#7AE47A] transition-colors duration-200">Save Search</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
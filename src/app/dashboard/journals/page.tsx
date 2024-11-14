'use client'

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { format } from 'date-fns'
import { Filter, Search, SortAsc, SortDesc, Loader2, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'

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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Journal {
  id: string
  name: string
  description: string | null
  color: string | null
  entryCount: number
  lastEntryDate: string | null
  createdAt: string
  updatedAt: string
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

export default function JournalsPage() {
  const router = useRouter()
  const [journals, setJournals] = useState<Journal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [sort, setSort] = useState<'name' | 'createdAt' | 'updatedAt' | 'entryCount'>('createdAt')
  const [order, setOrder] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    fetchJournals()
  }, [filter, sort, order])

  const fetchJournals = async () => {
    setIsLoading(true)
    try {
      const response = await axios.get<Journal[]>('/api/journals', {
        params: { filter, sort, order }
      })
      setJournals(response.data)
    } catch (error) {
      console.error('Error fetching journals:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSort = (newSort: typeof sort) => {
    if (newSort === sort) {
      setOrder(order === 'asc' ? 'desc' : 'asc')
    } else {
      setSort(newSort)
      setOrder('asc')
    }
  }

  return (
    <div className="container mx-auto py-3 px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary">Your Journals</h1>
        <Button onClick={() => router.push('/dashboard/journals/new')} className="bg-green-500 hover:bg-green-600 text-white">
          <Plus className="mr-2 h-4 w-4" /> New Journal
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative flex-1 w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search journals..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-10 pr-4 py-2 w-full sm:max-w-xs"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                <Filter className="mr-2 h-4 w-4" /> Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setFilter('')}>
                All Journals
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter('personal')}>
                Personal
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter('work')}>
                Work
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Select value={sort} onValueChange={(value) => handleSort(value as typeof sort)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="createdAt">Created Date</SelectItem>
              <SelectItem value="updatedAt">Updated Date</SelectItem>
              <SelectItem value="entryCount">Entry Count</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => setOrder(order === 'asc' ? 'desc' : 'asc')}>
            {order === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {journals.map((journal, index) => (
            <Card 
              key={journal.id} 
              className={`${cardColors[index % cardColors.length]} hover:shadow-lg transition-shadow duration-300 cursor-pointer`}
              onClick={() => router.push(`/dashboard/journals/${journal.id}`)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-semibold text-primary flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-2 ${journal.color || 'bg-gray-400'}`}></div>
                  {journal.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 line-clamp-2">{journal.description || 'No description'}</p>
                <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
                  <span>Entries: {journal.entryCount}</span>
                  <span>Created: {format(new Date(journal.createdAt), 'MMM d, yyyy')}</span>
                </div>
              </CardContent>
              <CardFooter className="pt-2">
                <Badge variant="secondary" className="ml-auto">
                  {journal.lastEntryDate
                    ? `Last entry: ${format(new Date(journal.lastEntryDate), 'MMM d, yyyy')}`
                    : 'No entries'}
                </Badge>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
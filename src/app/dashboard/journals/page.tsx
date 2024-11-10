'use client'

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { format } from 'date-fns'
import { Book, ChevronDown, Filter, Search, SortAsc, SortDesc, Loader2 } from 'lucide-react'
import Link from 'next/link'

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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

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

export default function JournalsPage() {
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary">Your Journals</h1>
        <Link href="/dashboard/journals/new">
          <Button className="bg-green-500 hover:bg-green-600 text-white">
            <Book className="mr-2 h-4 w-4" /> New Journal
          </Button>
        </Link>
      </div>

      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle>Journal Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search journals..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className='flex gap-x-3'>
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
        
            <Button variant="outline" onClick={() => setOrder(order === 'asc' ? 'desc' : 'asc')} className="w-full sm:w-auto">
              {order === 'asc' ? <SortAsc className="h-4 w-4 mr-2" /> : <SortDesc className="h-4 w-4 mr-2" />}
              {order === 'asc' ? 'Ascending' : 'Descending'}
            </Button>
            </div>
          </div>
        </CardContent>
      </Card>
     
      <Card className="bg-white shadow-sm">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[30%]">Name</TableHead>
                  <TableHead className="w-[15%]">Entries</TableHead>
                  <TableHead className="w-[20%]">Last Entry</TableHead>
                  <TableHead className="w-[20%]">Created</TableHead>
                  <TableHead className="w-[15%] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {journals.map((journal) => (
                  <TableRow key={journal.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-2 ${journal.color || 'bg-gray-400'}`}></div>
                        {journal.name}
                      </div>
                    </TableCell>
                    <TableCell>{journal.entryCount}</TableCell>
                    <TableCell>
                      {journal.lastEntryDate
                        ? format(new Date(journal.lastEntryDate), 'MMM d, yyyy')
                        : 'No entries'}
                    </TableCell>
                    <TableCell>{format(new Date(journal.createdAt), 'MMM d, yyyy')}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Link href={`/dashboard/journals/${journal.id}`} className="flex w-full">
                              View
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Link href={`/dashboard/journals/${journal.id}/edit`} className="flex w-full">
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

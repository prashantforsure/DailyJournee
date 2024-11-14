'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { format } from 'date-fns'
import { 
  
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Loader2,
  BookOpen,
  Gift,
  TrendingUp
} from 'lucide-react'
import { toast } from 'react-hot-toast'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface Memory {
  id: string
  title: string
  content: string
  createdAt: string
  mood?: string
  category?: string
}

interface YearlyReview {
  year: number
  totalEntries: number
  topMoods: { mood: string; count: number }[]
  topCategories: { category: string; count: number }[]
}

interface TimeCapsule {
  id: string
  title: string
  content: string
  createdAt: string
  openDate: string
}

export default function MemoriesPage() {
  const router = useRouter()
  const [memories, setMemories] = useState<Memory[]>([])
  const [yearlyReviews, setYearlyReviews] = useState<YearlyReview[]>([])
  const [timeCapsules, setTimeCapsules] = useState<TimeCapsule[]>([])
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [isLoading, setIsLoading] = useState(true)
  const [newTimeCapsule, setNewTimeCapsule] = useState({ title: '', content: '', openDate: '' })

  useEffect(() => {
    fetchMemories()
    fetchYearlyReviews()
    fetchTimeCapsules()
  }, [selectedYear])

  const fetchMemories = async () => {
    setIsLoading(true)
    try {
      const response = await axios.get(`/api/memories?year=${selectedYear}`)
      setMemories(response.data)
    } catch (error) {
      console.error('Error fetching memories:', error)
      toast.error('Failed to load memories')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchYearlyReviews = async () => {
    try {
      const response = await axios.get(`/api/memories/yearly-review?year=${selectedYear}`)
      setYearlyReviews(response.data)
    } catch (error) {
      console.error('Error fetching yearly reviews:', error)
      toast.error('Failed to load yearly reviews')
    }
  }

  const fetchTimeCapsules = async () => {
    try {
      const response = await axios.get('/api/memories/time-capsules')
      setTimeCapsules(response.data)
    } catch (error) {
      console.error('Error fetching time capsules:', error)
      toast.error('Failed to load time capsules')
    }
  }

  const handleYearChange = (increment: number) => {
    setSelectedYear(prevYear => prevYear + increment)
  }

  const handleCreateTimeCapsule = async () => {
    try {
      await axios.post('/api/memories/time-capsules', newTimeCapsule)
      toast.success('Time capsule created successfully')
      fetchTimeCapsules()
      setNewTimeCapsule({ title: '', content: '', openDate: '' })
    } catch (error) {
      console.error('Error creating time capsule:', error)
      toast.error('Failed to create time capsule')
    }
  }

  const handleOpenTimeCapsule = async (id: string) => {
    try {
      const response = await axios.post(`/api/memories/time-capsules/${id}/open`)
      toast.success('Time capsule opened!')
      // Update the UI to show the opened time capsule
      setTimeCapsules(prevCapsules => 
        prevCapsules.map(capsule => 
          capsule.id === id ? { ...capsule, ...response.data } : capsule
        )
      )
    } catch (error) {
      console.error('Error opening time capsule:', error)
      toast.error('Failed to open time capsule')
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold mb-8 text-gray-800">Your Memory Lane</h1>

      <div className="flex justify-between items-center mb-6">
        <Button 
          onClick={() => handleYearChange(-1)}
          className="bg-[#BFEAF5] text-gray-800 hover:bg-[#A0D8E8] transition-colors duration-200"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Previous Year
        </Button>
        <h2 className="text-2xl font-semibold text-gray-700">{selectedYear} Memories</h2>
        <Button 
          onClick={() => handleYearChange(1)}
          className="bg-[#BFEAF5] text-gray-800 hover:bg-[#A0D8E8] transition-colors duration-200"
        >
          Next Year
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-[#98FF98]" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {memories.map((memory) => (
            <Card key={memory.id} className="bg-white shadow-md hover:shadow-lg transition-shadow duration-200">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-800 truncate">{memory.title}</CardTitle>
                <CardDescription className="text-sm text-gray-500">
                  {format(new Date(memory.createdAt), 'PPP')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 line-clamp-3">{memory.content}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {memory.mood && <Badge className="bg-[#FFD1DC] text-gray-800">{memory.mood}</Badge>}
                  {memory.category && <Badge className="bg-[#FFFFD1] text-gray-800">{memory.category}</Badge>}
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  onClick={() => router.push(`/journals/entries/${memory.id}`)}
                  className="w-full border-2 border-[#98FF98] text-gray-700 hover:bg-[#98FF98] transition-colors duration-200"
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  Read Full Entry
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <h2 className="text-3xl font-bold mt-12 mb-6 text-gray-800">Yearly Review</h2>
      {yearlyReviews.length > 0 ? (
    yearlyReviews.map((review) => (
      <Card key={review.year} className="mb-6 bg-white shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-gray-700">{review.year} in Review</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-semibold mb-2 text-gray-700">Journal Stats</h3>
              <p className="text-gray-600">Total Entries: {review.totalEntries}</p>
              <h4 className="text-md font-semibold mt-4 mb-2 text-gray-700">Top Moods</h4>
              <ul className="list-disc list-inside">
                {review.topMoods.map((mood, index) => (
                  <li key={index} className="text-gray-600">{mood.mood}: {mood.count} entries</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-md font-semibold mb-2 text-gray-700">Top Categories</h4>
              <ul className="list-disc list-inside">
                {review.topCategories.map((category, index) => (
                  <li key={index} className="text-gray-600">{category.category}: {category.count} entries</li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={() => router.push(`/journals/yearly-review/${review.year}`)}
            className="w-full bg-[#98FF98] text-gray-800 hover:bg-[#7AE47A] transition-colors duration-200"
          >
            <TrendingUp className="mr-2 h-4 w-4" />
            View Detailed Review
          </Button>
        </CardFooter>
      </Card>
    ))
  ) : (
    <p className="text-center text-gray-500">No yearly reviews available.</p>
  )}

      <h2 className="text-3xl font-bold mt-12 mb-6 text-gray-800">Time Capsules</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {timeCapsules.map((capsule) => (
          <Card key={capsule.id} className="bg-white shadow-md">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-800 truncate">{capsule.title}</CardTitle>
              <CardDescription className="text-sm text-gray-500">
                Created on {format(new Date(capsule.createdAt), 'PPP')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                {new Date(capsule.openDate) <= new Date() 
                  ? capsule.content 
                  : `This time capsule will be available on ${format(new Date(capsule.openDate), 'PPP')}`
                }
              </p>
            </CardContent>
            <CardFooter>
              {new Date(capsule.openDate) <= new Date() ? (
                <Button 
                  variant="outline"
                  onClick={() => router.push(`/journals/entries/${capsule.id}`)}
                  className="w-full border-2 border-[#FFD1DC] text-gray-700 hover:bg-[#FFD1DC] transition-colors duration-200"
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  Read Full Entry
                </Button>
              ) : (
                <Button 
                  onClick={() => handleOpenTimeCapsule(capsule.id)}
                  disabled={new Date(capsule.openDate) > new Date()}
                  className="w-full bg-[#FFFFD1] text-gray-800 hover:bg-[#F0F0C0] transition-colors duration-200"
                >
                  <Gift className="mr-2 h-4 w-4" />
                  Open Time Capsule
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      <Dialog>
        <DialogTrigger asChild>
          <Button className="mb-8 bg-[#98FF98] text-gray-800 hover:bg-[#7AE47A] transition-colors duration-200">
            <Gift className="mr-2 h-4 w-4" />
            Create New Time Capsule
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create a New Time Capsule</DialogTitle>
            <DialogDescription>
              Write a message to your future self. This entry will be locked until the date you specify.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                value={newTimeCapsule.title}
                onChange={(e) => setNewTimeCapsule({...newTimeCapsule, title: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="content" className="text-right">
                Message
              </Label>
              <Textarea
                id="content"
                value={newTimeCapsule.content}
                onChange={(e) => setNewTimeCapsule({...newTimeCapsule, content: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="openDate" className="text-right">
                Open Date
              </Label>
              <Input
                id="openDate"
                type="date"
                value={newTimeCapsule.openDate}
                onChange={(e) => setNewTimeCapsule({...newTimeCapsule, openDate: e.target.value})}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleCreateTimeCapsule} className="bg-[#98FF98] text-gray-800 hover:bg-[#7AE47A] transition-colors duration-200">Create Time Capsule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              className="fixed bottom-8 right-8 rounded-full w-12 h-12 bg-[#BFEAF5] text-gray-800 hover:bg-[#A0D8E8] transition-colors duration-200"
            >
              <Clock className="h-6 w-6" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Jump to a specific date in your memories</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}
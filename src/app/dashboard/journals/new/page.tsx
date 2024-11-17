'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { toast } from 'react-hot-toast'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Book, Pen, Notebook, Calendar, Star } from "lucide-react"

const journalSchema = z.object({
  name: z.string().min(1, "Journal name is required").max(100, "Journal name must be 100 characters or less"),
  description: z.string().max(500, "Description must be 500 characters or less").optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid color format").optional(),
  icon: z.string().max(50, "Icon name must be 50 characters or less").optional(),
  categoryId: z.string().optional(),
})

type JournalFormData = z.infer<typeof journalSchema>

interface Category {
  id: string
  name: string
}

type IconOption = {
  value: keyof typeof Icons
  label: string
}

const Icons = {
  book: Book,
  pen: Pen,
  notebook: Notebook,
  calendar: Calendar,
  star: Star,
} as const

const iconOptions: IconOption[] = [
  { value: 'book', label: 'Book' },
  { value: 'pen', label: 'Pen' },
  { value: 'notebook', label: 'Notebook' },
  { value: 'calendar', label: 'Calendar' },
  { value: 'star', label: 'Star' },
]

export default function NewJournalPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { register, handleSubmit, control, formState: { errors } } = useForm<JournalFormData>({
    resolver: zodResolver(journalSchema),
  })

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get<Category[]>('/api/journals/[journalId]/categories')
        setCategories(response.data)
      } catch (error) {
        console.error('Error fetching categories:', error)
        toast.error('Failed to load categories')
      }
    }

    fetchCategories()
  }, [])

  const onSubmit = async (data: JournalFormData) => {
    setIsSubmitting(true)
    try {
      await axios.post('/api/journals', data)
      toast.success('Journal created successfully!')
      router.push('/dashboard/journals')
    } catch (error) {
      console.error('Error creating journal:', error)
      toast.error('Failed to create journal')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8 mb-8">
      <Card className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
        <CardHeader className="bg-blue-100  p-6">
          <CardTitle className="text-3xl font-bold">Create New Journal</CardTitle>
          <CardDescription className="text-blue-100 mt-2">Fill in the details to create your new journal.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-6 p-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">Journal Name</Label>
              <Input 
                id="name" 
                {...register('name')} 
                placeholder="My Awesome Journal" 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium text-gray-700">Description</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Write a brief description of your journal..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>}
            </div>


            <div className="space-y-2">
              <Label htmlFor="icon" className="text-sm font-medium text-gray-700">Icon</Label>
              <Controller
                name="icon"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <SelectValue placeholder="Select an icon" />
                    </SelectTrigger>
                    <SelectContent>
                      {iconOptions.map((icon) => {
                        const IconComponent = Icons[icon.value]
                        return (
                          <SelectItem key={icon.value} value={icon.value}>
                            <div className="flex items-center">
                              <IconComponent className="mr-2 h-4 w-4" />
                              <span>{icon.label}</span>
                            </div>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.icon && <p className="text-sm text-red-500 mt-1">{errors.icon.message}</p>}
            </div>

            {/* <div className="space-y-2">
              <Label htmlFor="categoryId" className="text-sm font-medium text-gray-700">Category</Label>
              <Controller
                name="categoryId"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div> */}
          </CardContent>
          <CardFooter className="bg-gray-50 px-6 py-4">
            <Button 
              type="submit" 
              className="w-full bg-green-100 text-black font-semibold py-2 px-4 rounded-md hover:from-green-300 hover:to-green-200 focus:outline-none focus:ring-2 focus:ring-green-200 focus:ring-offset-2 transition-colors duration-300" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Book className="mr-2 h-5 w-5" />
                  Create Journal
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
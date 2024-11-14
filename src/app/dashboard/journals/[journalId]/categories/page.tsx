'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import axios from 'axios'
import { Plus, Edit2, Trash2, Loader2 } from 'lucide-react'
import { toast } from 'react-hot-toast'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Category {
  id: string
  name: string
  color: string
  _count: {
    entries: number
  }
}

export default function CategoriesManagement() {
  const params = useParams<{ journalId: string }>()
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [newCategory, setNewCategory] = useState({ name: '', color: '#BFEAF5' })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    setIsLoading(true)
    try {
      const response = await axios.get(`/api/journals/${params.journalId}/categories`)
      setCategories(response.data)
    } catch (error) {
      console.error('Error fetching categories:', error)
      toast.error('Failed to load categories')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateCategory = async () => {
    try {
      await axios.post(`/api/journals/${params.journalId}/categories`, newCategory)
      toast.success('Category created successfully')
      setIsDialogOpen(false)
      setNewCategory({ name: '', color: '#BFEAF5' })
      fetchCategories()
    } catch (error) {
      console.error('Error creating category:', error)
      toast.error('Failed to create category')
    }
  }

  const handleUpdateCategory = async () => {
    if (!editingCategory) return
    try {
      await axios.put(`/api/journals/${params.journalId}/categories`, editingCategory)
      toast.success('Category updated successfully')
      setIsDialogOpen(false)
      setEditingCategory(null)
      fetchCategories()
    } catch (error) {
      console.error('Error updating category:', error)
      toast.error('Failed to update category')
    }
  }

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      await axios.delete(`/api/journals/${params.journalId}/categories?id=${categoryId}`)
      toast.success('Category deleted successfully')
      fetchCategories()
    } catch (error) {
      console.error('Error deleting category:', error)
      toast.error('Failed to delete category')
    }
  }

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <Card className="bg-white shadow-md hover:shadow-lg transition-shadow duration-300">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 pb-6 border-b">
          <CardTitle className="text-2xl sm:text-3xl font-bold text-gray-800">Categories Management</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#98FF98] text-gray-800 hover:bg-[#7AE47A] transition-colors duration-300">
                <Plus className="mr-2 h-4 w-4" /> Add Category
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold text-gray-800">
                  {editingCategory ? 'Edit Category' : 'Create New Category'}
                </DialogTitle>
                <DialogDescription className="text-gray-600">
                  {editingCategory
                    ? 'Edit the details of the existing category.'
                    : 'Add a new category to organize your journal entries.'}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right text-gray-700">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={editingCategory ? editingCategory.name : newCategory.name}
                    onChange={(e) =>
                      editingCategory
                        ? setEditingCategory({ ...editingCategory, name: e.target.value })
                        : setNewCategory({ ...newCategory, name: e.target.value })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="color" className="text-right text-gray-700">
                    Color
                  </Label>
                  <Input
                    id="color"
                    type="color"
                    value={editingCategory ? editingCategory.color : newCategory.color}
                    onChange={(e) =>
                      editingCategory
                        ? setEditingCategory({ ...editingCategory, color: e.target.value })
                        : setNewCategory({ ...newCategory, color: e.target.value })
                    }
                    className="col-span-3 h-10"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => setIsDialogOpen(false)} variant="outline" className="text-gray-600">
                  Cancel
                </Button>
                <Button 
                  onClick={editingCategory ? handleUpdateCategory : handleCreateCategory}
                  className="bg-[#BFEAF5] text-gray-800 hover:bg-[#A0D8E8] transition-colors duration-300"
                >
                  {editingCategory ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-[#BFEAF5]" />
            </div>
          ) : (
            <ScrollArea className="h-[calc(100vh-300px)] rounded-md border p-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Name</TableHead>
                    <TableHead>Color</TableHead>
                    <TableHead className="text-right">Entries Count</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-6 h-6 rounded-full" 
                            style={{ backgroundColor: category.color }}
                          />
                          <span>{category.color}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{category._count.entries}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingCategory(category)
                              setIsDialogOpen(true)
                            }}
                            className="text-gray-600 hover:text-gray-800"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" className="text-gray-600 hover:text-gray-800">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-xl font-semibold text-gray-800">Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription className="text-gray-600">
                                  This action cannot be undone. This will permanently delete the
                                  category and remove it from all associated entries.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="text-gray-600">Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDeleteCategory(category.id)}
                                  className="bg-[#FFD1DC] text-gray-800 hover:bg-[#FFC0CB] transition-colors duration-300"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
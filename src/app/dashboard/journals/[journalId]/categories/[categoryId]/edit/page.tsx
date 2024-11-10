
'use client'

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { format } from 'date-fns';
import { Edit2, Trash2, Loader2, ArrowLeft, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
} from "@/components/ui/alert-dialog";

interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string;
  entries: {
    id: string;
    title: string;
    createdAt: string;
  }[];
}

export default function EditCategoryPage() {
  const params = useParams();
  const router = useRouter();
  const [category, setCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchCategory();
  }, []);

  const fetchCategory = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`/api/journals/${params.journalId}/categories/${params.categoryId}`);
      setCategory(response.data);
    } catch (error) {
      console.error('Error fetching category:', error);
      toast.error('Failed to load category');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateCategory = async () => {
    if (!category) return;
    setIsSaving(true);
    try {
      await axios.put(`/api/journals/${params.journalId}/categories/${params.categoryId}`, {
        name: category.name,
        color: category.color,
        icon: category.icon,
      });
      toast.success('Category updated successfully');
      router.push(`/journals/${params.journalId}/categories`);
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('Failed to update category');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCategory = async () => {
    try {
      await axios.delete(`/api/journals/${params.journalId}/categories/${params.categoryId}`);
      toast.success('Category deleted successfully');
      router.push(`/journals/${params.journalId}/categories`);
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!category) {
    return <div>Category not found</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Edit Category: {category.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={category.name}
                onChange={(e) => setCategory({ ...category, name: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="color" className="text-right">
                Color
              </Label>
              <Input
                id="color"
                type="color"
                value={category.color}
                onChange={(e) => setCategory({ ...category, color: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="icon" className="text-right">
                Icon
              </Label>
              <Input
                id="icon"
                value={category.icon || ''}
                onChange={(e) => setCategory({ ...category, icon: e.target.value })}
                className="col-span-3"
                placeholder="Enter icon name (e.g., 'book', 'star')"
              />
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Entries in this category</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {category.entries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>{entry.title}</TableCell>
                    <TableCell>{format(new Date(entry.createdAt), 'PPP')}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/journals/${params.journalId}/entries/${entry.id}`)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" /> Delete Category
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the category
                  and remove it from all associated entries.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteCategory}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button onClick={handleUpdateCategory} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" /> Save Changes
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
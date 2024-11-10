// app/(dashboard)/journals/[journalId]/page.tsx

'use client'

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { format } from 'date-fns';
import { Book, Edit, Star, Trash2, PlusCircle, BarChart2, Calendar, FileText, Heart } from 'lucide-react';
import { toast } from 'react-hot-toast';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Entry {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  mood: string;
  isFavorite: boolean;
}

interface JournalDetails {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  createdAt: string;
  updatedAt: string;
  category: { id: string; name: string } | null;
  entries: Entry[];
  statistics: {
    entryCount: number;
    favoriteCount: number;
    totalWordCount: number;
    moodDistribution: { [key: string]: number };
  };
}

export default function JournalDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [journal, setJournal] = useState<JournalDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isNewEntryDialogOpen, setIsNewEntryDialogOpen] = useState(false);
  const [newEntry, setNewEntry] = useState({ title: '', content: '', mood: '' });

  useEffect(() => {
    const fetchJournalDetails = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get<JournalDetails>(`/api/journals/${params.journalId}`);
        setJournal(response.data);
      } catch (error) {
        console.error('Error fetching journal details:', error);
        toast.error('Failed to load journal details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchJournalDetails();
  }, [params.journalId]);

  const handleDeleteJournal = async () => {
    try {
      await axios.delete(`/api/journals/${params.journalId}`);
      toast.success('Journal deleted successfully');
      router.push('/dashboard/journals');
    } catch (error) {
      console.error('Error deleting journal:', error);
      toast.error('Failed to delete journal');
    }
  };

  const handleCreateEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`/api/journals/${params.journalId}/entries`, newEntry);
      toast.success('Entry created successfully');
      setIsNewEntryDialogOpen(false);
     
      const response = await axios.get<JournalDetails>(`/api/journals/${params.journalId}`);
      setJournal(response.data);
    } catch (error) {
      console.error('Error creating entry:', error);
      toast.error('Failed to create entry');
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!journal) {
    return <div className="flex justify-center items-center h-screen">Journal not found</div>;
  }

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold" style={{ color: journal.color || undefined }}>
          {journal.icon && <span className="mr-2">{journal.icon}</span>}
          {journal.name}
        </h1>
        <div className="space-x-2">
          <Button onClick={() => router.push(`/dashboard/journals/${journal.id}/edit`)}>
            <Edit className="mr-2 h-4 w-4" /> Edit Journal
          </Button>
          <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
            <Trash2 className="mr-2 h-4 w-4" /> Delete Journal
          </Button>
        </div>
      </div>

      {journal.description && (
        <p className="text-gray-600 mt-2">{journal.description}</p>
      )}

      {journal.category && (
        <Badge variant="secondary">{journal.category.name}</Badge>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{journal.statistics.entryCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Favorite Entries</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{journal.statistics.favoriteCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Words</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{journal.statistics.totalWordCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Common Mood</CardTitle>
            <BarChart2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.entries(journal.statistics.moodDistribution).reduce((a, b) => a[1] > b[1] ? a : b)[0]}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Recent Entries</CardTitle>
            <Button onClick={() => setIsNewEntryDialogOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" /> New Entry
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Mood</TableHead>
                <TableHead>Favorite</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {journal.entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="font-medium">{entry.title}</TableCell>
                  <TableCell>{format(new Date(entry.createdAt), 'MMM d, yyyy')}</TableCell>
                  <TableCell>{entry.mood}</TableCell>
                  <TableCell>{entry.isFavorite ? <Star className="text-yellow-400" /> : null}</TableCell>
                  <TableCell>
                    <Button variant="ghost" onClick={() => router.push(`/dashboard/journals/${journal.id}/entries/${entry.id}`)}>
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full" onClick={() => router.push(`/dashboard/journals/${journal.id}/entries`)}>
            View All Entries
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure you want to delete this journal?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the journal and all its entries.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteJournal}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isNewEntryDialogOpen} onOpenChange={setIsNewEntryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Entry</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateEntry}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newEntry.title}
                  onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={newEntry.content}
                  onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="mood">Mood</Label>
                <Input
                  id="mood"
                  value={newEntry.mood}
                  onChange={(e) => setNewEntry({ ...newEntry, mood: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button type="submit">Create Entry</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
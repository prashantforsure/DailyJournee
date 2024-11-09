// app/(dashboard)/journals/[journalId]/entries/[entryId]/page.tsx

'use client'

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { format } from 'date-fns';
import { useSession } from 'next-auth/react';
import { 
  Calendar,
  Clock,
  Edit,
  Heart,
  Share2,
  Tag,
  Folder,
  Image as ImageIcon,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Entry {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  mood: string;
  isFavorite: boolean;
  tags: { id: string; name: string }[];
  media: { id: string; url: string }[];
  category: { id: string; name: string } | null;
}

interface RelatedEntry {
  id: string;
  title: string;
  createdAt: string;
}

export default function EntryDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [entry, setEntry] = useState<Entry | null>(null);
  const [relatedEntries, setRelatedEntries] = useState<RelatedEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);

  useEffect(() => {
    const fetchEntryDetails = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`/api/journals/${params.journalId}/entries/${params.entryId}`);
        setEntry(response.data.entry);
        setRelatedEntries(response.data.relatedEntries);
      } catch (error) {
        console.error('Error fetching entry details:', error);
        toast.error('Failed to load entry details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEntryDetails();
  }, [params.journalId, params.entryId]);

  const handleToggleFavorite = async () => {
    try {
      const response = await axios.put(`/api/journals/${params.journalId}/entries/${params.entryId}`, {
        isFavorite: !entry?.isFavorite,
      });
      setEntry(prevEntry => ({ ...prevEntry!, isFavorite: response.data.isFavorite }));
      toast.success(entry?.isFavorite ? 'Removed from favorites' : 'Added to favorites');
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorite status');
    }
  };

  const handleShare = (platform: string) => {
    // Implement sharing logic here
    console.log(`Sharing to ${platform}`);
    toast.success(`Shared to ${platform}`);
    setIsShareDialogOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!entry) {
    return <div>Entry not found</div>;
  }

  return (
    <div className="container mx-auto py-10 space-y-8">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Entries
      </Button>

      <Card className="max-w-4xl mx-auto">
        <CardHeader className="space-y-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-3xl font-bold">{entry.title}</CardTitle>
            <div className="flex space-x-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" onClick={handleToggleFavorite}>
                      <Heart className={`h-4 w-4 ${entry.isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {entry.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" onClick={() => router.push(`/journals/${params.journalId}/entries/${params.entryId}/edit`)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    Edit entry
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" onClick={() => setIsShareDialogOpen(true)}>
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    Share entry
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
            <div className="flex items-center">
              <Calendar className="mr-1 h-4 w-4" />
              {format(new Date(entry.createdAt), 'MMMM d, yyyy')}
            </div>
            <div className="flex items-center">
              <Clock className="mr-1 h-4 w-4" />
              {format(new Date(entry.createdAt), 'h:mm a')}
            </div>
            {entry.mood && (
              <Badge variant="secondary" className="ml-2">
                Mood: {entry.mood}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: entry.content }} />

          {entry.media.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Attached Media</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {entry.media.map((media) => (
                  <div key={media.id} className="relative aspect-square">
                    <img
                      src={media.url}
                      alt="Attached media"
                      className="object-cover rounded-lg w-full h-full"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {entry.category && (
            <div className="flex items-center space-x-2">
              <Folder className="h-4 w-4" />
              <span>Category: {entry.category.name}</span>
            </div>
          )}

          {entry.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <Tag className="h-4 w-4 mr-2" />
              {entry.tags.map((tag) => (
                <Badge key={tag.id} variant="outline">
                  {tag.name}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {relatedEntries.length > 0 && (
        <Card className="max-w-4xl mx-auto mt-8">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Related Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {relatedEntries.map((relatedEntry) => (
                <li key={relatedEntry.id} className="flex justify-between items-center">
                  <Button
                    variant="link"
                    onClick={() => router.push(`/journals/${params.journalId}/entries/${relatedEntry.id}`)}
                  >
                    {relatedEntry.title}
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(relatedEntry.createdAt), 'MMMM d, yyyy')}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Entry</DialogTitle>
            <DialogDescription>
              Choose a platform to share your entry.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <Button onClick={() => handleShare('Twitter')}>Twitter</Button>
            <Button onClick={() => handleShare('Facebook')}>Facebook</Button>
            <Button onClick={() => handleShare('LinkedIn')}>LinkedIn</Button>
            <Button onClick={() => handleShare('Email')}>Email</Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsShareDialogOpen(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
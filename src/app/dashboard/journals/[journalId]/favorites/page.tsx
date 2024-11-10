
'use client'

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { format } from 'date-fns';
import { Star, ChevronDown, ChevronUp, Loader2, Search, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";
interface FavoriteEntry {
  id: string;
  title: string;
  content: string;
  mood: string | null;
  createdAt: string;
  updatedAt: string;
  isQuickEntry: boolean;
}

export default function FavoritesPage() {
  const params = useParams();
  const router = useRouter();
  const [favorites, setFavorites] = useState<FavoriteEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchFavorites();
  }, [sortBy, sortOrder, currentPage, searchTerm]);

  const fetchFavorites = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`/api/journals/${params.journalId}/favorites`, {
        params: {
          sortBy,
          order: sortOrder,
          page: currentPage,
          limit: 10,
          search: searchTerm,
        },
      });
      setFavorites(response.data.favorites);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      toast.error('Failed to load favorite entries');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const handleRemoveFavorite = async (entryId: string) => {
    try {
      await axios.put(`/api/journals/${params.journalId}/favorites`, {
        entryId,
        isFavorite: false,
      });
      toast.success('Entry removed from favorites');
      fetchFavorites();
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast.error('Failed to remove entry from favorites');
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const renderSortIcon = (column: string) => {
    if (sortBy === column) {
      return sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
    }
    return null;
  };

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Favorite Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-2">
              <Input
                type="text"
                placeholder="Search favorites..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-64"
              />
              {searchTerm && (
                <Button variant="ghost" onClick={() => setSearchTerm('')}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Date Created</SelectItem>
                <SelectItem value="updatedAt">Date Updated</SelectItem>
                <SelectItem value="title">Title</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">
                    <Button variant="ghost" onClick={() => handleSort('title')}>
                      Title {renderSortIcon('title')}
                    </Button>
                  </TableHead>
                  <TableHead>Content</TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort('createdAt')}>
                      Created At {renderSortIcon('createdAt')}
                    </Button>
                  </TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {favorites.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium">{entry.title || "Untitled Entry"}</TableCell>
                    <TableCell className="truncate max-w-[300px]">{entry.content}</TableCell>
                    <TableCell>{format(new Date(entry.createdAt), 'PPP')}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => router.push(`/journals/${params.journalId}/entries/${entry.id}`)}>
                          View
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleRemoveFavorite(entry.id)}>
                          <Star className="h-4 w-4 fill-current text-yellow-400" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
        <CardFooter>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                {currentPage === 1 ? (
                  <PaginationPrevious 
                    className="pointer-events-none opacity-50" 
                    href="#"
                  />
                ) : (
                  <PaginationPrevious 
                    onClick={() => handlePageChange(currentPage - 1)}
                    href="#"
                  />
                )}
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    onClick={() => handlePageChange(page)}
                    isActive={currentPage === page}
                    href="#"
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                {currentPage === totalPages ? (
                  <PaginationNext 
                    className="pointer-events-none opacity-50" 
                    href="#"
                  />
                ) : (
                  <PaginationNext 
                    onClick={() => handlePageChange(currentPage + 1)}
                    href="#"
                  />
                )}
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </CardFooter>
      </Card>
    </div>
  );
}
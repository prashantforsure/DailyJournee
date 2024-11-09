
'use client'

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { Book, ChevronDown, Filter, Search, SortAsc, SortDesc } from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Journal {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  entryCount: number;
  lastEntryDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function JournalsPage() {
  const [journals, setJournals] = useState<Journal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [sort, setSort] = useState<'name' | 'createdAt' | 'updatedAt' | 'entryCount'>('createdAt');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchJournals();
  }, [filter, sort, order]);

  const fetchJournals = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get<Journal[]>('/api/journals', {
        params: { filter, sort, order }
      });
      setJournals(response.data);
    } catch (error) {
      console.error('Error fetching journals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSort = (newSort: typeof sort) => {
    if (newSort === sort) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setSort(newSort);
      setOrder('asc');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Your Journals</h1>
        <Button>
          <Book className="mr-2 h-4 w-4" /> New Journal
        </Button>
      </div>

      <div className="flex space-x-2">
        <div className="relative flex-grow">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search journals..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-8"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
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

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Entries</TableHead>
              <TableHead>Last Entry</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {journals.map((journal) => (
              <TableRow key={journal.id}>
                <TableCell className="font-medium">{journal.name}</TableCell>
                <TableCell>{journal.entryCount}</TableCell>
                <TableCell>
                  {journal.lastEntryDate
                    ? format(new Date(journal.lastEntryDate), 'MMM d, yyyy')
                    : 'No entries'}
                </TableCell>
                <TableCell>{format(new Date(journal.createdAt), 'MMM d, yyyy')}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View</DropdownMenuItem>
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
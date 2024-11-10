// app/(dashboard)/journals/[journalId]/calendar/page.tsx

'use client'

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Star, Smile } from 'lucide-react';
import { toast } from 'react-hot-toast';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
  mood: string | null;
  createdAt: string;
  isQuickEntry: boolean;
  isFavorite: boolean;
}

export default function CalendarView() {
  const params = useParams();
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [entries, setEntries] = useState<Entry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);

  useEffect(() => {
    fetchEntries();
  }, [currentDate]);

  const fetchEntries = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`/api/journals/${params.journalId}/entries/calendar`, {
        params: {
          year: currentDate.getFullYear(),
          month: currentDate.getMonth() + 1,
        },
      });
      setEntries(response.data);
    } catch (error) {
      console.error('Error fetching entries:', error);
      toast.error('Failed to load entries');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreviousMonth = () => {
    setCurrentDate(prevDate => subMonths(prevDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prevDate => addMonths(prevDate, 1));
  };

  const handleNewEntry = (date: Date) => {
    router.push(`/journals/${params.journalId}/entries/new?date=${format(date, 'yyyy-MM-dd')}`);
  };

  const getDayEntries = (day: Date) => {
    return entries.filter(entry => isSameDay(new Date(entry.createdAt), day));
  };

  const renderCalendar = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = monthStart;
    const endDate = monthEnd;

    const dateFormat = "d";
    const rows = [];

    let days = [];
    let day = startDate;
    let formattedDate = "";

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, dateFormat);
        const cloneDay = day;
        const dayEntries = getDayEntries(cloneDay);
        days.push(
          <div
            key={day.toString()}
            className={`relative h-32 border p-2 ${
              !isSameMonth(day, monthStart)
                ? "bg-gray-100 text-gray-400"
                : "bg-white"
            }`}
          >
            <span className="text-sm font-semibold">{formattedDate}</span>
            {dayEntries.length > 0 && (
              <div className="mt-2 space-y-1">
                {dayEntries.slice(0, 3).map(entry => (
                  <TooltipProvider key={entry.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className="text-xs truncate cursor-pointer hover:bg-gray-100 p-1 rounded"
                          onClick={() => setSelectedEntry(entry)}
                        >
                          {entry.title || "Untitled Entry"}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{entry.title || "Untitled Entry"}</p>
                        <p>{entry.content.substring(0, 50)}...</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
                {dayEntries.length > 3 && (
                  <div className="text-xs text-gray-500">
                    +{dayEntries.length - 3} more
                  </div>
                )}
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="absolute bottom-1 right-1"
              onClick={() => handleNewEntry(cloneDay)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        );
        day = addMonths(day, 1);
      }
      rows.push(
        <div key={day.toString()} className="grid grid-cols-7 gap-1">
          {days}
        </div>
      );
      days = [];
    }
    return <div className="space-y-1">{rows}</div>;
  };

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-bold">Calendar View</CardTitle>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="icon" onClick={handlePreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-lg font-semibold">
              {format(currentDate, 'MMMM yyyy')}
            </span>
            <Button variant="outline" size="icon" onClick={handleNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center font-semibold text-gray-500">
                {day}
              </div>
            ))}
          </div>
          {isLoading ? (
            <div className="flex justify-center items-center h-96">
              <CalendarIcon className="h-16 w-16 animate-pulse text-gray-400" />
            </div>
          ) : (
            renderCalendar()
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedEntry} onOpenChange={() => setSelectedEntry(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{selectedEntry?.title || "Untitled Entry"}</span>
              <div className="flex items-center space-x-2">
                {selectedEntry?.isFavorite && (
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                )}
                {selectedEntry?.mood && (
                  <Smile className="h-5 w-5 text-blue-500" />
                )}
                <span className="text-sm text-gray-500">
                  {selectedEntry?.createdAt && format(new Date(selectedEntry.createdAt), 'PPP')}
                </span>
              </div>
            </DialogTitle>
            <DialogDescription>
              {selectedEntry?.isQuickEntry ? "Quick Entry" : "Full Entry"}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 max-h-96 overflow-y-auto">
            <p className="whitespace-pre-wrap">{selectedEntry?.content}</p>
          </div>
          <DialogFooter>
            <Button onClick={() => router.push(`/journals/${params.journalId}/entries/${selectedEntry?.id}`)}>
              View Full Entry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
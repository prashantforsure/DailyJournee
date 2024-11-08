
import React from 'react'
import Link from 'next/link'
import { Book } from 'lucide-react'

import { Button } from "@/components/ui/button"

type Journal = {
    id: string;
    name: string;
    entryCount: number;
  };
  
  export default function JournalList({ journals }: { journals: Journal[] }) {
    return (
      <ul className="space-y-2">
        {journals.map((journal) => (
          <li
            key={journal.id}
            className="flex items-center justify-between p-2 bg-white rounded-lg shadow-sm"
          >
            <div className="flex items-center">
              <Book className="w-5 h-5 mr-2 text-blue-500" />
              <span className="font-medium">{journal.name}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                {journal.entryCount} entries
              </span>
              <Button asChild variant="ghost" size="sm">
                <Link href={`/dashboard/journals/${journal.id}`}>View</Link>
              </Button>
            </div>
          </li>
        ))}
      </ul>
    );
  }

import React from 'react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

import { Button } from "@/components/ui/button"

type Entry = {
    id: string;
    title: string;
    journalName: string;
    journalId: string;
    createdAt: string;
  };
  
  export default function RecentEntriesList({ entries }: { entries: Entry[] }) {
    return (
      <ul className="space-y-2">
        {entries.map((entry) => (
          <li
            key={entry.id}
            className="flex items-center justify-between p-2 bg-white rounded-lg shadow-sm"
          >
            <div>
              <h3 className="font-medium">{entry.title}</h3>
              <p className="text-sm text-gray-500">
                {entry.journalName} • {formatDistanceToNow(new Date(entry.createdAt), {
                  addSuffix: true,
                })}
              </p>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href={`/dashboard/journals/${entry.journalId}/entries/${entry.id}`}>
                View
              </Link>
            </Button>
          </li>
        ))}
      </ul>
    );
  }
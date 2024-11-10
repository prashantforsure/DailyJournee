'use client'

import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Book, Edit3, TrendingUp, Loader2 } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import JournalList from '@/components/JournalList'
import RecentEntriesList from '@/components/entries/recent-entries-list'

interface DashboardData {
  totalJournals: number
  totalEntries: number
  currentStreak: number
  recentJournals: any[]
  recentEntries: any[]
}

async function getDashboardData(): Promise<DashboardData> {
  try {
    const response = await axios.get<DashboardData>('/api/dashboard')
    return response.data
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error)
    throw new Error('Failed to fetch dashboard data')
  }
}

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getDashboardData()
        setDashboardData(data)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  if (isLoading) {
    return <DashboardSkeleton />
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg text-muted-foreground">Error loading dashboard data. Please try again later.</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-8">
      <h1 className="text-3xl font-bold text-primary">Dashboard</h1>
      <div className="grid gap-6 md:grid-cols-3">
        <StatCard title="Total Journals" value={dashboardData.totalJournals} icon={Book} color="bg-pink-100" />
        <StatCard title="Total Entries" value={dashboardData.totalEntries} icon={Edit3} color="bg-blue-100" />
        <StatCard 
          title="Streak" 
          value={`${dashboardData.currentStreak} days`} 
          icon={TrendingUp} 
          color="bg-green-100"
          progress={dashboardData.currentStreak}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <RecentCard title="Recent Journals" >
          <JournalList journals={dashboardData.recentJournals} />
        </RecentCard>
        <RecentCard title="Recent Entries">
          <RecentEntriesList entries={dashboardData.recentEntries} />
        </RecentCard>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon: Icon, color, progress }: { 
  title: string; 
  value: string | number; 
  icon: React.ElementType; 
  color: string;
  progress?: number;
}) {
  return (
    <Card className={`${color} transition-all duration-300 hover:shadow-lg`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {progress !== undefined && (
          <Progress value={progress} max={30} className="mt-2" />
        )}
      </CardContent>
    </Card>
  )
}

function RecentCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="transition-all duration-300 hover:shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-primary">{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

function DashboardSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Skeleton className="h-10 w-48" />
      <div className="grid gap-6 md:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="bg-gray-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-[60px]" />
              {i === 2 && <Skeleton className="h-2 w-full mt-2" />}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <Card key={i} className="bg-gray-50">
            <CardHeader>
              <Skeleton className="h-6 w-[150px]" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[...Array(3)].map((_, j) => (
                  <Skeleton key={j} className="h-12 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
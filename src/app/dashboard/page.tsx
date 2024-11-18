'use client'

import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Book, Edit3, TrendingUp } from 'lucide-react'

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 space-y-8 mb-8">
      <div className="grid gap-6 md:grid-cols-3">
        <StatCard 
          title="Total Journals" 
          value={dashboardData.totalJournals} 
          icon={Book} 
          color="from-pink-400 via-purple-400 to-indigo-400" 
        />
        <StatCard 
          title="Total Entries" 
          value={dashboardData.totalEntries} 
          icon={Edit3} 
          color="from-blue-400 via-cyan-400 to-teal-400" 
        />
        <StatCard 
          title="Streak" 
          value={`${dashboardData.currentStreak} days`} 
          icon={TrendingUp} 
          color="from-green-400 via-lime-400 to-yellow-400"
          progress={dashboardData.currentStreak}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-10">
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
    <Card className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg group`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-60`}></div>
      {[...Array(3)].map((_, i) => (
        <div 
          key={i} 
          className={`
            absolute w-[200%] h-[200%] top-[-50%] left-[-50%] 
            bg-gradient-to-br ${color}
            animate-wave-${i + 1} rounded-[40%] opacity-30
          `}
        ></div>
      ))}
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
        <CardTitle className="text-sm font-medium text-white">{title}</CardTitle>
        <Icon className="h-4 w-4 text-white" />
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="text-2xl font-bold text-white">{value}</div>
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
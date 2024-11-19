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

  const cardData = [
    { title: "Total Journals", value: dashboardData.totalJournals, icon: Book, gradient: 'from-[#f89b29] to-[#ff0f7b]' },
    { title: "Total Entries", value: dashboardData.totalEntries, icon: Edit3, gradient: 'from-[#00ddeb] to-[#5b42f3]' },
    { title: "Streak", value: `${dashboardData.currentStreak} days`, icon: TrendingUp, gradient: 'from-[#5b42f3] to-[#00ddeb]', progress: dashboardData.currentStreak },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 space-y-8 mb-8">
      <div className="grid gap-6 md:grid-cols-3">
        {cardData.map((card, index) => (
          <StatCard key={index} {...card} />
        ))}
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

function StatCard({ title, value, icon: Icon, gradient, progress }: { 
  title: string; 
  value: string | number; 
  icon: React.ElementType; 
  gradient: string;
  progress?: number;
}) {
  return (
    <div className="e-card playing" style={{width: '100%', height: '200px', margin: '0'}}>
      <div className="image"></div>
      <div className={`wave bg-gradient-to-br ${gradient}`}></div>
      <div className={`wave bg-gradient-to-br ${gradient}`}></div>
      <div className={`wave bg-gradient-to-br ${gradient}`}></div>
      <div className="infotop">
      <div className="icon-wrapper">
  <Icon className="icon" style={{color: 'white', width: '32px', height: '32px'}} />
</div>
        <div className="title">{title}</div>
        <div className="value">{value}</div>
        {progress !== undefined && (
          <div className="progress-wrapper">
            <Progress value={progress} max={30} className="progress" />
          </div>
        )}
      </div>
    </div>
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
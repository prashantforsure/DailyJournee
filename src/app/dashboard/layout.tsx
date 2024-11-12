'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from "next-auth/react"
import { Bell, Book, Calendar, Home, LogOut, Search, Settings, Star, User } from 'lucide-react'

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { UserAvatar } from '@/components/UserAvatar'

const navigationItems = [
  { icon: Home, label: 'Overview', href: '/dashboard' },
  { icon: Book, label: 'Journals', href: '/dashboard/journals' },
  { icon: Star, label: 'Favorites', href: '/dashboard/favorites' },
  { icon: Calendar, label: 'Memories', href: '/dashboard/memories' },
  { icon: Search, label: 'Search', href: '/dashboard/search' },
  { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session } = useSession()
  const pathname = usePathname()

  return (
    <div className="flex h-screen bg-[#FAFAFA]">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 bg-white border-r border-[#DBDBDB]">
        <div className="p-4 border-b border-[#DBDBDB]">
          <h1 className="text-2xl font-bold text-[#FFD1DC]" style={{ fontFamily: 'Agatha, sans-serif' }}>JournalApp</h1>
        </div>
        <nav className="mt-6">
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center px-4 py-2 text-[#262626] hover:bg-[#FAFAFA] hover:text-[#BFEAF5] transition-colors duration-200 rounded-sm mx-2",
                pathname === item.href && "bg-[#FAFAFA] text-[#BFEAF5] font-medium"
              )}
            >
              <item.icon className="w-5 h-5 mr-3" />
              <span className="text-sm">{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-[#DBDBDB] sticky top-0 z-10">
          <div className="max-w-5xl mx-auto py-3 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            {/* Mobile Logo - only visible on mobile */}
            <h1 className="md:hidden text-2xl font-bold text-[#FFD1DC]" style={{ fontFamily: 'Agatha, sans-serif' }}>JournalApp</h1>
            
            <div className="flex items-center space-x-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="hover:bg-[#FAFAFA]">
                    <Bell className="h-5 w-5 text-[#262626]" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-white border border-[#DBDBDB]">
                  <DropdownMenuLabel className="text-[#262626]">Notifications</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-[#DBDBDB]" />
                  <DropdownMenuItem className="text-sm">New journal entry reminder</DropdownMenuItem>
                  <DropdownMenuItem className="text-sm">Weekly reflection</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full hover:bg-[#FAFAFA]">
                    <UserAvatar
                      user={{ name: session?.user?.name || null, image: session?.user?.image || null }}
                      className="h-8 w-8"
                    />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-white border border-[#DBDBDB]" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium text-[#262626]">{session?.user?.name}</p>
                      <p className="text-xs text-[#8E8E8E]">{session?.user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-[#DBDBDB]" />
                  <DropdownMenuItem className="text-sm">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-sm">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-[#DBDBDB]" />
                  <DropdownMenuItem onClick={() => signOut()} className="text-sm">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#DBDBDB]">
          <div className="grid grid-cols-5 h-14">
            {navigationItems.slice(0, 5).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center space-y-1",
                  pathname === item.href 
                    ? "text-[#BFEAF5]" 
                    : "text-[#262626] hover:text-[#BFEAF5]"
                )}
              >
                <item.icon className="w-6 h-6" />
                <span className="text-[10px]">{item.label}</span>
              </Link>
            ))}
          </div>
        </nav>
      </main>
    </div>
  )
}
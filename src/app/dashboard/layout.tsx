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
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { UserAvatar } from '@/components/UserAvatar'

const navigationItems = [
  { icon: Home, label: 'Overview', href: '/dashboard' },
  { icon: Book, label: 'Journals', href: '/dashboard/journals' },
  { icon: Star, label: 'Favorites', href: '/favorites' },
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
    <div className="flex h-screen bg-[#FFFFFF]">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 bg-[#FFFFFF] border-r border-[#E5E5E5]">
        <div className="p-4 border-b border-[#E5E5E5]">
          <h1 className="text-xl font-semibold text-[#000000]">JournalApp</h1>
        </div>
        <nav className="mt-6">
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center px-4 py-2 text-[#37352F] hover:bg-[#F7F7F7] transition-colors duration-200 rounded-sm mx-2",
                pathname === item.href && "bg-[#F7F7F7] font-medium"
              )}
            >
              <item.icon className="w-4 h-4 mr-3 text-[#737373]" />
              <span className="text-sm">{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
        {/* Header */}
        <header className="bg-[#FFFFFF] border-b border-[#E5E5E5] sticky top-0 z-10">
          <div className="max-w-7xl mx-auto py-3 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            {/* Mobile Logo - only visible on mobile */}
            <h1 className="md:hidden text-lg font-semibold text-[#000000]">JournalApp</h1>
            
            <div className="flex items-center space-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="hover:bg-[#F7F7F7]">
                    <Bell className="h-4 w-4 text-[#737373]" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="text-[#37352F]">Notifications</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-[#E5E5E5]" />
                  <DropdownMenuItem className="text-sm">New journal entry reminder</DropdownMenuItem>
                  <DropdownMenuItem className="text-sm">Weekly reflection</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full hover:bg-[#F7F7F7]">
                    <Avatar className="h-7 w-7">
                      <UserAvatar
                        user={{ name: session?.user?.name || null, image: session?.user?.name?.[0] || null }}
                        className="h-7 w-7"
                      />
                      <AvatarFallback className="text-sm bg-[#F7F7F7] text-[#37352F]">
                        {session?.user?.name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium text-[#37352F]">{session?.user?.name}</p>
                      <p className="text-xs text-[#737373]">{session?.user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-[#E5E5E5]" />
                  <DropdownMenuItem className="text-sm">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-sm">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-[#E5E5E5]" />
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
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {children}
        </div>

        {/* Mobile Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#FFFFFF] border-t border-[#E5E5E5]">
          <div className="grid grid-cols-5 h-14">
            {navigationItems.slice(0, 5).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center space-y-1",
                  pathname === item.href 
                    ? "text-[#000000]" 
                    : "text-[#737373] hover:text-[#000000]"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-[10px]">{item.label}</span>
              </Link>
            ))}
          </div>
        </nav>
      </main>
    </div>
  )
}
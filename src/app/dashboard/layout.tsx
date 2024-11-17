'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from "next-auth/react"
import { Book, Calendar, Feather, Home, LogOut, Search, Settings, Star, PenTool } from 'lucide-react'

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
import { useRouter } from 'next/navigation'


const navigationItems = [
  { icon: Home, label: 'Overview', href: '/dashboard' },
  { icon: Book, label: 'Journals', href: '/dashboard/journals' },
  { icon: PenTool, label: 'Entries', href: '/dashboard/entry' },
  { icon: Star, label: 'Favorites', href: '/dashboard/favorites' },
  { icon: Calendar, label: 'Memories', href: '/dashboard/memories' },
  { icon: Search, label: 'Search', href: '/dashboard/search' },

]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (!session) {
      router.push('/')
    }
  }, [session, router])

  return (
    <div className="flex h-screen bg-[#FAFAFA]">
      <aside className="hidden md:block w-64 bg-white border-r border-[#DBDBDB]">
        <div className="p-4 border-b border-[#DBDBDB]">
          <div className='flex'>
            <Feather className="h-8 w-8 text-[#8dc572]" />
            <span className="ml-2 text-xl font-bold text-[#080707]" style={{ fontFamily: '"Agatha", cursive' }}><Link href='/'>Daily Journee</Link></span>
          </div>
        </div>
        <nav className="mt-6">
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center px-4 py-2 text-[#262626] hover:bg-[#FAFAFA] hover:text-[#BFEAF5] transition-colors duration-200 rounded-sm mx-2",
                pathname === item.href && "bg-[#FAFAFA] text-[#34d6ff] font-medium"
              )}
            >
              <item.icon className="w-5 h-5 mr-3" />
              <span className="text-sm">{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-[#DBDBDB] sticky top-0 z-10">
          <div className="max-w-5xl mx-auto py-3 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <div className='flex md:hidden'>
              <Feather className="h-8 w-8 text-[#8dc572]" />
              <span className="ml-2 text-xl font-bold text-[#080707]" style={{ fontFamily: '"Agatha", cursive' }}>Daily Journee</span>
            </div>
            {/* <div className="hidden md:hidden">
              <Input
                type="search"
                placeholder="Search..."
                className="w-64"
              />
            </div> */}
            <div className='text-white'>.</div>
            <div className="flex items-center space-x-4">
              <Link href='/dashboard/search'>
              <Button variant="ghost" size="icon" className="md:hidden hover:bg-[#FAFAFA]">
                <Search className="h-5 w-5" />
              </Button>
              </Link>
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

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </div>

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
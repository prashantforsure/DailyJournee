'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession, signIn, signOut } from 'next-auth/react'
import { Feather, Loader2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { motion } from 'framer-motion'

export default function Header() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (session) {
      router.push('/dashboard')
    }
  }, [session, router])

  const handleAuthAction = () => {
    if (session) {
      signOut()
    } else {
      signIn()
    }
  }

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-r backdrop-blur-lg bg-white/80 border-b border-gray-100 sticky top-0 z-50"
    >
      <nav className="container mx-auto px-4 sm:px-6 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <Feather className="h-8 w-8 " />
            <span className="ml-2 text-xl font-bold text-gradient-to-r from-blue-600 to-purple-600" style={{ fontFamily: '"Agatha", cursive' }}>Daily Journee</span>
          </Link>
          <div className="flex items-center space-x-6">
            {status === 'loading' ? (
              <Button disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait
              </Button>
            ) : session ? (
              <Button
                onClick={handleAuthAction}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:bg-gray-100 transition-colors duration-300"
              >
                Sign Out
              </Button>
            ) : (
              <Button
                onClick={handleAuthAction}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:bg-gray-100 transition-colors duration-300"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </nav>
    </motion.header>
  )
}
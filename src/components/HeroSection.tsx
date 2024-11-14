'use client'

import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
}

const staggerChildren = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
}

const floatAnimation = {
  y: ['-2%', '2%'],
  transition: {
    y: {
      duration: 2,
      repeat: Infinity,
      repeatType: 'reverse',
      ease: 'easeInOut'
    }
  }
}

export default function HeroSection() {
  const { data: session } = useSession()
  const router = useRouter()

  const handleClick = () => {
    if (session) {
      router.push('/dashboard')
    } else {
      router.push('/auth/signin')
    }
  }

  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={staggerChildren}
      className="relative h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 to-pink-50"
    >
      <div className="container mx-auto px-4 z-10">
        <motion.h1
          variants={fadeIn}
          className="text-5xl md:text-7xl font-bold text-center mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-pink-600"
        >
          Capture Your Journey
        </motion.h1>
        <motion.p
          variants={fadeIn}
          className="text-xl md:text-2xl text-center mb-8 text-gray-600"
        >
          Elevate your journaling experience with AI-powered insights and seamless organization.
        </motion.p>
        <motion.div variants={fadeIn} className="flex justify-center space-x-4">
          <Button onClick={handleClick} size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
            Start Journaling
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
          <Button size="lg" variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
            Learn More
          </Button>
        </motion.div>
      </div>
      <motion.div
        animate={floatAnimation}
        className="absolute inset-0 z-0"
      >
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/2 w-64 h-64 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </motion.div>
    </motion.section>
  )
}
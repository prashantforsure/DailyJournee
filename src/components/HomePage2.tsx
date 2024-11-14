'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'
import { motion, useAnimation, AnimatePresence } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { ChevronRight, Star, Check, ArrowRight, Heart, TrendingUp, Target, Feather, Loader2 } from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import Header from './Header'

// Animations
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

const HeroSection = () => {
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
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
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

const FeatureShowcase = () => {
  const controls = useAnimation()
  const [ref, inView] = useInView()

  useEffect(() => {
    if (inView) {
      controls.start('visible')
    }
  }, [controls, inView])

  const features = [
    {
      title: 'Quick Entry',
      description: 'Jot down your thoughts in seconds with our streamlined interface.',
      icon: '⚡️'
    },
    {
      title: 'AI-Powered Insights',
      description: 'Gain deeper understanding of your entries with intelligent analysis.',
      icon: '🧠'
    },
    {
      title: 'Multimedia Support',
      description: 'Enrich your journal with photos, audio, and video content.',
      icon: '🎨'
    },
    {
      title: 'Cross-Device Sync',
      description: 'Access your journal from anywhere, on any device.',
      icon: '🔄'
    },
    {
      title: 'Advanced Organization',
      description: 'Easily categorize and find entries with tags and smart filters.',
      icon: '📊'
    },
    {
      title: 'Privacy First',
      description: 'Your thoughts are yours alone, with end-to-end encryption.',
      icon: '🔒'
    }
  ]

  return (
    <motion.section
      ref={ref}
      animate={controls}
      initial="hidden"
      variants={staggerChildren}
      className="py-20 bg-white"
    >
      <div className="container mx-auto px-4">
        <motion.h2
          variants={fadeIn}
          className="text-4xl font-bold text-center mb-12 text-gray-800"
        >
          Powerful Features for Your Journey
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div key={index} variants={fadeIn}>
              <Card className="h-full transition-all duration-300 hover:shadow-lg">
                <CardHeader>
                  <div className="text-4xl mb-2">{feature.icon}</div>
                  <CardTitle className="text-xl font-semibold">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
        </div>
      </motion.section>
   )}
  
  


// Benefits Explanation
const BenefitsExplanation = () => {
  const controls = useAnimation()
  const [ref, inView] = useInView()

  useEffect(() => {
    if (inView) {
      controls.start('visible')
    }
  }, [controls, inView])

  const benefits = [
    {
      title: 'Enhance Self-Reflection',
      description: 'Deepen your understanding of yourself through guided journaling prompts and AI-powered insights.',
      icon: <Star className="h-8 w-8 text-yellow-500" />
    },
    {
      title: 'Boost Mental Well-being',
      description: 'Improve your emotional awareness and reduce stress through regular journaling practice.',
      icon: <Heart className="h-8 w-8 text-red-500" />
    },
    {
      title: 'Track Personal Growth',
      description: 'Visualize your progress over time with advanced analytics and mood tracking features.',
      icon: <TrendingUp className="h-8 w-8 text-green-500" />
    },
    {
      title: 'Increase Productivity',
      description: 'Set and achieve your goals more effectively by documenting your journey and learnings.',
      icon: <Target className="h-8 w-8 text-blue-500" />
    }
  ]

  return (
    <motion.section
      ref={ref}
      animate={controls}
      initial="hidden"
      variants={staggerChildren}
      className="py-20 bg-gray-50"
    >
      <div className="container mx-auto px-4">
        <motion.h2
          variants={fadeIn}
          className="text-4xl font-bold text-center mb-12 text-gray-800"
        >
          Transform Your Life Through Journaling
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {benefits.map((benefit, index) => (
            <motion.div key={index} variants={fadeIn}>
              <Card className="h-full transition-all duration-300 hover:shadow-lg">
                <CardHeader>
                  <div className="mb-4">{benefit.icon}</div>
                  <CardTitle className="text-xl font-semibold">{benefit.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{benefit.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  )
}

// Call-to-Action Section
const CallToAction = () => {
  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={staggerChildren}
      className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white"
    >
      <div className="container mx-auto px-4 text-center">
        <motion.h2
          variants={fadeIn}
          className="text-4xl font-bold mb-6"
        >
          Start Your Journaling Journey Today
        </motion.h2>
        <motion.p
          variants={fadeIn}
          className="text-xl mb-8"
        >
          Join thousands of others who have transformed their lives through the power of journaling.
        </motion.p>
        <motion.div variants={fadeIn}>
          <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
            Get Started for Free
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </motion.div>
      </div>
    </motion.section>
  )
}

// User Testimonials
const UserTestimonials = () => {
  const controls = useAnimation()
  const [ref, inView] = useInView()

  useEffect(() => {
    if (inView) {
      controls.start('visible')
    }
  }, [controls, inView])

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Entrepreneur',
      content: 'This journaling app has been a game-changer for my personal growth. The AI insights have helped me uncover patterns I never noticed before.',
      avatar: '/placeholder.svg'
    },
    {
      name: 'Michael Chen',
      role: 'Student',
      content: 'As a busy student, I love how quick and easy it is to jot down my thoughts. The cross-device sync is perfect for my lifestyle.',
      avatar: '/placeholder.svg'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Therapist',
      content: 'I recommend this app to all my clients. Its an incredible tool for self-reflection and emotional awareness.',
      avatar: '/placeholder.svg'
    }
  ]

  return (
    <motion.section
      ref={ref}
      animate={controls}
      initial="hidden"
      variants={staggerChildren}
      className="py-20 bg-white"
    >
      <div className="container mx-auto px-4">
        <motion.h2
          variants={fadeIn}
          className="text-4xl font-bold text-center mb-12 text-gray-800"
        >
          What Our Users Say
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div key={index} variants={fadeIn}>
              <Card className="h-full transition-all duration-300 hover:shadow-lg">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                      <AvatarFallback>{testimonial.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg font-semibold">{testimonial.name}</CardTitle>
                      <CardDescription>{testimonial.role}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 italic">"{testimonial.content}"</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  )
}


const FAQSection = () => {
  const controls = useAnimation()
  const [ref, inView] = useInView()

  useEffect(() => {
    if (inView) {
      controls.start('visible')
    }
  }, [controls, inView])

  const faqs = [
    {
      question: 'Is my journal data secure and private?',
      answer: 'Absolutely. We use end-to-end encryption to ensure that only you can access your journal entries. Your privacy is our top priority.'
    },
    {
      question: 'Can I use the app offline?',
      answer: 'Yes, you can create and edit entries offline. Your changes will sync automatically when youre back online.'
    },
    {
      question: 'How does the AI-powered insight feature work?',
      answer: 'Our AI analyzes your entries to identify patterns, emotions, and topics. It then provides personalized insights and suggestions to help you gain deeper self-awareness.'
    },
    {
      question: 'Is there a limit to how much I can write?',
      answer: 'No, theres no limit to the length or number of entries you can create. Write as much as you want!'
    }
  ]

  return (
    <motion.section
      ref={ref}
      animate={controls}
      initial="hidden"
      variants={staggerChildren}
      className="py-20 bg-gray-50"
    >
      <div className="container mx-auto px-4">
        <motion.h2
          variants={fadeIn}
          className="text-4xl font-bold text-center mb-12 text-gray-800"
        >
          Frequently Asked Questions
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {faqs.map((faq, index) => (
            <motion.div key={index} variants={fadeIn}>
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold">{faq.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{faq.answer}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  )
}


const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">About Us</h3>
            <p className="text-gray-400">We're on a mission to help people lead more reflective and fulfilling lives through the power of journaling.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Home</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Features</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Pricing</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Blog</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">FAQ</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Connect With Us</h3>
            <div className="flex space-x-4">
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-700 text-center">
          <p className="text-gray-400">&copy; 2023 Your Journal App. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default function Home1() {
  
  return (
    <div className="min-h-screen bg-gray-50">
        <Header />
      <HeroSection />
      <FeatureShowcase />
      <BenefitsExplanation />
    
      <UserTestimonials />
      <FAQSection />
      <Footer />
    </div>
  )
}
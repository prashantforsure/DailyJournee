"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  Menu,
  X,
  PenLine,
  Sparkles,
  BarChart3,
  Lightbulb,
  ShieldCheck,
  Smartphone,
  MessageSquareText,
  LineChart,
  ArrowRight,
  Zap,
  Brain,
  Calendar,
  Search,
  Clock,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Star,
  Check,
  Loader2,
  Twitter,
  Instagram,
  Facebook,
} from "lucide-react"
import { Button } from "./ui/button"
import { useSession } from "next-auth/react"
import { UserAccountNav } from "./UserAccountNav"

export default function Homepage() {
  // Navigation state
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const { data: session, status } = useSession()
  // Hero section state
  const textRef = useRef<HTMLDivElement>(null)

  // How It Works section state
  const [activeStep, setActiveStep] = useState(1)
  const demoTextRef = useRef<HTMLDivElement>(null)

  // Testimonials section state
  const [testimonialIndex, setTestimonialIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null)

  // Pricing section state
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly")

  // CTA section state
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState("")

  // Scroll effect for navigation
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Typing effect for hero section
  useEffect(() => {
    if (!textRef.current) return

    const text = "Today I'm feeling..."
    let index = 0
    let currentText = ""

    const interval = setInterval(() => {
      if (index < text.length) {
        currentText += text[index]
        if (textRef.current) {
          textRef.current.textContent = currentText + "|"
        }
        index++
      } else {
        clearInterval(interval)
        if (textRef.current) {
          textRef.current.textContent = currentText
        }

        // Start blinking cursor
        let cursorVisible = true
        const cursorInterval = setInterval(() => {
          if (textRef.current) {
            if (cursorVisible) {
              textRef.current.textContent = currentText + "|"
            } else {
              textRef.current.textContent = currentText
            }
            cursorVisible = !cursorVisible
          }
        }, 500)

        return () => clearInterval(cursorInterval)
      }
    }, 100)

    return () => clearInterval(interval)
  }, [])

  // Auto-rotate through steps for How It Works section
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev < 3 ? prev + 1 : 1))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  // Typing effect for How It Works section
  useEffect(() => {
    if (activeStep !== 2 || !demoTextRef.current) return

    const originalText = "I'm feeling anxious about my presentation tomorrow..."
    const aiSuggestion = " I should prepare by reviewing my notes and practicing deep breathing exercises."
    let index = 0
    let currentText = originalText

    demoTextRef.current.textContent = originalText

    // Wait a bit before starting the AI typing
    setTimeout(() => {
      const interval = setInterval(() => {
        if (index < aiSuggestion.length) {
          currentText += aiSuggestion[index]
          if (demoTextRef.current) {
            demoTextRef.current.textContent = currentText
          }
          index++
        } else {
          clearInterval(interval)
        }
      }, 50)

      return () => clearInterval(interval)
    }, 1000)
  }, [activeStep])

  // Testimonial carousel functionality
  const nextTestimonial = useCallback(() => {
    setTestimonialIndex((prev) => (prev + 1) % testimonials.length)
  }, [])

  const prevTestimonial = () => {
    setTestimonialIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  // Auto-play functionality for testimonials
  useEffect(() => {
    if (isAutoPlaying) {
      autoPlayRef.current = setInterval(() => {
        nextTestimonial()
      }, 5000)
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current)
      }
    }
  }, [isAutoPlaying, nextTestimonial])

  // Pause auto-play on hover for testimonials
  const handleMouseEnter = () => setIsAutoPlaying(false)
  const handleMouseLeave = () => setIsAutoPlaying(true)

  // Form submission for CTA section
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email) {
      setError("Please enter your email address")
      return
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Please enter a valid email address")
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSuccess(true)
      setEmail("")

      // Reset success message after 5 seconds
      setTimeout(() => {
        setIsSuccess(false)
      }, 5000)
    }, 1500)
  }

  // Data for features section
  const features = [
    {
      icon: <Sparkles className="h-6 w-6 text-white" />,
      title: "AI-Powered Prompts",
      description:
        "Get personalized journaling prompts based on your mood, goals, and past entries to inspire deeper reflection.",
      delay: 0.1,
    },
    {
      icon: <BarChart3 className="h-6 w-6 text-white" />,
      title: "Mood & Sentiment Analysis",
      description:
        "Track your emotional patterns over time with AI that analyzes the sentiment and themes in your journal entries.",
      delay: 0.2,
    },
    {
      icon: <Lightbulb className="h-6 w-6 text-white" />,
      title: "Auto-Generation",
      description:
        "Let AI help you complete thoughts, expand on ideas, or suggest new perspectives when you're feeling stuck.",
      delay: 0.3,
    },
    {
      icon: <MessageSquareText className="h-6 w-6 text-white" />,
      title: "Insight Reports",
      description:
        "Receive weekly and monthly reports that highlight patterns, growth areas, and insights from your journaling practice.",
      delay: 0.4,
    },
    {
      icon: <ShieldCheck className="h-6 w-6 text-white" />,
      title: "Privacy & Security",
      description:
        "Your thoughts stay private with end-to-end encryption and strict data protection policies you can trust.",
      delay: 0.5,
    },
    {
      icon: <Smartphone className="h-6 w-6 text-white" />,
      title: "Cross-Platform Access",
      description: "Journal from anywhere with seamless synchronization across web, iOS, and Android applications.",
      delay: 0.6,
    },
  ]

  // Data for how it works section
  const steps = [
    {
      number: 1,
      title: "Start Journaling",
      description:
        "Begin writing about your day, thoughts, or feelings. Our AI recognizes your writing patterns and mood.",
      icon: <PenLine className="h-6 w-6" />,
    },
    {
      number: 2,
      title: "Get AI Assistance",
      description:
        "Receive suggestions, prompts, and help completing thoughts when you're stuck or want to explore deeper.",
      icon: <Sparkles className="h-6 w-6" />,
    },
    {
      number: 3,
      title: "Gain Insights",
      description:
        "Review AI-generated insights about your emotional patterns, recurring themes, and personal growth over time.",
      icon: <LineChart className="h-6 w-6" />,
    },
  ]

  // Data for benefits section
  const benefits = [
    {
      icon: <Zap className="h-6 w-6 text-blue-400" />,
      title: "Overcome Writer's Block",
      description: "AI suggestions help you keep writing even when you're not sure what to say next.",
    },
    {
      icon: <Brain className="h-6 w-6 text-purple-400" />,
      title: "Develop Self-Awareness",
      description: "Gain deeper insights into your thoughts, feelings, and behaviors through guided reflection.",
    },
    {
      icon: <Calendar className="h-6 w-6 text-blue-400" />,
      title: "Build Consistent Habits",
      description: "Smart reminders and streaks help you maintain a regular journaling practice.",
    },
    {
      icon: <Search className="h-6 w-6 text-purple-400" />,
      title: "Discover Patterns",
      description: "AI analysis reveals recurring themes and patterns in your thoughts and behaviors.",
    },
    {
      icon: <Clock className="h-6 w-6 text-blue-400" />,
      title: "Save Time",
      description: "Write more meaningful entries in less time with AI assistance and templates.",
    },
    {
      icon: <CheckCircle className="h-6 w-6 text-purple-400" />,
      title: "Track Progress",
      description: "Monitor your personal growth and mood improvements over time with visual reports.",
    },
  ]

  // Data for testimonials section
  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Creative Writer",
      content:
        "ReflectAI has completely transformed my journaling practice. The AI prompts help me dig deeper into my thoughts, and I've discovered patterns in my thinking I never noticed before. It's like having a therapist and writing coach in one app!",
      avatar: "/placeholder.svg?height=80&width=80",
      rating: 5,
    },
    {
      id: 2,
      name: "Michael Chen",
      role: "Entrepreneur",
      content:
        "As a busy entrepreneur, I struggled to maintain a consistent journaling habit. ReflectAI makes it easy with smart reminders and AI assistance that helps me process my thoughts quickly. The insights reports have been invaluable for my personal growth.",
      avatar: "/placeholder.svg?height=80&width=80",
      rating: 5,
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      role: "Therapist",
      content:
        "I recommend ReflectAI to all my clients. The AI-powered prompts encourage meaningful self-reflection, and the mood tracking features help them visualize their emotional progress over time. It's an excellent complement to therapy.",
      avatar: "/placeholder.svg?height=80&width=80",
      rating: 5,
    },
  ]

  // Data for pricing section
  const pricingPlans = [
    {
      name: "Free",
      description: "Perfect for getting started with AI journaling",
      price: {
        monthly: 0,
        yearly: 0,
      },
      features: [
        { text: "3 AI-powered journal entries per week", included: true },
        { text: "Basic sentiment analysis", included: true },
        { text: "7-day entry history", included: true },
        { text: "Standard journaling prompts", included: true },
        { text: "Web access only", included: true },
        { text: "Advanced insights", included: false },
        { text: "Custom journaling templates", included: false },
        { text: "Priority support", included: false },
      ],
      cta: "Get Started",
    },
    {
      name: "Premium",
      description: "For dedicated journalers seeking deeper insights",
      price: {
        monthly: 9.99,
        yearly: 7.99,
      },
      features: [
        { text: "Unlimited AI-powered journal entries", included: true },
        { text: "Advanced sentiment & theme analysis", included: true },
        { text: "Unlimited entry history", included: true },
        { text: "Personalized journaling prompts", included: true },
        { text: "Web, iOS & Android access", included: true },
        { text: "Weekly & monthly insights reports", included: true },
        { text: "Custom journaling templates", included: true },
        { text: "Priority support", included: false },
      ],
      cta: "Start Free Trial",
      popular: true,
    },
    {
      name: "Ultimate",
      description: "For those serious about personal growth & reflection",
      price: {
        monthly: 19.99,
        yearly: 16.99,
      },
      features: [
        { text: "Everything in Premium", included: true },
        { text: "Advanced AI writing assistance", included: true },
        { text: "In-depth psychological insights", included: true },
        { text: "Custom analytics dashboard", included: true },
        { text: "Goal tracking & progress reports", included: true },
        { text: "Export & integration options", included: true },
        { text: "1-on-1 onboarding session", included: true },
        { text: "24/7 priority support", included: true },
      ],
      cta: "Start Free Trial",
    },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      {/* Header/Navigation */}
      <header
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? "bg-black/80 backdrop-blur-md" : "bg-transparent"}`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="relative w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <PenLine className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <span className="text-xl md:text-2xl font-bold">Daily Journee</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-sm text-gray-300 hover:text-white transition-colors">
                Features
              </Link>
              <Link href="#how-it-works" className="text-sm text-gray-300 hover:text-white transition-colors">
                How It Works
              </Link>
              <Link href="#testimonials" className="text-sm text-gray-300 hover:text-white transition-colors">
                Testimonials
              </Link>
              <Link href="#pricing" className="text-sm text-gray-300 hover:text-white transition-colors">
                Pricing
              </Link>
            </nav>

            {/* Auth Buttons */}
            <div className='flex items-center gap-4'>
          {session?.user ? (
            <>
              <div className="hidden md:flex items-center gap-4">
               
               
              </div>
              
              <UserAccountNav user={{
                ...session.user,
                image: session.user.image ?? "",
                name: session.user.name ?? "",   
                email: session.user.email ?? ""  
              }} />
            </>
          ) : (
            <Link href='/auth/signin'>
              <Button 
                variant="ghost" 
                className='rounded-md px-6 py-2 text-white bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 transition-all duration-300 ease-in-out hover:shadow-[0_0_15px_rgba(236,72,153,0.5)] hover:-translate-y-0.5'
              >
                Sign In
              </Button>
            </Link>
          )}
        </div>

            {/* Mobile Menu Button */}
            <button className="md:hidden text-gray-300 hover:text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-gray-900/95 backdrop-blur-md">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link
                href="#features"
                className="block px-3 py-2 text-base font-medium text-gray-300 hover:text-white"
                onClick={() => setIsMenuOpen(false)}
              >
                Features
              </Link>
              <Link
                href="#how-it-works"
                className="block px-3 py-2 text-base font-medium text-gray-300 hover:text-white"
                onClick={() => setIsMenuOpen(false)}
              >
                How It Works
              </Link>
              <Link
                href="#testimonials"
                className="block px-3 py-2 text-base font-medium text-gray-300 hover:text-white"
                onClick={() => setIsMenuOpen(false)}
              >
                Testimonials
              </Link>
              <Link
                href="#pricing"
                className="block px-3 py-2 text-base font-medium text-gray-300 hover:text-white"
                onClick={() => setIsMenuOpen(false)}
              >
                Pricing
              </Link>
              <div className="pt-4 flex flex-col space-y-3">
                <Link
                  href="/login"
                  className="block px-3 py-2 text-base font-medium text-center text-gray-300 hover:text-white border border-gray-700 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="block px-3 py-2 text-base font-medium text-center bg-gradient-to-r from-blue-500 to-purple-600 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign up
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="flex-grow pt-16 md:pt-20">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 md:pt-32 pb-16 md:pb-24">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-black">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-900/20 to-purple-900/20" />
            <div className="absolute -top-[40%] -left-[10%] w-[70%] h-[70%] rounded-full bg-blue-600/20 blur-[120px]" />
            <div className="absolute -bottom-[30%] -right-[10%] w-[60%] h-[60%] rounded-full bg-purple-600/20 blur-[120px]" />
          </div>

          <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left column - Text content */}
              <motion.div
                className="text-center lg:text-left"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight md:leading-tight lg:leading-tight mb-6">
                  Where journaling and{" "}
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">AI</span>{" "}
                  become one
                </h1>
                <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto lg:mx-0">
                  Discover deeper insights about yourself with AI-powered journaling that helps you reflect, grow, and
                  understand your thoughts better.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-4">
                  <Link
                    href="/signup"
                    className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full text-white font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 w-full sm:w-auto text-center"
                  >
                    Start Journaling Free
                  </Link>
                  <Link
                    href="#how-it-works"
                    className="px-8 py-3 bg-white/10 rounded-full text-white font-medium hover:bg-white/20 transition-all duration-300 flex items-center justify-center w-full sm:w-auto"
                  >
                    See How It Works
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </motion.div>

              {/* Right column - Journal demo */}
              <motion.div
                className="relative"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 shadow-2xl shadow-blue-500/10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <div className="text-sm text-gray-400">Today, {new Date().toLocaleDateString()}</div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-white">My Journal</h3>

                    <div className="bg-gray-800/50 rounded-lg p-4 min-h-[200px]">
                      <div ref={textRef} className="text-gray-300">
                        |
                      </div>
                    </div>

                    <div className="bg-gray-800/30 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                        <p className="text-sm font-medium text-blue-400">AI Assistant</p>
                      </div>
                      <p className="text-gray-300 text-sm">
                        I notice you're starting a new entry. Would you like me to suggest some prompts to help you
                        reflect on your day?
                      </p>
                    </div>

                    <div className="flex space-x-2">
                      <button className="px-4 py-2 bg-blue-600/30 hover:bg-blue-600/50 rounded-md text-blue-300 text-sm transition-colors">
                        Yes, suggest prompts
                      </button>
                      <button className="px-4 py-2 bg-gray-700/30 hover:bg-gray-700/50 rounded-md text-gray-300 text-sm transition-colors">
                        No thanks
                      </button>
                    </div>
                  </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-blue-500/30 rounded-full blur-2xl"></div>
                <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl"></div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 md:py-32 relative">
          {/* Background elements */}
          <div className="absolute inset-0 bg-black">
            <div className="absolute top-1/2 left-1/4 w-[30%] h-[30%] rounded-full bg-blue-600/10 blur-[100px]" />
            <div className="absolute bottom-0 right-1/4 w-[20%] h-[20%] rounded-full bg-purple-600/10 blur-[100px]" />
          </div>

          <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="text-center max-w-3xl mx-auto mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Features for Meaningful Journaling</h2>
              <p className="text-xl text-gray-400">
                Our AI-powered tools help you journal more effectively, gain deeper insights, and build a consistent
                practice.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 hover:border-blue-500/50 transition-colors"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: feature.delay }}
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20 md:py-32 relative bg-gray-950">
          {/* Background elements */}
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[120px]" />
            <div className="absolute bottom-0 left-0 w-[30%] h-[30%] rounded-full bg-purple-600/10 blur-[120px]" />
          </div>

          <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="text-center max-w-3xl mx-auto mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">How ReflectAI Works</h2>
              <p className="text-xl text-gray-400">
                Our intuitive process makes journaling effortless and insightful, helping you build a consistent
                practice.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Steps */}
              <div className="space-y-8">
                {steps.map((step) => (
                  <motion.div
                    key={step.number}
                    className={`flex items-start space-x-4 p-6 rounded-xl transition-all duration-300 ${
                      activeStep === step.number
                        ? "bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/30"
                        : "bg-gray-900/30 border border-gray-800 hover:border-gray-700"
                    }`}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.1 * step.number }}
                  >
                    <div
                      className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                        activeStep === step.number ? "bg-gradient-to-r from-blue-500 to-purple-600" : "bg-gray-800"
                      }`}
                    >
                      {step.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2 flex items-center">
                        <span>
                          Step {step.number}: {step.title}
                        </span>
                        {activeStep === step.number && (
                          <span className="ml-2 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                        )}
                      </h3>
                      <p className="text-gray-400">{step.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Interactive Demo */}
              <motion.div
                className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 shadow-xl"
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium">Interactive Demo</h3>
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                </div>

                <div className="space-y-4">
                  {activeStep === 1 && (
                    <>
                      <div className="bg-gray-800/50 rounded-lg p-4 min-h-[150px]">
                        <p className="text-gray-300">
                          Dear Journal,
                          <br />
                          <br />
                          Today was challenging. I had a disagreement with a colleague about our project direction. I
                          felt misunderstood but tried to listen to their perspective...
                        </p>
                      </div>
                      <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <Sparkles className="h-4 w-4 text-blue-400" />
                          <p className="text-sm font-medium text-blue-400">AI Detected</p>
                        </div>
                        <p className="text-gray-300 text-sm">
                          I notice you're writing about a conflict. Would you like to explore how you could approach
                          this situation differently next time?
                        </p>
                      </div>
                    </>
                  )}

                  {activeStep === 2 && (
                    <>
                      <div className="bg-gray-800/50 rounded-lg p-4 min-h-[150px]">
                        <p className="text-gray-300" ref={demoTextRef}>
                          I'm feeling anxious about my presentation tomorrow...
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button className="px-4 py-2 bg-blue-600/30 hover:bg-blue-600/50 rounded-md text-blue-300 text-sm transition-colors flex items-center">
                          <Sparkles className="h-4 w-4 mr-2" />
                          Generate more
                        </button>
                        <button className="px-4 py-2 bg-gray-700/30 hover:bg-gray-700/50 rounded-md text-gray-300 text-sm transition-colors">
                          Rewrite
                        </button>
                      </div>
                    </>
                  )}

                  {activeStep === 3 && (
                    <>
                      <div className="bg-gray-800/50 rounded-lg p-4">
                        <h4 className="text-lg font-medium mb-3">Weekly Insights</h4>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400">Mood Trend</span>
                            <div className="flex items-center space-x-1">
                              <div className="w-6 h-2 bg-red-500/50 rounded-full"></div>
                              <div className="w-6 h-3 bg-yellow-500/50 rounded-full"></div>
                              <div className="w-6 h-4 bg-green-500/50 rounded-full"></div>
                              <div className="w-6 h-5 bg-green-500/50 rounded-full"></div>
                              <div className="w-6 h-4 bg-green-500/50 rounded-full"></div>
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-400">Common Themes</span>
                            <div className="flex flex-wrap gap-2 mt-1">
                              <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">
                                Work-Life Balance
                              </span>
                              <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs">
                                Personal Growth
                              </span>
                              <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs">
                                Relationships
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-300">
                            Your mood has improved over the week. You've been focusing on finding better work-life
                            balance and making time for personal growth.
                          </p>
                        </div>
                      </div>
                      <button className="w-full px-4 py-2 bg-blue-600/30 hover:bg-blue-600/50 rounded-md text-blue-300 text-sm transition-colors flex items-center justify-center">
                        View Full Report
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 md:py-32 relative">
          {/* Background elements */}
          <div className="absolute inset-0 bg-black">
            <div className="absolute bottom-0 left-1/4 w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[120px]" />
          </div>

          <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left column - Image */}
              <motion.div
                className="relative order-2 lg:order-1"
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <div className="relative bg-gradient-to-br from-blue-500/5 to-purple-600/5 rounded-2xl p-1">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-2xl blur-xl"></div>
                  <div className="relative bg-gray-900 rounded-2xl overflow-hidden">
                    <img
                      src="/placeholder.svg?height=600&width=600"
                      alt="ReflectAI Benefits"
                      className="w-full h-auto"
                    />
                  </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute -top-6 -left-6 w-24 h-24 bg-blue-500/20 rounded-full blur-xl"></div>
                <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-purple-500/20 rounded-full blur-xl"></div>
              </motion.div>

              {/* Right column - Benefits list */}
              <div className="order-1 lg:order-2">
                <motion.div
                  className="mb-10"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                >
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">Transform Your Journaling Experience</h2>
                  <p className="text-xl text-gray-400">
                    ReflectAI helps you get more value from your journaling practice with these powerful benefits.
                  </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {benefits.map((benefit, index) => (
                    <motion.div
                      key={index}
                      className="flex items-start space-x-4"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.1 * index }}
                    >
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-lg flex items-center justify-center border border-blue-500/30">
                        {benefit.icon}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                        <p className="text-gray-400">{benefit.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-20 md:py-32 relative bg-gray-950">
          {/* Background elements */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[120px]" />
            <div className="absolute bottom-0 right-0 w-[30%] h-[30%] rounded-full bg-purple-600/10 blur-[120px]" />
          </div>

          <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="text-center max-w-3xl mx-auto mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Users Say</h2>
              <p className="text-xl text-gray-400">
                Thousands of people are using ReflectAI to deepen their self-awareness and improve their lives.
              </p>
            </motion.div>

            <div className="relative max-w-4xl mx-auto" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
              <div className="overflow-hidden">
                <div
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${testimonialIndex * 100}%)` }}
                >
                  {testimonials.map((testimonial) => (
                    <div key={testimonial.id} className="w-full flex-shrink-0 px-4">
                      <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 backdrop-blur-sm border border-gray-800 rounded-2xl p-8 md:p-10">
                        <div className="flex flex-col md:flex-row md:items-center mb-6">
                          <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
                            <img
                              src={testimonial.avatar || "/placeholder.svg"}
                              alt={testimonial.name}
                              className="w-16 h-16 rounded-full border-2 border-blue-500/30"
                            />
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold">{testimonial.name}</h3>
                            <p className="text-gray-400">{testimonial.role}</p>
                            <div className="flex mt-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${i < testimonial.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-600"}`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <blockquote className="text-lg md:text-xl text-gray-300 italic">
                          "{testimonial.content}"
                        </blockquote>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation buttons */}
              <button
                className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 md:-translate-x-6 w-10 h-10 bg-gray-800/80 hover:bg-gray-700 rounded-full flex items-center justify-center text-white transition-colors"
                onClick={prevTestimonial}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2 md:translate-x-6 w-10 h-10 bg-gray-800/80 hover:bg-gray-700 rounded-full flex items-center justify-center text-white transition-colors"
                onClick={nextTestimonial}
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Indicators */}
              <div className="flex justify-center space-x-2 mt-6">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    className={`w-2.5 h-2.5 rounded-full transition-colors ${
                      index === testimonialIndex ? "bg-blue-500" : "bg-gray-700 hover:bg-gray-600"
                    }`}
                    onClick={() => setTestimonialIndex(index)}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 md:py-32 relative">
          {/* Background elements */}
          <div className="absolute inset-0 bg-black">
            <div className="absolute top-1/3 right-1/4 w-[30%] h-[30%] rounded-full bg-blue-600/10 blur-[100px]" />
            <div className="absolute bottom-1/3 left-1/4 w-[20%] h-[20%] rounded-full bg-purple-600/10 blur-[100px]" />
          </div>

          <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="text-center max-w-3xl mx-auto mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
              <p className="text-xl text-gray-400 mb-8">
                Choose the plan that fits your journaling needs. All plans include a 14-day free trial.
              </p>

              {/* Billing toggle */}
              <div className="flex items-center justify-center space-x-4">
                <span className={`text-sm font-medium ${billingCycle === "monthly" ? "text-white" : "text-gray-400"}`}>
                  Monthly
                </span>
                <button
                  className="relative w-14 h-7 bg-gray-700 rounded-full p-1 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onClick={() => setBillingCycle((prev) => (prev === "monthly" ? "yearly" : "monthly"))}
                >
                  <span
                    className={`absolute top-1 left-1 bg-white w-5 h-5 rounded-full transition-transform ${
                      billingCycle === "yearly" ? "translate-x-7" : ""
                    }`}
                  />
                </button>
                <span className={`text-sm font-medium ${billingCycle === "yearly" ? "text-white" : "text-gray-400"}`}>
                  Yearly
                  <span className="ml-1.5 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gradient-to-r from-blue-500 to-purple-600">
                    Save 20%
                  </span>
                </span>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {pricingPlans.map((plan, index) => (
                <motion.div
                  key={plan.name}
                  className={`relative rounded-2xl overflow-hidden ${
                    plan.popular ? "border-2 border-blue-500 shadow-lg shadow-blue-500/10" : "border border-gray-800"
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                >
                  {plan.popular && (
                    <div className="absolute top-0 right-0 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                      Most Popular
                    </div>
                  )}

                  <div className="bg-gray-900/50 backdrop-blur-sm p-8">
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    <p className="text-gray-400 mb-6">{plan.description}</p>

                    <div className="mb-6">
                      <span className="text-4xl font-bold">
                        ${billingCycle === "monthly" ? plan.price.monthly : plan.price.yearly}
                      </span>
                      {plan.price.monthly > 0 && (
                        <span className="text-gray-400 ml-2">
                          / {billingCycle === "monthly" ? "month" : "month, billed yearly"}
                        </span>
                      )}
                    </div>

                    <button
                      className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                        plan.popular
                          ? "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                          : "bg-white/10 hover:bg-white/20 text-white"
                      }`}
                    >
                      {plan.cta}
                    </button>
                  </div>

                  <div className="bg-gray-900/30 p-8">
                    <h4 className="font-medium mb-4">What's included:</h4>
                    <ul className="space-y-3">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start">
                          {feature.included ? (
                            <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                          ) : (
                            <X className="h-5 w-5 text-gray-500 mr-3 flex-shrink-0" />
                          )}
                          <span className={feature.included ? "text-gray-300" : "text-gray-500"}>{feature.text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <p className="text-gray-400">
                All plans come with a 14-day free trial. No credit card required to start.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 md:py-32 relative">
          {/* Background elements */}
          <div className="absolute inset-0 bg-gradient-to-b from-black to-gray-950">
            <div className="absolute bottom-0 left-0 w-full h-[50%] rounded-full bg-blue-600/10 blur-[120px]" />
          </div>

          <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="max-w-3xl mx-auto text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">Start Your Journaling Journey Today</h2>
              <p className="text-xl text-gray-300 mb-8">
                Join thousands of people who are discovering themselves through AI-powered journaling.
              </p>

              <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 backdrop-blur-sm border border-blue-500/20 rounded-2xl p-8 md:p-10 max-w-2xl mx-auto">
                <h3 className="text-2xl font-bold mb-2">Get Started for Free</h3>
                <p className="text-gray-300 mb-6">
                  Sign up now and get 14 days of Premium features, no credit card required.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <div className="relative">
                      <input
                        type="email"
                        placeholder="Enter your email address"
                        className={`w-full px-4 py-3 bg-gray-800/80 border ${
                          error ? "border-red-500" : "border-gray-700"
                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white`}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isSubmitting || isSuccess}
                      />
                    </div>
                    {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-lg font-medium text-white flex items-center justify-center transition-colors"
                    disabled={isSubmitting || isSuccess}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="animate-spin mr-2 h-5 w-5" />
                        Processing...
                      </>
                    ) : isSuccess ? (
                      <>Success! Check your inbox</>
                    ) : (
                      <>
                        Start Your Free Trial
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </button>
                </form>

                <p className="mt-4 text-sm text-gray-400">
                  By signing up, you agree to our Terms of Service and Privacy Policy.
                </p>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
            {/* Brand Column */}
            <div className="space-y-4">
              <Link href="/" className="flex items-center space-x-2">
                <div className="relative w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <PenLine className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">Daily Journee</span>
              </Link>
              <p className="text-gray-400 text-sm">
                AI-powered journaling to help you reflect, grow, and understand yourself better.
              </p>
              <div className="flex space-x-4 pt-2">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Twitter className="h-5 w-5" />
                  <span className="sr-only">Twitter</span>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Instagram className="h-5 w-5" />
                  <span className="sr-only">Instagram</span>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Facebook className="h-5 w-5" />
                  <span className="sr-only">Facebook</span>
                </a>
              </div>
            </div>

            {/* Links Column 1 */}
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Product</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#features" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#how-it-works" className="text-gray-400 hover:text-white transition-colors text-sm">
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link href="#pricing" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>

            {/* Links Column 2 */}
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Company</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Newsletter Column */}
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Stay Updated</h3>
              <p className="text-gray-400 text-sm mb-4">
                Subscribe to our newsletter for tips, updates, and journaling prompts.
              </p>
              <form className="flex">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="bg-gray-800 text-white px-4 py-2 rounded-l-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  required
                />
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-r-md transition-colors"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">&copy; {new Date().getFullYear()} ReflectAI. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                Privacy Policy
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                Terms of Service
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}


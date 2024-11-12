'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useSession } from 'next-auth/react'
import { 
  ChevronRight, 
  Feather, 
  Brain, 
  Calendar, 
  Image as ImageIcon, 
  Tag, 
  Cloud, 
  Zap,
  Heart,
  Clock,
  Lock,
  TrendingUp,
  ChevronUp,
  Github,
  Twitter,
  Linkedin
} from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import Link from 'next/link'

//@ts-expect-error there is some type error
const FeatureCard = ({ icon, title, description }) => (
  <Card className="bg-[#24272c] shadow-md hover:shadow-lg transition-shadow duration-300 border-[#3a3f4b]">
    <CardHeader>
      <div className="w-12 h-12 bg-[#3a3f4b] rounded-full flex items-center justify-center mb-4">
        {icon}
      </div>
      <CardTitle className="text-xl font-semibold text-[#e0e0e0]">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <CardDescription className="text-[#9a9897]">{description}</CardDescription>
    </CardContent>
  </Card>
)
//@ts-expect-error there is some type error
const BenefitItem = ({ icon, title, description }) => (
  <div className="flex items-start space-x-4">
    <div className="w-10 h-10 bg-[#3a3f4b] rounded-full flex items-center justify-center flex-shrink-0">
      {icon}
    </div>
    <div>
      <h3 className="text-lg font-semibold text-[#e0e0e0] mb-2">{title}</h3>
      <p className="text-[#9a9897]">{description}</p>
    </div>
  </div>
)
//@ts-expect-error there is some type error
const TestimonialCard = ({ name, image, quote }) => (
  <Card className="bg-[#24272c] shadow-md hover:shadow-lg transition-shadow duration-300 border-[#3a3f4b]">
    <CardHeader>
      <div className="flex items-center space-x-4">
        <Image
          src={image}
          alt={name}
          width={50}
          height={50}
          className="rounded-full"
        />
        <CardTitle className="text-lg font-semibold text-[#e0e0e0]">{name}</CardTitle>
      </div>
    </CardHeader>
    <CardContent>
      <CardDescription className="text-[#9a9897] italic">&ldquo;{quote}&rdquo;</CardDescription>
    </CardContent>
  </Card>
)

export default function LandingPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard')
    }
  }, [status, router])

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener('scroll', toggleVisibility)

    return () => window.removeEventListener('scroll', toggleVisibility)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  if (status === 'loading') {
    return <div className="flex justify-center items-center h-screen bg-[#1a1d21]">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-[#8dc572]"></div>
    </div>
  }

  if (status === 'authenticated') {
    return null 
  }

  return (
    <div className="bg-[#1a1d21] min-h-screen text-[#e0e0e0] font-sans">
     
      <header className="bg-[#24272c] shadow-sm sticky top-0 z-50">
        <nav className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Feather className="h-8 w-8 text-[#8dc572]" />
              <span className="ml-2 text-2xl font-bold text-[#e0e0e0]" style={{ fontFamily: '__DM_Sans_0dfae3, __DM_Sans_Fallback_0dfae3, sans-serif' }}>JournalApp</span>
            </div>
            <div className="hidden md:flex items-center space-x-6">
             
              <Link href='/auth/signin'><Button className="bg-[#8dc572] text-[#1a1d21] hover:bg-[#7ab562] transition-colors duration-300">
                Sign In
              </Button></Link>
            </div>
            <div className="md:hidden">
            
            </div>
          </div>
        </nav>
      </header>


      <section className="py-20 bg-gradient-to-r from-[#24272c] to-[#1a1d21]">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold text-[#e0e0e0] mb-6">
                Capture Your Thoughts, Unleash Your Potential
              </h1>
              <p className="text-xl text-[#9a9897] mb-8">
                Experience the power of AI-enhanced journaling. Reflect, grow, and discover insights about yourself like never before.
              </p>
              <Button className="bg-[#8dc572] text-[#1a1d21] hover:bg-[#7ab562] transition-colors duration-300 text-lg px-8 py-3">
                Start Your Journey <ChevronRight className="ml-2" />
              </Button>
            </div>
            <div className="md:w-1/2">
              <Image
                src="/placeholder.svg?height=400&width=600"
                alt="Journaling App Interface"
                width={600}
                height={400}
                className="rounded-lg shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

   
      <section id="features" className="py-20 bg-[#1a1d21]">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-[#e0e0e0] mb-12">
            Powerful Features to Enhance Your Journaling Experience
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Zap className="h-6 w-6 text-[#8dc572]" />}
              title="Quick Entry Mode"
              description="Capture your thoughts instantly with our streamlined quick entry feature."
            />
            <FeatureCard
              icon={<Brain className="h-6 w-6 text-[#8dc572]" />}
              title="AI-Powered Insights"
              description="Gain deeper understanding of your entries with AI-generated reflections and suggestions."
            />
            <FeatureCard
              icon={<Calendar className="h-6 w-6 text-[#8dc572]" />}
              title="Personalized Reminders"
              description="Stay consistent with customizable reminders and streak tracking."
            />
            <FeatureCard
              icon={<ImageIcon className="h-6 w-6 text-[#8dc572]" />}
              title="Multimedia Support"
              description="Enrich your entries with photos, audio recordings, and video clips."
            />
            <FeatureCard
              icon={<Tag className="h-6 w-6 text-[#8dc572]" />}
              title="Advanced Organization"
              description="Keep your thoughts organized with tags, filters, and collections."
            />
            <FeatureCard
              icon={<Cloud className="h-6 w-6 text-[#8dc572]" />}
              title="Cross-Device Sync"
              description="Access your journal from any device with seamless cloud synchronization."
            />
          </div>
        </div>
      </section>

      <section id="benefits" className="bg-[#24272c] py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-[#e0e0e0] mb-12">
            Transform Your Life Through Journaling
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <BenefitItem
              icon={<TrendingUp className="h-6 w-6 text-[#8dc572]" />}
              title="Enhance Personal Growth"
              description="Regular journaling helps you track your progress, set goals, and reflect on your experiences, fostering continuous self-improvement."
            />
            <BenefitItem
              icon={<Heart className="h-6 w-6 text-[#8dc572]" />}
              title="Boost Mental Well-being"
              description="Writing down your thoughts and feelings can reduce stress, increase self-awareness, and improve your overall emotional health."
            />
            <BenefitItem
              icon={<Clock className="h-6 w-6 text-[#8dc572]" />}
              title="Simplify Your Routine"
              description="Our intuitive interface and quick entry mode make it easy to incorporate journaling into your daily life, no matter how busy you are."
            />
            <BenefitItem
              icon={<Lock className="h-6 w-6 text-[#8dc572]" />}
              title="Secure Self-Expression"
              description="Express yourself freely in a private, encrypted space that ensures your thoughts remain confidential and protected."
            />
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-[#1a1d21] to-[#24272c]">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-[#e0e0e0] mb-12">
            Experience JournalApp in Action
          </h2>
          <Tabs defaultValue="write" className="w-full max-w-3xl mx-auto">
            <TabsList className="grid w-full grid-cols-3 bg-[#3a3f4b]">
              <TabsTrigger value="write" className="text-[#9a9897] data-[state=active]:text-[#8dc572] data-[state=active]:bg-[#24272c]">Write</TabsTrigger>
              <TabsTrigger value="reflect" className="text-[#9a9897] data-[state=active]:text-[#8dc572] data-[state=active]:bg-[#24272c]">Reflect</TabsTrigger>
              <TabsTrigger value="discover" className="text-[#9a9897] data-[state=active]:text-[#8dc572] data-[state=active]:bg-[#24272c]">Discover</TabsTrigger>
            </TabsList>
            <TabsContent value="write" className="mt-6">
              <Card className="bg-[#24272c] border-[#3a3f4b]">
                <CardHeader>
                  <CardTitle className="text-[#e0e0e0]">Quick Entry Mode</CardTitle>
                  <CardDescription className="text-[#9a9897]">Capture your thoughts effortlessly</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-[#1a1d21] p-4 rounded-lg shadow-inner">
                    <p className="text-[#9a9897] mb-2">Today I feel...</p>
                    <div className="flex space-x-2 mb-4">
                      {['😊', '😐', '😢', '😡', '😴'].map((emoji) => (
                        <button key={emoji} className="text-2xl hover:scale-110 transition-transform duration-200">
                          {emoji}
                        </button>
                      ))}
                    </div>
                    <Textarea
                      className="w-full h-32 p-2 bg-[#24272c] border border-[#3a3f4b] rounded-md focus:outline-none focus:ring-2 focus:ring-[#8dc572] text-[#e0e0e0]"
                      placeholder="Start typing your entry..."
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" className="border-[#3a3f4b] text-[#9a9897] hover:bg-[#3a3f4b] hover:text-[#e0e0e0]">Save Draft</Button>
                  <Button className="bg-[#8dc572] text-[#1a1d21] hover:bg-[#7ab562]">Publish Entry</Button>
                </CardFooter>
              </Card>
            </TabsContent>
            <TabsContent value="reflect" className="mt-6">
              <Card className="bg-[#24272c] border-[#3a3f4b]">
                <CardHeader>
                  <CardTitle className="text-[#e0e0e0]">AI-Powered Reflection</CardTitle>
                  <CardDescription className="text-[#9a9897]">Gain insights from your entries</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-[#1a1d21] p-4 rounded-lg shadow-inner">
                    <p className="text-[#9a9897] mb-4">Based on your recent entries, here are some insights:</p>
                    <ul className="list-disc list-inside space-y-2 text-[#e0e0e0]">
                      <li>You've been feeling more energetic in the mornings</li>
                      <li>Your productivity peaks on Wednesdays</li>
                      <li>You mention 'family' frequently, indicating its importance in your life</li>
                      <li>Consider incorporating more outdoor activities to boost your mood</li>
                    </ul>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="bg-[#8dc572] text-[#1a1d21] hover:bg-[#7ab562] w-full">
                    Generate More Insights
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            <TabsContent value="discover" className="mt-6">
              <Card className="bg-[#24272c] border-[#3a3f4b]">
                <CardHeader>
                  <CardTitle className="text-[#e0e0e0]">Discover Patterns</CardTitle>
                  <CardDescription className="text-[#9a9897]">Visualize your journaling habits</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-[#1a1d21] p-4 rounded-lg shadow-inner">
                    <Image
                      src="/placeholder.svg?height=200&width=400"
                      alt="Mood Tracker Visualization"
                      width={400}
                      height={200}
                      className="w-full h-auto mb-4"
                    />
                    <p className="text-[#9a9897]">Your mood trend over the past month</p>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" className="border-[#3a3f4b] text-[#9a9897] hover:bg-[#3a3f4b] hover:text-[#e0e0e0]">View Details</Button>
                  <Button className="bg-[#8dc572] text-[#1a1d21] hover:bg-[#7ab562]">Export Data</Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <section id="testimonials" className="py-20 bg-[#1a1d21]">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-[#e0e0e0] mb-12">
            What Our Users Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <TestimonialCard
              name="Sarah Johnson"
              image="/placeholder.svg?height=50&width=50"
              quote="JournalApp has transformed my daily routine. The AI insights have helped me understand myself better than ever before."
            />
            <TestimonialCard
              name="Michael Chen"
              image="/placeholder.svg?height=50&width=50"
              quote="As a busy professional, the quick entry mode is a game-changer. I can jot down my thoughts in seconds, keeping me consistent."
            />
            <TestimonialCard
              name="Emily Rodriguez"
              image="/placeholder.svg?height=50&width=50"
              quote="The multimedia support allows me to create rich, vibrant entries that truly capture the essence of my experiences."
            />
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-[#24272c] to-[#1a1d21] py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[#e0e0e0] mb-8">
            Ready to Start Your Journaling Journey?
          </h2>
          <p className="text-xl text-[#9a9897] mb-10">
            Join thousands of users who have transformed their lives through the power of AI-enhanced journaling.
          </p>
          <Button className="bg-[#8dc572] text-[#1a1d21] hover:bg-[#7ab562] transition-colors duration-300 text-lg px-8 py-3">
            Get Started for Free <ChevronRight className="ml-2" />
          </Button>
        </div>
      </section>

      <footer className="bg-[#24272c] text-[#e0e0e0] py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">JournalApp</h3>
              <p className="text-[#9a9897]">Empowering self-reflection and personal growth through AI-enhanced journaling.</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="#features" className="text-[#9a9897] hover:text-[#e0e0e0] transition-colors duration-300">Features</a></li>
                <li><a href="#benefits" className="text-[#9a9897] hover:text-[#e0e0e0] transition-colors duration-300">Benefits</a></li>
                <li><a href="#testimonials" className="text-[#9a9897] hover:text-[#e0e0e0] transition-colors duration-300">Testimonials</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Support</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-[#9a9897] hover:text-[#e0e0e0] transition-colors duration-300">FAQs</a></li>
                <li><a href="#" className="text-[#9a9897] hover:text-[#e0e0e0] transition-colors duration-300">Contact Us</a></li>
                <li><a href="#" className="text-[#9a9897] hover:text-[#e0e0e0] transition-colors duration-300">Privacy Policy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Connect With Us</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-[#9a9897] hover:text-[#e0e0e0] transition-colors duration-300">
                  <Github className="h-6 w-6" />
                </a>
                <a href="#" className="text-[#9a9897] hover:text-[#e0e0e0] transition-colors duration-300">
                  <Twitter className="h-6 w-6" />
                </a>
                <a href="#" className="text-[#9a9897] hover:text-[#e0e0e0] transition-colors duration-300">
                  <Linkedin className="h-6 w-6" />
                </a>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-[#3a3f4b] text-center">
            <p className="text-[#9a9897]">&copy; 2024 JournalApp. All rights reserved.</p>
          </div>
        </div>
      </footer>

  
      {isVisible && (
        <Button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 bg-[#8dc572] text-[#1a1d21] p-3 rounded-full shadow-lg hover:bg-[#7ab562] transition-colors duration-300"
          aria-label="Back to top"
        >
          <ChevronUp className="h-6 w-6" />
        </Button>
      )}
    </div>
  )
}
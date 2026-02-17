'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Share2, Users, TrendingUp, ArrowRight, Copy, MessageCircle, Send, Youtube } from 'lucide-react'
import { toast } from 'sonner'

interface PreLoginFlowProps {
  onProceedToLogin: (tempReferralCode?: string) => void
}

export default function PreLoginFlow({ onProceedToLogin }: PreLoginFlowProps) {
  const [currentScreen, setCurrentScreen] = useState(0)
  const [tempReferralCode, setTempReferralCode] = useState('')
  const [loading, setLoading] = useState(false)

  // Generate temp referral code on mount
  useEffect(() => {
    const generateCode = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
      let code = 'TEMP-REF-'
      for (let i = 0; i < 4; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      setTempReferralCode(code)
    }
    generateCode()
  }, [])

  const screens = [
    // Screen 1: PROBLEM & OPPORTUNITY
    {
      title: "Nearby logon ko roz madad chahiye.",
      subtitle: "Aur madad ke badle log paisa dete hain.",
      content: "Help2Earn isi system ko easy banata hai.",
      buttonText: "Aage dekho",
      icon: "🤝"
    },
    // Screen 2: EARNING LOGIC
    {
      title: "Madad dene par paisa milta hai.",
      subtitle: "Madad lene par nearby log milte hain.",
      content: "Sab kuch phone pe direct hota hai.",
      buttonText: "Kaise kaam karta hai?",
      icon: "💰"
    },
    // Screen 3: SOCIAL PROOF
    {
      title: "Log apne area me madad karke kama rahe hain.",
      subtitle: "Ye koi job nahi, opportunity hai.",
      content: "Join karo aur apne area me help karke earn karo!",
      buttonText: "Doston ko batao",
      icon: "🌟"
    }
  ]

  const handleNext = () => {
    if (currentScreen < screens.length - 1) {
      setCurrentScreen(currentScreen + 1)
    } else {
      // Move to share screen
      setCurrentScreen(screens.length)
    }
  }

  const handleShare = async (platform: string) => {
    setLoading(true)
    const shareText = `Help2Earn ek app hai jahan madad karke kamaai hoti hai. Is code se join karo: ${tempReferralCode}`

    try {
      switch (platform) {
        case 'whatsapp':
          window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank')
          break
        case 'telegram':
          window.open(`https://t.me/share/url?url=${encodeURIComponent('https://help2earn.com')}&text=${encodeURIComponent(shareText)}`, '_blank')
          break
        case 'copy':
          await navigator.clipboard.writeText(shareText)
          toast.success('Link copied to clipboard!')
          break
        case 'youtube':
          // For YouTube, just copy the text
          await navigator.clipboard.writeText(shareText)
          toast.success('Text copied! Paste in YouTube description')
          break
      }
    } catch (error) {
      toast.error('Sharing failed!')
    } finally {
      setLoading(false)
    }
  }

  const handleProceedToLogin = () => {
    onProceedToLogin(tempReferralCode)
  }

  // Share Screen
  if (currentScreen === screens.length) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
        {/* Header */}
        <header className="p-4 border-b bg-white/80 backdrop-blur-lg sticky top-0 z-50 shadow-sm">
          <div className="max-w-lg mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center shadow-lg overflow-hidden">
                <Image src="/logo.png" alt="Help2Earn" width={48} height={48} className="object-contain" />
              </div>
              <div>
                <h1 className="text-xl font-bold gradient-text">Help2Earn</h1>
                <p className="text-xs text-gray-500">Madad karo, Kamaao! 💵</p>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-md shadow-2xl overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400" />
            <CardHeader className="text-center pt-6">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mx-auto mb-4 shadow-xl">
                <Share2 className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-2xl">Login se pehle apne area ke logon ko batao.</CardTitle>
              <CardDescription className="text-base">
                Jitne zyada log judenge, utni zyada earning hogi.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pb-6">
              {/* Referral Code */}
              <div className="p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border-2 border-amber-200">
                <p className="text-sm text-amber-700 text-center font-mono font-bold text-lg">
                  {tempReferralCode}
                </p>
                <p className="text-xs text-amber-600 text-center mt-1">
                  Ye code login ke baad permanent ho jaayega
                </p>
              </div>

              {/* Share Buttons */}
              <div className="space-y-3">
                <Button
                  className="w-full h-12 bg-green-500 hover:bg-green-600 text-white font-semibold"
                  onClick={() => handleShare('whatsapp')}
                  disabled={loading}
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  WhatsApp Share
                </Button>

                <Button
                  className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white font-semibold"
                  onClick={() => handleShare('telegram')}
                  disabled={loading}
                >
                  <Send className="w-5 h-5 mr-2" />
                  Telegram Share
                </Button>

                <Button
                  variant="outline"
                  className="w-full h-12 border-red-200 text-red-600 hover:bg-red-50"
                  onClick={() => handleShare('youtube')}
                  disabled={loading}
                >
                  <Youtube className="w-5 h-5 mr-2" />
                  YouTube Description
                </Button>

                <Button
                  variant="outline"
                  className="w-full h-12"
                  onClick={() => handleShare('copy')}
                  disabled={loading}
                >
                  <Copy className="w-5 h-5 mr-2" />
                  Copy Link
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 text-center">
                  <Users className="w-6 h-6 mx-auto mb-1 text-emerald-600" />
                  <p className="text-sm font-bold text-emerald-600">10+ Referrals</p>
                  <p className="text-xs text-gray-500">= Free Access</p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-teal-50 to-teal-100 border border-teal-200 text-center">
                  <TrendingUp className="w-6 h-6 mx-auto mb-1 text-teal-600" />
                  <p className="text-sm font-bold text-teal-600">Higher Visibility</p>
                  <p className="text-xs text-gray-500">In Area</p>
                </div>
              </div>
            </CardContent>

            <div className="p-6 pt-0">
              <Button
                className="w-full h-12 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 shadow-lg text-lg font-semibold"
                onClick={handleProceedToLogin}
              >
                <ArrowRight className="w-5 h-5 mr-2" />
                Proceed to Login
              </Button>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  // Main Screens
  const screen = screens[currentScreen]
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-emerald-200/30 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute bottom-40 right-10 w-40 h-40 bg-teal-200/30 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-cyan-200/30 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '2s' }} />
      </div>

      {/* Header */}
      <header className="p-4 border-b bg-white/80 backdrop-blur-lg sticky top-0 z-50 shadow-sm">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center shadow-lg overflow-hidden">
              <Image src="/logo.png" alt="Help2Earn" width={48} height={48} className="object-contain" />
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">Help2Earn</h1>
              <p className="text-xs text-gray-500">Madad karo, Kamaao! 💵</p>
            </div>
          </div>
          <Badge className="bg-emerald-500 text-white">
            {currentScreen + 1}/{screens.length}
          </Badge>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400" />
          <CardHeader className="text-center pt-8">
            <div className="text-6xl mb-4">{screen.icon}</div>
            <CardTitle className="text-2xl font-bold">{screen.title}</CardTitle>
            <CardDescription className="text-lg font-medium text-gray-600 mt-2">
              {screen.subtitle}
            </CardDescription>
            <p className="text-base text-gray-500 mt-4">{screen.content}</p>
          </CardHeader>
          <CardContent className="pb-8">
            <Button
              className="w-full h-12 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 shadow-lg text-lg font-semibold"
              onClick={handleNext}
            >
              {screen.buttonText}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="p-4 text-center border-t bg-white/80 backdrop-blur">
        <p className="font-semibold gradient-text">Madad bhi, roz ki kamaai bhi! 🎯</p>
        <p className="text-xs text-gray-400 mt-1">© 2024 Help2Earn | Made with ❤️ in India</p>
      </footer>
    </div>
  )
}

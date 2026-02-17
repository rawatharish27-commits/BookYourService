'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Phone, Wallet } from 'lucide-react'

interface LoginScreenProps {
  onOtpSent: (phone: string, otp: string) => void
  onVerifyOtp: (phone: string, code: string, name: string) => void
  loading: boolean
}

export default function LoginScreen({ onOtpSent, onVerifyOtp, loading }: LoginScreenProps) {
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [name, setName] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [receivedOtp, setReceivedOtp] = useState('')

  const handleSendOtp = async () => {
    if (!phone || phone.length !== 10) {
      alert('Sahi 10-digit mobile number daalen!')
      return
    }
    if (!termsAccepted) {
      alert('Terms & Conditions accept karein')
      return
    }

    // Call the actual API to send OTP
    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone }),
      })

      if (response.ok) {
        setOtpSent(true)
        alert('OTP sent successfully!')
        onOtpSent(phone, '')
      } else {
        alert('Failed to send OTP. Please try again.')
      }
    } catch (error) {
      console.error('Error sending OTP:', error)
      alert('Network error. Please check your connection and try again.')
    }
  }

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      alert('6-digit OTP daalen')
      return
    }
    onVerifyOtp(phone, otp, name)
  }

  const HERO_TEXT = {
    main: "Madad karo, Kamaao! 💵",
    sub: "Jab logon ko zarurat hoti hai, nearby madad milti hai.",
    highlight: "Help2Earn pe customer khud aapse phone pe baat karega — seedha contact!",
    pricing: "Aap apni madad ka daam khud tay karte ho 💪",
    tagline: "Madad bhi, roz ki kamaai bhi! 🎯"
  }

  const ATTRACT_QUOTES = [
    "💰 Madad karke roz ₹1,000 – ₹2,000 tak kamaane ka mauka!",
    "⏰ Kya aapke paas thoda time hai? Nearby logon ki madad karo aur kamaao!",
    "🏠 Ghar par bekaar pada samaan se lekar free time dene tak — sab kaam aa sakta hai!",
    "💍 Shaadi ho, emergency ho ya daily ka kaam — log madad dhundhte hain!",
    "📍 Apne 20 KM area me customer khud aapse phone pe baat karega!",
    "✨ Madad bhi, imaandaari se kamaai bhi — sirf ₹49/mahina!",
    "🚀 Aaj hi join karo aur apni community me help karke earn karo!"
  ]

  const FEATURES = [
    {
      icon: "🚨",
      title: "Emergency Help",
      titleHi: "Emergency Madad",
      desc: "Puncture, Battery Dead, Phone Charging — Quick help jab sabse zyada zaroori ho!"
    },
    {
      icon: "⏰",
      title: "Time & Access",
      titleHi: "Time Do, Kamaao",
      desc: "Queue me lagna, errands, local guidance — Apna time dho, paisa kamao!"
    },
    {
      icon: "📦",
      title: "Resource Rent",
      titleHi: "Samaan Rent Karo",
      desc: "Bike, Tools, Electronics — Ghar pada samaan se income banao!"
    }
  ]

  if (!otpSent) {
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
          </div>
        </header>

        {/* Hero Section */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 relative">
          <div className="w-full max-w-md space-y-5">
            {/* Hero Card */}
            <Card className="border-emerald-200 bg-white/90 backdrop-blur-xl shadow-2xl overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400" />
              <CardHeader className="text-center pb-2 pt-6">
                <div className="w-24 h-24 mx-auto mb-4 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-3xl rotate-6 opacity-20" />
                  <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center shadow-xl">
                    <Wallet className="w-12 h-12 text-white" />
                  </div>
                </div>
                <CardTitle className="text-3xl font-bold gradient-text">
                  {HERO_TEXT.main}
                </CardTitle>
                <CardDescription className="text-base font-medium text-gray-600 mt-2">
                  {HERO_TEXT.sub}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Rotating Quote */}
                <div className="p-4 bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 rounded-xl border border-amber-100 min-h-[70px] flex items-center justify-center shadow-inner">
                  <p className="text-sm text-amber-700 text-center font-medium transition-opacity duration-500">
                    {ATTRACT_QUOTES[0]} {/* Static for now */}
                  </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 text-center">
                    <p className="text-2xl font-bold text-emerald-600">₹1K+</p>
                    <p className="text-xs text-gray-500">Daily Earn</p>
                  </div>
                  <div className="p-3 rounded-xl bg-gradient-to-br from-teal-50 to-teal-100 border border-teal-200 text-center">
                    <p className="text-2xl font-bold text-teal-600">20 KM</p>
                    <p className="text-xs text-gray-500">Area</p>
                  </div>
                  <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-50 to-cyan-100 border border-cyan-200 text-center">
                    <p className="text-2xl font-bold text-cyan-600">₹49</p>
                    <p className="text-xs text-gray-500">/Month</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {/* Phone Input */}
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium">📱 Mobile Number</Label>
                    <div className="flex">
                      <span className="flex items-center px-4 border border-r-0 rounded-l-xl bg-gradient-to-b from-gray-50 to-gray-100 text-gray-600 text-sm font-medium">
                        +91
                      </span>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="10-digit number daalen"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        className="rounded-l-none h-12 text-lg"
                        maxLength={10}
                      />
                    </div>
                  </div>

                  {/* Name Input */}
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">👤 Name (Optional)</Label>
                    <Input
                      id="name"
                      placeholder="Apna naam"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="h-12"
                    />
                  </div>

                  {/* Terms */}
                  <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-xl">
                    <Checkbox
                      id="terms"
                      checked={termsAccepted}
                      onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                    />
                    <label htmlFor="terms" className="text-sm cursor-pointer text-gray-600 leading-tight">
                      Main <span className="font-medium">Terms &amp; Privacy Policy</span> accept karta/karti hoon
                    </label>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pb-6">
                <Button
                  className="w-full h-12 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 shadow-lg text-lg font-semibold"
                  onClick={handleSendOtp}
                  disabled={loading || phone.length !== 10 || !termsAccepted}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">⏳ Bhej rahe hain...</span>
                  ) : (
                    <span className="flex items-center gap-2">🚀 Get Started - OTP Bhejo</span>
                  )}
                </Button>
              </CardFooter>
            </Card>

            {/* Feature Cards */}
            <div className="space-y-3">
              {FEATURES.map((feature, i) => (
                <Card key={i} className="p-4 bg-white/80 backdrop-blur shadow-lg border-0">
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">{feature.icon}</div>
                    <div>
                      <p className="font-semibold text-gray-800">{feature.titleHi}</p>
                      <p className="text-sm text-gray-500">{feature.desc}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="p-4 text-center border-t bg-white/80 backdrop-blur">
          <p className="font-semibold gradient-text">{HERO_TEXT.tagline}</p>
          <p className="text-xs text-gray-400 mt-1">© 2024 Help2Earn | Made with ❤️ in India</p>
        </footer>
      </div>
    )
  }

  // OTP Verification Screen
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400" />
          <CardHeader className="text-center pt-8">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mx-auto mb-4 shadow-xl">
              <Phone className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-2xl">OTP Verify Karo 📱</CardTitle>
            <CardDescription className="text-base">
              +91 {phone} pe bheja gaya code daalen
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pb-6">
            <Input
              type="text"
              placeholder="6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="text-center text-3xl tracking-widest h-16 font-bold"
              maxLength={6}
            />

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 h-12"
                onClick={() => { setOtpSent(false); setOtp(''); setReceivedOtp('') }}
              >
                ← Back
              </Button>
              <Button
                className="flex-1 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 font-semibold"
                onClick={handleVerifyOtp}
                disabled={loading || otp.length !== 6}
              >
                {loading ? '⏳ Verify...' : '✅ Verify & Login'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

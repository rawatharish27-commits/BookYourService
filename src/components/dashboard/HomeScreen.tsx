'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Award, Heart, HandHelping, Gift, Sparkles, Target, TrendingUp, Users } from 'lucide-react'
import { formatCurrency } from '@/lib/store'
import type { User as UserType } from '@/lib/store'

interface HomeScreenProps {
  user: UserType | null
  onTabChange: (tab: string) => void
}

export default function HomeScreen({ user, onTabChange }: HomeScreenProps) {
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

  const PROBLEM_CATEGORIES = {
    EMERGENCY: {
      label: 'Emergency',
      icon: '🚨',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      color: 'text-red-700',
      riskLevel: 'HIGH',
      minTrust: 70,
      examples: {
        city: ['Battery Dead', 'Puncture', 'Phone Charging', 'Medical Help']
      }
    },
    TIME_ACCESS: {
      label: 'Time & Access',
      icon: '⏰',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      color: 'text-blue-700',
      riskLevel: 'MEDIUM',
      minTrust: 50,
      examples: {
        city: ['Queue Stand', 'Local Guide', 'Errands', 'Pet Care']
      }
    },
    RESOURCE_RENT: {
      label: 'Resource Rent',
      icon: '📦',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      color: 'text-green-700',
      riskLevel: 'LOW',
      minTrust: 40,
      examples: {
        city: ['Bike Rent', 'Tools', 'Electronics', 'Party Items']
      }
    }
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Hero Section */}
      <Card className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white border-0 shadow-xl overflow-hidden">
        <CardContent className="pt-6 pb-6 relative">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

          <div className="relative text-center mb-4">
            <h2 className="text-2xl font-bold mb-1">
              {user?.name ? `Namaste, ${user.name}! 🙏` : 'Welcome to Help2Earn! 🎉'}
            </h2>
            <p className="text-white/90 text-sm">
              {HERO_TEXT.highlight}
            </p>
          </div>

          {/* Rotating Quote */}
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur mb-4">
            <p className="text-sm text-center font-medium transition-opacity duration-500">
              {ATTRACT_QUOTES[0]} {/* Static for now */}
            </p>
          </div>

          <div className="flex gap-3 justify-center">
            <Button
              className="bg-white text-emerald-600 hover:bg-emerald-50 shadow-lg font-semibold"
              onClick={() => onTabChange('post')}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Request Post Karo
            </Button>
            <Button
              variant="outline"
              className="border-white text-white hover:bg-white/20 font-semibold"
              onClick={() => onTabChange('problems')}
            >
              <Target className="w-4 h-4 mr-2" />
              Help Dhundho
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="shadow-lg card-hover bg-gradient-to-br from-white to-emerald-50">
          <CardContent className="pt-4 pb-3 text-center">
            <Award className="w-7 h-7 mx-auto text-emerald-500" />
            <p className="text-2xl font-bold mt-1 gradient-text">{user?.trustScore || 50}</p>
            <p className="text-xs text-gray-500 font-medium">Trust Score</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg card-hover bg-gradient-to-br from-white to-pink-50">
          <CardContent className="pt-4 pb-3 text-center">
            <Heart className="w-7 h-7 mx-auto text-pink-500" />
            <p className="text-2xl font-bold mt-1 text-pink-600">{user?.totalHelpsGiven || 0}</p>
            <p className="text-xs text-gray-500 font-medium">Madad Ki 👍</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg card-hover bg-gradient-to-br from-white to-blue-50">
          <CardContent className="pt-4 pb-3 text-center">
            <HandHelping className="w-7 h-7 mx-auto text-blue-500" />
            <p className="text-2xl font-bold mt-1 text-blue-600">{user?.totalHelpsTaken || 0}</p>
            <p className="text-xs text-gray-500 font-medium">Madad Li 🙏</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg card-hover bg-gradient-to-br from-white to-amber-50">
          <CardContent className="pt-4 pb-3 text-center">
            <Gift className="w-7 h-7 mx-auto text-amber-500" />
            <p className="text-2xl font-bold mt-1 text-amber-600">{user?.referralCount || 0}</p>
            <p className="text-xs text-gray-500 font-medium">Referrals 🎁</p>
          </CardContent>
        </Card>
      </div>

      {/* Help Types */}
      <div className="space-y-2">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-amber-500" />
          Madad ke Types
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {Object.entries(PROBLEM_CATEGORIES).map(([key, config]) => (
            <Card key={key} className={`${config.bgColor} ${config.borderColor} border-2 shadow-lg card-hover overflow-hidden`}>
              <div className="h-1 bg-gradient-to-r from-emerald-400 to-teal-400" />
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="text-2xl">{config.icon}</span>
                  <span className={config.color}>{config.label}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-2">
                  <Badge variant="outline" className="text-xs font-medium">{config.riskLevel} Risk</Badge>
                  <Badge variant="outline" className="text-xs font-medium">Trust: {config.minTrust}</Badge>
                </div>
                <p className="text-xs text-gray-600 font-medium">
                  {config.examples.city.slice(0, 4).join(', ')}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Earning Info */}
      <Card className="bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 border-2 border-amber-200 shadow-lg">
        <CardContent className="pt-5 pb-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg flex-shrink-0">
              <Users className="w-7 h-7 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-gray-800 text-lg">💰 Roz ₹1,000–₹2,000 tak kamaao!</h4>
              <p className="text-sm text-gray-600 mt-1">
                Ghar par bekaar pade samaan se lekar free time dene tak — sab kuch kaam aa sakta hai.
                Shaadi ho, emergency ho ya daily ka zaroori kaam — log madad dhundhte hain!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Referral Section */}
      {user?.referralCode && (
        <Card className="shadow-lg overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-amber-400 to-orange-500" />
          <CardHeader className="pb-2 bg-gradient-to-r from-amber-50 to-orange-50">
            <CardTitle className="text-lg flex items-center gap-2">
              <Gift className="w-5 h-5 text-amber-500" />
              🎁 Refer &amp; Earn
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <p className="text-sm text-gray-600 mb-3">Apna referral code share karo, dono ko +3 trust score milega!</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 p-3 bg-gray-100 rounded-xl font-mono text-center text-lg font-bold">
                {user.referralCode}
              </div>
              <Button variant="outline" size="icon" className="h-12 w-12" onClick={() => {
                navigator.clipboard.writeText(user.referralCode)
                // toast.success('Referral code copy ho gaya! 📋')
              }}>
                <Gift className="w-5 h-5" />
              </Button>
              <Button variant="outline" size="icon" className="h-12 w-12">
                <Sparkles className="w-5 h-5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trust Score Info */}
      <Card className="shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Award className="w-5 h-5 text-blue-500" />
            Trust Score System 🛡️
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="p-3 rounded-xl bg-green-50 border-2 border-green-200 text-center">
              <div className="text-2xl">🟢</div>
              <p className="font-bold text-sm text-green-700">Trusted</p>
              <p className="text-xs text-gray-500">70-100</p>
            </div>
            <div className="p-3 rounded-xl bg-yellow-50 border-2 border-yellow-300 text-center">
              <div className="text-2xl">🟡</div>
              <p className="font-bold text-sm text-yellow-700">Neutral</p>
              <p className="text-xs text-gray-500">40-69</p>
            </div>
            <div className="p-3 rounded-xl bg-red-50 border-2 border-red-200 text-center">
              <div className="text-2xl">🔴</div>
              <p className="font-bold text-sm text-red-700">Restricted</p>
              <p className="text-xs text-gray-500">0-39</p>
            </div>
          </div>
          <div className="text-sm text-gray-600 space-y-1 bg-gray-50 p-3 rounded-xl">
            <p>✅ Successful help: <span className="font-bold text-green-600">+3</span></p>
            <p>⭐ Positive rating (4-5): <span className="font-bold text-green-600">+2</span></p>
            <p>❌ No-show: <span className="font-bold text-red-600">-10</span></p>
            <p>🚨 Valid report: <span className="font-bold text-red-600">-15</span></p>
          </div>
        </CardContent>
      </Card>

      {/* Rules */}
      <Card className="shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            📋 Important Rules
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2 p-2 bg-green-50 rounded-lg">
              <Award className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Subscription: <strong>₹49/month</strong> mandatory</span>
            </div>
            <div className="flex items-start gap-2 p-2 bg-green-50 rounded-lg">
              <Target className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Visibility: <strong>20 KM radius</strong> for paid users</span>
            </div>
            <div className="flex items-start gap-2 p-2 bg-green-50 rounded-lg">
              <HandHelping className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Payments: Direct between users (outside app)</span>
            </div>
            <div className="flex items-start gap-2 p-2 bg-green-50 rounded-lg">
              <Award className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Max <strong>3 posts/day</strong></span>
            </div>
            <div className="flex items-start gap-2 p-2 bg-red-50 rounded-lg">
              <Sparkles className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <span>No illegal items or activities ❌</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Clock, MapPin, Eye, PhoneCall, Flag } from 'lucide-react'
import { formatCurrency, formatRelativeTime, formatPhone, PROBLEM_CATEGORIES } from '@/lib/store'

interface Problem {
  id: string
  userId: string
  type: 'EMERGENCY' | 'TIME_ACCESS' | 'RESOURCE_RENT'
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
  title: string
  description: string
  offerPrice: number | null
  latitude: number | null
  longitude: number | null
  locationText: string | null
  minTrustRequired: number
  status: string
  viewCount: number
  callCount: number
  createdAt: string
  expiresAt: string | null
  distance?: number
  user: {
    id: string
    phone: string
    name: string | null
    trustScore: number
  }
}

interface ProblemCardProps {
  problem: Problem
  onDetailsClick: (problem: Problem) => void
  onCallClick: (phone: string) => void
  onReportClick: (problem: Problem) => void
}

export default function ProblemCard({
  problem,
  onDetailsClick,
  onCallClick,
  onReportClick
}: ProblemCardProps) {
  const typeConfig = PROBLEM_CATEGORIES[problem.type]

  return (
    <Card className="shadow-lg card-hover overflow-hidden">
      <div className={`h-1 ${problem.riskLevel === 'HIGH' ? 'bg-red-400' : problem.riskLevel === 'MEDIUM' ? 'bg-yellow-400' : 'bg-green-400'}`} />
      <CardContent className="pt-4 pb-3">
        <div className="flex justify-between items-start mb-2">
          <div className="space-y-1">
            <h3 className="font-bold text-gray-800">{problem.title}</h3>
            <div className="flex flex-wrap gap-1">
              <Badge className={`${typeConfig.bgColor} ${typeConfig.borderColor} ${typeConfig.color}`} variant="outline">
                {typeConfig.icon} {typeConfig.label}
              </Badge>
              <Badge variant="outline" className={
                problem.riskLevel === 'HIGH' ? 'text-red-500 border-red-300' :
                problem.riskLevel === 'MEDIUM' ? 'text-yellow-600 border-yellow-300' :
                'text-green-500 border-green-300'
              }>
                {problem.riskLevel}
              </Badge>
            </div>
          </div>
          {problem.offerPrice && (
            <Badge className="bg-green-500 text-white shadow-sm text-base px-3">
              {formatCurrency(problem.offerPrice)}
            </Badge>
          )}
        </div>

        <p className="text-sm text-gray-600 line-clamp-2 mt-2">{problem.description}</p>

        <div className="flex flex-wrap gap-3 mt-3 text-xs text-gray-500">
          <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full">
            <Clock className="w-3 h-3" />
            {formatRelativeTime(problem.createdAt)}
          </span>
          {problem.distance && (
            <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full">
              <MapPin className="w-3 h-3" />
              {problem.distance.toFixed(1)} km
            </span>
          )}
          <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full">
            <Eye className="w-3 h-3" />
            {problem.viewCount}
          </span>
        </div>

        <Separator className="my-3" />

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium">{formatPhone(problem.user.phone)}</span>
            <Badge variant="outline" className={
              problem.user.trustScore >= 70 ? 'text-green-500' :
              problem.user.trustScore >= 40 ? 'text-yellow-600' :
              'text-red-500'
            }>
              {problem.user.trustScore}
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => onDetailsClick(problem)}>
              <Eye className="w-4 h-4 mr-1" /> Details
            </Button>
            <Button size="sm" className="bg-gradient-to-r from-emerald-500 to-teal-500" onClick={() => onCallClick(problem.user.phone)}>
              <PhoneCall className="w-4 h-4 mr-1" /> Call
            </Button>
          </div>
        </div>

        <div className="mt-2 flex justify-end">
          <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600" onClick={() => onReportClick(problem)}>
            <Flag className="w-4 h-4 mr-1" /> Report
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MapPin, Clock, Eye, PhoneCall, Phone, Star, AlertTriangle, CheckCircle2, XCircle, MessageSquare } from 'lucide-react'
import { formatRelativeTime, formatPhone, PROBLEM_CATEGORIES } from '@/lib/store'
import type { User as UserType } from '@/lib/store'

interface Problem {
  id: string
  userId: string
  type: 'EMERGENCY' | 'TIME_ACCESS' | 'RESOURCE_RENT'
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
  category?: string
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

interface ProblemListProps {
  problems: Problem[]
  myProblems: Problem[]
  user: UserType | null
  userLocation: { lat: number; lng: number } | null
  onSelectProblem: (problem: Problem) => void
  onReport: (problem: Problem) => void
  onFeedback: (problem: Problem) => void
}

export default function ProblemList({
  problems,
  myProblems,
  user,
  userLocation,
  onSelectProblem,
  onReport,
  onFeedback
}: ProblemListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedRisk, setSelectedRisk] = useState<string>('all')

  // Filtered Problems
  const filteredProblems = useMemo(() => {
    return problems.filter(p => {
      const matchesSearch = !searchQuery ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesType = selectedType === 'all' || p.type === selectedType
      const matchesRisk = selectedRisk === 'all' || p.riskLevel === selectedRisk
      return matchesSearch && matchesType && matchesRisk
    })
  }, [problems, searchQuery, selectedType, selectedRisk])

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="🔍 Madad dhundho..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-11"
            />
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-36 h-9">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="EMERGENCY">🚨 Emergency</SelectItem>
              <SelectItem value="TIME_ACCESS">⏰ Time</SelectItem>
              <SelectItem value="RESOURCE_RENT">📦 Resource</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedRisk} onValueChange={setSelectedRisk}>
            <SelectTrigger className="w-32 h-9">
              <SelectValue placeholder="Risk" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Risk</SelectItem>
              <SelectItem value="LOW">🟢 Low</SelectItem>
              <SelectItem value="MEDIUM">🟡 Medium</SelectItem>
              <SelectItem value="HIGH">🔴 High</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2 text-sm text-gray-500 ml-auto bg-white px-3 py-1.5 rounded-lg shadow-sm">
            <MapPin className="w-4 h-4 text-emerald-500" />
            {userLocation ? `${userLocation.lat.toFixed(2)}, ${userLocation.lng.toFixed(2)}` : 'No GPS'}
          </div>
        </div>
      </div>

      <Tabs defaultValue="nearby">
        <TabsList className="bg-white/80 shadow-sm">
          <TabsTrigger value="nearby">Nearby ({filteredProblems.length})</TabsTrigger>
          <TabsTrigger value="mine">My Posts ({myProblems.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="nearby">
          {filteredProblems.length === 0 ? (
            <Card className="shadow-lg">
              <CardContent className="py-16 text-center">
                <MapPin className="w-16 h-16 mx-auto mb-4 text-gray-200" />
                <p className="font-semibold text-gray-600 text-lg">Koi help request nahi mili</p>
                <p className="text-sm text-gray-400 mt-1">Filters change karo ya khud post karo!</p>
              </CardContent>
            </Card>
          ) : (
            <ScrollArea className="h-[55vh] scrollbar-thin">
              <div className="space-y-3 pr-2">
                {filteredProblems.map((problem) => {
                  const typeConfig = PROBLEM_CATEGORIES[problem.type]
                  return (
                    <Card key={problem.id} className="shadow-lg card-hover overflow-hidden">
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
                              ₹{problem.offerPrice}
                            </Badge>
                          )}
                        </div>

                        <p className="text-sm text-gray-600 line-clamp-2 mt-2">{problem.description}</p>

                        <div className="flex flex-wrap gap-3 mt-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full">
                            <Clock className="w-3 h-3" />
                            {formatRelativeTime(problem.createdAt)}
                          </span>
                          <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full">
                            <MapPin className="w-3 h-3" />
                            {problem.distance?.toFixed(1)} km
                          </span>
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
                            <Button size="sm" variant="outline" onClick={() => onSelectProblem(problem)}>
                              <Eye className="w-4 h-4 mr-1" /> Details
                            </Button>
                            <Button size="sm" className="bg-gradient-to-r from-emerald-500 to-teal-500" onClick={() => window.open(`tel:+91${problem.user.phone}`)}>
                              <PhoneCall className="w-4 h-4 mr-1" /> Call
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </ScrollArea>
          )}
        </TabsContent>

        <TabsContent value="mine">
          {myProblems.length === 0 ? (
            <Card className="shadow-lg">
              <CardContent className="py-16 text-center">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-200" />
                <p className="font-semibold text-gray-600 text-lg">Koi post nahi hai</p>
                <p className="text-sm text-gray-400 mt-1">Apni pehli help request banao!</p>
              </CardContent>
            </Card>
          ) : (
            <ScrollArea className="h-[55vh] scrollbar-thin">
              <div className="space-y-3 pr-2">
                {myProblems.map((problem) => {
                  const typeConfig = PROBLEM_CATEGORIES[problem.type]
                  return (
                    <Card key={problem.id} className="shadow-lg">
                      <CardContent className="pt-4 pb-3">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold">{problem.title}</h3>
                          <Badge variant="outline">{problem.status}</Badge>
                        </div>
                        <Badge className={`${typeConfig.bgColor} ${typeConfig.borderColor}`}>
                          {typeConfig.icon} {typeConfig.label}
                        </Badge>
                        <p className="text-sm text-gray-600 mt-2">{problem.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatRelativeTime(problem.createdAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {problem.viewCount} views
                          </span>
                        </div>
                        {problem.status === 'OPEN' && (
                          <Button
                            variant="outline" size="sm"
                            className="mt-3 w-full"
                            onClick={() => onFeedback(problem)}
                          >
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Mark Resolved & Feedback Do
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </ScrollArea>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

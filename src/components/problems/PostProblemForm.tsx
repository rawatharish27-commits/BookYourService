'use client'

import { useState } from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Plus, AlertCircle } from 'lucide-react'
import { PROBLEM_CATEGORIES } from '@/lib/store'

interface PostProblemFormProps {
  onSubmit: (problem: {
    type: 'EMERGENCY' | 'TIME_ACCESS' | 'RESOURCE_RENT'
    title: string
    description: string
    offerPrice: string
    locationText: string
  }) => void
  loading: boolean
}

export default function PostProblemForm({ onSubmit, loading }: PostProblemFormProps) {
  const [newProblem, setNewProblem] = useState({
    type: 'EMERGENCY' as 'EMERGENCY' | 'TIME_ACCESS' | 'RESOURCE_RENT',
    title: '',
    description: '',
    offerPrice: '',
    locationText: ''
  })

  const handleSubmit = () => {
    if (!newProblem.title || !newProblem.description) {
      alert('Sab fields bharen!')
      return
    }
    onSubmit(newProblem)
    // Reset form
    setNewProblem({
      type: 'EMERGENCY',
      title: '',
      description: '',
      offerPrice: '',
      locationText: ''
    })
  }

  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Plus className="w-6 h-6 text-emerald-500" />
          Help Request Post Karo
        </CardTitle>
        <p className="text-gray-600">Kis tarah ki madad chahiye? Describe karo</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label className="font-medium">Request Type *</Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {(['EMERGENCY', 'TIME_ACCESS', 'RESOURCE_RENT'] as const).map((type) => {
              const config = PROBLEM_CATEGORIES[type]
              return (
                <Card
                  key={type}
                  className={`cursor-pointer transition-all card-hover ${newProblem.type === type ? 'ring-2 ring-emerald-500 border-emerald-300' : ''} ${config.bgColor} ${config.borderColor} border-2`}
                  onClick={() => setNewProblem({ ...newProblem, type })}
                >
                  <CardContent className="pt-4 pb-3 text-center">
                    <span className="text-3xl">{config.icon}</span>
                    <p className={`font-semibold mt-2 ${config.color}`}>{config.label}</p>
                    <Badge variant="outline" className="text-xs mt-1">{config.riskLevel}</Badge>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="title" className="font-medium">Title *</Label>
          <Input
            id="title"
            placeholder="Brief title likho..."
            value={newProblem.title}
            onChange={(e) => setNewProblem({ ...newProblem, title: e.target.value })}
            className="h-11"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="font-medium">Description *</Label>
          <Textarea
            id="description"
            placeholder="Kya madad chahiye? Details me likho..."
            value={newProblem.description}
            onChange={(e) => setNewProblem({ ...newProblem, description: e.target.value })}
            rows={4}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="offerPrice" className="font-medium">Offer Price (₹)</Label>
            <Input
              id="offerPrice"
              type="number"
              placeholder="Optional"
              value={newProblem.offerPrice}
              onChange={(e) => setNewProblem({ ...newProblem, offerPrice: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="locationText" className="font-medium">Location</Label>
            <Input
              id="locationText"
              placeholder="Landmark, area..."
              value={newProblem.locationText}
              onChange={(e) => setNewProblem({ ...newProblem, locationText: e.target.value })}
            />
          </div>
        </div>

        <Alert className="bg-amber-50 border-amber-200">
          <AlertCircle className="w-4 h-4 text-amber-500" />
          <AlertTitle>Yaad rakho! 📝</AlertTitle>
          <AlertDescription>
            <ul className="list-disc list-inside text-sm mt-1 space-y-1">
              <li>Max <strong>3 posts/day</strong></li>
              <li>Posts <strong>24 hours</strong> me expire</li>
              <li>Phone number helpers ko dikhegi</li>
              <li>Payments <strong>outside app</strong></li>
            </ul>
          </AlertDescription>
        </Alert>
      </CardContent>
      <CardFooter className="pb-6">
        <Button
          className="w-full h-12 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 font-semibold text-lg"
          onClick={handleSubmit}
          disabled={loading || !newProblem.title || !newProblem.description}
        >
          {loading ? '⏳ Posting...' : '🚀 Post Request'}
        </Button>
      </CardFooter>
    </Card>
  )
}

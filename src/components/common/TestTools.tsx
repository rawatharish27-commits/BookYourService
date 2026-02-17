'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Settings, Shield, MapPin, AlertTriangle,
  User, Bug, TestTube, Zap
} from 'lucide-react'
import { toast } from 'sonner'
import { shouldShowTestTools } from '@/lib/config'

interface TestToolsProps {
  userId: string
  onToolExecuted?: () => void
}

export default function TestTools({ userId, onToolExecuted }: TestToolsProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  // Only show in DEV environment
  if (!shouldShowTestTools()) {
    return null
  }

  const forceTrustScoreChange = async (newScore: number) => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/trust-scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          newScore,
          reason: 'DEV Test Tool - Forced trust score change'
        })
      })

      if (response.ok) {
        toast.success(`Trust score changed to ${newScore}`)
        onToolExecuted?.()
      } else {
        toast.error('Failed to change trust score')
      }
    } catch (error) {
      toast.error('Error changing trust score')
    } finally {
      setLoading(false)
    }
  }

  const simulateNoShow = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/trust-scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          action: 'NO_SHOW',
          reason: 'DEV Test Tool - Simulated no-show'
        })
      })

      if (response.ok) {
        toast.success('No-show penalty applied')
        onToolExecuted?.()
      } else {
        toast.error('Failed to apply penalty')
      }
    } catch (error) {
      toast.error('Error applying penalty')
    } finally {
      setLoading(false)
    }
  }

  const mockLocationWarning = async () => {
    setLoading(true)
    try {
      // Simulate suspicious location update
      const response = await fetch('/api/user/location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: 28.6139, // Delhi
          longitude: 77.2090,
          accuracy: 100
        })
      })

      // Wait a bit then update to Mumbai (suspicious jump)
      setTimeout(async () => {
        await fetch('/api/user/location', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            latitude: 19.0760, // Mumbai
            longitude: 72.8777,
            accuracy: 50
          })
        })
        toast.success('Mock location warning triggered')
        onToolExecuted?.()
      }, 1000)
    } catch (error) {
      toast.error('Error triggering location warning')
    } finally {
      setLoading(false)
    }
  }

  const fakeReferralDetection = async () => {
    setLoading(true)
    try {
      // Create a fake referral pattern
      const response = await fetch('/api/admin/fraud-detection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'FAKE_REFERRAL',
          userId,
          details: 'DEV Test Tool - Fake referral pattern detected'
        })
      })

      if (response.ok) {
        toast.success('Fake referral detection triggered')
        onToolExecuted?.()
      } else {
        toast.error('Failed to trigger detection')
      }
    } catch (error) {
      toast.error('Error triggering detection')
    } finally {
      setLoading(false)
    }
  }

  const crashTest = () => {
    try {
      // Deliberate error to test crash reporting
      throw new Error('DEV Test Tool - Deliberate crash for testing')
    } catch (error) {
      console.error('Test crash:', error)
      toast.error('Test crash triggered - check logs')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="fixed bottom-4 right-4 z-50 bg-red-500 text-white hover:bg-red-600">
          <TestTube className="w-4 h-4 mr-2" />
          DEV Tools
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <TestTube className="w-5 h-5" />
            Development Test Tools
          </DialogTitle>
          <DialogDescription>
            These tools are only available in DEV environment for testing purposes.
          </DialogDescription>
        </DialogHeader>

        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="w-4 h-4 text-red-500" />
          <AlertTitle className="text-red-800">⚠️ DEV Environment Only</AlertTitle>
          <AlertDescription className="text-red-700">
            These tools modify real data and should never be used in production.
            They are for testing trust scores, fraud detection, and error handling.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Trust Score Tools */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Trust Score Control
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs">Force Trust Score</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    type="number"
                    placeholder="0-100"
                    min="0"
                    max="100"
                    className="flex-1"
                    onChange={(e) => {
                      const score = parseInt(e.target.value)
                      if (score >= 0 && score <= 100) {
                        forceTrustScoreChange(score)
                      }
                    }}
                  />
                  <Button size="sm" variant="outline" disabled={loading}>
                    Set
                  </Button>
                </div>
              </div>

              <Button
                size="sm"
                variant="destructive"
                onClick={simulateNoShow}
                disabled={loading}
                className="w-full"
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Simulate No-Show
              </Button>
            </CardContent>
          </Card>

          {/* Location Tools */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Location Testing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                size="sm"
                variant="outline"
                onClick={mockLocationWarning}
                disabled={loading}
                className="w-full"
              >
                <MapPin className="w-4 h-4 mr-2" />
                Mock GPS Spoofing
              </Button>
              <p className="text-xs text-gray-500 mt-2">
                Triggers location validation warning
              </p>
            </CardContent>
          </Card>

          {/* Fraud Detection */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <User className="w-4 h-4" />
                Fraud Detection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                size="sm"
                variant="outline"
                onClick={fakeReferralDetection}
                disabled={loading}
                className="w-full"
              >
                <User className="w-4 h-4 mr-2" />
                Fake Referral Pattern
              </Button>
              <p className="text-xs text-gray-500 mt-2">
                Triggers fraud detection system
              </p>
            </CardContent>
          </Card>

          {/* Crash Testing */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Bug className="w-4 h-4" />
                Error Testing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                size="sm"
                variant="destructive"
                onClick={crashTest}
                className="w-full"
              >
                <Bug className="w-4 h-4 mr-2" />
                Trigger Test Crash
              </Button>
              <p className="text-xs text-gray-500 mt-2">
                Tests error logging and crash reporting
              </p>
            </CardContent>
          </Card>
        </div>

        <Separator />

        <div className="text-center">
          <Badge variant="secondary" className="bg-red-100 text-red-800">
            DEV ENVIRONMENT ONLY
          </Badge>
          <p className="text-xs text-gray-500 mt-2">
            These tools help test app behavior under various conditions.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

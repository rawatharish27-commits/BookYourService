'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Card, CardContent } from '@/components/ui/card'
import { MapPin, Shield, AlertTriangle, CheckCircle, Info } from 'lucide-react'
import { toast } from 'sonner'

interface LocationPermissionScreenProps {
  open: boolean
  onPermissionGranted: () => void
  onPermissionDenied: () => void
  onManualFallback: () => void
}

export default function LocationPermissionScreen({
  open,
  onPermissionGranted,
  onPermissionDenied,
  onManualFallback
}: LocationPermissionScreenProps) {
  const [permissionStatus, setPermissionStatus] = useState<PermissionState | null>(null)
  const [isRequesting, setIsRequesting] = useState(false)
  const [showFallback, setShowFallback] = useState(false)

  useEffect(() => {
    if (open) {
      checkPermissionStatus()
    }
  }, [open])

  const checkPermissionStatus = async () => {
    if (!navigator.permissions) {
      setPermissionStatus('prompt')
      return
    }

    try {
      const result = await navigator.permissions.query({ name: 'geolocation' })
      setPermissionStatus(result.state)
    } catch (error) {
      console.warn('Permission check failed:', error)
      setPermissionStatus('prompt')
    }
  }

  const requestLocationPermission = async () => {
    setIsRequesting(true)

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        })
      })

      // Permission granted and location obtained
      toast.success('Location access granted!')
      onPermissionGranted()

    } catch (error: any) {
      console.warn('Location permission denied or failed:', error)

      if (error.code === error.PERMISSION_DENIED) {
        setPermissionStatus('denied')
        toast.error('Location permission denied')
        setShowFallback(true)
      } else {
        // Timeout or other error - show fallback
        toast.warning('Location access timed out. Please try manual entry.')
        setShowFallback(true)
      }
    } finally {
      setIsRequesting(false)
    }
  }

  const handleManualEntry = () => {
    onManualFallback()
  }

  const handleSkipForNow = () => {
    toast.warning('Location access is required for full app functionality')
    onPermissionDenied()
  }

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <MapPin className="w-6 h-6 text-emerald-500" />
            Location Access Required
          </DialogTitle>
          <DialogDescription>
            Help2Earn needs location access to connect you with nearby helpers and help requests.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <Info className="w-4 h-4" />
            <AlertTitle>Location Usage</AlertTitle>
            <AlertDescription className="text-sm">
              Your location is used only to show nearby help requests within 20 KM radius.
              We never share your exact location with others.
            </AlertDescription>
          </Alert>

          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-blue-900">Privacy Protected</h4>
                  <ul className="text-sm text-blue-700 mt-1 space-y-1">
                    <li>• Location data is encrypted</li>
                    <li>• Only approximate location shown to others</li>
                    <li>• GPS spoofing is detected and penalized</li>
                    <li>• You can delete location data anytime</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {!showFallback ? (
            <div className="space-y-3">
              <Button
                onClick={requestLocationPermission}
                disabled={isRequesting}
                className="w-full h-12 bg-emerald-500 hover:bg-emerald-600"
              >
                {isRequesting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Requesting Access...
                  </>
                ) : (
                  <>
                    <MapPin className="w-4 h-4 mr-2" />
                    Allow Location Access
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                onClick={handleManualEntry}
                className="w-full"
              >
                Enter Location Manually
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <Alert className="border-amber-200 bg-amber-50">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <AlertTitle>Location Access Denied</AlertTitle>
                <AlertDescription className="text-sm">
                  Without location access, you can still use the app but with limited functionality.
                  You can enter your location manually or enable location access later in settings.
                </AlertDescription>
              </Alert>

              <Button
                onClick={handleManualEntry}
                className="w-full h-12 bg-emerald-500 hover:bg-emerald-600"
              >
                <MapPin className="w-4 h-4 mr-2" />
                Enter Location Manually
              </Button>

              <Button
                variant="outline"
                onClick={handleSkipForNow}
                className="w-full"
              >
                Skip for Now
              </Button>
            </div>
          )}

          <div className="text-xs text-gray-500 text-center">
            You can change this setting anytime in app settings
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

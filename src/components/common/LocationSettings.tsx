'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { MapPin, Shield, Eye, EyeOff, Info } from 'lucide-react'
import { toast } from 'sonner'

interface LocationSettingsProps {
  userId: string
  onSettingsChanged?: () => void
}

export default function LocationSettings({ userId, onSettingsChanged }: LocationSettingsProps) {
  const [settings, setSettings] = useState({
    locationEnabled: true,
    foregroundOnly: true,
    shareWithHelpers: true,
    shareWithClients: false
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [userId])

  const loadSettings = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/user/location-settings')
      if (response.ok) {
        const data = await response.json()
        setSettings(data.settings)
      }
    } catch (error) {
      console.error('Failed to load location settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/user/location-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })

      if (response.ok) {
        toast.success('Location settings updated successfully!')
        onSettingsChanged?.()
      } else {
        toast.error('Failed to update settings')
      }
    } catch (error) {
      console.error('Failed to save location settings:', error)
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const clearLocationData = async () => {
    if (!confirm('Are you sure you want to clear all your location data? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch('/api/user/location-settings', {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Location data cleared successfully!')
        onSettingsChanged?.()
      } else {
        toast.error('Failed to clear location data')
      }
    } catch (error) {
      console.error('Failed to clear location data:', error)
      toast.error('Failed to clear location data')
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-emerald-500" />
          Location Privacy Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <Info className="w-4 h-4" />
          <AlertTitle>Location Usage</AlertTitle>
          <AlertDescription>
            Your location is used only to show nearby help requests and helpers.
            We never share your exact location with others without your permission.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base font-medium">Enable Location Services</Label>
              <p className="text-sm text-gray-600">
                Allow the app to access your location for nearby help matching
              </p>
            </div>
            <Switch
              checked={settings.locationEnabled}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, locationEnabled: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base font-medium">Foreground Location Only</Label>
              <p className="text-sm text-gray-600">
                Only track location when app is open (recommended for privacy)
              </p>
            </div>
            <Switch
              checked={settings.foregroundOnly}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, foregroundOnly: checked })
              }
              disabled={!settings.locationEnabled}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base font-medium">Share with Helpers</Label>
              <p className="text-sm text-gray-600">
                Allow verified helpers to see your approximate location
              </p>
            </div>
            <Switch
              checked={settings.shareWithHelpers}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, shareWithHelpers: checked })
              }
              disabled={!settings.locationEnabled}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base font-medium">Share with Clients</Label>
              <p className="text-sm text-gray-600">
                Allow help seekers to see your location (not recommended)
              </p>
            </div>
            <Switch
              checked={settings.shareWithClients}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, shareWithClients: checked })
              }
              disabled={!settings.locationEnabled}
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <Button
            onClick={saveSettings}
            disabled={saving}
            className="flex-1"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
          <Button
            variant="outline"
            onClick={clearLocationData}
            className="flex-1"
          >
            Clear Location Data
          </Button>
        </div>

        <Alert className="bg-blue-50 border-blue-200">
          <MapPin className="w-4 h-4 text-blue-500" />
          <AlertTitle>Privacy Notice</AlertTitle>
          <AlertDescription className="text-sm">
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Location data is encrypted and stored securely</li>
              <li>You can delete your location data at any time</li>
              <li>Location is never sold to third parties</li>
              <li>GPS spoofing is detected and penalized</li>
            </ul>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}

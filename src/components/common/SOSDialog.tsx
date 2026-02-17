'use client'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

interface SOSDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function SOSDialog({ open, onOpenChange }: SOSDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600 text-xl">
            <AlertTriangle className="w-6 h-6" />
            🚨 SOS Emergency
          </DialogTitle>
          <DialogDescription>
            Emergency me ye contacts use karo
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Button className="w-full h-12" variant="destructive" onClick={() => window.open('tel:112')}>
            📞 Emergency (112)
          </Button>
          <Button className="w-full h-12" variant="outline" onClick={() => window.open('tel:100')}>
            👮 Police (100)
          </Button>
          <Button
            className="w-full h-12"
            variant="outline"
            onClick={() => {
              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                  (position) => {
                    const { latitude, longitude } = position.coords
                    window.open(`https://maps.google.com/?q=${latitude},${longitude}`)
                  },
                  () => window.open('https://maps.google.com')
                )
              } else {
                window.open('https://maps.google.com')
              }
            }}
          >
            📍 Location Share
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

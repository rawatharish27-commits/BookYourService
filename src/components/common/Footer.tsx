'use client'

import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

interface FooterProps {
  onSOS: () => void
}

const HERO_TEXT = {
  tagline: "Madad bhi, roz ki kamaai bhi! 🎯"
}

export default function Footer({ onSOS }: FooterProps) {
  return (
    <>
      {/* SOS Button */}
      <Button
        className="fixed bottom-20 right-4 w-14 h-14 rounded-full bg-gradient-to-br from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 shadow-xl z-40 animate-pulse-soft"
        size="icon"
        onClick={onSOS}
      >
        <AlertTriangle className="w-7 h-7" />
      </Button>

      {/* Footer */}
      <footer className="sticky bottom-0 bg-white/90 backdrop-blur-lg border-t mt-auto">
        <div className="max-w-6xl mx-auto px-3 py-2 flex items-center justify-center">
          <p className="font-semibold gradient-text text-sm">{HERO_TEXT.tagline}</p>
        </div>
      </footer>
    </>
  )
}

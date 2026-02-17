'use client'

import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { LogOut, Settings, Shield, CheckCircle, XCircle } from 'lucide-react'
import { getTrustBadge } from '@/lib/store'
import type { User as UserType } from '@/lib/types'
import { ThemeToggle } from '@/components/ui/theme-toggle'

interface HeaderProps {
  user: UserType | null
  isUserActive: boolean
  onLogout: () => void
}

export default function Header({ user, isUserActive, onLogout }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b shadow-sm">
      <div className="max-w-6xl mx-auto px-3 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-md overflow-hidden">
            <Image src="/logo.png" alt="Help2Earn" width={40} height={40} className="object-contain" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-bold gradient-text">Help2Earn</h1>
            <p className="text-xs text-gray-400">Madad karo, Kamaao!</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Badge className={`${getTrustBadge(user?.trustScore || 50).color} text-white shadow-sm`}>
            {getTrustBadge(user?.trustScore || 50).icon} {user?.trustScore}
          </Badge>
          {isUserActive ? (
            <Badge className="bg-emerald-500 text-white text-xs shadow-sm">
              <CheckCircle className="w-3 h-3 mr-1" /> Active
            </Badge>
          ) : (
            <Badge className="bg-red-500 text-white text-xs shadow-sm">
              <XCircle className="w-3 h-3 mr-1" /> Inactive
            </Badge>
          )}
          {user?.isAdmin && (
            <Badge className="bg-purple-500 text-white text-xs shadow-sm">
              <Shield className="w-3 h-3 mr-1" /> Admin
            </Badge>
          )}
        </div>
      </div>
    </header>
  )
}

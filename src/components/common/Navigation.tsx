'use client'

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Home, Search, Plus, IndianRupee, Settings, LogOut } from 'lucide-react'
import { type User as UserType } from '@/lib/store'

interface NavigationProps {
  currentTab: string
  onTabChange: (tab: string) => void
  user: UserType | null
  isUserActive: boolean
}

export default function Navigation({ currentTab, onTabChange, user, isUserActive }: NavigationProps) {
  return (
    <Tabs value={currentTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-4 md:grid-cols-6 mb-4 bg-white/80 backdrop-blur shadow-sm">
        <TabsTrigger value="home" className="text-xs md:text-sm font-medium">
          <Home className="w-4 h-4 mr-1" /> Home
        </TabsTrigger>
        <TabsTrigger value="problems" className="text-xs md:text-sm font-medium" disabled={!isUserActive}>
          <Search className="w-4 h-4 mr-1" /> Nearby
        </TabsTrigger>
        <TabsTrigger value="post" className="text-xs md:text-sm font-medium" disabled={!isUserActive}>
          <Plus className="w-4 h-4 mr-1" /> Post
        </TabsTrigger>
        <TabsTrigger value="payment" className="text-xs md:text-sm font-medium">
          <IndianRupee className="w-4 h-4 mr-1" /> Payment
        </TabsTrigger>
        {user?.isAdmin && (
          <TabsTrigger value="admin" className="text-xs md:text-sm font-medium">
            <Settings className="w-4 h-4 mr-1" /> Admin
          </TabsTrigger>
        )}
        <TabsTrigger value="logout" className="text-xs md:text-sm font-medium text-red-500" onClick={() => onTabChange('logout')}>
          <LogOut className="w-4 h-4 mr-1" /> Exit
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}

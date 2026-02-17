'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Users, FileText, AlertTriangle, TrendingUp, DollarSign,
  Shield, Ban, CheckCircle, XCircle, Search, Filter,
  BarChart3, PieChart, Activity, Settings
} from 'lucide-react'
import { formatRelativeTime, formatPhone } from '@/lib/store'

interface AdminStats {
  totalUsers: number
  activeUsers: number
  totalProblems: number
  pendingPayments: number
  totalReports: number
  resolvedReports: number
}

interface User {
  id: string
  phone: string
  name: string | null
  trustScore: number
  paymentActive: boolean
  isFrozen: boolean
  totalHelpsGiven: number
  totalHelpsTaken: number
  createdAt: string
}

interface Report {
  id: string
  category: string
  reason: string
  status: string
  reporter: { phone: string } | null
  reported: { phone: string } | null
  createdAt: string
}

interface AdminDashboardProps {
  stats: AdminStats
  users: User[]
  reports: Report[]
  onUserAction: (userId: string, action: string) => void
  onReportAction: (reportId: string, action: string) => void
  loading: boolean
}

export default function AdminDashboard({
  stats,
  users,
  reports,
  onUserAction,
  onReportAction,
  loading
}: AdminDashboardProps) {
  const [userSearch, setUserSearch] = useState('')
  const [userFilter, setUserFilter] = useState('all')
  const [reportFilter, setReportFilter] = useState('all')

  const filteredUsers = users.filter(user => {
    const matchesSearch = !userSearch ||
      user.phone.includes(userSearch) ||
      (user.name && user.name.toLowerCase().includes(userSearch.toLowerCase()))
    const matchesFilter = userFilter === 'all' ||
      (userFilter === 'frozen' && user.isFrozen) ||
      (userFilter === 'active' && user.paymentActive) ||
      (userFilter === 'inactive' && !user.paymentActive)
    return matchesSearch && matchesFilter
  })

  const filteredReports = reports.filter(report => {
    return reportFilter === 'all' || report.status === reportFilter
  })

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="shadow-lg">
          <CardContent className="pt-4 pb-3 text-center">
            <Users className="w-8 h-8 mx-auto text-blue-500 mb-2" />
            <p className="text-2xl font-bold">{stats.totalUsers}</p>
            <p className="text-xs text-gray-500">Total Users</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardContent className="pt-4 pb-3 text-center">
            <Activity className="w-8 h-8 mx-auto text-green-500 mb-2" />
            <p className="text-2xl font-bold">{stats.activeUsers}</p>
            <p className="text-xs text-gray-500">Active Users</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardContent className="pt-4 pb-3 text-center">
            <FileText className="w-8 h-8 mx-auto text-purple-500 mb-2" />
            <p className="text-2xl font-bold">{stats.totalProblems}</p>
            <p className="text-xs text-gray-500">Problems</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardContent className="pt-4 pb-3 text-center">
            <DollarSign className="w-8 h-8 mx-auto text-yellow-500 mb-2" />
            <p className="text-2xl font-bold">{stats.pendingPayments}</p>
            <p className="text-xs text-gray-500">Pending Payments</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardContent className="pt-4 pb-3 text-center">
            <AlertTriangle className="w-8 h-8 mx-auto text-red-500 mb-2" />
            <p className="text-2xl font-bold">{stats.totalReports}</p>
            <p className="text-xs text-gray-500">Reports</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardContent className="pt-4 pb-3 text-center">
            <CheckCircle className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
            <p className="text-2xl font-bold">{stats.resolvedReports}</p>
            <p className="text-xs text-gray-500">Resolved</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users">
        <TabsList className="bg-white shadow-sm">
          <TabsTrigger value="users">👥 Users ({filteredUsers.length})</TabsTrigger>
          <TabsTrigger value="reports">🚨 Reports ({filteredReports.length})</TabsTrigger>
          <TabsTrigger value="analytics">📊 Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                User Management
              </CardTitle>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search users..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={userFilter} onValueChange={setUserFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="frozen">Frozen</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {filteredUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="space-y-1">
                        <p className="font-medium">{formatPhone(user.phone)}</p>
                        <p className="text-sm text-gray-500">{user.name || 'No name'}</p>
                        <div className="flex gap-2">
                          <Badge variant="outline">Trust: {user.trustScore}</Badge>
                          <Badge variant={user.paymentActive ? 'default' : 'secondary'}>
                            {user.paymentActive ? 'Active' : 'Inactive'}
                          </Badge>
                          {user.isFrozen && <Badge variant="destructive">Frozen</Badge>}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onUserAction(user.id, user.isFrozen ? 'unfreeze' : 'freeze')}
                          disabled={loading}
                        >
                          {user.isFrozen ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onUserAction(user.id, 'reset_trust')}
                          disabled={loading}
                        >
                          <Shield className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Report Management
              </CardTitle>
              <Select value={reportFilter} onValueChange={setReportFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Reports</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="REVIEWED">Reviewed</SelectItem>
                  <SelectItem value="RESOLVED">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {filteredReports.map((report) => (
                    <div key={report.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant="outline">{report.category}</Badge>
                        <Badge variant={
                          report.status === 'RESOLVED' ? 'default' :
                          report.status === 'PENDING' ? 'secondary' : 'outline'
                        }>
                          {report.status}
                        </Badge>
                      </div>
                      <p className="font-medium mb-1">{report.reason}</p>
                      <div className="text-sm text-gray-500 space-y-1">
                        <p>Reporter: {report.reporter?.phone || 'Unknown'}</p>
                        <p>Reported: {report.reported?.phone || 'Unknown'}</p>
                        <p>{formatRelativeTime(report.createdAt)}</p>
                      </div>
                      {report.status === 'PENDING' && (
                        <div className="flex gap-2 mt-3">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => onReportAction(report.id, 'penalize')}
                            disabled={loading}
                          >
                            <Ban className="w-4 h-4 mr-1" />
                            Penalize
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onReportAction(report.id, 'dismiss')}
                            disabled={loading}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Dismiss
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  User Growth
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Chart will be implemented</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Problem Categories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <PieChart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Chart will be implemented</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

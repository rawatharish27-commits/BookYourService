'use client'

import { useState, useEffect, useCallback } from 'react'
import { TabsContent } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  CheckCircle, XCircle, Flag, MessageSquare,
  PhoneCall, Eye, Star, AlertTriangle
} from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { toast } from 'sonner'

// Import modular components
import PreLoginFlow from '@/components/auth/PreLoginFlow'
import LoginScreen from '@/components/auth/LoginScreen'
import HomeScreen from '@/components/common/HomeScreen'
import ProblemList from '@/components/problems/ProblemList'
import PostProblemForm from '@/components/problems/PostProblemForm'
import PaymentSection from '@/components/payments/PaymentSection'
import AdminDashboard from '@/components/admin/AdminDashboard'
import Header from '@/components/common/Header'
import Navigation from '@/components/common/Navigation'
import Footer from '@/components/common/Footer'
import SOSDialog from '@/components/common/SOSDialog'

// Import types
import type {
  User,
  Problem,
  Payment,
  AdminStats,
  LoginScreenProps,
  HomeScreenProps,
  ProblemListProps
} from '@/lib/types'

export default function App() {
  // Global State
  const { user, isAuthenticated, setUser, logout, updateUserLocation } = useAppStore()

  // Local State
  const [loading, setLoading] = useState(false)
  const [currentTab, setCurrentTab] = useState('home')

  // Login State
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [name, setName] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [receivedOtp, setReceivedOtp] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)

  // Referral State
  const [showPreLogin, setShowPreLogin] = useState(true)
  const [tempReferralCode, setTempReferralCode] = useState<string>('')

  // Problems State
  const [problems, setProblems] = useState<Problem[]>([])
  const [myProblems, setMyProblems] = useState<Problem[]>([])
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedRisk, setSelectedRisk] = useState<string>('all')

  // Payment State
  const [payments, setPayments] = useState<Payment[]>([])
  const [pendingPayments, setPendingPayments] = useState<Payment[]>([])

  // Admin State
  const [adminStats, setAdminStats] = useState({
    totalUsers: 0, activePaidUsers: 0, todayProblems: 0, pendingPayments: 0,
    flaggedUsers: 0, openProblems: 0, totalPayments: 0, totalRevenue: 0, pendingReports: 0
  })
  const [adminUsers, setAdminUsers] = useState<any[]>([])
  const [adminReports, setAdminReports] = useState<any[]>([])
  const [adminProblems, setAdminProblems] = useState<Problem[]>([])
  const [adminTab, setAdminTab] = useState<'overview' | 'payments' | 'users' | 'reports' | 'problems'>('overview')
  const [userSearchQuery, setUserSearchQuery] = useState('')
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [userActionDialog, setUserActionDialog] = useState(false)
  const [reportActionDialog, setReportActionDialog] = useState(false)
  const [selectedReport, setSelectedReport] = useState<any>(null)
  const [adminNotes, setAdminNotes] = useState('')

  // Location State
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)

  // Dialog State
  const [showReportDialog, setShowReportDialog] = useState(false)
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false)
  const [showSOSDialog, setShowSOSDialog] = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [reportCategory, setReportCategory] = useState('OTHER')
  const [feedbackRating, setFeedbackRating] = useState(5)
  const [feedbackComment, setFeedbackComment] = useState('')
  const [helperReached, setHelperReached] = useState<boolean | null>(null)

  // Computed Values
  const isUserActive = user?.paymentActive && user?.activeTill && new Date(user.activeTill) > new Date()

  // Handle tab change
  const handleTabChange = (tab: string) => {
    if (tab === 'logout') {
      logout()
    } else {
      setCurrentTab(tab)
    }
  }

  // API Functions
  const sendOtp = async (phoneNum: string, otpCode: string) => {
    setPhone(phoneNum)
    setReceivedOtp(otpCode)
    setOtpSent(true)
  }

  const verifyOtp = async (phoneNum: string, code: string, userName: string) => {
    setLoading(true)
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneNum, code, name: userName, tempReferralCode })
      })
      const data = await res.json()
      if (data.success) {
        setUser(data.user)
        toast.success('🎉 Welcome to Help2Earn!')
        if (data.user.isAdmin) toast.info('Admin Access Active!')
      } else {
        toast.error(data.error || 'Galat OTP!')
      }
    } catch {
      toast.error('Verification failed!')
    } finally {
      setLoading(false)
    }
  }

  const fetchNearbyProblems = useCallback(async () => {
    if (!user || !userLocation) return
    try {
      const res = await fetch(`/api/problems/nearby?userId=${user.id}&lat=${userLocation.lat}&lng=${userLocation.lng}`)
      const data = await res.json()
      if (data.problems) setProblems(data.problems)
    } catch {
      toast.error('Problems load nahi ho paaye')
    }
  }, [user, userLocation])

  const fetchMyProblems = useCallback(async () => {
    if (!user) return
    try {
      const res = await fetch(`/api/problems?userId=${user.id}`)
      const data = await res.json()
      if (data.problems) setMyProblems(data.problems)
    } catch {
      toast.error('Posts load nahi ho paaye')
    }
  }, [user])

  const fetchPayments = useCallback(async () => {
    if (!user) return
    try {
      const res = await fetch(`/api/payments?userId=${user.id}`)
      const data = await res.json()
      if (data.payments) setPayments(data.payments)
    } catch {
      toast.error('Payments load nahi ho paaye')
    }
  }, [user])

  const fetchAdminData = useCallback(async () => {
    if (!user?.isAdmin) return
    try {
      const [statsRes, paymentsRes, usersRes, reportsRes, problemsRes] = await Promise.all([
        fetch(`/api/admin/stats?adminId=${user.id}`),
        fetch(`/api/admin/payments?adminId=${user.id}&status=PENDING`),
        fetch(`/api/admin/users?adminId=${user.id}`),
        fetch(`/api/admin/reports?adminId=${user.id}&status=PENDING`),
        fetch(`/api/admin/problems?adminId=${user.id}&status=OPEN`)
      ])
      const [statsData, paymentsData, usersData, reportsData, problemsData] = await Promise.all([
        statsRes.json(), paymentsRes.json(), usersRes.json(), reportsRes.json(), problemsRes.json()
      ])
      if (statsData.stats) setAdminStats(statsData.stats)
      if (paymentsData.payments) setPendingPayments(paymentsData.payments)
      if (usersData.users) setAdminUsers(usersData.users)
      if (reportsData.reports) setAdminReports(reportsData.reports)
      if (problemsData.problems) setAdminProblems(problemsData.problems)
    } catch {
      toast.error('Admin data load error')
    }
  }, [user])

  // Get User Location
  useEffect(() => {
    if (isAuthenticated && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          setUserLocation({ lat: latitude, lng: longitude })
          updateUserLocation(latitude, longitude)
          if (user) {
            try {
              await fetch('/api/users/location', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, latitude, longitude })
              })
            } catch (e) { console.error('Location error:', e) }
          }
        },
        () => toast.error('GPS enable karein better results ke liye!'),
        { enableHighAccuracy: true, timeout: 10000 }
      )
    }
  }, [isAuthenticated])

  // Fetch data on tab change
  useEffect(() => {
    if (isAuthenticated && user) {
      if (currentTab === 'problems') { fetchNearbyProblems(); fetchMyProblems() }
      else if (currentTab === 'payment') fetchPayments()
      else if (currentTab === 'admin' && user.isAdmin) fetchAdminData()
    }
  }, [currentTab, isAuthenticated, user, fetchNearbyProblems, fetchMyProblems, fetchPayments, fetchAdminData])

  // Login Screen
  if (!isAuthenticated) {
    if (showPreLogin) {
      return (
        <PreLoginFlow
          onProceedToLogin={(tempCode) => {
            setTempReferralCode(tempCode)
            setShowPreLogin(false)
          }}
        />
      )
    }
    return (
      <LoginScreen
        onOtpSent={sendOtp}
        onVerifyOtp={verifyOtp}
        loading={loading}
      />
    )
  }

  // Main App
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <Header
        user={user}
        isUserActive={isUserActive}
        onLogout={logout}
      />

      {/* Navigation */}
      <Navigation
        currentTab={currentTab}
        onTabChange={handleTabChange}
        user={user}
        isUserActive={isUserActive}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full p-3">
        {/* HOME TAB */}
        <TabsContent value="home" className="animate-fade-in">
          <HomeScreen
            user={user}
            isUserActive={isUserActive}
            onTabChange={setCurrentTab}
          />
        </TabsContent>

        {/* PROBLEMS TAB */}
        <TabsContent value="problems" className="animate-fade-in">
          <ProblemList
            problems={problems}
            myProblems={myProblems}
            user={user}
            userLocation={userLocation}
            onSelectProblem={setSelectedProblem}
            onReport={() => setShowReportDialog(true)}
            onFeedback={() => setShowFeedbackDialog(true)}
          />
        </TabsContent>

        {/* POST TAB */}
        <TabsContent value="post" className="animate-fade-in">
          <PostProblemForm
            onSubmit={async (problem) => {
              if (!user || !userLocation) return
              setLoading(true)
              try {
                const res = await fetch('/api/problems', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    userId: user.id,
                    type: problem.type,
                    title: problem.title,
                    description: problem.description,
                    offerPrice: problem.offerPrice ? parseFloat(problem.offerPrice) : null,
                    locationText: problem.locationText,
                    latitude: userLocation.lat,
                    longitude: userLocation.lng
                  })
                })
                const data = await res.json()
                if (data.success) {
                  toast.success('Problem post ho gaya! 🎉')
                  fetchMyProblems()
                  setCurrentTab('problems')
                } else {
                  toast.error(data.error || 'Post fail!')
                }
              } catch {
                toast.error('Error!')
              } finally {
                setLoading(false)
              }
            }}
            loading={loading}
          />
        </TabsContent>

        {/* PAYMENT TAB */}
        <TabsContent value="payment" className="animate-fade-in">
          <PaymentSection
            payments={payments}
            isUserActive={isUserActive}
            loading={loading}
            setLoading={setLoading}
            onPaymentRequest={fetchPayments}
          />
        </TabsContent>

        {/* ADMIN TAB */}
        {user?.isAdmin && (
          <TabsContent value="admin" className="animate-fade-in">
            <AdminDashboard
              adminStats={adminStats}
              pendingPayments={pendingPayments}
              adminUsers={adminUsers}
              adminReports={adminReports}
              adminProblems={adminProblems}
              adminTab={adminTab}
              setAdminTab={setAdminTab}
              userSearchQuery={userSearchQuery}
              setUserSearchQuery={setUserSearchQuery}
              selectedUser={selectedUser}
              setSelectedUser={setSelectedUser}
              userActionDialog={userActionDialog}
              setUserActionDialog={setUserActionDialog}
              reportActionDialog={reportActionDialog}
              setReportActionDialog={setReportActionDialog}
              selectedReport={selectedReport}
              setSelectedReport={setSelectedReport}
              adminNotes={adminNotes}
              setAdminNotes={setAdminNotes}
              loading={loading}
              setLoading={setLoading}
              onRefresh={fetchAdminData}
            />
          </TabsContent>
        )}
      </main>

      {/* Footer */}
      <Footer onSOS={() => setShowSOSDialog(true)} />

      {/* Problem Detail Dialog */}
      <Dialog open={!!selectedProblem && !showFeedbackDialog} onOpenChange={() => setSelectedProblem(null)}>
        <DialogContent className="max-w-md">
          {selectedProblem && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">{selectedProblem.title}</DialogTitle>
                <DialogDescription>
                  <div className="flex gap-2 mt-2">
                    <Badge>{selectedProblem.type}</Badge>
                    <Badge variant="outline">{selectedProblem.riskLevel} Risk</Badge>
                  </div>
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <p className="text-gray-600">{selectedProblem.description}</p>
                <div className="flex flex-wrap gap-2">
                  {selectedProblem.offerPrice && <Badge className="bg-green-500 text-white">₹{selectedProblem.offerPrice}</Badge>}
                  <Badge variant="outline">Views: {selectedProblem.viewCount}</Badge>
                </div>
                {selectedProblem.locationText && <p className="text-sm text-gray-500">📍 {selectedProblem.locationText}</p>}
              </div>
              <DialogFooter className="flex-col gap-2">
                <Button className="w-full bg-gradient-to-r from-emerald-500 to-teal-500" onClick={() => window.open(`tel:+91${selectedProblem.user.phone}`)}>
                  <PhoneCall className="w-4 h-4 mr-2" /> Call Now
                </Button>
                <Button variant="outline" className="w-full" onClick={() => setShowReportDialog(true)}>
                  <Flag className="w-4 h-4 mr-2" /> Report
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Report Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>🚨 Report Problem</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="report-category" className="text-sm font-medium">Category</label>
              <select
                id="report-category"
                value={reportCategory}
                onChange={(e) => setReportCategory(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="NO_SHOW">No Show</option>
                <option value="MISBEHAVIOR">Misbehavior</option>
                <option value="FRAUD">Fraud</option>
                <option value="SAFETY">Safety Concern</option>
                <option value="SPAM">Spam</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Reason</label>
              <Textarea placeholder="Issue describe karo..." value={reportReason} onChange={(e) => setReportReason(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReportDialog(false)}>Cancel</Button>
            <Button onClick={() => selectedProblem && submitReport(selectedProblem.userId)} disabled={!reportReason || loading}>Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Feedback Dialog */}
      <Dialog open={showFeedbackDialog} onOpenChange={setShowFeedbackDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>⭐ Feedback & Resolution</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Helper ne madad ki?</label>
              <div className="flex gap-2">
                <Button variant={helperReached === true ? 'default' : 'outline'} className="flex-1" onClick={() => setHelperReached(true)}>
                  <CheckCircle className="w-4 h-4 mr-1" /> Haan
                </Button>
                <Button variant={helperReached === false ? 'destructive' : 'outline'} className="flex-1" onClick={() => setHelperReached(false)}>
                  <XCircle className="w-4 h-4 mr-1" /> Nahi
                </Button>
              </div>
            </div>
            {helperReached === true && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Rating</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Button key={star} variant="ghost" size="icon" onClick={() => setFeedbackRating(star)} >
                        <Star className={`w-7 h-7 ${star <= feedbackRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Comment (Optional)</label>
                  <Textarea placeholder="Experience kaisa raha?" value={feedbackComment} onChange={(e) => setFeedbackComment(e.target.value)} />
                </div>
              </>
            )}
            {helperReached === false && (
              <Alert className="bg-red-50 border-red-200">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <AlertTitle>No-show Report</AlertTitle>
                <AlertDescription>Helper ka trust score -10 hoga.</AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFeedbackDialog(false)}>Cancel</Button>
            <Button onClick={() => selectedProblem && submitFeedback(selectedProblem.id, selectedProblem.userId)} disabled={helperReached === null || loading}>Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* SOS Dialog */}
      <SOSDialog open={showSOSDialog} onOpenChange={setShowSOSDialog} />
    </div>
  )

  // Helper functions
  async function submitReport(reportedId: string) {
    if (!user || !reportReason) { toast.error('Reason daalen!'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reporterId: user.id, reportedId, reason: reportReason, category: reportCategory })
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Report submit ho gaya!')
        setShowReportDialog(false)
        setReportReason('')
        setReportCategory('OTHER')
      } else {
        toast.error(data.error || 'Report fail!')
      }
    } catch {
      toast.error('Error!')
    } finally {
      setLoading(false)
    }
  }

  async function submitFeedback(problemId: string, helperId: string) {
    if (!user || helperReached === null) { toast.error('Confirm karein!'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problemId, helperId, clientId: user.id, rating: feedbackRating, comment: feedbackComment, helperReached })
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Feedback diya! 🌟')
        setShowFeedbackDialog(false)
        setFeedbackRating(5)
        setFeedbackComment('')
        setHelperReached(null)
        fetchMyProblems()
      } else {
        toast.error(data.error || 'Feedback fail!')
      }
    } catch {
      toast.error('Error!')
    } finally {
      setLoading(false)
    }
  }
}

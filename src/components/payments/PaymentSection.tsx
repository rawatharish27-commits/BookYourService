'use client'

import { useState } from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { CreditCard, Calendar, CheckCircle, AlertCircle, IndianRupee, Star } from 'lucide-react'
import { formatCurrency } from '@/lib/store'
import type { User as UserType } from '@/lib/store'

interface Payment {
  id: string
  userId: string
  amount: number
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  month: number
  year: number
  createdAt: string
}

interface PaymentSectionProps {
  user: UserType | null
  payments: Payment[]
  onPaymentRequest: (month: number, year: number) => void
  loading: boolean
}

export default function PaymentSection({ user, payments, onPaymentRequest, loading }: PaymentSectionProps) {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  const SUBSCRIPTION_INFO = {
    price: 49,
    duration: '1 Month',
    features: [
      '20 KM radius visibility',
      'Unlimited help requests',
      'Direct phone contact',
      'Trust score system',
      '24/7 support'
    ]
  }

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const years = Array.from({ length: 3 }, (_, i) => new Date().getFullYear() + i)

  const hasActiveSubscription = user?.paymentActive && user.activeTill && new Date(user.activeTill) > new Date()

  const currentMonthPayment = payments.find(p =>
    p.month === selectedMonth && p.year === selectedYear
  )

  const handlePaymentRequest = () => {
    onPaymentRequest(selectedMonth, selectedYear)
  }

  return (
    <div className="space-y-4">
      {/* Subscription Status */}
      <Card className="shadow-xl overflow-hidden">
        <div className={`h-1 ${hasActiveSubscription ? 'bg-green-400' : 'bg-red-400'}`} />
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <CreditCard className="w-6 h-6 text-emerald-500" />
            Subscription Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {hasActiveSubscription ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border-2 border-green-200">
                <CheckCircle className="w-8 h-8 text-green-500" />
                <div>
                  <p className="font-bold text-green-700 text-lg">Active Subscription</p>
                  <p className="text-sm text-green-600">
                    Valid till: {user?.activeTill ? new Date(user.activeTill).toLocaleDateString('en-IN') : 'N/A'}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-emerald-50 rounded-lg text-center">
                  <Star className="w-6 h-6 mx-auto text-emerald-500 mb-1" />
                  <p className="font-bold text-emerald-700">20 KM</p>
                  <p className="text-xs text-emerald-600">Visibility</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg text-center">
                  <IndianRupee className="w-6 h-6 mx-auto text-blue-500 mb-1" />
                  <p className="font-bold text-blue-700">₹{SUBSCRIPTION_INFO.price}</p>
                  <p className="text-xs text-blue-600">Monthly</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl border-2 border-red-200">
                <AlertCircle className="w-8 h-8 text-red-500" />
                <div>
                  <p className="font-bold text-red-700 text-lg">No Active Subscription</p>
                  <p className="text-sm text-red-600">Limited visibility - only 5 KM radius</p>
                </div>
              </div>
              <Alert className="bg-amber-50 border-amber-200">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                <AlertTitle>Upgrade Required</AlertTitle>
                <AlertDescription>
                  Subscribe for ₹{SUBSCRIPTION_INFO.price}/month to get 20 KM visibility and unlimited features.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Request */}
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Calendar className="w-6 h-6 text-blue-500" />
            Payment Request
          </CardTitle>
          <p className="text-gray-600">Select month and request payment</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="font-medium">Month</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="w-full p-3 border rounded-lg"
              >
                {months.map((month, index) => (
                  <option key={index + 1} value={index + 1}>{month}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="font-medium">Year</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="w-full p-3 border rounded-lg"
              >
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>

          {currentMonthPayment && (
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Status for {months[selectedMonth - 1]} {selectedYear}</span>
                <Badge variant={
                  currentMonthPayment.status === 'APPROVED' ? 'default' :
                  currentMonthPayment.status === 'PENDING' ? 'secondary' : 'destructive'
                }>
                  {currentMonthPayment.status}
                </Badge>
              </div>
              <p className="text-sm text-gray-600">
                Amount: ₹{currentMonthPayment.amount} | Requested: {new Date(currentMonthPayment.createdAt).toLocaleDateString()}
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button
            className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-500 font-semibold text-lg"
            onClick={handlePaymentRequest}
            disabled={loading || !!currentMonthPayment}
          >
            {loading ? '⏳ Requesting...' : currentMonthPayment ? 'Already Requested' : '💳 Request Payment'}
          </Button>
        </CardFooter>
      </Card>

      {/* Payment History */}
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <IndianRupee className="w-6 h-6 text-green-500" />
            Payment History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="text-center py-8">
              <IndianRupee className="w-12 h-12 mx-auto text-gray-300 mb-2" />
              <p className="text-gray-500">No payment requests yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {payments.slice(0, 5).map((payment) => (
                <div key={payment.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{months[payment.month - 1]} {payment.year}</p>
                    <p className="text-sm text-gray-500">{new Date(payment.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">₹{payment.amount}</p>
                    <Badge variant={
                      payment.status === 'APPROVED' ? 'default' :
                      payment.status === 'PENDING' ? 'secondary' : 'destructive'
                    } className="text-xs">
                      {payment.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Subscription Benefits */}
      <Card className="shadow-xl bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl text-emerald-700">
            <Star className="w-6 h-6 text-emerald-500" />
            Premium Benefits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {SUBSCRIPTION_INFO.features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-white/60 rounded-lg">
                <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <span className="text-sm font-medium">{feature}</span>
              </div>
            ))}
          </div>
          <Separator className="my-4" />
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-700">₹{SUBSCRIPTION_INFO.price}/month</p>
            <p className="text-sm text-emerald-600">Cancel anytime</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

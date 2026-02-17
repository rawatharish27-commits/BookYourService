'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  CreditCard, Smartphone, CheckCircle, AlertTriangle,
  Info, Shield, Clock, IndianRupee
} from 'lucide-react'
import { SUBSCRIPTION_INFO } from '@/lib/store'

interface PaymentInstructionScreenProps {
  open: boolean
  onProceedToPayment: () => void
  onCancel: () => void
}

export default function PaymentInstructionScreen({
  open,
  onProceedToPayment,
  onCancel
}: PaymentInstructionScreenProps) {
  const [hasReadInstructions, setHasReadInstructions] = useState(false)

  const handleProceed = () => {
    if (!hasReadInstructions) {
      alert('Please read and acknowledge the payment instructions first.')
      return
    }
    onProceedToPayment()
  }

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <CreditCard className="w-6 h-6 text-emerald-500" />
            Payment Instructions
          </DialogTitle>
          <DialogDescription>
            Please read these instructions carefully before making payment.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Subscription Details */}
          <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-lg text-emerald-800">Help2Earn Subscription</h3>
                  <p className="text-emerald-600">Unlock full app features</p>
                </div>
                <Badge className="bg-emerald-500 text-white text-lg px-3 py-1">
                  ₹{SUBSCRIPTION_INFO.price}/{SUBSCRIPTION_INFO.duration} days
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {SUBSCRIPTION_INFO.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Important Notices */}
          <Alert className="border-amber-200 bg-amber-50">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <AlertTitle className="text-amber-800">Important: Read Carefully</AlertTitle>
            <AlertDescription className="text-amber-700">
              <div className="space-y-2 mt-2">
                <p><strong>App sirf connect karta hai:</strong> Help2Earn only connects helpers with those who need help. We do not provide services ourselves.</p>
                <p><strong>Payment app ke bahar hota hai:</strong> All payments happen directly between users outside this app. We do not handle or process payments.</p>
                <p><strong>Price aap khud decide karte ho:</strong> Helper and client agree on price mutually. We have no control over pricing.</p>
                <p><strong>Emergency me police contact karein:</strong> For emergencies, contact local police directly. We are not an emergency service.</p>
              </div>
            </AlertDescription>
          </Alert>

          {/* Payment Process */}
          <Card>
            <CardContent className="pt-4">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-blue-500" />
                Payment Process
              </h4>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                    1
                  </div>
                  <div>
                    <p className="font-medium">Complete Subscription Payment</p>
                    <p className="text-sm text-gray-600">Pay ₹{SUBSCRIPTION_INFO.price} for {SUBSCRIPTION_INFO.duration}-day access</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                    2
                  </div>
                  <div>
                    <p className="font-medium">Admin Approval</p>
                    <p className="text-sm text-gray-600">Our team verifies payment within 24 hours</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Access Unlocked</p>
                    <p className="text-sm text-gray-600">Post unlimited requests and view all nearby help</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Safety */}
          <Card>
            <CardContent className="pt-4">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-500" />
                Payment Safety & Trust
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Trust score system protects both parties</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Report system for unfair practices</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Phone numbers verified for security</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Admin monitoring 24/7</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pending Status Info */}
          <Alert>
            <Clock className="w-4 h-4" />
            <AlertTitle>PAYMENT_PENDING Status</AlertTitle>
            <AlertDescription>
              After payment, your account shows "PAYMENT_PENDING" until admin approval.
              This usually takes 2-24 hours. You'll receive a notification once approved.
            </AlertDescription>
          </Alert>

          {/* Acknowledgment */}
          <Card className="border-2 border-dashed">
            <CardContent className="pt-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasReadInstructions}
                  onChange={(e) => setHasReadInstructions(e.target.checked)}
                  className="mt-1 w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                />
                <div>
                  <p className="font-medium text-gray-900">I have read and understood:</p>
                  <ul className="text-sm text-gray-600 mt-2 space-y-1">
                    <li>• Help2Earn only connects users, doesn't provide services</li>
                    <li>• All payments happen outside the app</li>
                    <li>• Pricing is decided mutually by users</li>
                    <li>• For emergencies, contact police directly</li>
                    <li>• Payment approval takes 2-24 hours</li>
                  </ul>
                </div>
              </label>
            </CardContent>
          </Card>

          <Separator />

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onCancel}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleProceed}
              disabled={!hasReadInstructions}
              className="flex-1 bg-emerald-500 hover:bg-emerald-600"
            >
              <IndianRupee className="w-4 h-4 mr-2" />
              Proceed to Payment
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

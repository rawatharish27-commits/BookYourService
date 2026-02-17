'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Info, AlertTriangle, Shield, Phone } from 'lucide-react'

export default function UserCommunication() {
  return (
    <div className="space-y-4">
      {/* App Role Clarification */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">App sirf connect karta hai</h4>
              <p className="text-sm text-blue-800">
                Help2Earn sirf helpers aur un logon ko connect karta hai jo madad ki zaroorat mein hain.
                Hum khud koi bhi services provide nahi karte.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Clarification */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-green-900 mb-2">Payment app ke bahar hota hai</h4>
              <p className="text-sm text-green-800">
                Saari payments helpers aur clients ke beech directly hoti hai, is app ke bahar.
                Hum koi bhi payment process nahi karte ya handle nahi karte.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Price Setting */}
      <Card className="border-purple-200 bg-purple-50">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <Badge className="bg-purple-500 text-white mt-0.5 flex-shrink-0">₹</Badge>
            <div>
              <h4 className="font-semibold text-purple-900 mb-2">Price aap khud decide karte ho</h4>
              <p className="text-sm text-purple-800">
                Helper aur client mutually price decide karte hain. Hum koi control nahi rakhte pricing pe.
                Sab kuch aapke beech mutual agreement se hota hai.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contact */}
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <Phone className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-red-900 mb-2">Emergency me police contact karein</h4>
              <p className="text-sm text-red-800 mb-2">
                Emergency situations mein directly police se contact karein. Hum emergency service nahi hain.
              </p>
              <div className="flex gap-2">
                <Badge variant="outline" className="border-red-300 text-red-700">
                  Police: 100
                </Badge>
                <Badge variant="outline" className="border-red-300 text-red-700">
                  Emergency: 112
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legal Compliance Notice */}
      <Alert className="border-amber-200 bg-amber-50">
        <AlertTriangle className="w-4 h-4 text-amber-500" />
        <AlertTitle className="text-amber-800">Legal & Safety Notice</AlertTitle>
        <AlertDescription className="text-amber-700">
          <div className="space-y-2 text-sm">
            <p>• This app follows all Indian laws and regulations</p>
            <p>• We maintain user privacy and data protection</p>
            <p>• Trust score system ensures community safety</p>
            <p>• Report any suspicious activity immediately</p>
            <p>• Admin monitoring is active 24/7</p>
          </div>
        </AlertDescription>
      </Alert>

      {/* Income Disclaimer */}
      <Alert className="border-gray-200 bg-gray-50">
        <Info className="w-4 h-4 text-gray-500" />
        <AlertTitle className="text-gray-800">Income Disclaimer</AlertTitle>
        <AlertDescription className="text-gray-700">
          <p className="text-sm">
            Help2Earn does not guarantee any income or employment opportunities.
            Earnings depend on various factors including location, skills, and market conditions.
            This platform is for connecting people who need help with those who can provide it.
          </p>
        </AlertDescription>
      </Alert>
    </div>
  )
}

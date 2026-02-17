'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Star, Flag, CheckCircle, AlertTriangle,
  ThumbsUp, ThumbsDown, MessageSquare
} from 'lucide-react'
import { toast } from 'sonner'

interface FeedbackDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  helpId: string
  helperName: string
  helperPhone: string
  onFeedbackSubmitted: (feedback: {
    reached: boolean
    rating: number
    reportReason?: string
    comments?: string
  }) => void
}

export default function FeedbackDialog({
  open,
  onOpenChange,
  helpId,
  helperName,
  helperPhone,
  onFeedbackSubmitted
}: FeedbackDialogProps) {
  const [reached, setReached] = useState<boolean | null>(null)
  const [rating, setRating] = useState(0)
  const [reportReason, setReportReason] = useState('')
  const [comments, setComments] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (reached === null) {
      toast.error('Please select whether you reached the helper or not.')
      return
    }

    if (reached && rating === 0) {
      toast.error('Please provide a rating for the helper.')
      return
    }

    setIsSubmitting(true)

    try {
      await onFeedbackSubmitted({
        reached: reached,
        rating: reached ? rating : 0,
        reportReason: !reached ? reportReason : undefined,
        comments
      })

      toast.success('Feedback submitted successfully!')
      onOpenChange(false)

      // Reset form
      setReached(null)
      setRating(0)
      setReportReason('')
      setComments('')

    } catch (error) {
      toast.error('Failed to submit feedback. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const reportReasons = [
    'Did not show up',
    'Rude behavior',
    'Overcharged',
    'Poor service quality',
    'Safety concern',
    'Other'
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-500" />
            Help Completed
          </DialogTitle>
          <DialogDescription>
            How was your experience with {helperName}?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Reached Question */}
          <div>
            <Label className="text-base font-medium mb-3 block">
              Did you successfully reach the helper?
            </Label>
            <div className="flex gap-3">
              <Button
                variant={reached === true ? 'default' : 'outline'}
                onClick={() => setReached(true)}
                className="flex-1"
              >
                <ThumbsUp className="w-4 h-4 mr-2" />
                Yes, Reached
              </Button>
              <Button
                variant={reached === false ? 'destructive' : 'outline'}
                onClick={() => setReached(false)}
                className="flex-1"
              >
                <ThumbsDown className="w-4 h-4 mr-2" />
                Did Not Reach
              </Button>
            </div>
          </div>

          {/* Rating Section */}
          {reached === true && (
            <Card>
              <CardContent className="pt-4">
                <Label className="text-base font-medium mb-3 block">
                  Rate your experience (1-5 stars)
                </Label>
                <div className="flex gap-1 justify-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= rating
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <p className="text-center text-sm text-gray-600 mt-2">
                    {rating === 1 && 'Poor'}
                    {rating === 2 && 'Below Average'}
                    {rating === 3 && 'Average'}
                    {rating === 4 && 'Good'}
                    {rating === 5 && 'Excellent'}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Report Section */}
          {reached === false && (
            <Card className="border-red-200">
              <CardContent className="pt-4">
                <Label className="text-base font-medium mb-3 block flex items-center gap-2">
                  <Flag className="w-4 h-4 text-red-500" />
                  Report Reason
                </Label>
                <div className="space-y-2">
                  {reportReasons.map((reason) => (
                    <button
                      key={reason}
                      onClick={() => setReportReason(reason)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        reportReason === reason
                          ? 'border-red-500 bg-red-50 text-red-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {reason}
                    </button>
                  ))}
                </div>
                {reportReason && (
                  <Alert className="mt-3 border-amber-200 bg-amber-50">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <AlertTitle>Report Notice</AlertTitle>
                    <AlertDescription className="text-sm">
                      This report will be reviewed by our admin team. False reports may affect your trust score.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}

          {/* Comments */}
          <div>
            <Label htmlFor="comments" className="text-base font-medium mb-2 block">
              Additional Comments (Optional)
            </Label>
            <Textarea
              id="comments"
              placeholder="Share your experience or suggestions..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={3}
            />
          </div>

          <Separator />

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || reached === null}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Submit Feedback
              </>
            )}
          </Button>

          <p className="text-xs text-gray-500 text-center">
            Your feedback helps maintain quality and trust in our community.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

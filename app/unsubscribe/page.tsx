"use client"

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, XCircle, Mail, Shield } from 'lucide-react'

export default function UnsubscribePage() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email')
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'not-found'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!email) {
      setStatus('not-found')
      setMessage('No email address provided')
      return
    }

    // In a real implementation, you would verify the email and handle unsubscribe
    // For now, we'll simulate the process
    const handleUnsubscribe = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Here you would call your API to unsubscribe the user
        // const response = await fetch('/api/unsubscribe', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ email })
        // })
        
        setStatus('success')
        setMessage('You have been successfully unsubscribed from email notifications.')
      } catch (error) {
        setStatus('error')
        setMessage('An error occurred while processing your request.')
      }
    }

    handleUnsubscribe()
  }, [email])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Mail className="w-6 h-6 text-blue-600" />
            </div>
            <CardTitle>Processing Unsubscribe Request</CardTitle>
            <CardDescription>
              Please wait while we process your request...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {status === 'success' ? (
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          ) : status === 'error' ? (
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          ) : (
            <div className="mx-auto w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-yellow-600" />
            </div>
          )}
          
          <CardTitle>
            {status === 'success' ? 'Successfully Unsubscribed' : 
             status === 'error' ? 'Error Processing Request' : 
             'Invalid Request'}
          </CardTitle>
          <CardDescription>
            {status === 'success' ? 'You will no longer receive email notifications from JobMatch AI.' :
             status === 'error' ? 'Please try again or contact support if the problem persists.' :
             'The unsubscribe link is invalid or has expired.'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              {message}
            </AlertDescription>
          </Alert>
          
          {email && (
            <div className="text-sm text-gray-600 text-center">
              Email: <span className="font-mono">{email}</span>
            </div>
          )}
          
          <div className="space-y-2">
            <Button 
              className="w-full" 
              onClick={() => window.location.href = '/'}
            >
              Return to Home
            </Button>
            
            {status === 'success' && (
              <Button 
                className="w-full bg-gray-100 text-gray-900 hover:bg-gray-200"
                onClick={() => {
                  // In a real implementation, this would resubscribe the user
                  alert('Resubscribe functionality would be implemented here')
                }}
              >
                Resubscribe to Notifications
              </Button>
            )}
          </div>
          
          <div className="text-xs text-gray-500 text-center">
            <p>If you have any questions, please contact our support team.</p>
            <p>You can also manage your email preferences in your account settings.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 
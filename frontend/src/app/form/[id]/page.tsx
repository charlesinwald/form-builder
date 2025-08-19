"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { PublicForm } from "@/app/components/public-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Button } from "@/app/components/ui/button"
import { CheckCircle, AlertCircle, Home } from "lucide-react"
import { apiService, Form } from "@/lib/api"
import Link from "next/link"

export default function PublicFormPage() {
  const params = useParams()
  const formId = params.id as string
  
  const [form, setForm] = useState<Form | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    const loadForm = async () => {
      try {
        console.log('Loading form with ID:', formId)
        setLoading(true)
        setError(null)
        const formData = await apiService.getPublicForm(formId)
        console.log('Form data received:', formData)
        setForm(formData)
      } catch (err) {
        console.error('Error loading form:', err)
        setError(err instanceof Error ? err.message : 'Failed to load form')
      } finally {
        setLoading(false)
      }
    }

    if (formId) {
      loadForm()
    }
  }, [formId])

  const handleSubmit = async (data: Record<string, unknown>) => {
    setIsSubmitting(true)
    setSubmitError(null)
    
    try {
      await apiService.submitFormResponse(formId, data)
      setIsSubmitted(true)
    } catch (err) {
      console.error('Error submitting form:', err)
      setSubmitError(err instanceof Error ? err.message : 'Failed to submit form')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    setIsSubmitted(false)
    setSubmitError(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-muted rounded w-3/4 mx-auto"></div>
                <div className="h-8 bg-muted rounded w-1/2 mx-auto"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-full"></div>
                  <div className="h-4 bg-muted rounded w-5/6"></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !form) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-xl">Form Not Found</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              {error || 'The form you are looking for is not available or has been removed.'}
            </p>
            <Link href="/">
              <Button className="gap-2">
                <Home className="h-4 w-4" />
                Go Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-secondary" />
            </div>
            <CardTitle className="text-xl">Thank You!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Your response has been submitted successfully.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button onClick={handleReset} variant="outline">
                Submit Another Response
              </Button>
              <Link href="/">
                <Button className="gap-2 w-full sm:w-auto">
                  <Home className="h-4 w-4" />
                  Go Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <>
      <PublicForm 
        form={form} 
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
      {submitError && (
        <div className="fixed bottom-4 right-4 max-w-sm">
          <Card className="border-destructive">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <p className="text-sm font-medium text-destructive">
                    Submission Failed
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {submitError}
                  </p>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => setSubmitError(null)}
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}
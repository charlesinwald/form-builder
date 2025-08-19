"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Button } from "@/app/components/ui/button"
import { CheckCircle, Home } from "lucide-react"
import Link from "next/link"

interface FormSuccessProps {
  formTitle?: string
  onSubmitAnother?: () => void
}

export function FormSuccess({ formTitle, onSubmitAnother }: FormSuccessProps) {
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
            {formTitle 
              ? `Your response to "${formTitle}" has been submitted successfully.`
              : "Your response has been submitted successfully."
            }
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            {onSubmitAnother && (
              <Button onClick={onSubmitAnother} variant="outline">
                Submit Another Response
              </Button>
            )}
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
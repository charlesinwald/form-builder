"use client"

import type React from "react"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Send, Wifi } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface FormData {
  id: string
  title: string
  description: string
  fields: FormFieldData[]
}

interface FormFieldData {
  id: string
  type: "text" | "textarea" | "select" | "radio" | "checkbox" | "rating"
  label: string
  placeholder?: string
  required: boolean
  options?: string[]
}

interface PublicFormRendererProps {
  formData: FormData
  onSubmissionSuccess: () => void
}

export function PublicFormRenderer({ formData, onSubmissionSuccess }: PublicFormRendererProps) {
  const [responses, setResponses] = useState<Record<string, any>>({})
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { toast } = useToast()

  const updateResponse = (fieldId: string, value: any) => {
    setResponses((prev) => ({ ...prev, [fieldId]: value }))
    // Clear error when user starts typing
    if (errors[fieldId]) {
      setErrors((prev) => ({ ...prev, [fieldId]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    formData.fields.forEach((field) => {
      if (field.required) {
        const value = responses[field.id]
        if (!value || (Array.isArray(value) && value.length === 0) || value === "") {
          newErrors[field.id] = `${field.label} is required`
        }
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast({
        title: "Please fix the errors",
        description: "Some required fields are missing or invalid.",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)

    try {
      // Simulate API submission with real-time update
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // In a real app, you would send the data to your backend:
      // const response = await fetch('/api/forms/submit', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     formId: formData.id,
      //     responses,
      //     submittedAt: new Date().toISOString()
      //   })
      // })

      console.log("Form submitted:", {
        formId: formData.id,
        responses,
        submittedAt: new Date().toISOString(),
      })

      toast({
        title: "Form submitted successfully!",
        description: "Your response will appear in real-time analytics.",
        action: (
          <div className="flex items-center gap-1 text-xs">
            <Wifi className="h-3 w-3" />
            Live
          </div>
        ),
      })

      onSubmissionSuccess()
    } catch (error) {
      toast({
        title: "Submission failed",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const renderField = (field: FormFieldData) => {
    const hasError = !!errors[field.id]

    switch (field.type) {
      case "text":
        return (
          <div className="space-y-2">
            <Input
              placeholder={field.placeholder}
              value={responses[field.id] || ""}
              onChange={(e) => updateResponse(field.id, e.target.value)}
              className={hasError ? "border-destructive focus-visible:ring-destructive" : ""}
            />
            {hasError && <p className="text-sm text-destructive">{errors[field.id]}</p>}
          </div>
        )

      case "textarea":
        return (
          <div className="space-y-2">
            <Textarea
              placeholder={field.placeholder}
              value={responses[field.id] || ""}
              onChange={(e) => updateResponse(field.id, e.target.value)}
              rows={4}
              className={hasError ? "border-destructive focus-visible:ring-destructive" : ""}
            />
            {hasError && <p className="text-sm text-destructive">{errors[field.id]}</p>}
          </div>
        )

      case "select":
        return (
          <div className="space-y-2">
            <Select value={responses[field.id] || ""} onValueChange={(value) => updateResponse(field.id, value)}>
              <SelectTrigger className={hasError ? "border-destructive focus:ring-destructive" : ""}>
                <SelectValue placeholder="Select an option..." />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option, index) => (
                  <SelectItem key={index} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {hasError && <p className="text-sm text-destructive">{errors[field.id]}</p>}
          </div>
        )

      case "radio":
        return (
          <div className="space-y-3">
            <div className="space-y-2">
              {field.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <input
                    type="radio"
                    id={`${field.id}-${index}`}
                    name={field.id}
                    value={option}
                    checked={responses[field.id] === option}
                    onChange={(e) => updateResponse(field.id, e.target.value)}
                    className="w-4 h-4 text-primary border-border focus:ring-primary focus:ring-2"
                  />
                  <Label htmlFor={`${field.id}-${index}`} className="text-sm font-normal cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
            {hasError && <p className="text-sm text-destructive">{errors[field.id]}</p>}
          </div>
        )

      case "checkbox":
        return (
          <div className="space-y-3">
            <div className="space-y-2">
              {field.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id={`${field.id}-${index}`}
                    value={option}
                    checked={(responses[field.id] || []).includes(option)}
                    onChange={(e) => {
                      const currentValues = responses[field.id] || []
                      const newValues = e.target.checked
                        ? [...currentValues, option]
                        : currentValues.filter((v: string) => v !== option)
                      updateResponse(field.id, newValues)
                    }}
                    className="w-4 h-4 text-primary border-border rounded focus:ring-primary focus:ring-2"
                  />
                  <Label htmlFor={`${field.id}-${index}`} className="text-sm font-normal cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
            {hasError && <p className="text-sm text-destructive">{errors[field.id]}</p>}
          </div>
        )

      case "rating":
        return (
          <div className="space-y-2">
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => updateResponse(field.id, star)}
                  className={`text-3xl transition-colors hover:scale-110 transform ${
                    (responses[field.id] || 0) >= star ? "text-secondary" : "text-muted-foreground hover:text-secondary"
                  }`}
                >
                  ⭐
                </button>
              ))}
              {responses[field.id] && (
                <span className="ml-3 text-sm text-muted-foreground self-center">{responses[field.id]} out of 5</span>
              )}
            </div>
            {hasError && <p className="text-sm text-destructive">{errors[field.id]}</p>}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Form Header */}
          <div className="space-y-3 text-center">
            <h1 className="text-3xl font-serif font-bold text-foreground">{formData.title}</h1>
            {formData.description && <p className="text-muted-foreground text-lg">{formData.description}</p>}
          </div>

          {/* Form Fields */}
          <div className="space-y-6">
            {formData.fields.map((field) => (
              <div key={field.id} className="space-y-3">
                <Label className="text-base font-medium text-foreground">
                  {field.label}
                  {field.required && <span className="text-destructive ml-1">*</span>}
                </Label>
                {renderField(field)}
              </div>
            ))}
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <Button type="submit" disabled={submitting} className="w-full h-12 text-base">
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Submit Response
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

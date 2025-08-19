"use client"

import type React from "react"

import { useState } from "react"
import { Card } from "@/app/components/ui/card"
import { Input } from "@/app/components/ui/input"
import { Textarea } from "@/app/components/ui/textarea"
import { Button } from "@/app/components/ui/button"
import { Label } from "@/app/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select"

interface FormData {
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

interface FormPreviewProps {
  formData: FormData
}

export function FormPreview({ formData }: FormPreviewProps) {
  const [responses, setResponses] = useState<Record<string, any>>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted:", responses)
    // Here you would typically send the data to your backend
  }

  const updateResponse = (fieldId: string, value: any) => {
    setResponses((prev) => ({ ...prev, [fieldId]: value }))
  }

  const renderField = (field: FormFieldData) => {
    switch (field.type) {
      case "text":
        return (
          <Input
            placeholder={field.placeholder}
            value={responses[field.id] || ""}
            onChange={(e) => updateResponse(field.id, e.target.value)}
            required={field.required}
          />
        )
      case "textarea":
        return (
          <Textarea
            placeholder={field.placeholder}
            value={responses[field.id] || ""}
            onChange={(e) => updateResponse(field.id, e.target.value)}
            required={field.required}
            rows={4}
          />
        )
      case "select":
        return (
          <Select
            value={responses[field.id] || ""}
            onValueChange={(value) => updateResponse(field.id, value)}
            required={field.required}
          >
            <SelectTrigger>
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
        )
      case "radio":
        return (
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="radio"
                  id={`${field.id}-${index}`}
                  name={field.id}
                  value={option}
                  checked={responses[field.id] === option}
                  onChange={(e) => updateResponse(field.id, e.target.value)}
                  required={field.required}
                  className="text-primary"
                />
                <Label htmlFor={`${field.id}-${index}`} className="text-sm font-normal">
                  {option}
                </Label>
              </div>
            ))}
          </div>
        )
      case "checkbox":
        return (
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
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
                  className="text-primary"
                />
                <Label htmlFor={`${field.id}-${index}`} className="text-sm font-normal">
                  {option}
                </Label>
              </div>
            ))}
          </div>
        )
      case "rating":
        return (
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => updateResponse(field.id, star)}
                className={`text-2xl ${
                  (responses[field.id] || 0) >= star ? "text-secondary" : "text-muted-foreground"
                } hover:text-secondary transition-colors`}
              >
                ⭐
              </button>
            ))}
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Card className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Form Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-serif font-bold text-foreground">{formData.title}</h1>
            {formData.description && <p className="text-muted-foreground">{formData.description}</p>}
          </div>

          {/* Form Fields */}
          {formData.fields.map((field) => (
            <div key={field.id} className="space-y-2">
              <Label className="text-base font-medium">
                {field.label}
                {field.required && <span className="text-destructive ml-1">*</span>}
              </Label>
              {renderField(field)}
            </div>
          ))}

          {/* Submit Button */}
          {formData.fields.length > 0 && (
            <Button type="submit" className="w-full">
              Submit Response
            </Button>
          )}

          {formData.fields.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No fields added to this form yet.</p>
            </div>
          )}
        </form>
      </Card>
    </div>
  )
}

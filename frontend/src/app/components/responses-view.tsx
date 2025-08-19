"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Button } from "@/app/components/ui/button"
import { Badge } from "@/app/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/components/ui/table"
import { ScrollArea } from "@/app/components/ui/scroll-area"
import { Download, Eye, Calendar, User, Globe } from "lucide-react"
import { Form, FormResponse, apiService } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"

interface ResponsesViewProps {
  form: Form
  onBack: () => void
}

export function ResponsesView({ form, onBack }: ResponsesViewProps) {
  const [responses, setResponses] = useState<FormResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedResponse, setSelectedResponse] = useState<FormResponse | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const loadResponses = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await apiService.getFormResponses(form.id)
        setResponses(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load responses')
      } finally {
        setLoading(false)
      }
    }

    loadResponses()
  }, [form.id])

  const exportToCSV = () => {
    if (responses.length === 0) {
      toast({
        variant: "destructive",
        title: "No data to export",
        description: "There are no responses to export yet.",
      })
      return
    }

    // Get all unique field IDs from all responses
    const allFieldIds = new Set<string>()
    responses.forEach(response => {
      Object.keys(response.data).forEach(fieldId => allFieldIds.add(fieldId))
    })

    // Create headers
    const fieldHeaders = form.fields
      .filter(field => allFieldIds.has(field.id))
      .map(field => field.label)
    const headers = ['Submitted At', 'IP Address', ...fieldHeaders]

    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...responses.map(response => {
        const values = [
          `"${format(new Date(response.createdAt), 'yyyy-MM-dd HH:mm:ss')}"`,
          `"${response.ipAddress}"`,
          ...form.fields
            .filter(field => allFieldIds.has(field.id))
            .map(field => {
              const value = response.data[field.id]
              if (Array.isArray(value)) {
                return `"${value.join(', ')}"`
              }
              return `"${value || ''}"`
            })
        ]
        return values.join(',')
      })
    ].join('\n')

    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${form.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_responses.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Export successful",
      description: `Exported ${responses.length} responses to CSV`,
    })
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <Button variant="outline" onClick={onBack} className="mb-4">
            ← Back to Forms
          </Button>
          <h2 className="text-2xl font-bold">{form.title} - Responses</h2>
        </div>
        
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <Button variant="outline" onClick={onBack} className="mb-4">
          ← Back to Forms
        </Button>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (selectedResponse) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <Button variant="outline" onClick={() => setSelectedResponse(null)} className="mb-4">
            ← Back to Responses
          </Button>
          <h2 className="text-2xl font-bold">Response Details</h2>
          <p className="text-muted-foreground">
            Submitted on {format(new Date(selectedResponse.createdAt), 'PPP at pp')}
          </p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Submission Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Submitted:</span>
                <span>{format(new Date(selectedResponse.createdAt), 'PPP at pp')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">IP Address:</span>
                <span>{selectedResponse.ipAddress}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">User Agent:</span>
                <span className="text-xs break-all">{selectedResponse.userAgent}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Form Data</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {form.fields.map(field => {
                const value = selectedResponse.data[field.id]
                return (
                  <div key={field.id} className="border-b pb-3">
                    <div className="font-medium text-sm text-muted-foreground mb-1">
                      {field.label}
                      {field.required && <span className="text-destructive ml-1">*</span>}
                    </div>
                    <div className="text-sm">
                      {Array.isArray(value) ? (value as string[]).join(', ') : (String(value || 'No response'))}
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Button variant="outline" onClick={onBack} className="mb-4">
          ← Back to Forms
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{form.title} - Responses</h2>
            <p className="text-muted-foreground">
              {responses.length} total response{responses.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex gap-2">
            {responses.length > 0 && (
              <Button onClick={exportToCSV} className="gap-2">
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            )}
          </div>
        </div>
      </div>

      {responses.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Globe className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No responses yet</h3>
            <p className="text-muted-foreground mb-4">
              Share your form to start collecting responses.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Responses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Submitted</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Preview</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {responses.map((response) => (
                    <TableRow key={response.id}>
                      <TableCell>
                        {format(new Date(response.createdAt), 'MMM dd, yyyy HH:mm')}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {response.ipAddress}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {form.fields.slice(0, 2).map(field => {
                            const value = response.data[field.id]
                            if (!value) return null
                            return (
                              <Badge key={field.id} variant="secondary" className="text-xs">
                                {field.label}: {Array.isArray(value) ? value.join(', ') : String(value).slice(0, 20)}
                                {String(value).length > 20 ? '...' : ''}
                              </Badge>
                            )
                          })}
                          {Object.keys(response.data).length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{Object.keys(response.data).length - 2} more
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setSelectedResponse(response)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
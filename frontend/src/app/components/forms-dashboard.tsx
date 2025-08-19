"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FormCard } from "@/components/form-card"
import { CreateFormModal } from "@/components/create-form-modal"
import { DeleteFormModal } from "@/components/delete-form-modal"
import { Plus, Search, Filter, Grid, List } from "lucide-react"

interface FormData {
  id: string
  title: string
  description: string
  fields: FormFieldData[]
  status: "draft" | "published" | "archived"
  createdAt: string
  updatedAt: string
  responseCount: number
}

interface FormFieldData {
  id: string
  type: "text" | "textarea" | "select" | "radio" | "checkbox" | "rating"
  label: string
  placeholder?: string
  required: boolean
  options?: string[]
}

interface FormsDashboardProps {
  onFormSelect: (form: FormData) => void
  onNewForm: () => void
}

export function FormsDashboard({ onFormSelect, onNewForm }: FormsDashboardProps) {
  const [forms, setForms] = useState<FormData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "draft" | "published" | "archived">("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [formToDelete, setFormToDelete] = useState<FormData | null>(null)

  // Mock forms data
  const generateMockForms = (): FormData[] => [
    {
      id: "1",
      title: "Customer Feedback Survey",
      description: "Collect feedback from customers about our services",
      fields: [
        { id: "name", type: "text", label: "Name", required: true },
        { id: "rating", type: "rating", label: "Rating", required: true },
        { id: "feedback", type: "textarea", label: "Feedback", required: false },
      ],
      status: "published",
      createdAt: "2024-01-15T10:00:00Z",
      updatedAt: "2024-01-16T14:30:00Z",
      responseCount: 47,
    },
    {
      id: "2",
      title: "Employee Satisfaction Survey",
      description: "Annual employee satisfaction and engagement survey",
      fields: [
        {
          id: "department",
          type: "select",
          label: "Department",
          required: true,
          options: ["HR", "Engineering", "Sales"],
        },
        { id: "satisfaction", type: "rating", label: "Job Satisfaction", required: true },
        { id: "comments", type: "textarea", label: "Comments", required: false },
      ],
      status: "draft",
      createdAt: "2024-01-14T09:00:00Z",
      updatedAt: "2024-01-17T11:15:00Z",
      responseCount: 0,
    },
    {
      id: "3",
      title: "Product Feature Request",
      description: "Gather feature requests and suggestions from users",
      fields: [
        { id: "feature", type: "text", label: "Feature Request", required: true },
        { id: "priority", type: "radio", label: "Priority", required: true, options: ["Low", "Medium", "High"] },
        { id: "description", type: "textarea", label: "Description", required: true },
      ],
      status: "published",
      createdAt: "2024-01-12T16:00:00Z",
      updatedAt: "2024-01-15T10:45:00Z",
      responseCount: 23,
    },
    {
      id: "4",
      title: "Event Registration Form",
      description: "Registration form for upcoming company events",
      fields: [
        { id: "name", type: "text", label: "Full Name", required: true },
        { id: "email", type: "text", label: "Email", required: true },
        {
          id: "dietary",
          type: "checkbox",
          label: "Dietary Restrictions",
          required: false,
          options: ["Vegetarian", "Vegan", "Gluten-free"],
        },
      ],
      status: "archived",
      createdAt: "2024-01-10T12:00:00Z",
      updatedAt: "2024-01-13T08:20:00Z",
      responseCount: 156,
    },
  ]

  useEffect(() => {
    const fetchForms = async () => {
      setLoading(true)
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setForms(generateMockForms())
      setLoading(false)
    }

    fetchForms()
  }, [])

  const filteredForms = forms.filter((form) => {
    const matchesSearch =
      form.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      form.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || form.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleCreateForm = (formData: Partial<FormData>) => {
    const newForm: FormData = {
      id: Date.now().toString(),
      title: formData.title || "Untitled Form",
      description: formData.description || "",
      fields: [],
      status: "draft",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      responseCount: 0,
    }
    setForms((prev) => [newForm, ...prev])
    onFormSelect(newForm)
  }

  const handleDuplicateForm = (form: FormData) => {
    const duplicatedForm: FormData = {
      ...form,
      id: Date.now().toString(),
      title: `${form.title} (Copy)`,
      status: "draft",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      responseCount: 0,
    }
    setForms((prev) => [duplicatedForm, ...prev])
  }

  const handleDeleteForm = (formId: string) => {
    setForms((prev) => prev.filter((form) => form.id !== formId))
    setFormToDelete(null)
  }

  const handleStatusChange = (formId: string, newStatus: "draft" | "published" | "archived") => {
    setForms((prev) =>
      prev.map((form) =>
        form.id === formId ? { ...form, status: newStatus, updatedAt: new Date().toISOString() } : form,
      ),
    )
  }

  const getStatusStats = () => {
    const stats = forms.reduce(
      (acc, form) => {
        acc[form.status]++
        acc.total++
        return acc
      },
      { total: 0, draft: 0, published: 0, archived: 0 },
    )
    return stats
  }

  const stats = getStatusStats()

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Forms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Published</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">{stats.published}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Drafts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-2">{stats.draft}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Archived</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground">{stats.archived}</div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search forms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
            <SelectTrigger className="w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center border border-border rounded-md">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="rounded-r-none"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <Button onClick={() => setShowCreateModal(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            New Form
          </Button>
        </div>
      </div>

      {/* Forms Grid/List */}
      {filteredForms.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <Plus className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">
            {searchQuery || statusFilter !== "all" ? "No forms found" : "No forms yet"}
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery || statusFilter !== "all"
              ? "Try adjusting your search or filter criteria."
              : "Create your first form to get started."}
          </p>
          {!searchQuery && statusFilter === "all" && (
            <Button onClick={() => setShowCreateModal(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Form
            </Button>
          )}
        </div>
      ) : (
        <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
          {filteredForms.map((form) => (
            <FormCard
              key={form.id}
              form={form}
              viewMode={viewMode}
              onSelect={() => onFormSelect(form)}
              onDuplicate={() => handleDuplicateForm(form)}
              onDelete={() => setFormToDelete(form)}
              onStatusChange={(status) => handleStatusChange(form.id, status)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <CreateFormModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateForm={handleCreateForm}
      />

      <DeleteFormModal
        isOpen={!!formToDelete}
        onClose={() => setFormToDelete(null)}
        onConfirm={() => formToDelete && handleDeleteForm(formToDelete.id)}
        formTitle={formToDelete?.title || ""}
      />
    </div>
  )
}

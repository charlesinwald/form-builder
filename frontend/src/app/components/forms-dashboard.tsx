"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select"
import { FormCard } from "@/app/components/form-card"
import { CreateFormModal } from "@/app/components/create-form-modal"
import { DeleteFormModal } from "@/app/components/delete-form-modal"
import { Plus, Search, Filter, Grid, List } from "lucide-react"
import { useForms } from "@/hooks/use-forms"
import { Form } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface FormsDashboardProps {
  onFormSelect: (form: Form) => void
  onNewForm: () => void
}

export function FormsDashboard({ onFormSelect, onNewForm }: FormsDashboardProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "draft" | "published" | "archived">("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [formToDelete, setFormToDelete] = useState<Form | null>(null)
  const { toast } = useToast()

  const { 
    forms, 
    loading, 
    error,
    createForm,
    deleteForm,
    duplicateForm,
    publishForm,
    unpublishForm,
    archiveForm
  } = useForms()

  useEffect(() => {
    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error,
      })
    }
  }, [error, toast])

  const filteredForms = forms.filter((form) => {
    const matchesSearch =
      form.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      form.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || form.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleCreateForm = async (formData: Partial<Form>) => {
    try {
      const newForm = await createForm({
        title: formData.title || "Untitled Form",
        description: formData.description || "",
        fields: [],
        status: "draft"
      })
      onFormSelect(newForm)
      toast({
        title: "Success",
        description: "Form created successfully",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create form",
      })
    }
  }

  const handleDuplicateForm = async (form: Form) => {
    try {
      await duplicateForm(form)
      toast({
        title: "Success",
        description: "Form duplicated successfully",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to duplicate form",
      })
    }
  }

  const handleDeleteForm = async (formId: string) => {
    try {
      await deleteForm(formId)
      setFormToDelete(null)
      toast({
        title: "Success",
        description: "Form deleted successfully",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete form",
      })
    }
  }

  const handleStatusChange = async (formId: string, newStatus: "draft" | "published" | "archived") => {
    try {
      switch (newStatus) {
        case 'published':
          await publishForm(formId)
          break
        case 'draft':
          await unpublishForm(formId)
          break
        case 'archived':
          await archiveForm(formId)
          break
      }
      toast({
        title: "Success",
        description: `Form ${newStatus} successfully`,
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to ${newStatus === 'published' ? 'publish' : newStatus === 'archived' ? 'archive' : 'unpublish'} form`,
      })
    }
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

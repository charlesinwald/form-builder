"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface CreateFormModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateForm: (formData: { title: string; description: string }) => void
}

export function CreateFormModal({ isOpen, onClose, onCreateForm }: CreateFormModalProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (title.trim()) {
      onCreateForm({ title: title.trim(), description: description.trim() })
      setTitle("")
      setDescription("")
      onClose()
    }
  }

  const handleClose = () => {
    setTitle("")
    setDescription("")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif">Create New Form</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="form-title">Form Title</Label>
            <Input
              id="form-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter form title..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="form-description">Description (Optional)</Label>
            <Textarea
              id="form-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this form is for..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} className="bg-transparent">
              Cancel
            </Button>
            <Button type="submit">Create Form</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

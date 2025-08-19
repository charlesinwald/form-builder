"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

interface DeleteFormModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  formTitle: string
}

export function DeleteFormModal({ isOpen, onClose, onConfirm, formTitle }: DeleteFormModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Delete Form
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-muted-foreground">
            Are you sure you want to delete <span className="font-medium text-foreground">"{formTitle}"</span>?
          </p>
          <p className="text-sm text-muted-foreground">
            This action cannot be undone. All responses and analytics data will be permanently deleted.
          </p>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="bg-transparent">
              Cancel
            </Button>
            <Button variant="destructive" onClick={onConfirm}>
              Delete Form
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

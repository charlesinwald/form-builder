"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/app/components/ui/dialog"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Label } from "@/app/components/ui/label"
import { Copy, ExternalLink, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ShareFormModalProps {
  isOpen: boolean
  onClose: () => void
  formTitle: string
  formId: string
}

export function ShareFormModal({ isOpen, onClose, formTitle, formId }: ShareFormModalProps) {
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  // Generate the shareable URL
  const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/form/${formId}`

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      toast({
        title: "Link copied!",
        description: "The form link has been copied to your clipboard.",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please copy the link manually.",
        variant: "destructive",
      })
    }
  }

  const openInNewTab = () => {
    window.open(shareUrl, "_blank")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif">Share Form</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-4">
              Share this link with others to collect responses for "{formTitle}".
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="share-url">Form Link</Label>
            <div className="flex space-x-2">
              <Input id="share-url" value={shareUrl} readOnly className="flex-1" />
              <Button size="sm" onClick={copyToClipboard} className="shrink-0">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="flex space-x-2 pt-4">
            <Button variant="outline" onClick={openInNewTab} className="flex-1 gap-2 bg-transparent">
              <ExternalLink className="h-4 w-4" />
              Preview Form
            </Button>
            <Button onClick={onClose} className="flex-1">
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

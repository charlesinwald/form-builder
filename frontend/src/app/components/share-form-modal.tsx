"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/app/components/ui/dialog"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Label } from "@/app/components/ui/label"
import { Copy, Check, ExternalLink, Globe, QrCode } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { QRCodeComponent } from "./qr-code"

interface ShareFormModalProps {
  isOpen: boolean
  onClose: () => void
  formId: string
  formTitle: string
}

export function ShareFormModal({ isOpen, onClose, formId, formTitle }: ShareFormModalProps) {
  const [copied, setCopied] = useState(false)
  const [showQR, setShowQR] = useState(false)
  const { toast } = useToast()

  const shareUrl = `${window.location.origin}/form/${formId}`

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      toast({
        title: "Copied!",
        description: "Share link copied to clipboard",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast({
        variant: "destructive",
        title: "Failed to copy",
        description: "Unable to copy to clipboard",
      })
    }
  }

  const handleOpenInNewTab = () => {
    window.open(shareUrl, '_blank')
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Share Form
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="form-title">Form</Label>
            <Input 
              id="form-title"
              value={formTitle}
              readOnly
              className="bg-muted"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="share-url">Public URL</Label>
            <div className="flex space-x-2">
              <Input
                id="share-url"
                value={shareUrl}
                readOnly
                className="bg-muted"
              />
              <Button
                type="button"
                size="sm"
                className="px-3"
                onClick={handleCopyUrl}
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Anyone with this link can fill out your form. Make sure your form is published.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label>QR Code</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowQR(!showQR)}
                className="h-6 px-2 text-xs"
              >
                <QrCode className="h-3 w-3 mr-1" />
                {showQR ? 'Hide' : 'Show'}
              </Button>
            </div>
            {showQR && (
              <div className="flex justify-center p-4 bg-muted rounded-lg">
                <QRCodeComponent value={shareUrl} size={200} />
              </div>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 justify-end">
            <Button 
              variant="outline" 
              onClick={handleOpenInNewTab}
              className="gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Preview
            </Button>
            <Button onClick={onClose}>
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
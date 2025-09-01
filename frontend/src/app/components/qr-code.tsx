"use client"

import { useEffect, useState } from "react"
import QRCode from "qrcode"

interface QRCodeProps {
  value: string
  size?: number
  className?: string
}

export function QRCodeComponent({ value, size = 200, className }: QRCodeProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!value) {
      setIsLoading(false)
      return
    }

    const generateQR = async () => {
      try {
        setIsLoading(true)
        setError(null)
        setQrDataUrl(null)
        
        const dataUrl = await QRCode.toDataURL(value, {
          width: size,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        })
        setQrDataUrl(dataUrl)
      } catch (err) {
        console.error('QR code generation failed:', err)
        setError(`Failed to generate QR code: ${err instanceof Error ? err.message : 'Unknown error'}`)
      } finally {
        setIsLoading(false)
      }
    }

    generateQR()
  }, [value, size])

  if (error) {
    return (
      <div className={`flex items-center justify-center border border-destructive rounded-lg ${className}`} style={{ width: size, height: size }}>
        <p className="text-sm text-destructive p-4 text-center">
          {error}
        </p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center border rounded-lg ${className}`} style={{ width: size, height: size }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!qrDataUrl) {
    return (
      <div className={`flex items-center justify-center border rounded-lg ${className}`} style={{ width: size, height: size }}>
        <p className="text-sm text-muted-foreground p-4 text-center">
          No QR code generated
        </p>
      </div>
    )
  }

  return (
    <img
      src={qrDataUrl}
      alt={`QR Code for ${value}`}
      width={size}
      height={size}
      className={`border rounded-lg ${className}`}
    />
  )
}
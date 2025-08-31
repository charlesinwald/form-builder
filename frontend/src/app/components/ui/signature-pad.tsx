"use client";

import { SignaturePad } from "@ark-ui/react/signature-pad";
import { useState, useRef, useEffect, useCallback } from "react";
import { CheckCircle, AlertCircle, Upload, FileImage } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiService } from "@/lib/api";

interface SignaturePadProps {
  onSignatureChange?: (hasSignature: boolean, signatureData?: string, fileUrl?: string) => void;
  required?: boolean;
  label?: string;
  className?: string;
  disabled?: boolean;
  formId?: string;
  fieldId?: string;
  allowUpload?: boolean;
  publicUpload?: boolean;
}

export function BasicSignaturePad({ 
  onSignatureChange, 
  required = false, 
  label = "Signature", 
  className,
  disabled = false,
  formId,
  fieldId,
  allowUpload = false,
  publicUpload = false
}: SignaturePadProps) {
  const [hasSignature, setHasSignature] = useState(false);
  const [signatureData, setSignatureData] = useState<string>("");
  const [uploadedFile, setUploadedFile] = useState<{ url: string; filename: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string>("");
  const [isDrawing, setIsDrawing] = useState(false);
  const signaturePadRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleDrawEnd = useCallback(async (details: any) => {
    console.log('SignaturePad: handleDrawEnd called with details:', details);
    setHasSignature(true);
    
    // Try different methods to get signature data
    let dataUrl: string | null = null;
    
    // Ark UI SignaturePad uses SVG, so try to get the data URL directly first
    if (details && typeof details.getDataUrl === 'function') {
      try {
        // Try without format specification first (Ark UI default) - it returns a Promise!
        const result = details.getDataUrl();
        console.log('SignaturePad: Details getDataUrl result:', result, 'type:', typeof result);
        
        // Check if result is a Promise
        if (result && typeof result === 'object' && typeof result.then === 'function') {
          console.log('SignaturePad: getDataUrl returned a Promise, awaiting...');
          dataUrl = await result;
          console.log('SignaturePad: Awaited result:', typeof dataUrl, dataUrl && typeof dataUrl === 'string' ? dataUrl.substring(0, 50) + '...' : dataUrl);
        }
        // Check if result is a string (data URL)
        else if (typeof result === 'string') {
          dataUrl = result;
          console.log('SignaturePad: Direct string result:', dataUrl.substring(0, 50) + '...');
        }
      } catch (error) {
        console.error('Error calling details.getDataUrl without format:', error);
      }
    }
    
    // If that didn't work, try to find SVG element and convert it
    if (!dataUrl && signaturePadRef.current) {
      try {
        const svg = signaturePadRef.current.querySelector('svg');
        console.log('SignaturePad: Found SVG:', svg);
        if (svg) {
          // Convert SVG element to data URL
          const svgData = new XMLSerializer().serializeToString(svg);
          const svgBase64 = btoa(unescape(encodeURIComponent(svgData)));
          dataUrl = `data:image/svg+xml;base64,${svgBase64}`;
          console.log('SignaturePad: Created SVG data URL, length:', dataUrl.length);
        }
      } catch (error) {
        console.error('Error getting SVG data:', error);
      }
    }
    
    // If we got SVG data, convert it to PNG
    if (dataUrl && typeof dataUrl === 'string' && (dataUrl.startsWith('data:image/svg+xml') || dataUrl.includes('svg'))) {
      console.log('SignaturePad: Converting SVG to PNG');
      try {
        dataUrl = await convertSvgToPng(dataUrl);
        console.log('SignaturePad: Converted PNG data URL length:', dataUrl?.length);
      } catch (error) {
        console.error('Error converting SVG to PNG:', error);
        // Fall back to using the SVG data as-is for now
      }
    }
    
    if (dataUrl && typeof dataUrl === 'string' && dataUrl.startsWith('data:image/')) {
      console.log('SignaturePad: Valid signature data found, length:', dataUrl.length);
      setSignatureData(dataUrl);
      
      // Auto-upload the signature if formId and fieldId are provided
      if (formId && fieldId) {
        console.log('SignaturePad: Auto-uploading signature with formId:', formId, 'fieldId:', fieldId);
        try {
          setIsUploading(true);
          // Convert data URL to blob
          const response = await fetch(dataUrl);
          const blob = await response.blob();
          console.log('SignaturePad: Created blob, size:', blob.size, 'type:', blob.type);
          const file = new File([blob], `signature_${Date.now()}.png`, { type: 'image/png' });

          // Upload the file
          console.log('SignaturePad: Uploading file...');
          const uploadResult = await apiService.uploadFile(file, formId, fieldId, publicUpload);
          console.log('SignaturePad: Upload successful:', uploadResult);
          setUploadedFile({ url: uploadResult.url, filename: uploadResult.filename });
          onSignatureChange?.(true, dataUrl, uploadResult.url);
        } catch (error) {
          console.error('Error auto-uploading signature:', error);
          setUploadError(`Failed to save signature: ${error instanceof Error ? error.message : 'Unknown error'}`);
          // Fall back to just the signature data
          onSignatureChange?.(true, dataUrl, undefined);
        } finally {
          setIsUploading(false);
        }
      } else {
        console.log('SignaturePad: No auto-upload (formId:', formId, 'fieldId:', fieldId, ')');
        onSignatureChange?.(true, dataUrl, undefined);
      }
    } else {
      console.log('SignaturePad: No valid signature data found');
      onSignatureChange?.(true, undefined, undefined);
    }
  }, [formId, fieldId, publicUpload, onSignatureChange]);

  // Auto-save with debouncing when drawing stops
  const triggerAutoSave = useCallback(() => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    
    autoSaveTimerRef.current = setTimeout(() => {
      console.log('SignaturePad: Auto-save triggered after drawing stopped');
      handleDrawEnd(null);
    }, 1000); // Wait 1 second after drawing stops
  }, [handleDrawEnd]);

  // Handle drawing start
  const handleDrawStart = useCallback(() => {
    console.log('SignaturePad: Drawing started');
    setIsDrawing(true);
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
  }, []);

  // Handle drawing end/stop
  const handleDrawStop = useCallback(() => {
    console.log('SignaturePad: Drawing stopped');
    setIsDrawing(false);
    triggerAutoSave();
  }, [triggerAutoSave]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, []);

  // Helper function to convert SVG data URL to PNG
  const convertSvgToPng = async (svgDataUrl: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        // Set a reasonable size if the image dimensions are 0 or very small
        const width = Math.max(img.width, img.naturalWidth, 600);
        const height = Math.max(img.height, img.naturalHeight, 120);
        
        canvas.width = width;
        canvas.height = height;
        
        // Fill with white background
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw the SVG image
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to PNG data URL
        const pngDataUrl = canvas.toDataURL('image/png');
        resolve(pngDataUrl);
      };
      img.onerror = (error) => {
        console.error('SVG to PNG conversion failed:', error);
        reject(new Error('Failed to load SVG image'));
      };
      img.src = svgDataUrl;
    });
  };

  const handleClear = () => {
    setHasSignature(false);
    setSignatureData("");
    setUploadedFile(null);
    setUploadError("");
    onSignatureChange?.(false, undefined, undefined);
  };

  const saveSignatureAsFile = async () => {
    if (!signatureData) return;

    try {
      setIsUploading(true);
      setUploadError("");

      // Convert data URL to blob
      const response = await fetch(signatureData);
      const blob = await response.blob();
      const file = new File([blob], `signature_${Date.now()}.png`, { type: 'image/png' });

      // Upload the file
      const uploadResult = await apiService.uploadFile(file, formId, fieldId);
      setUploadedFile({ url: uploadResult.url, filename: uploadResult.filename });
      onSignatureChange?.(true, signatureData, uploadResult.url);
    } catch (error) {
      console.error('Error saving signature:', error);
      setUploadError('Failed to save signature');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file');
      return;
    }

    try {
      setIsUploading(true);
      setUploadError("");

      const uploadResult = await apiService.uploadFile(file, formId, fieldId, publicUpload);
      setUploadedFile({ url: uploadResult.url, filename: uploadResult.filename });
      setHasSignature(true);
      onSignatureChange?.(true, undefined, uploadResult.url);
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadError('Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={cn("w-full", className)}>
      <SignaturePad.Root ref={signaturePadRef} onDrawEnd={handleDrawEnd}>
        <SignaturePad.Label className="text-sm font-medium text-foreground mb-2 block">
          {label} {required && <span className="text-destructive">*</span>}
        </SignaturePad.Label>
        <SignaturePad.Control className="relative w-full h-32 bg-background rounded-lg border-2 border-input hover:border-border transition-colors">
          <SignaturePad.Segment 
            className={cn(
              "w-full h-full stroke-foreground fill-foreground",
              disabled && "pointer-events-none opacity-50"
            )}
            onPointerDown={handleDrawStart}
            onPointerUp={handleDrawStop}
            onMouseDown={handleDrawStart}
            onMouseUp={handleDrawStop}
            onTouchStart={handleDrawStart}
            onTouchEnd={handleDrawStop}
          />
          {!disabled && (
            <SignaturePad.ClearTrigger 
              className="absolute top-2 right-2 px-2 py-1 bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded text-xs font-medium transition-colors"
              onClick={handleClear}
            >
              Clear
            </SignaturePad.ClearTrigger>
          )}
          <SignaturePad.Guide className="absolute bottom-4 left-3 right-3 border-b-2 border-dashed border-muted-foreground/30" />
        </SignaturePad.Control>
      </SignaturePad.Root>

      {/* Action buttons */}
      {!disabled && (
        <div className="flex gap-2 mt-3">
          <button
            type="button"
            onClick={() => handleDrawEnd(null)}
            className="px-3 py-2 bg-primary text-primary-foreground hover:bg-primary/80 rounded-md text-sm font-medium transition-colors"
          >
            Save Signature
          </button>
          {allowUpload && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex items-center gap-2 px-3 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Upload Image
                  </>
                )}
              </button>
            </>
          )}
        </div>
      )}

      {/* Loading indicator when auto-uploading signature */}
      {isUploading && !allowUpload && (
        <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          Saving signature...
        </div>
      )}

      {/* Upload error */}
      {uploadError && (
        <div className="mt-2 text-sm text-destructive">
          {uploadError}
        </div>
      )}

      {/* Uploaded file info */}
      {uploadedFile && (
        <div className="mt-2 p-3 bg-muted rounded-lg">
          <div className="flex items-center gap-2 text-sm">
            <FileImage className="w-4 h-4 text-green-600" />
            <span className="text-muted-foreground">File saved:</span>
            <span className="font-medium">{uploadedFile.filename}</span>
          </div>
        </div>
      )}
      
      {/* Status indicator */}
      {(required || hasSignature) && (
        <div className="flex items-center space-x-2 mt-2">
          {hasSignature ? (
            <CheckCircle className="w-4 h-4 text-green-600" />
          ) : (
            <AlertCircle className="w-4 h-4 text-muted-foreground" />
          )}
          <span className="text-sm text-muted-foreground">
            {hasSignature ? "Signature provided" : "Signature required"}
          </span>
        </div>
      )}
    </div>
  );
}

export function ContractSignature() {
  const [hasSignature, setHasSignature] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleDrawEnd = () => {
    setHasSignature(true);
  };

  const handleClear = () => {
    setHasSignature(false);
  };

  const handleSubmit = () => {
    if (hasSignature) {
      setIsSubmitted(true);
    }
  };

  return (
    <div className="bg-card w-full px-4 py-12 rounded-xl border">
      <div className="max-w-md w-full mx-auto space-y-4">
        <div className="text-center space-y-2">
          <h2 className="text-lg font-semibold text-foreground">
            Contract Agreement
          </h2>
          <p className="text-sm text-muted-foreground">
            Please review and sign the agreement below
          </p>
        </div>

        <div className="bg-muted rounded-lg p-3 space-y-2">
          <h3 className="font-medium text-foreground text-sm">
            Terms and Conditions
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            By signing this document, you agree to the terms and conditions
            outlined in our service agreement. This signature constitutes your
            acceptance of all terms and represents your legal consent.
          </p>
        </div>

        <div className="space-y-2">
          <SignaturePad.Root onDrawEnd={handleDrawEnd}>
            <SignaturePad.Label className="text-sm font-medium text-foreground block">
              Digital Signature *
            </SignaturePad.Label>
            <SignaturePad.Control className="relative w-full h-32 bg-background rounded-lg border-2 border-input">
              <SignaturePad.Segment className="w-full h-full stroke-foreground fill-foreground" />
              <SignaturePad.ClearTrigger 
                className="absolute top-2 right-2 px-2 py-1 bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded text-xs font-medium transition-colors"
                onClick={handleClear}
              >
                Clear
              </SignaturePad.ClearTrigger>
              <SignaturePad.Guide className="absolute bottom-4 left-3 right-3 border-b-2 border-dashed border-muted-foreground/30" />
            </SignaturePad.Control>
          </SignaturePad.Root>

          <div className="flex items-center space-x-2">
            {hasSignature ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-muted-foreground" />
            )}
            <span className="text-sm text-muted-foreground">
              {hasSignature ? "Signature provided" : "Signature required"}
            </span>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={handleSubmit}
            disabled={!hasSignature}
            className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium disabled:opacity-50 hover:bg-primary/90 transition-colors disabled:hover:bg-primary"
          >
            Submit Agreement
          </button>
        </div>

        {isSubmitted && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-green-800 dark:text-green-200 text-sm font-medium">
                Agreement submitted successfully!
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export { BasicSignaturePad as SignaturePad };
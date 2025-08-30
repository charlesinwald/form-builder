"use client";

import { SignaturePad } from "@ark-ui/react/signature-pad";
import { useState, useRef, useEffect } from "react";
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
}

export function BasicSignaturePad({ 
  onSignatureChange, 
  required = false, 
  label = "Signature", 
  className,
  disabled = false,
  formId,
  fieldId,
  allowUpload = false
}: SignaturePadProps) {
  const [hasSignature, setHasSignature] = useState(false);
  const [signatureData, setSignatureData] = useState<string>("");
  const [uploadedFile, setUploadedFile] = useState<{ url: string; filename: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string>("");
  const signaturePadRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrawEnd = async (details: any) => {
    if (details && details.getDataUrl) {
      const dataUrl = details.getDataUrl('image/png');
      setSignatureData(dataUrl);
      setHasSignature(true);
      
      // Auto-upload the signature if formId and fieldId are provided
      if (formId && fieldId) {
        try {
          setIsUploading(true);
          // Convert data URL to blob
          const response = await fetch(dataUrl);
          const blob = await response.blob();
          const file = new File([blob], `signature_${Date.now()}.png`, { type: 'image/png' });

          // Upload the file
          const uploadResult = await apiService.uploadFile(file, formId, fieldId);
          setUploadedFile({ url: uploadResult.url, filename: uploadResult.filename });
          onSignatureChange?.(true, dataUrl, uploadResult.url);
        } catch (error) {
          console.error('Error auto-uploading signature:', error);
          // Fall back to just the signature data
          onSignatureChange?.(true, dataUrl, undefined);
        } finally {
          setIsUploading(false);
        }
      } else {
        onSignatureChange?.(true, dataUrl, undefined);
      }
    }
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

      const uploadResult = await apiService.uploadFile(file, formId, fieldId);
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
      <SignaturePad.Root onDrawEnd={handleDrawEnd}>
        <SignaturePad.Label className="text-sm font-medium text-foreground mb-2 block">
          {label} {required && <span className="text-destructive">*</span>}
        </SignaturePad.Label>
        <SignaturePad.Control className="relative w-full h-32 bg-background rounded-lg border-2 border-input hover:border-border transition-colors">
          <SignaturePad.Segment 
            className={cn(
              "w-full h-full stroke-foreground fill-foreground",
              disabled && "pointer-events-none opacity-50"
            )} 
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
      {!disabled && allowUpload && (
        <div className="flex gap-2 mt-3">
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
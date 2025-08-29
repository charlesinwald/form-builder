"use client";

import { SignaturePad } from "@ark-ui/react/signature-pad";
import { useState } from "react";
import { CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface SignaturePadProps {
  onSignatureChange?: (hasSignature: boolean, signatureData?: string) => void;
  required?: boolean;
  label?: string;
  className?: string;
  disabled?: boolean;
}

export function BasicSignaturePad({ 
  onSignatureChange, 
  required = false, 
  label = "Signature", 
  className,
  disabled = false 
}: SignaturePadProps) {
  const [hasSignature, setHasSignature] = useState(false);

  const handleDrawEnd = () => {
    setHasSignature(true);
    onSignatureChange?.(true);
  };

  const handleClear = () => {
    setHasSignature(false);
    onSignatureChange?.(false);
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
      
      {required && (
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
"use client";

import { useRef, useEffect, useState } from "react";
import { CheckCircle, AlertCircle, Upload, FileImage, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiService } from "@/lib/api";

interface SimpleSignaturePadProps {
  onSignatureChange?: (hasSignature: boolean, signatureData?: string, fileUrl?: string) => void;
  required?: boolean;
  label?: string;
  className?: string;
  disabled?: boolean;
  formId?: string;
  fieldId?: string;
  allowUpload?: boolean;
}

export function SimpleSignaturePad({
  onSignatureChange,
  required = false,
  label = "Signature",
  className,
  disabled = false,
  formId,
  fieldId,
  allowUpload = false
}: SimpleSignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [signatureData, setSignatureData] = useState<string>("");
  const [uploadedFile, setUploadedFile] = useState<{ url: string; filename: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const context = canvas.getContext('2d');
      if (context) {
        context.lineCap = 'round';
        context.strokeStyle = '#000000';
        context.lineWidth = 2;
        setCtx(context);
        
        // Set canvas size - use fixed dimensions first to ensure visibility
        canvas.width = 400;
        canvas.height = 128;
        canvas.style.width = '100%';
        canvas.style.height = '128px';
      }
    }
  }, []);

  const getMousePos = (canvas: HTMLCanvasElement, clientX: number, clientY: number) => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (disabled || !ctx) return;
    
    setIsDrawing(true);
    const canvas = canvasRef.current!;
    const pos = getMousePos(canvas, e.clientX, e.clientY);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || disabled || !ctx) return;
    
    const canvas = canvasRef.current!;
    const pos = getMousePos(canvas, e.clientX, e.clientY);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    
    if (canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      setSignatureData(dataUrl);
      setHasSignature(true);
      setUploadedFile(null); // Clear uploaded file if drawing new signature
      onSignatureChange?.(true, dataUrl);
    }
  };

  const clearSignature = () => {
    if (!ctx || !canvasRef.current) return;
    
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setHasSignature(false);
    setSignatureData("");
    setUploadedFile(null);
    setUploadError("");
    onSignatureChange?.(false);
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
      setSignatureData(""); // Clear drawn signature if uploading file
      clearSignature(); // Clear the canvas
      onSignatureChange?.(true, undefined, uploadResult.url);
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadError('Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  // Touch event handlers for mobile
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousedown', {
      clientX: touch.clientX,
      clientY: touch.clientY
    });
    canvasRef.current?.dispatchEvent(mouseEvent);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousemove', {
      clientX: touch.clientX,
      clientY: touch.clientY
    });
    canvasRef.current?.dispatchEvent(mouseEvent);
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const mouseEvent = new MouseEvent('mouseup', {});
    canvasRef.current?.dispatchEvent(mouseEvent);
  };

  console.log('SimpleSignaturePad: Rendering component:', { label, hasSignature, disabled });
  
  return (
    <div className={cn("w-full space-y-3 border-2 border-red-200 p-2", className)}>
      <div className="bg-red-50 p-2 text-sm">DEBUG: SimpleSignaturePad - {label}</div>
      <label className="text-sm font-medium text-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </label>

      {/* Canvas for drawing */}
      <div className="relative w-full h-32 border-2 border-gray-300 rounded-lg bg-white overflow-hidden">
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-crosshair border border-gray-200"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ 
            touchAction: 'none',
            opacity: disabled ? 0.5 : 1,
            pointerEvents: disabled ? 'none' : 'auto',
            backgroundColor: 'white'
          }}
        />
        
        {/* Clear button */}
        {!disabled && (hasSignature || uploadedFile) && (
          <button
            type="button"
            onClick={clearSignature}
            className="absolute top-2 right-2 p-1 bg-muted text-muted-foreground hover:bg-destructive hover:text-destructive-foreground rounded text-xs transition-colors"
            title="Clear signature"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}

        {/* Placeholder text */}
        {!hasSignature && !uploadedFile && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-muted-foreground text-sm">
              {disabled ? "Signature disabled" : "Draw your signature here"}
            </span>
          </div>
        )}

        {/* Signature line */}
        <div className="absolute bottom-4 left-3 right-3 border-b-2 border-dashed border-muted-foreground/30" />
      </div>

      {/* Action buttons */}
      {!disabled && (
        <div className="flex gap-2">
          {hasSignature && signatureData && !uploadedFile && (
            <button
              type="button"
              onClick={saveSignatureAsFile}
              disabled={isUploading}
              className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <FileImage className="w-4 h-4" />
                  Save Signature
                </>
              )}
            </button>
          )}

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

      {/* Upload error */}
      {uploadError && (
        <div className="text-sm text-destructive">
          {uploadError}
        </div>
      )}

      {/* Uploaded file info */}
      {uploadedFile && (
        <div className="p-3 bg-muted rounded-lg">
          <div className="flex items-center gap-2 text-sm">
            <FileImage className="w-4 h-4 text-green-600" />
            <span className="text-muted-foreground">File saved:</span>
            <span className="font-medium">{uploadedFile.filename}</span>
          </div>
        </div>
      )}

      {/* Status indicator */}
      {(required || hasSignature || uploadedFile) && (
        <div className="flex items-center space-x-2">
          {(hasSignature || uploadedFile) ? (
            <CheckCircle className="w-4 h-4 text-green-600" />
          ) : (
            <AlertCircle className="w-4 h-4 text-muted-foreground" />
          )}
          <span className="text-sm text-muted-foreground">
            {(hasSignature || uploadedFile) ? "Signature provided" : "Signature required"}
          </span>
        </div>
      )}
    </div>
  );
}
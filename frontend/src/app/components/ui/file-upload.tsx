"use client";

import { useState, useRef } from "react";
import { Upload, File, X, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiService } from "@/lib/api";

interface FileUploadProps {
  onFileChange?: (hasFile: boolean, fileUrl?: string, filename?: string) => void;
  required?: boolean;
  label?: string;
  className?: string;
  disabled?: boolean;
  formId?: string;
  fieldId?: string;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in MB
}

export function FileUpload({
  onFileChange,
  required = false,
  label = "File Upload",
  className,
  disabled = false,
  formId,
  fieldId,
  accept = "*/*",
  multiple = false,
  maxSize = 10
}: FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ url: string; filename: string; id: string }>>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string>("");
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasFiles = uploadedFiles.length > 0;

  const validateFile = (file: File): string | null => {
    if (file.size > maxSize * 1024 * 1024) {
      return `File size must be less than ${maxSize}MB`;
    }
    return null;
  };

  const uploadFiles = async (files: FileList) => {
    const validFiles: File[] = [];
    const errors: string[] = [];

    Array.from(files).forEach(file => {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else {
        validFiles.push(file);
      }
    });

    if (errors.length > 0) {
      setUploadError(errors.join(', '));
      return;
    }

    if (validFiles.length === 0) return;

    try {
      setIsUploading(true);
      setUploadError("");

      const uploadPromises = validFiles.map(file =>
        apiService.uploadFile(file, formId, fieldId)
      );

      const results = await Promise.all(uploadPromises);
      const newFiles = results.map(result => ({
        url: result.url,
        filename: result.filename,
        id: result.id
      }));

      if (multiple) {
        const updatedFiles = [...uploadedFiles, ...newFiles];
        setUploadedFiles(updatedFiles);
        onFileChange?.(updatedFiles.length > 0, updatedFiles[0]?.url, updatedFiles[0]?.filename);
      } else {
        setUploadedFiles(newFiles);
        onFileChange?.(true, newFiles[0]?.url, newFiles[0]?.filename);
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      setUploadError('Failed to upload files');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      uploadFiles(files);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);

    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      uploadFiles(files);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const removeFile = (fileId: string) => {
    const updatedFiles = uploadedFiles.filter(file => file.id !== fileId);
    setUploadedFiles(updatedFiles);
    onFileChange?.(updatedFiles.length > 0, updatedFiles[0]?.url, updatedFiles[0]?.filename);
    
    // TODO: Call API to delete file from server
    // apiService.deleteFile(fileId);
  };

  const openFileSelector = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className={cn("w-full", className)}>
      <label className="text-sm font-medium text-foreground mb-2 block">
        {label} {required && <span className="text-destructive">*</span>}
      </label>

      {/* Upload area */}
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer",
          isDragOver ? "border-primary bg-primary/5" : "border-input",
          disabled && "pointer-events-none opacity-50",
          hasFiles && "border-green-500 bg-green-50 dark:bg-green-900/20"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={openFileSelector}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled}
        />

        {isUploading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground">Uploading...</p>
          </div>
        ) : hasFiles ? (
          <div className="flex flex-col items-center gap-2">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <p className="text-sm font-medium">
              {uploadedFiles.length} file{uploadedFiles.length > 1 ? 's' : ''} uploaded
            </p>
            <p className="text-xs text-muted-foreground">
              Click to add {multiple ? 'more files' : 'a different file'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="w-8 h-8 text-muted-foreground" />
            <p className="text-sm font-medium">
              Drop files here or click to browse
            </p>
            <p className="text-xs text-muted-foreground">
              Maximum file size: {maxSize}MB
            </p>
          </div>
        )}
      </div>

      {/* Error message */}
      {uploadError && (
        <div className="mt-2 text-sm text-destructive">
          {uploadError}
        </div>
      )}

      {/* File list */}
      {uploadedFiles.length > 0 && (
        <div className="mt-3 space-y-2">
          {uploadedFiles.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-3 bg-muted rounded-lg"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <File className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span className="text-sm font-medium truncate">
                  {file.filename}
                </span>
              </div>
              {!disabled && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(file.id);
                  }}
                  className="p-1 text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Status indicator */}
      {required && (
        <div className="flex items-center space-x-2 mt-2">
          {hasFiles ? (
            <CheckCircle className="w-4 h-4 text-green-600" />
          ) : (
            <AlertCircle className="w-4 h-4 text-muted-foreground" />
          )}
          <span className="text-sm text-muted-foreground">
            {hasFiles ? "File(s) uploaded" : "File required"}
          </span>
        </div>
      )}
    </div>
  );
}
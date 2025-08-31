"use client";

import { FormField } from "../../../../shared/types";
import { FileViewer } from "./file-viewer";
import { normalizeFileUrl } from "@/lib/utils";

interface FormFieldViewerProps {
  field: FormField;
  value: any;
  className?: string;
}

export function FormFieldViewer({ field, value, className }: FormFieldViewerProps) {
  if (!value) {
    return <span className="text-muted-foreground">No response</span>;
  }

  // Handle signature fields
  if (field.type === 'signature') {
    if (typeof value === 'string') {
      if (value.startsWith('data:image/')) {
        // Base64 signature data
        return (
          <div className={`border rounded-lg p-3 bg-card ${className || ''}`}>
            <img 
              src={value} 
              alt="Digital Signature" 
              className="max-w-[300px] h-auto border rounded shadow-sm"
            />
            <p className="text-xs text-muted-foreground mt-2">✍️ Digital signature</p>
          </div>
        );
      } else if (value.startsWith('http')) {
        // File URL - normalize it
        const normalizedUrl = normalizeFileUrl(value);
        return (
          <div className={className}>
            <FileViewer
              fileUrl={normalizedUrl}
              filename="signature.png"
              mimeType="image/png"
              showPreview={true}
            />
          </div>
        );
      }
    }
    return <span className="text-muted-foreground">Invalid signature data</span>;
  }

  // Handle file upload fields
  if (field.type === 'file') {
    if (typeof value === 'string' && value.startsWith('http')) {
      // Single file URL - normalize it
      const normalizedUrl = normalizeFileUrl(value);
      const filename = normalizedUrl.split('/').pop() || 'file';
      return (
        <div className={className}>
          <FileViewer
            fileUrl={normalizedUrl}
            filename={filename}
            showPreview={true}
          />
        </div>
      );
    } else if (Array.isArray(value)) {
      // Multiple files - normalize URLs
      return (
        <div className={`space-y-2 ${className || ''}`}>
          {value.map((fileUrl, index) => {
            const normalizedUrl = normalizeFileUrl(fileUrl);
            const filename = normalizedUrl.split('/').pop() || `file-${index + 1}`;
            return (
              <FileViewer
                key={index}
                fileUrl={normalizedUrl}
                filename={filename}
                showPreview={true}
              />
            );
          })}
        </div>
      );
    }
    return <span className="text-muted-foreground">No file uploaded</span>;
  }

  // Handle date fields
  if (field.type === 'date' && value) {
    try {
      const date = new Date(value);
      return <span>{date.toLocaleDateString()}</span>;
    } catch {
      return <span>{String(value)}</span>;
    }
  }

  // Handle rating fields
  if (field.type === 'rating' && value) {
    const rating = Number(value);
    const stars = '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
    return (
      <div className="flex items-center gap-2">
        <span className="text-lg">{stars}</span>
        <span className="text-sm text-muted-foreground">({rating}/5)</span>
      </div>
    );
  }

  // Handle checkbox arrays
  if (field.type === 'checkbox' && Array.isArray(value)) {
    return (
      <div className="flex flex-wrap gap-1">
        {value.map((item, index) => (
          <span
            key={index}
            className="inline-flex items-center px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 text-xs rounded-full"
          >
            ✓ {item}
          </span>
        ))}
      </div>
    );
  }

  // Handle select/radio with options
  if ((field.type === 'select' || field.type === 'radio') && field.options && value) {
    const isValidOption = field.options.includes(value);
    return (
      <span className={isValidOption ? "" : "text-orange-600"}>
        {value}
        {!isValidOption && " (custom value)"}
      </span>
    );
  }

  // Handle arrays (multi-select, etc.)
  if (Array.isArray(value)) {
    return (
      <div className="flex flex-wrap gap-1">
        {value.map((item, index) => (
          <span
            key={index}
            className="inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-xs rounded"
          >
            {item}
          </span>
        ))}
      </div>
    );
  }

  // Handle email fields
  if (field.type === 'email' && value) {
    return (
      <a
        href={`mailto:${value}`}
        className="text-blue-600 hover:underline"
      >
        {value}
      </a>
    );
  }

  // Handle regular text values
  const stringValue = String(value);
  
  // Handle long text (show truncated with expand option)
  if (stringValue.length > 100) {
    return (
      <details className="group">
        <summary className="cursor-pointer text-blue-600 hover:underline">
          {stringValue.slice(0, 100)}... <span className="text-xs">(click to expand)</span>
        </summary>
        <div className="mt-2 p-2 bg-muted rounded text-sm">
          {stringValue}
        </div>
      </details>
    );
  }

  // Handle URLs
  if (stringValue.startsWith('http://') || stringValue.startsWith('https://')) {
    return (
      <a
        href={stringValue}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:underline break-all"
      >
        {stringValue}
      </a>
    );
  }

  return <span className="break-words">{stringValue}</span>;
}
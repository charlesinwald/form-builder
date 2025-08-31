"use client";

import { useState } from "react";
import {
  File,
  FileImage,
  FileText,
  Eye,
  Download,
  ExternalLink,
} from "lucide-react";
import Image from "next/image";
import { cn, normalizeFileUrl } from "@/lib/utils";

interface FileViewerProps {
  fileUrl: string;
  filename?: string;
  mimeType?: string;
  size?: number;
  className?: string;
  showPreview?: boolean;
}

export function FileViewer({
  fileUrl,
  filename,
  mimeType,
  size,
  className,
  showPreview = true,
}: FileViewerProps) {
  const [showModal, setShowModal] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Normalize the file URL to use the public endpoint
  const normalizedUrl = normalizeFileUrl(fileUrl);

  const getFileIcon = () => {
    if (mimeType?.startsWith("image/")) {
      return <FileImage className="w-5 h-5 text-blue-600" />;
    } else if (mimeType === "application/pdf") {
      return <FileText className="w-5 h-5 text-red-600" />;
    } else {
      return <File className="w-5 h-5 text-gray-600" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const downloadFile = () => {
    const link = document.createElement("a");
    link.href = normalizedUrl;
    link.download = filename || "download";
    link.click();
  };

  const openInNewTab = () => {
    window.open(normalizedUrl, "_blank");
  };

  const isImage = mimeType?.startsWith("image/");

  return (
    <div className={cn("border rounded-lg p-3 bg-card", className)}>
      <div className="flex items-center gap-3">
        {/* File Icon or Thumbnail */}
        <div className="flex-shrink-0">
          {isImage && !imageError && showPreview ? (
            <Image
              src={normalizedUrl}
              alt={filename || "File"}
              width={48}
              height={48}
              className="w-12 h-12 rounded object-cover cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => setShowModal(true)}
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-12 h-12 rounded bg-muted flex items-center justify-center">
              {getFileIcon()}
            </div>
          )}
        </div>

        {/* File Info */}
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate" title={filename}>
            {filename || "Unknown file"}
          </p>
          {size && (
            <p className="text-sm text-muted-foreground">
              {formatFileSize(size)}
            </p>
          )}
          {mimeType && (
            <p className="text-xs text-muted-foreground">{mimeType}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-1">
          {isImage && !imageError && (
            <button
              onClick={() => setShowModal(true)}
              className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
              title="Preview"
            >
              <Eye className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={downloadFile}
            className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
            title="Download"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={openInNewTab}
            className="p-2 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-900/20 rounded transition-colors"
            title="Open in new tab"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Image Preview Modal */}
      {showModal && isImage && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setShowModal(false)}
        >
          <div className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">{filename || "Image"}</h3>
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    downloadFile();
                  }}
                  className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  Download
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1 border rounded hover:bg-accent transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
            <div className="p-4">
              <Image
                src={normalizedUrl}
                alt={filename || "Preview"}
                width={800}
                height={600}
                className="max-w-full h-auto mx-auto rounded-lg"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface FileListViewerProps {
  files: Array<{
    url: string;
    filename?: string;
    mimeType?: string;
    size?: number;
  }>;
  className?: string;
}

export function FileListViewer({ files, className }: FileListViewerProps) {
  if (!files || files.length === 0) {
    return (
      <div className={cn("text-sm text-muted-foreground", className)}>
        No files attached
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      {files.map((file, index) => (
        <FileViewer
          key={index}
          fileUrl={file.url}
          filename={file.filename}
          mimeType={file.mimeType}
          size={file.size}
        />
      ))}
    </div>
  );
}

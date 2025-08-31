"use client";

import { useState, useEffect } from "react";
import {
  File,
  ImageIcon,
  Download,
  Trash2,
  Eye,
  Search,
  Grid,
  List,
  FileText,
  ArrowLeft,
} from "lucide-react";
import NextImage from "next/image";
import { cn, normalizeFileUrl, formatFileSize } from "@/lib/utils";
import { apiService } from "@/lib/api";
import type { FileUpload } from "../../../../shared/types";
import Link from "next/link";

interface FileManagerProps {
  formId?: string;
  fieldId?: string;
  onFileSelect?: (file: FileUpload) => void;
  selectable?: boolean;
}

export function FileManager({
  formId,
  fieldId,
  onFileSelect,
  selectable = false,
}: FileManagerProps) {
  const [files, setFiles] = useState<FileUpload[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedFile, setSelectedFile] = useState<FileUpload | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [fileView, setFileView] = useState<"user" | "forms">("forms");

  useEffect(() => {
    loadFiles();
  }, [fileView]);

  const loadFiles = async () => {
    try {
      setLoading(true);
      setError("");
      const userFiles =
        fileView === "user"
          ? await apiService.getUserFiles()
          : await apiService.getUserFormFiles();

      let filteredFiles = userFiles;

      if (formId) {
        filteredFiles = userFiles.filter((file) => file.formId === formId);
      }
      if (fieldId) {
        filteredFiles = filteredFiles.filter(
          (file) => file.fieldId === fieldId
        );
      }

      filteredFiles = filteredFiles.map((file) => ({
        ...file,
        url: normalizeFileUrl(file.url),
      }));

      setFiles(filteredFiles);
    } catch (err) {
      console.error("Error loading files:", err);
      setError("Failed to load files");
    } finally {
      setLoading(false);
    }
  };

  const deleteFile = async (fileId: string) => {
    if (!confirm("Are you sure you want to delete this file?")) return;

    try {
      await apiService.deleteFile(fileId);
      setFiles(files.filter((file) => file.id !== fileId));
      if (selectedFile?.id === fileId) {
        setSelectedFile(null);
        setShowPreview(false);
      }
    } catch (err) {
      console.error("Error deleting file:", err);
      setError("Failed to delete file");
    }
  };

  const downloadFile = (file: FileUpload) => {
    const link = document.createElement("a");
    link.href = file.url;
    link.download = file.originalName;
    link.click();
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) {
      return <ImageIcon className="w-6 h-6 text-primary" />;
    } else if (mimeType === "application/pdf") {
      return <FileText className="w-6 h-6 text-destructive" />;
    } else {
      return <File className="w-6 h-6 text-muted-foreground" />;
    }
  };

  const filteredFiles = files.filter((file) => {
    const matchesSearch =
      file.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.filename.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType =
      filterType === "all" ||
      (filterType === "images" && file.mimeType.startsWith("image/")) ||
      (filterType === "documents" && !file.mimeType.startsWith("image/"));

    return matchesSearch && matchesType;
  });

  const openPreview = (file: FileUpload) => {
    setSelectedFile(file);
    setShowPreview(true);
  };

  const handleFileSelect = (file: FileUpload) => {
    if (selectable && onFileSelect) {
      onFileSelect(file);
    } else {
      openPreview(file);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-border border-t-primary rounded-full animate-spin" />
          <div
            className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-primary/60 rounded-full animate-spin animate-reverse"
            style={{ animationDelay: "0.15s" }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8">
      {/* Enhanced header with better typography and spacing */}
      <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
        <Link href="/" className="hover:text-primary transition-colors">
          <ArrowLeft className="w-8 h-8" />
        </Link>{" "}
        <div className="space-y-1 flex-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            File Manager
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage and organize your files with ease
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "p-2 rounded-md transition-all duration-200",
                viewMode === "grid"
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "p-2 rounded-md transition-all duration-200",
                viewMode === "list"
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modern toggle with improved styling */}
      <div className="flex gap-1 p-1 bg-muted rounded-xl w-fit">
        <button
          onClick={() => setFileView("forms")}
          className={cn(
            "px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
            fileView === "forms"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Form Files
        </button>
        <button
          onClick={() => setFileView("user")}
          className={cn(
            "px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
            fileView === "user"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          My Files
        </button>
      </div>

      {/* Enhanced search and filter section */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative group">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary transition-all duration-200 text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary transition-all duration-200 text-foreground min-w-[140px]"
        >
          <option value="all">All Files</option>
          <option value="images">Images</option>
          <option value="documents">Documents</option>
        </select>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive flex items-center gap-3">
          <div className="w-2 h-2 bg-destructive rounded-full" />
          {error}
        </div>
      )}

      {/* Modern files display with enhanced cards */}
      {filteredFiles.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-6 bg-muted rounded-2xl flex items-center justify-center">
            <File className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">
            No files found
          </h3>
          <p className="text-muted-foreground">
            Upload some files to get started
          </p>
        </div>
      ) : (
        <div
          className={cn(
            viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              : "space-y-3"
          )}
        >
          {filteredFiles.map((file) => (
            <div
              key={file.id}
              onClick={() => handleFileSelect(file)}
              className={cn(
                "group bg-card border border-border rounded-2xl p-5 transition-all duration-200 hover:shadow-lg hover:shadow-black/5 hover:border-border",
                selectable
                  ? "cursor-pointer hover:bg-primary/5 hover:border-primary/20"
                  : "cursor-pointer",
                viewMode === "list"
                  ? "flex items-center gap-4 p-4"
                  : "space-y-4"
              )}
            >
              {/* Enhanced file preview with better styling */}
              <div
                className={cn(
                  "flex items-center justify-center",
                  viewMode === "grid" ? "mb-3" : "flex-shrink-0"
                )}
              >
                {file.mimeType.startsWith("image/") ? (
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-muted ring-1 ring-border">
                    <NextImage
                      src={file.url}
                      alt={file.originalName}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-muted/50 border border-border flex items-center justify-center group-hover:bg-muted transition-colors">
                    {getFileIcon(file.mimeType)}
                  </div>
                )}
              </div>

              {/* Improved file info typography */}
              <div
                className={cn(
                  "flex-1 min-w-0",
                  viewMode === "list" ? "text-left" : "text-center"
                )}
              >
                <h3
                  className={cn(
                    "font-semibold text-card-foreground truncate text-sm mb-1",
                    viewMode === "list" ? "text-left" : ""
                  )}
                  title={file.originalName}
                >
                  {file.originalName}
                </h3>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{formatFileSize(file.size)}</span>
                  <span>•</span>
                  <span>{new Date(file.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Modern action buttons with better hover states */}
              <div
                className={cn(
                  "flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200",
                  viewMode === "grid" ? "justify-center mt-3" : "flex-shrink-0"
                )}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openPreview(file);
                  }}
                  className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all duration-200"
                  title="Preview"
                >
                  <Eye className="w-4 h-4" />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    downloadFile(file);
                  }}
                  className="p-2 text-muted-foreground hover:text-secondary hover:bg-secondary/10 rounded-lg transition-all duration-200"
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteFile(file.id);
                  }}
                  className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all duration-200"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && selectedFile && (
        <FilePreviewModal
          file={selectedFile}
          onClose={() => setShowPreview(false)}
          onDelete={() => deleteFile(selectedFile.id)}
          onDownload={() => downloadFile(selectedFile)}
        />
      )}
    </div>
  );
}

interface FilePreviewModalProps {
  file: FileUpload;
  onClose: () => void;
  onDelete: () => void;
  onDownload: () => void;
}

function FilePreviewModal({
  file,
  onClose,
  onDelete,
  onDownload,
}: FilePreviewModalProps) {
  const isImage = file.mimeType.startsWith("image/");

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-popover rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-auto shadow-2xl">
        {/* Enhanced modal header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-popover-foreground">
              {file.originalName}
            </h2>
            <p className="text-sm text-muted-foreground">
              {formatFileSize(file.size)} •{" "}
              {new Date(file.createdAt).toLocaleString()}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onDownload}
              className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-xl hover:bg-secondary/90 transition-colors font-medium"
            >
              <Download className="w-4 h-4" />
              Download
            </button>

            <button
              onClick={onDelete}
              className="flex items-center gap-2 px-4 py-2 bg-destructive text-destructive-foreground rounded-xl hover:bg-destructive/90 transition-colors font-medium"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 border border-border text-popover-foreground rounded-xl hover:bg-accent hover:text-accent-foreground transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>

        {/* Enhanced modal content */}
        <div className="p-6">
          {isImage ? (
            <div className="rounded-xl overflow-hidden bg-muted/30">
              <NextImage
                src={file.url}
                alt={file.originalName}
                width={800}
                height={600}
                className="max-w-full h-auto mx-auto"
              />
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-muted flex items-center justify-center">
                {file.mimeType === "application/pdf" ? (
                  <FileText className="w-12 h-12 text-destructive" />
                ) : (
                  <File className="w-12 h-12 text-muted-foreground" />
                )}
              </div>
              <h3 className="text-lg font-semibold text-popover-foreground mb-2">
                {file.originalName}
              </h3>
              <p className="text-muted-foreground mb-6">
                Preview not available for this file type
              </p>
              <a
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors font-medium"
              >
                <Eye className="w-4 h-4" />
                Open in New Tab
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

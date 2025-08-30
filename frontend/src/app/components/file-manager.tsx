"use client";

import { useState, useEffect } from "react";
import { 
  File, 
  Image, 
  Download, 
  Trash2, 
  Eye, 
  Calendar, 
  User,
  Search,
  Filter,
  Grid,
  List,
  FileText,
  FileImage
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiService } from "@/lib/api";
import { FileUpload } from "../../../../shared/types";

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
  selectable = false 
}: FileManagerProps) {
  const [files, setFiles] = useState<FileUpload[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedFile, setSelectedFile] = useState<FileUpload | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      setLoading(true);
      setError("");
      const userFiles = await apiService.getUserFiles();
      
      let filteredFiles = userFiles;
      
      // Filter by form/field if specified
      if (formId) {
        filteredFiles = userFiles.filter(file => file.formId === formId);
      }
      if (fieldId) {
        filteredFiles = filteredFiles.filter(file => file.fieldId === fieldId);
      }
      
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
      setFiles(files.filter(file => file.id !== fileId));
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
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.originalName;
    link.click();
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return <FileImage className="w-8 h-8 text-blue-600" />;
    } else if (mimeType === 'application/pdf') {
      return <FileText className="w-8 h-8 text-red-600" />;
    } else {
      return <File className="w-8 h-8 text-gray-600" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.filename.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === "all" || 
                       (filterType === "images" && file.mimeType.startsWith('image/')) ||
                       (filterType === "documents" && !file.mimeType.startsWith('image/'));
    
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
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h2 className="text-2xl font-bold">File Manager</h2>
        
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
            className="p-2 border rounded-lg hover:bg-accent transition-colors"
          >
            {viewMode === "grid" ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">All Files</option>
          <option value="images">Images</option>
          <option value="documents">Documents</option>
        </select>
      </div>

      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
          {error}
        </div>
      )}

      {/* Files Grid/List */}
      {filteredFiles.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <File className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No files found</p>
        </div>
      ) : (
        <div className={cn(
          viewMode === "grid" 
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            : "space-y-2"
        )}>
          {filteredFiles.map((file) => (
            <div
              key={file.id}
              onClick={() => handleFileSelect(file)}
              className={cn(
                "border rounded-lg p-4 transition-colors",
                selectable 
                  ? "cursor-pointer hover:bg-accent hover:border-primary" 
                  : "cursor-pointer hover:bg-accent",
                viewMode === "list" ? "flex items-center gap-4" : "space-y-3"
              )}
            >
              {/* File Icon/Preview */}
              <div className={cn(
                "flex items-center justify-center",
                viewMode === "grid" ? "mb-2" : "flex-shrink-0"
              )}>
                {file.mimeType.startsWith('image/') ? (
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted">
                    <img
                      src={file.url}
                      alt={file.originalName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                    {getFileIcon(file.mimeType)}
                  </div>
                )}
              </div>

              {/* File Info */}
              <div className={cn(
                "flex-1",
                viewMode === "list" ? "min-w-0" : "text-center"
              )}>
                <h3 className={cn(
                  "font-medium truncate",
                  viewMode === "list" ? "text-left" : ""
                )}>
                  {file.originalName}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {formatFileSize(file.size)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(file.createdAt).toLocaleDateString()}
                </p>
              </div>

              {/* Actions */}
              <div className={cn(
                "flex gap-2",
                viewMode === "grid" ? "justify-center mt-2" : "flex-shrink-0"
              )}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openPreview(file);
                  }}
                  className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  title="Preview"
                >
                  <Eye className="w-4 h-4" />
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    downloadFile(file);
                  }}
                  className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteFile(file.id);
                  }}
                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
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

function FilePreviewModal({ file, onClose, onDelete, onDownload }: FilePreviewModalProps) {
  const isImage = file.mimeType.startsWith('image/');
  
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold">{file.originalName}</h2>
            <p className="text-sm text-muted-foreground">
              {formatFileSize(file.size)} • {new Date(file.createdAt).toLocaleString()}
            </p>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={onDownload}
              className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
            
            <button
              onClick={onDelete}
              className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
            
            <button
              onClick={onClose}
              className="px-3 py-2 border rounded-lg hover:bg-accent transition-colors"
            >
              Close
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {isImage ? (
            <img
              src={file.url}
              alt={file.originalName}
              className="max-w-full h-auto mx-auto rounded-lg shadow-lg"
            />
          ) : (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-4 rounded-lg bg-muted flex items-center justify-center">
                {file.mimeType === 'application/pdf' ? (
                  <FileText className="w-12 h-12 text-red-600" />
                ) : (
                  <File className="w-12 h-12 text-gray-600" />
                )}
              </div>
              <p className="text-lg font-medium mb-2">{file.originalName}</p>
              <p className="text-muted-foreground mb-4">
                Preview not available for this file type
              </p>
              <a
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
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

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
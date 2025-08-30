"use client";

import { FileManager } from "../components/file-manager";
import ProtectedRoute from "../components/auth/protected-route";

export default function FilesPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <FileManager />
        </div>
      </div>
    </ProtectedRoute>
  );
}
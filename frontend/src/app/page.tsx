"use client";

import { useState } from "react";
import { FormBuilder } from "@/app/components/form-builder";
import { FormPreview } from "@/app/components/form-preview";
import { Sidebar } from "@/app/components/sidebar";
import { Header } from "@/app/components/header";

export default function HomePage() {
  const [activeView, setActiveView] = useState<
    "builder" | "preview" | "analytics"
  >("builder");
  const [formData, setFormData] = useState({
    title: "Untitled Form",
    description: "",
    fields: [],
  });

  return (
    <div className="flex h-screen bg-background">
      <Sidebar activeView={activeView} onViewChange={setActiveView} />

      <div className="flex-1 flex flex-col">
        <Header
          formTitle={formData.title}
          onTitleChange={(title) => setFormData((prev) => ({ ...prev, title }))}
          activeView={activeView}
        />

        <main className="flex-1 overflow-hidden">
          {activeView === "builder" && (
            <FormBuilder formData={formData} onFormDataChange={setFormData} />
          )}
          {activeView === "preview" && <FormPreview formData={formData} />}
          {activeView === "analytics" && (
            <div className="p-6">
              <h2 className="text-2xl font-inter font-bold text-foreground mb-4">
                Analytics Dashboard
              </h2>
              <p className="text-muted-foreground">
                Analytics dashboard coming soon...
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

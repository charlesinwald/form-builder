"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { FormBuilder } from "@/app/components/form-builder";
import { FormPreview } from "@/app/components/form-preview";
import { FormsDashboard } from "@/app/components/forms-dashboard";
import { Sidebar } from "@/app/components/sidebar";
import { Header } from "@/app/components/header";
import { Form } from "@/lib/api";
import { useForms } from "@/hooks/use-forms";
import { useToast } from "@/hooks/use-toast";

interface FormData {
  title: string;
  description: string;
  fields: any[];
}

export default function HomePage() {
  const [activeView, setActiveView] = useState<
    "dashboard" | "builder" | "preview" | "analytics"
  >("dashboard");
  const [currentForm, setCurrentForm] = useState<Form | null>(null);
  const [formData, setFormData] = useState<FormData>({
    title: "Untitled Form",
    description: "",
    fields: [],
  });
  const [isPublishing, setIsPublishing] = useState(false);
  
  const { saveDraft, updateForm, createForm, publishForm, refetch } = useForms();
  const { toast } = useToast();
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-save functionality
  const performAutoSave = useCallback(async () => {
    if (!currentForm) return;
    
    try {
      await saveDraft(currentForm.id, {
        title: formData.title,
        description: formData.description,
        fields: formData.fields
      });
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  }, [currentForm, formData, saveDraft]);

  // Auto-save when form data changes (debounced)
  useEffect(() => {
    if (!currentForm) return;

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      performAutoSave();
    }, 2000); // Auto-save after 2 seconds of inactivity

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [formData, currentForm, performAutoSave]);

  const handleFormSelect = (form: Form) => {
    setCurrentForm(form);
    setFormData({
      title: form.title,
      description: form.description,
      fields: form.fields,
    });
    setActiveView("builder");
  };

  const handleNewForm = async () => {
    try {
      const newForm = await createForm({
        title: "Untitled Form",
        description: "",
        fields: [],
        status: "draft"
      });
      setCurrentForm(newForm);
      setFormData({
        title: newForm.title,
        description: newForm.description,
        fields: newForm.fields,
      });
      setActiveView("builder");
      toast({
        title: "New form created",
        description: "Your draft form has been created",
      });
    } catch (error) {
      toast({
        variant: "destructive", 
        title: "Error",
        description: "Failed to create new form",
      });
    }
  };

  const handlePublishForm = async () => {
    if (!currentForm || isPublishing) return;
    
    setIsPublishing(true);
    try {
      // Clear any pending auto-save to prevent conflicts
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }

      // First save current changes as draft to ensure all data is saved
      await saveDraft(currentForm.id, {
        title: formData.title,
        description: formData.description,
        fields: formData.fields
      });

      // Then publish using the dedicated publishForm method for consistency
      const publishedForm = await publishForm(currentForm.id);
      setCurrentForm(publishedForm);
      
      // Refresh forms list to ensure dashboard shows correct state
      await refetch();
      
      toast({
        title: "Success",
        description: "Form published successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to publish form",
      });
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar 
        activeView={activeView} 
        onViewChange={setActiveView} 
        onNewForm={handleNewForm}
      />

      <div className="flex-1 flex flex-col">
        <Header
          formTitle={formData.title}
          onTitleChange={(title) => setFormData((prev) => ({ ...prev, title }))}
          activeView={activeView}
          onPreview={() => setActiveView("preview")}
          onPublish={handlePublishForm}
          onShare={() => {
            // Share functionality to be implemented
            console.log("Share clicked");
          }}
          isFormDraft={currentForm?.status === 'draft'}
          isFormPublished={currentForm?.status === 'published'}
          isPublishing={isPublishing}
        />

        <main className="flex-1 overflow-hidden">
          {activeView === "dashboard" && (
            <FormsDashboard 
              onFormSelect={handleFormSelect}
              onNewForm={handleNewForm}
            />
          )}
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

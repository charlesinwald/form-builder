"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { FormBuilder } from "@/app/components/form-builder";
import { FormPreview } from "@/app/components/form-preview";
import { FormsDashboard } from "@/app/components/forms-dashboard";
import { Sidebar } from "@/app/components/sidebar";
import { Header } from "@/app/components/header";
import { ShareFormModal } from "@/app/components/share-form-modal";
import { ResponsesView } from "@/app/components/responses-view";
import { Button } from "@/app/components/ui/button";
import { Form } from "@/lib/api";
import { useForms } from "@/hooks/use-forms";
import { useToast } from "@/hooks/use-toast";
import { AnalyticsDashboard } from "./components/analytics-dashboard";
import { RealTimeAnalyticsDashboard } from "./components/real-time-analytics-dashboard";
import { FormCard } from "./components/form-card";

interface FormFieldData {
  id: string;
  type: "text" | "textarea" | "select" | "radio" | "checkbox" | "rating";
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
}

interface FormData {
  title: string;
  description: string;
  fields: FormFieldData[];
}

export default function HomePage() {
  const [activeView, setActiveView] = useState<
    "dashboard" | "builder" | "preview" | "analytics" | "responses"
  >("dashboard");
  const [currentForm, setCurrentForm] = useState<Form | null>(null);
  const [formData, setFormData] = useState<FormData>({
    title: "Untitled Form",
    description: "",
    fields: [],
  });
  const [isPublishing, setIsPublishing] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const { forms, saveDraft, createForm, publishForm, refetch } = useForms();
  const { toast } = useToast();
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-save functionality
  const performAutoSave = useCallback(async () => {
    if (!currentForm) return;

    try {
      await saveDraft(currentForm.id, {
        title: formData.title,
        description: formData.description,
        fields: formData.fields,
      });
    } catch (error) {
      console.error("Auto-save failed:", error);
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
    // Don't change the active view - stay on current view
  };

  const handleNewForm = async () => {
    try {
      const newForm = await createForm({
        title: "Untitled Form",
        description: "",
        fields: [],
        status: "draft",
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
    } catch {
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
        fields: formData.fields,
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
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to publish form",
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const handleViewResponses = (form: Form) => {
    setCurrentForm(form);
    setActiveView("responses");
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
          onPreview={() => setActiveView("preview")}
          onPublish={handlePublishForm}
          onShare={() => setShowShareModal(true)}
          isFormDraft={currentForm?.status === "draft"}
          isFormPublished={currentForm?.status === "published"}
          isPublishing={isPublishing}
        />

        <main className="flex-1 overflow-hidden">
          {activeView === "dashboard" && (
            <FormsDashboard
              onFormSelect={handleFormSelect}
              onNewForm={handleNewForm}
              onViewResponses={handleViewResponses}
            />
          )}
          {activeView === "builder" && (
            <FormBuilder formData={formData} onFormDataChange={setFormData} />
          )}
          {activeView === "preview" && <FormPreview formData={formData} />}
          {activeView === "analytics" &&
            (currentForm ? (
              <RealTimeAnalyticsDashboard
                formId={currentForm.id}
                formTitle={currentForm.title}
              />
            ) : (
              <div className="p-6 space-y-6">
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold text-foreground">
                    Analytics Dashboard
                  </h2>
                  <p className="text-muted-foreground">
                    Select a form to view its real-time analytics and insights
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {forms.map((form) => (
                    <FormCard
                      key={form.id}
                      form={form}
                      viewMode="grid"
                      isStatusChanging={false}
                      onSelect={() => handleFormSelect(form)}
                      onDuplicate={() => {}} // Not needed for analytics view
                      onDelete={() => {}} // Not needed for analytics view
                      onStatusChange={() => {}} // Not needed for analytics view
                      onShare={() => {}} // Not needed for analytics view
                      onViewResponses={() => handleViewResponses(form)}
                      context="analytics"
                    />
                  ))}
                </div>

                {forms.length === 0 && (
                  <div className="text-center py-12">
                    <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                      <svg
                        className="w-8 h-8 text-muted-foreground"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      No forms available
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Create a form first to view analytics
                    </p>
                    <Button onClick={handleNewForm} className="gap-2">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      Create Form
                    </Button>
                  </div>
                )}
              </div>
            ))}
          {activeView === "responses" && currentForm && (
            <ResponsesView
              form={currentForm}
              onBack={() => setActiveView("dashboard")}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      {currentForm && (
        <ShareFormModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          formId={currentForm.id}
          formTitle={formData.title}
        />
      )}

      {/* Developer Credit */}
      <div className="fixed bottom-4 right-4 text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors">
        Developed by Charles Inwald
      </div>
    </div>
  );
}

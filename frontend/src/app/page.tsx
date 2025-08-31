"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "./components/auth/protected-route";
import { LandingPage } from "@/app/components/landing-page";
import { FormBuilder } from "@/app/components/form-builder";
import { FormPreview } from "@/app/components/form-preview";
import { FormsDashboard } from "@/app/components/forms-dashboard";
import { Sidebar } from "@/app/components/sidebar";
import { Header } from "@/app/components/header";
import { ShareFormModal } from "@/app/components/share-form-modal";
import { ResponsesView } from "@/app/components/responses-view";
import { Button } from "@/app/components/ui/button";
import { Form, FormField } from "../../../shared/types";
import { useForms } from "@/hooks/use-forms";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { AnalyticsDashboard } from "./components/analytics-dashboard";
import { RealTimeAnalyticsDashboard } from "./components/real-time-analytics-dashboard";
import { FormCard } from "./components/form-card";

interface FormData {
  title: string;
  description: string;
  fields: FormField[];
}

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  
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

  // Auto-save functionality
  const performAutoSave = useCallback(async (formDataSnapshot?: FormData) => {
    if (!currentForm) {
      console.log("Auto-save skipped: no current form");
      return;
    }

    // Use provided snapshot or current formData
    const dataToSave = formDataSnapshot || formData;
    
    console.log("Performing auto-save for form:", currentForm.id);
    console.log("Form data being saved:", { 
      title: dataToSave.title, 
      description: dataToSave.description, 
      fieldsCount: dataToSave.fields.length,
      fields: dataToSave.fields 
    });
    
    try {
      const updatedForm = await saveDraft(currentForm.id, {
        title: dataToSave.title,
        description: dataToSave.description,
        fields: dataToSave.fields,
      });
      console.log("Auto-save successful - returned form:", { 
        id: updatedForm.id, 
        title: updatedForm.title, 
        fieldsCount: updatedForm.fields.length, 
        fields: updatedForm.fields 
      });
      // Update currentForm with the saved form data to keep UI in sync
      // Only update if the form ID matches (safety check)
      if (updatedForm.id === currentForm.id) {
        setCurrentForm(updatedForm);
      } else {
        console.warn("Auto-save returned form with different ID, not updating currentForm");
      }
    } catch (error) {
      console.error("Auto-save failed:", error);
      throw error; // Re-throw so the caller can handle it
    }
  }, [currentForm, formData, saveDraft]);

  // Auto-create form when accessing builder without current form
  useEffect(() => {
    if (activeView === "builder" && !currentForm) {
      console.log("Auto-creating form for builder view");
      // Create a form directly without changing the view (to prevent loops)
      createForm({
        title: "Untitled Form",
        description: "",
        fields: [],
        status: "draft",
      }).then((newForm) => {
        setCurrentForm(newForm);
        const newFormData = {
          title: newForm.title,
          description: newForm.description,
          fields: newForm.fields,
        };
        setFormData(newFormData);
        toast({
          title: "New form created",
          description: "Your draft form has been created",
        });
      }).catch((error) => {
        console.error("Failed to auto-create form:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to create new form",
        });
      });
    }
  }, [activeView, currentForm, createForm, toast]);

  // Save immediately on explicit user changes only
  const handleFormDataChange = useCallback((updated: FormData) => {
    setFormData(updated);
    if (currentForm) {
      void performAutoSave({ ...updated });
    }
  }, [currentForm, performAutoSave]);

  const handleGetStarted = () => {
    router.push("/auth");
  };

  // Show loading state while auth is being determined
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show landing page for non-authenticated users
  if (!isAuthenticated) {
    return <LandingPage onGetStarted={handleGetStarted} />;
  }

  const handleFormSelect = (form: Form) => {
    console.log("Selecting form:", { 
      id: form.id, 
      title: form.title, 
      fieldsCount: form.fields.length, 
      fields: form.fields 
    });
    setCurrentForm(form);
    const newFormData = {
      title: form.title,
      description: form.description,
      fields: form.fields,
    };
    setFormData(newFormData);
    if (activeView !== "analytics") {
      setActiveView("builder");
    }
  };

  const handleNewForm = async () => {
    try {
      console.log("Creating new form...");
      const newForm = await createForm({
        title: "Untitled Form",
        description: "",
        fields: [],
        status: "draft",
      });
      console.log("New form created:", newForm);
      setCurrentForm(newForm);
      const newFormData = {
        title: newForm.title,
        description: newForm.description,
        fields: newForm.fields,
      };
      setFormData(newFormData);
      setActiveView("builder");
      toast({
        title: "New form created",
        description: "Your draft form has been created",
      });
    } catch (error) {
      console.error("Failed to create form:", error);
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
    <ProtectedRoute>
      <div className="flex h-screen bg-background">
      <Sidebar
        activeView={activeView}
        onViewChange={setActiveView}
        onNewForm={handleNewForm}
      />

      <div className="flex-1 flex flex-col">
        <Header
          formTitle={formData.title}
          onTitleChange={(title) => handleFormDataChange({ ...formData, title })}
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
              onEditForm={(form) => {
                setCurrentForm(form);
                const newFormData = {
                  title: form.title,
                  description: form.description,
                  fields: form.fields,
                };
                setFormData(newFormData);
                setActiveView("builder");
              }}
            />
          )}
          {activeView === "builder" && (
            <FormBuilder formData={formData} onFormDataChange={handleFormDataChange} />
          )}
          {activeView === "preview" && <FormPreview formData={formData} />}
          {activeView === "analytics" &&
            (currentForm ? (
              <RealTimeAnalyticsDashboard
                formId={currentForm.id}
                formTitle={currentForm.title}
                onBack={() => {
                  setCurrentForm(null);
                  setActiveView("analytics");
                }}
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
                      onEdit={() => {
                        setCurrentForm(form);
                        const newFormData = {
                          title: form.title,
                          description: form.description,
                          fields: form.fields,
                        };
                        setFormData(newFormData);
                        setActiveView("builder");
                      }}
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

      </div>
    </ProtectedRoute>
  );
}

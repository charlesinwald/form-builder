import { useState, useEffect, useCallback } from 'react';
import { Form, CreateFormRequest, UpdateFormRequest } from '../../../shared/types';
import { apiService } from '@/lib/api';

export function useForms(initialStatus?: string) {
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchForms = useCallback(async (status?: string) => {
    try {
      console.log('useForms: Fetching forms with status:', status);
      setLoading(true);
      setError(null);
      const data = await apiService.getForms(status);
      console.log('useForms: Fetched forms:', data.length, 'forms');
      setForms(data);
    } catch (err) {
      console.error('useForms: Error fetching forms:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch forms');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchForms(initialStatus);
  }, [fetchForms, initialStatus]);

  const createForm = useCallback(async (formData: CreateFormRequest) => {
    try {
      console.log('useForms: Creating form with data:', formData);
      const newForm = await apiService.createForm(formData);
      console.log('useForms: Form created successfully:', newForm);
      setForms(prev => {
        const updatedForms = [newForm, ...prev];
        console.log('useForms: Updated forms list:', updatedForms.length, 'forms');
        return updatedForms;
      });
      return newForm;
    } catch (err) {
      console.error('useForms: Failed to create form:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create form';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const updateForm = useCallback(async (id: string, updates: UpdateFormRequest) => {
    try {
      const updatedForm = await apiService.updateForm(id, updates);
      setForms(prev => prev.map(form => form.id === id ? updatedForm : form));
      return updatedForm;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update form';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const deleteForm = useCallback(async (id: string) => {
    // Store original form for rollback if needed
    const originalForm = forms.find(f => f.id === id);
    const originalForms = forms;
    
    // Optimistic update - immediately remove form from UI
    setForms(prev => prev.filter(form => form.id !== id));

    try {
      await apiService.deleteForm(id);
    } catch (err) {
      // Rollback optimistic update on error
      setForms(originalForms);
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete form';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [forms]);

  const saveDraft = useCallback(async (id: string, formData: Omit<CreateFormRequest, 'status'>) => {
    try {
      console.log('useForms: Saving draft for form ID:', id, 'with data:', formData);
      const response = await apiService.saveDraft(id, formData);
      console.log('useForms: Draft saved successfully:', response);
      setForms(prev => {
        const updatedForms = prev.map(form => form.id === id ? response.form : form);
        console.log('useForms: Updated forms after save:', updatedForms.length, 'forms');
        return updatedForms;
      });
      return response.form;
    } catch (err) {
      console.error('useForms: Failed to save draft:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to save draft';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const publishForm = useCallback(async (id: string) => {
    // Optimistic update
    const originalForm = forms.find(f => f.id === id);
    setForms(prev => prev.map(form => 
      form.id === id 
        ? { ...form, status: 'published' as const, isActive: true }
        : form
    ));

    try {
      const updatedForm = await apiService.publishForm(id);
      setForms(prev => prev.map(form => form.id === id ? updatedForm : form));
      return updatedForm;
    } catch (err) {
      // Rollback optimistic update on error
      if (originalForm) {
        setForms(prev => prev.map(form => form.id === id ? originalForm : form));
      }
      const errorMessage = err instanceof Error ? err.message : 'Failed to publish form';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [forms]);

  const unpublishForm = useCallback(async (id: string) => {
    // Optimistic update
    const originalForm = forms.find(f => f.id === id);
    setForms(prev => prev.map(form => 
      form.id === id 
        ? { ...form, status: 'draft' as const, isActive: false }
        : form
    ));

    try {
      const updatedForm = await apiService.unpublishForm(id);
      setForms(prev => prev.map(form => form.id === id ? updatedForm : form));
      return updatedForm;
    } catch (err) {
      // Rollback optimistic update on error
      if (originalForm) {
        setForms(prev => prev.map(form => form.id === id ? originalForm : form));
      }
      const errorMessage = err instanceof Error ? err.message : 'Failed to unpublish form';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [forms]);

  const archiveForm = useCallback(async (id: string) => {
    // Optimistic update
    const originalForm = forms.find(f => f.id === id);
    setForms(prev => prev.map(form => 
      form.id === id 
        ? { ...form, status: 'archived' as const, isActive: false }
        : form
    ));

    try {
      const updatedForm = await apiService.archiveForm(id);
      setForms(prev => prev.map(form => form.id === id ? updatedForm : form));
      return updatedForm;
    } catch (err) {
      // Rollback optimistic update on error
      if (originalForm) {
        setForms(prev => prev.map(form => form.id === id ? originalForm : form));
      }
      const errorMessage = err instanceof Error ? err.message : 'Failed to archive form';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [forms]);

  const duplicateForm = useCallback(async (form: Form) => {
    try {
      const duplicatedFormData: CreateFormRequest = {
        title: `${form.title} (Copy)`,
        description: form.description,
        fields: form.fields,
        status: 'draft'
      };
      return await createForm(duplicatedFormData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to duplicate form';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [createForm]);

  return {
    forms,
    loading,
    error,
    refetch: fetchForms,
    createForm,
    updateForm,
    deleteForm,
    saveDraft,
    publishForm,
    unpublishForm,
    archiveForm,
    duplicateForm,
  };
}
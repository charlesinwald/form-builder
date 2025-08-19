import { useState, useEffect, useCallback } from 'react';
import { apiService, Form, CreateFormRequest, UpdateFormRequest } from '@/lib/api';

export function useForms(initialStatus?: string) {
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchForms = useCallback(async (status?: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getForms(status);
      setForms(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch forms');
      console.error('Error fetching forms:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchForms(initialStatus);
  }, [fetchForms, initialStatus]);

  const createForm = useCallback(async (formData: CreateFormRequest) => {
    try {
      const newForm = await apiService.createForm(formData);
      setForms(prev => [newForm, ...prev]);
      return newForm;
    } catch (err) {
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
    try {
      await apiService.deleteForm(id);
      setForms(prev => prev.filter(form => form.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete form';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const saveDraft = useCallback(async (id: string, formData: Omit<CreateFormRequest, 'status'>) => {
    try {
      const response = await apiService.saveDraft(id, formData);
      setForms(prev => prev.map(form => form.id === id ? response.form : form));
      return response.form;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save draft';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const publishForm = useCallback(async (id: string) => {
    try {
      const updatedForm = await apiService.publishForm(id);
      setForms(prev => prev.map(form => form.id === id ? updatedForm : form));
      return updatedForm;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to publish form';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const unpublishForm = useCallback(async (id: string) => {
    try {
      const updatedForm = await apiService.unpublishForm(id);
      setForms(prev => prev.map(form => form.id === id ? updatedForm : form));
      return updatedForm;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to unpublish form';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const archiveForm = useCallback(async (id: string) => {
    try {
      const updatedForm = await apiService.archiveForm(id);
      setForms(prev => prev.map(form => form.id === id ? updatedForm : form));
      return updatedForm;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to archive form';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

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
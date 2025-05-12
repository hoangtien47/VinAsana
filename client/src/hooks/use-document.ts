import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

export function useDocument() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [projectId, setProjectId] = useState<number | null>(null);

  // Fetch documents for the active project
  const {
    data: documents,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [`/api/projects/${projectId}/documents`],
    enabled: !!projectId,
  });

  const fetchDocuments = async (newProjectId: number, category?: string) => {
    setProjectId(newProjectId);
    if (newProjectId) {
      const queryKey = category 
        ? [`/api/projects/${newProjectId}/documents`, { category }]
        : [`/api/projects/${newProjectId}/documents`];
        
      return queryClient.fetchQuery({ queryKey });
    }
  };

  const uploadDocument = async (documentData: FormData) => {
    if (!projectId) {
      throw new Error("No project selected");
    }

    try {
      // Use fetch for file uploads with FormData
      const response = await fetch(`/api/projects/${projectId}/documents`, {
        method: "POST",
        body: documentData,
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }
      
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/documents`] });
      return response.json();
    } catch (error) {
      console.error("Failed to upload document:", error);
      throw error;
    }
  };

  const updateDocument = async (documentId: number, documentData: FormData) => {
    try {
      // Use fetch for file uploads with FormData
      const response = await fetch(`/api/documents/${documentId}`, {
        method: "PATCH",
        body: documentData,
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error(`Update failed: ${response.statusText}`);
      }
      
      // Invalidate both document list and individual document
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/documents`] });
      queryClient.invalidateQueries({ queryKey: [`/api/documents/${documentId}`] });
      return response.json();
    } catch (error) {
      console.error("Failed to update document:", error);
      throw error;
    }
  };

  const deleteDocument = async (documentId: number) => {
    try {
      await apiRequest("DELETE", `/api/documents/${documentId}`, undefined);
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/documents`] });
    } catch (error) {
      console.error("Failed to delete document:", error);
      throw error;
    }
  };

  const getDocument = async (documentId: number) => {
    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch document: ${response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error("Failed to get document:", error);
      throw error;
    }
  };

  return {
    documents,
    isLoading,
    error,
    fetchDocuments,
    uploadDocument,
    updateDocument,
    deleteDocument,
    getDocument,
    setProjectId,
  };
}

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth0 } from "@auth0/auth0-react";

// Document structure from API
export interface Document {
  id: number;
  key: string;
  url: string;
  contentType: 'specification' | 'design' | 'contract' | 'invoice' | 'report' | 'other';
  acl: 'PUBLIC_READ' | 'PRIVATE';
  description?: string;
}

// Document version structure
export interface DocumentVersion {
  versionId: string;
  lastModified: string;
  isLatest: boolean;
  modifiedBy: string;
}

// Filter options for documents
export interface DocumentFilters {
  // Pagination
  page?: number;
  size?: number;
  
  // Sorting
  sort?: string; // e.g., "createdAt,desc" or "key,asc"
  
  items?: []  // Category filter
  

  [key: string]: any;
}

export function useDocument() {
  const { toast } = useToast();
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();
  const [isUploading, setIsUploading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Helper function to make authenticated API requests
  const authFetch = async (url: string, options: RequestInit = {}) => {
    if (!isAuthenticated) {
      throw new Error("User is not authenticated");
    }

    const token = await getAccessTokenSilently();
    console.log("Token:", token);
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
      if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Request failed with status ${response.status}`
      );
    }

    // Handle empty responses
    const responseText = await response.text();
    if (!responseText) {
      return {};
    }

    try {
      return JSON.parse(responseText);
    } catch (parseError) {
      console.warn("Failed to parse response as JSON:", parseError);
      return { raw: responseText };
    }  };

  // Utility function to get presigned URL for download/preview with versioning support
  const getPresignedUrl = async (
    key: string, 
    contentDisposition: 'inline' | 'attachment' = 'attachment',
    versionId?: string
  ) => {
    console.log("Requesting presigned URL for:", { key, contentDisposition, versionId });
    
    const token = await getAccessTokenSilently();
    
    // Build query parameters
    const queryParams = new URLSearchParams({
      key: key,
      contentDisposition: contentDisposition,
    });
    
    if (versionId) {
      queryParams.append('versionId', versionId);
    }
    
    const url = `http://localhost:8080/v1/s3/presigned-request?${queryParams.toString()}`;
    console.log("Presigned URL request:", url);
    
    const response = await fetch(url, {
      method: "GET", // Changed to GET since we're just requesting a URL
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("Presigned URL response status:", response.status, response.statusText);

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Authentication required to get presigned URL");
      }
      const errorText = await response.text();
      console.error("Presigned URL error response:", errorText);
      throw new Error(`Failed to get presigned URL: ${response.statusText}`);
    }

    const result = await response.json();
    console.log("Presigned URL result:", result);
    return result.url || result; // Return the URL directly
  };

  // Utility function to get presigned URL for upload (keeping the original for uploads)
  const postPresignedUrl = async (key: string, acl: string) => {
    console.log("Requesting presigned URL for:", { key, acl });
    
    const token = await getAccessTokenSilently();
    const url = `http://localhost:8080/v1/s3/presigned-request?key=${encodeURIComponent(key)}&acl=${encodeURIComponent(acl)}`;
    console.log("Presigned URL request:", url);
    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log("Presigned URL response status:", response.status, response.statusText);

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Authentication required to get presigned URL");
      }
      const errorText = await response.text();
      console.error("Presigned URL error response:", errorText);
      throw new Error(`Failed to get presigned URL: ${response.statusText}`);
    }

    const result = await response.json();
    console.log("Presigned URL result:", result);
    return result;
  };

  // Utility function to upload file to S3
  const uploadToS3 = async (file: File, presignedData: any) => {
    const uploadHeaders: Record<string, string> = {};
    
    // Copy all signed headers from the response
    if (presignedData.signedHeaders) {
      Object.keys(presignedData.signedHeaders).forEach(key => {
        uploadHeaders[key] = presignedData.signedHeaders[key];
      });
    }

      // Use XMLHttpRequest for progress tracking
      const xhr = new XMLHttpRequest();
      
      return new Promise<string>((resolve, reject) => {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 60) + 20; // 20-80% for upload
            setUploadProgress(progress);
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            setUploadProgress(80);

            const fileUrl = presignedData.url;
            resolve(fileUrl);
          } else {
            reject(new Error(`S3 upload failed: ${xhr.statusText}`));
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('S3 upload failed'));
        });

        xhr.open('PUT', presignedData.url);
        
        Object.keys(uploadHeaders).forEach(key => {
          xhr.setRequestHeader(key, uploadHeaders[key]);
        });
        
        xhr.send(file);      
      });
  };
    
  const uploadDocument = async (file: File, fileName?: string, category: string = 'other', acl: 'PUBLIC_READ' | 'PRIVATE' = 'PUBLIC_READ', description?: string) => {
    setIsUploading(true);
    setUploadProgress(0);

    console.log("Starting document upload:", { fileName, category, acl, description });    
    try {
      // Use document name as key (including file extension) and category as contentType
      const documentName = fileName || file.name; // Keep file extension
      const key = documentName.includes('.') ? documentName : `${documentName}.${file.name.split('.').pop()}`; // Ensure extension is included
      const contentType = category; // Use category as contentType


      // Step 1: Get presigned URL from your API
      setUploadProgress(10);
      const presignedData = await postPresignedUrl(key, acl);
      setUploadProgress(20);
      

      // Step 2: Upload file to S3 using presigned URL with progress tracking
      const fileUrl = await uploadToS3(file, presignedData);


      setUploadProgress(90);      
        // Step 3: Save document metadata to your database
      const documentData = {
        key: key,
        url: presignedData.url.split('?')[0],
        contentType: contentType,
        acl: acl,
        description: description,
      };

      console.log("Saving document metadata:", documentData);

      const token = await getAccessTokenSilently();
      const saveResponse = await fetch(`http://localhost:8080/v1/files`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(documentData),
      });

      console.log("Save response status:", saveResponse.status, saveResponse.statusText);if (!saveResponse.ok) {
        throw new Error(`Failed to save document metadata: ${saveResponse.statusText}`);
      }
      
      setUploadProgress(100);
        // Parse response safely
      let savedDocument = null;
      const responseText = await saveResponse.text();
      console.log("Save response body:", responseText);
      
      if (responseText) {
        try {
          savedDocument = JSON.parse(responseText);
          console.log("Parsed saved document:", savedDocument);
        } catch (parseError) {
          console.warn("Failed to parse server response as JSON:", parseError);
          console.warn("Response text was:", responseText);
          // Continue without the parsed response
        }
      } else {
        console.log("Empty response from server");
      }
      
      // Invalidate documents cache to refresh the list
      await queryClient.invalidateQueries({ queryKey: ["documents"] });
      
      toast({
        title: "Upload Successful",
        description: "Document has been uploaded successfully",
      });
      
      return {
        ...(savedDocument || {}),
        url: fileUrl,
      };    } catch (error) {
      console.error("Failed to upload document:", error);
      
      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes("Failed to execute 'json'")) {
          toast({
            title: "Upload Failed",
            description: "Server returned an invalid response. Please try again.",
            variant: "destructive",
          });
        } else if (error.message.includes("Authentication")) {
          toast({
            title: "Authentication Error",
            description: "Please log in again and try uploading.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Upload Failed",
            description: error.message,
            variant: "destructive",
          });
        }
      }
      
      throw error;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };
  
  // Function to replace an existing document file while keeping the same key
  const replaceDocumentFile = async (file: File, existingKey: string, category: string = 'other', acl: 'PUBLIC_READ' | 'PRIVATE' = 'PUBLIC_READ', description?: string) => {
    setIsUploading(true);
    setUploadProgress(0);

    console.log("Starting document file replacement:", { existingKey, category, acl, description });
    
    try {
      const key = existingKey; // Use the existing key
      const contentType = category; // Use category as contentType

      console.log("Replace params:", { key, contentType, acl });

      // Step 1: Get presigned URL from your API (this will overwrite the existing file)
      setUploadProgress(10);
      const presignedData = await postPresignedUrl(key, acl);
      setUploadProgress(20);
      
      console.log("Presigned data for replacement:", presignedData);

      // Step 2: Upload file to S3 using presigned URL with progress tracking
      const fileUrl = await uploadToS3(file, presignedData);

      console.log("S3 replacement upload completed, file URL:", fileUrl);

      setUploadProgress(90);      
        
      // Step 3: Update document metadata in your database
      const documentData = {
        key: key,
        url: presignedData.url.split('?')[0],
        contentType: contentType,
        acl: acl,
        description: description,
      };

      console.log("Updating document metadata:", documentData);

      const token = await getAccessTokenSilently();
      const saveResponse = await fetch(`http://localhost:8080/v1/files`, {
        method: "POST", // Still use POST as it will create a new version
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(documentData),
      });

      console.log("Update response status:", saveResponse.status, saveResponse.statusText);
      
      if (!saveResponse.ok) {
        throw new Error(`Failed to update document metadata: ${saveResponse.statusText}`);
      }
      
      setUploadProgress(100);
        
      // Parse response safely
      let updatedDocument = null;
      const responseText = await saveResponse.text();
      console.log("Update response body:", responseText);
      
      if (responseText) {
        try {
          updatedDocument = JSON.parse(responseText);
          console.log("Parsed updated document:", updatedDocument);
        } catch (parseError) {
          console.warn("Failed to parse server response as JSON:", parseError);
          console.warn("Response text was:", responseText);
          // Continue without the parsed response
        }
      } else {
        console.log("Empty response from server");
      }
      
      // Invalidate documents cache to refresh the list
      await queryClient.invalidateQueries({ queryKey: ["documents"] });
      
      toast({
        title: "File Replaced Successfully",
        description: "Document file has been replaced successfully",
      });
      
      return {
        ...(updatedDocument || {}),
        url: fileUrl,
      };
    } catch (error) {
      console.error("Failed to replace document file:", error);
      
      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes("Failed to execute 'json'")) {
          toast({
            title: "Replace Failed",
            description: "Server returned an invalid response. Please try again.",
            variant: "destructive",
          });
        } else if (error.message.includes("Authentication")) {
          toast({
            title: "Authentication Error",
            description: "Please log in again and try replacing the file.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Replace Failed",
            description: error.message,
            variant: "destructive",
          });
        }
      }
      
      throw error;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Get documents with filtering
  const getDocuments = async (filters: DocumentFilters = {}) => {
    try {
      // Build query parameters
      const queryParams = new URLSearchParams();
      
      // Pagination
      if (filters.page) queryParams.append('page', filters.page.toString());
      if (filters.size) queryParams.append('size', filters.size.toString());
      
      // Sorting
      if (filters.sort) queryParams.append('sort', filters.sort);
      
      // Dynamic filters - automatically add any provided filter
      Object.keys(filters).forEach(key => {
        if (key !== 'page' && key !== 'size' && key !== 'sort' && filters[key] !== undefined && filters[key] !== null) {
          queryParams.append(key, filters[key].toString());
        }
      });

      const url = `http://localhost:8080/v1/files${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      console.log("Fetching documents from:", url);
      
      return await authFetch(url);
    } catch (error) {
      console.error("Failed to fetch documents:", error);
      throw error;
    }
  };

  // Update document
  const updateDocument = async (documentId: number, updateData: Partial<Document>) => {
    setIsUpdating(true);
    try {
      const url = `http://localhost:8080/v1/files/${documentId}`;
      const result = await authFetch(url, {
        method: 'PATCH',
        body: JSON.stringify(updateData),
      });
      
      // Invalidate documents cache to refresh the list
      await queryClient.invalidateQueries({ queryKey: ["documents"] });
      
      toast({
        title: "Document Updated",
        description: "Document has been updated successfully",
      });
      
      return result;
    } catch (error) {
      console.error("Failed to update document:", error);
      toast({
        title: "Update Failed", 
        description: error instanceof Error ? error.message : "Failed to update document",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  // Delete document
  const deleteDocument = async (documentId: number) => {
    try {
      const url = `http://localhost:8080/v1/files/${documentId}`;
      await authFetch(url, {
        method: 'DELETE',
      });
      
      // Invalidate documents cache to refresh the list
      await queryClient.invalidateQueries({ queryKey: ["documents"] });
      
      toast({
        title: "Document Deleted",
        description: "Document has been deleted successfully",
      });
    } catch (error) {
      console.error("Failed to delete document:", error);
      toast({
        title: "Delete Failed",
        description: error instanceof Error ? error.message : "Failed to delete document", 
        variant: "destructive",
      });
      throw error;
    }
  };
  // Get single document by ID
  const getDocumentById = async (documentId: number) => {
    try {
      const url = `http://localhost:8080/v1/files/${documentId}`;
      return await authFetch(url);
    } catch (error) {
      console.error("Failed to fetch document:", error);
      throw error;
    }
  };

  // Get document versions by key
  const getDocumentVersions = async (key: string): Promise<DocumentVersion[]> => {
    try {
      const url = `http://localhost:8080/v1/files/versions?key=${encodeURIComponent(key)}`;
      console.log("Fetching document versions from:", url);
      return await authFetch(url);
    } catch (error) {
      console.error("Failed to fetch document versions:", error);
      throw error;
    }
  };
  // Helper function to get preview URL for a document
  const getDocumentPreviewUrl = async (key: string, versionId?: string) => {
    return await getPresignedUrl(key, 'inline', versionId);
  };

  // Helper function to get download URL for a document
  const getDocumentDownloadUrl = async (key: string, versionId?: string) => {
    return await getPresignedUrl(key, 'attachment', versionId);
  };

  // React Query hook for documents with filters
  const useDocuments = (filters: DocumentFilters = {}) => {
    return useQuery({
      queryKey: ["documents", filters],
      queryFn: () => getDocuments(filters),
      enabled: isAuthenticated,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    });
  };

  // React Query hook for document versions
  const useDocumentVersions = (key: string) => {
    return useQuery({
      queryKey: ["document-versions", key],
      queryFn: () => getDocumentVersions(key),
      enabled: isAuthenticated && !!key,
      staleTime: 2 * 60 * 1000, // 2 minutes
      gcTime: 5 * 60 * 1000, // 5 minutes
    });
  };


  return {
    getDocuments,
    useDocuments,
    uploadDocument,
    replaceDocumentFile,
    isUploading,
    isUpdating,
    uploadProgress,
    updateDocument,
    deleteDocument,
    getDocumentById,    getDocumentVersions,
    useDocumentVersions,
    getPresignedUrl,
    getDocumentPreviewUrl,
    getDocumentDownloadUrl,
  };
}

import { useState } from "react";
import { Sidebar } from "@/components/ui/sidebar";
import { Navbar } from "@/components/ui/navbar";
import { DocumentList } from "@/components/documents/document-list";
import { DocumentUpload } from "@/components/documents/document-upload";
import { DocumentViewer } from "@/components/documents/document-viewer";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { useDocument, DocumentFilters } from "@/hooks/use-document";

export default function Documents() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [filters, setFilters] = useState<DocumentFilters>({
    page: 0,
    size: 10,
    sort: "id,desc"
  });

  // Use the document hook with filters
  const { useDocuments } = useDocument();
  const { 
    data: documents, 
    isLoading: isLoadingDocuments, 
    error: documentsError,
    refetch: refetchDocuments 
  } = useDocuments(filters);

  console.log("Documents:", documents);

  const handleUploadClick = () => {
    setSelectedDocument(null);
    setIsEditMode(false);
    setIsUploadDialogOpen(true);
  };

  const handleViewDocument = (document: any) => {
    setSelectedDocument(document);
    setIsViewerOpen(true);
  };

  const handleEditDocument = (document: any) => {
    setSelectedDocument(document);
    setIsEditMode(true);
    setIsViewerOpen(false);
    setIsUploadDialogOpen(true);
  };

  const handleDocumentsChange = () => {
    refetchDocuments();
  };

  // Handle filter changes
  const handleFilterChange = (newFilters: Partial<DocumentFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };
  // Loading state
  if (isLoadingDocuments) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Error state
  if (documentsError) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-2">Failed to load documents</p>
          <button 
            onClick={() => refetchDocuments()} 
            className="text-blue-500 underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar title="Documents" subtitle="All App Documents" />
        <div className="flex-1 p-6 overflow-auto">
          {/* Document list */}
          <DocumentList
            documents={documents.items || []}
            onViewDocument={handleViewDocument}
            onEditDocument={handleEditDocument}
            onUploadDocument={handleUploadClick}
            onDocumentsChange={handleDocumentsChange}
            onFilterChange={handleFilterChange}
            filters={filters}
          />

          {/* Document upload dialog */}
          <DocumentUpload
            open={isUploadDialogOpen}
            onClose={() => setIsUploadDialogOpen(false)}
            onDocumentUploaded={handleDocumentsChange}
            editDocument={isEditMode ? selectedDocument : undefined}
            isEditMode={isEditMode}
          />

          {/* Document viewer */}
          <DocumentViewer
            document={selectedDocument}
            open={isViewerOpen}
            onClose={() => setIsViewerOpen(false)}
            onEdit={handleEditDocument}
            allDocuments={documents || []}
          />
        </div>
      </div>
    </div>
  );
}

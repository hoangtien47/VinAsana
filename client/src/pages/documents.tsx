import { useState, useEffect } from "react";
import { Sidebar } from "@/components/ui/sidebar";
import { Navbar } from "@/components/ui/navbar";
import { DocumentList } from "@/components/documents/document-list";
import { DocumentUpload } from "@/components/documents/document-upload";
import { DocumentViewer } from "@/components/documents/document-viewer";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDocument } from "@/hooks/use-document";

export default function Documents() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [projectId, setProjectId] = useState<number | null>(null);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Get the first project ID for now, in a real application you'd want to get this from the URL
  const {
    data: projects,
    isLoading: isLoadingProjects,
    error: projectsError,
  } = useQuery({
    queryKey: ['/api/projects'],
    enabled: !!user,
  });

  // Set the first project as active when projects load
  useEffect(() => {
    if (projects && projects.length > 0 && !projectId) {
      setProjectId(projects[0].id);
    }
  }, [projects, projectId]);

  // Fetch documents for the active project
  const {
    data: documents,
    isLoading: isLoadingDocuments,
    error: documentsError,
    refetch: refetchDocuments,
  } = useQuery({
    queryKey: [`/api/projects/${projectId}/documents`],
    enabled: !!projectId,
  });

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

  const handleDocumentUploaded = () => {
    refetchDocuments();
  };

  // Loading state
  if (isLoadingProjects) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // No projects state
  if (projects && projects.length === 0) {
    return (
      <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Navbar title="Documents" />
          <div className="flex-1 p-6 flex items-center justify-center">
            <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-lg shadow-sm w-full max-w-md">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">No Projects Found</h2>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Create your first project to start managing documents.
              </p>
              <Button className="mt-4">Create Project</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar title="Documents" subtitle={projects?.find((p: any) => p.id === projectId)?.name} />
        <div className="flex-1 p-6 overflow-auto">          {/* Project selector */}
          {projects && projects.length > 1 && (
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-sm font-medium">Project:</span>              <Select
                value={projectId?.toString() || undefined}
                onValueChange={(value) => setProjectId(Number(value))}
              >
                <SelectTrigger className="w-[250px]">
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project: any) => (
                    <SelectItem key={project.id} value={project.id.toString()}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Document list */}
          {isLoadingDocuments ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <DocumentList
              documents={documents || []}
              projectId={projectId!}
              onViewDocument={handleViewDocument}
              onEditDocument={handleEditDocument}
              onUploadDocument={handleUploadClick}
              onDocumentsChange={refetchDocuments}
            />
          )}

          {/* Document upload dialog */}
          <DocumentUpload
            open={isUploadDialogOpen}
            onClose={() => setIsUploadDialogOpen(false)}
            onDocumentUploaded={handleDocumentUploaded}
            projectId={projectId!}
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

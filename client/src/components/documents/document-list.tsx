import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  FileText, 
  FileImage, 
  FilePen, 
  FileArchive, 
  File, 
  MoreVertical,
  Download,
  Trash2,
  Eye,
  Edit
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate, formatFileSize, getInitials } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
}

interface Document {
  id: number;
  name: string;
  description?: string;
  category: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  projectId: number;
  uploaderId: string;
  uploader?: User;
  version: number;
  createdAt: string;
  updatedAt: string;
}

interface DocumentListProps {
  documents: Document[];
  projectId: number;
  onViewDocument: (document: Document) => void;
  onEditDocument: (document: Document) => void;
  onUploadDocument: () => void;
  onDocumentsChange: () => void;
}

export function DocumentList({
  documents,
  projectId,
  onViewDocument,
  onEditDocument,
  onUploadDocument,
  onDocumentsChange
}: DocumentListProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("all");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const getFileIcon = (fileType: string) => {
    if (fileType.includes("image")) {
      return <FileImage className="h-10 w-10 text-blue-500" />;
    } else if (fileType.includes("pdf")) {
      return <FilePen className="h-10 w-10 text-red-500" />;
    } else if (fileType.includes("zip") || fileType.includes("rar") || fileType.includes("tar")) {
      return <FileArchive className="h-10 w-10 text-yellow-500" />;
    } else if (fileType.includes("text")) {
      return <FileText className="h-10 w-10 text-green-500" />;
    } else {
      return <File className="h-10 w-10 text-gray-500" />;
    }
  };

  const filteredDocuments = activeTab === "all" 
    ? documents 
    : documents.filter(doc => doc.category === activeTab);

  const handleDeleteClick = (document: Document) => {
    setDocumentToDelete(document);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteDocument = async () => {
    if (!documentToDelete) return;
    
    setIsDeleting(true);
    
    try {
      await apiRequest("DELETE", `/api/documents/${documentToDelete.id}`, undefined);
      
      // Invalidate the documents query
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/documents`] });
      onDocumentsChange();
      
      toast({
        title: "Document deleted",
        description: "The document has been deleted successfully.",
      });
      
      setIsDeleteDialogOpen(false);
      setDocumentToDelete(null);
    } catch (error) {
      console.error("Failed to delete document:", error);
      toast({
        title: "Error",
        description: "Failed to delete the document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const categories = [
    { value: "all", label: "All Documents" },
    { value: "specification", label: "Specifications" },
    { value: "design", label: "Designs" },
    { value: "contract", label: "Contracts" },
    { value: "invoice", label: "Invoices" },
    { value: "report", label: "Reports" },
    { value: "other", label: "Other" },
  ];

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
          <CardTitle className="text-lg">Documents</CardTitle>
          <Button onClick={onUploadDocument}>Upload Document</Button>
        </div>
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
            {categories.map((category) => (
              <TabsTrigger key={category.value} value={category.value}>
                {category.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className="flex-grow overflow-auto p-4">
        {filteredDocuments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDocuments.map((document) => (
              <div 
                key={document.id} 
                className="flex border rounded-lg p-4 hover:border-primary transition-colors"
              >
                <div className="flex-shrink-0 mr-4">
                  {getFileIcon(document.fileType)}
                </div>
                <div className="flex-grow min-w-0">
                  <div className="flex items-start justify-between">
                    <h3 
                      className="font-medium text-base truncate cursor-pointer hover:text-primary"
                      onClick={() => onViewDocument(document)}
                    >
                      {document.name}
                    </h3>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onViewDocument(document)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEditDocument(document)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <a 
                            href={document.fileUrl} 
                            download 
                            className="flex items-center w-full"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </a>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-red-500 focus:text-red-500"
                          onClick={() => handleDeleteClick(document)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  {document.description && (
                    <p className="text-sm text-gray-500 mt-1 truncate">{document.description}</p>
                  )}
                  
                  <div className="flex items-center mt-2 space-x-2">
                    <Badge variant="outline">{formatFileSize(document.fileSize)}</Badge>
                    <Badge variant="outline">v{document.version}</Badge>
                    <Badge variant="outline" className="capitalize">
                      {document.category}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                    <div className="flex items-center">
                      {document.uploader && (
                        <>
                          <Avatar className="h-5 w-5 mr-1">
                            <AvatarImage src={document.uploader.profileImageUrl} />
                            <AvatarFallback>
                              {getInitials(`${document.uploader.firstName || ''} ${document.uploader.lastName || ''}`)}
                            </AvatarFallback>
                          </Avatar>
                          <span>{document.uploader.firstName} {document.uploader.lastName}</span>
                        </>
                      )}
                    </div>
                    <span>{formatDate(document.updatedAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64">
            <FileText className="h-12 w-12 text-gray-300 mb-2" />
            <h3 className="text-xl font-medium text-gray-600 mb-1">No documents found</h3>
            <p className="text-gray-500 mb-4">
              {activeTab === "all" 
                ? "Upload your first document to get started" 
                : `No ${activeTab} documents found`}
            </p>
            <Button onClick={onUploadDocument}>Upload Document</Button>
          </div>
        )}
      </CardContent>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Document</DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to delete "{documentToDelete?.name}"? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteDocument} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Edit,
  Lock
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { useToast } from "@/hooks/use-toast";
import { Document, DocumentFilters, useDocument } from "@/hooks/use-document";

interface DocumentListProps {
  documents: Document[];
  onViewDocument: (document: Document) => void;
  onEditDocument: (document: Document) => void;
  onUploadDocument: () => void;
  onDocumentsChange: () => void;
  onFilterChange?: (filters: Partial<DocumentFilters>) => void;
  filters?: DocumentFilters;
}

export function DocumentList({
  documents,
  onViewDocument,
  onEditDocument,
  onUploadDocument,
  onDocumentsChange,
  onFilterChange,
  filters
}: DocumentListProps) {
  const { toast } = useToast();
  const { deleteDocument, getDocumentDownloadUrl } = useDocument();
  const [activeTab, setActiveTab] = useState("all");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);  const getFileIcon = (document: Document) => {
    const extension = document.key.split('.').pop()?.toLowerCase() || '';
    
    // Check by file extension first
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(extension)) {
      return <FileImage className="h-10 w-10 text-blue-500" />;
    } else if (['pdf'].includes(extension)) {
      return <FileText className="h-10 w-10 text-red-500" />;
    } else if (['txt', 'md', 'json', 'xml', 'csv'].includes(extension)) {
      return <FileText className="h-10 w-10 text-green-500" />;
    } else if (['doc', 'docx'].includes(extension)) {
      return <FilePen className="h-10 w-10 text-blue-600" />;
    } else if (['xls', 'xlsx'].includes(extension)) {
      return <FileArchive className="h-10 w-10 text-green-600" />;
    } else if (['ppt', 'pptx'].includes(extension)) {
      return <FileArchive className="h-10 w-10 text-orange-500" />;
    }
    
    // Fallback to content type
    const contentType = document.contentType;
    if (contentType.includes("design")) {
      return <FileImage className="h-10 w-10 text-blue-500" />;
    } else if (contentType.includes("specification")) {
      return <FileText className="h-10 w-10 text-green-500" />;
    } else if (contentType.includes("contract")) {
      return <FilePen className="h-10 w-10 text-red-500" />;
    } else if (contentType.includes("invoice")) {
      return <FileArchive className="h-10 w-10 text-yellow-500" />;
    } else if (contentType.includes("report")) {
      return <FileText className="h-10 w-10 text-purple-500" />;
    } else {
      return <File className="h-10 w-10 text-gray-500" />;
    }
  };

  const getFileExtension = (filename: string) => {
    const extension = filename.split('.').pop()?.toLowerCase() || '';
    return extension.toUpperCase();
  };

  const canPreview = (filename: string) => {
    const extension = filename.split('.').pop()?.toLowerCase() || '';
    return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'pdf', 'txt', 'md', 'json', 'xml', 'csv'].includes(extension);
  };
  const filteredDocuments = activeTab === "all" 
    ? documents 
    : documents.filter(doc => doc.contentType === activeTab);
  const handleDeleteClick = (document: Document) => {
    setDocumentToDelete(document);
    setIsDeleteDialogOpen(true);
  };
  const handleDeleteConfirm = async () => {
    if (!documentToDelete) return;
    
    setIsDeleting(true);
    try {
      await deleteDocument(documentToDelete.id);
      setIsDeleteDialogOpen(false);
      setDocumentToDelete(null);
      onDocumentsChange(); // Refresh the document list
    } catch (error) {
      console.error("Failed to delete document:", error);
      // Error toast is already handled in the deleteDocument function
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownload = async (document: Document) => {
    try {
      const downloadUrl = await getDocumentDownloadUrl(document.key);
      window.open(downloadUrl, "_blank");
    } catch (error) {
      console.error("Failed to get download URL:", error);
      // Fallback to original URL
      window.open(document.url, "_blank");
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
              >                <div className="flex-shrink-0 mr-4">
                  {getFileIcon(document)}
                </div>
                <div className="flex-grow min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-grow min-w-0">
                      <h3 
                        className="font-medium text-base truncate cursor-pointer hover:text-primary"
                        onClick={() => onViewDocument(document)}
                      >
                        {document.key}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {getFileExtension(document.key)}
                        </Badge>
                        {canPreview(document.key) && (
                          <Badge variant="secondary" className="text-xs">
                            Preview ✓
                          </Badge>
                        )}
                      </div>
                    </div>
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
                        </DropdownMenuItem>                        <DropdownMenuItem onClick={() => onEditDocument(document)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDownload(document)}>
                          <Download className="h-4 w-4 mr-2" />
                          Download
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
                    <Badge variant="outline" className="capitalize">
                      {document.contentType}
                    </Badge>
                    <Badge variant={document.acl === 'PUBLIC_READ' ? "default" : "secondary"} className="flex items-center gap-1">
                      {document.acl === 'PUBLIC_READ' ? (
                        <>
                          <Eye className="h-3 w-3" />
                          Public
                        </>
                      ) : (
                        <>
                          <Lock className="h-3 w-3" />
                          Private
                        </>
                      )}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                    <span>Document ID: {document.id}</span>
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
          </DialogHeader>          <p>
            Are you sure you want to delete "{documentToDelete?.key}"? This action cannot be undone.
          </p>          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" disabled={isDeleting} onClick={handleDeleteConfirm}>
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

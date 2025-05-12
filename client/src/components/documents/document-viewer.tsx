import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDate, formatFileSize, getInitials } from "@/lib/utils";
import { Download, X, ChevronLeft, ChevronRight, FileText, FilePen, FileImage, File } from "lucide-react";

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

interface DocumentViewerProps {
  document: Document | null;
  open: boolean;
  onClose: () => void;
  onEdit: (document: Document) => void;
  allDocuments?: Document[];
}

export function DocumentViewer({
  document,
  open,
  onClose,
  onEdit,
  allDocuments = [],
}: DocumentViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (document && allDocuments.length > 0) {
      const index = allDocuments.findIndex(doc => doc.id === document.id);
      if (index !== -1) {
        setCurrentIndex(index);
      }
    }
  }, [document, allDocuments]);

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < allDocuments.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const renderDocumentPreview = () => {
    if (!document) return null;

    // Determine what type of preview to show based on file type
    if (document.fileType.includes("image")) {
      return (
        <div className="flex justify-center items-center bg-gray-100 dark:bg-gray-800 rounded-md p-2 h-[400px] max-h-[400px]">
          <img 
            src={document.fileUrl} 
            alt={document.name} 
            className="max-h-full max-w-full object-contain"
            onError={(e) => (e.currentTarget.src = "")} // Handle image load errors
          />
        </div>
      );
    } else if (document.fileType.includes("pdf")) {
      return (
        <div className="flex justify-center items-center bg-gray-100 dark:bg-gray-800 rounded-md p-2 h-[400px]">
          <iframe
            src={`${document.fileUrl}#toolbar=0&navpanes=0`}
            title={document.name}
            className="w-full h-full"
          />
        </div>
      );
    } else {
      // Generic file preview
      return (
        <div className="flex flex-col justify-center items-center bg-gray-100 dark:bg-gray-800 rounded-md p-8 h-[400px]">
          {document.fileType.includes("pdf") ? (
            <FilePen className="h-20 w-20 text-red-500 mb-4" />
          ) : document.fileType.includes("image") ? (
            <FileImage className="h-20 w-20 text-blue-500 mb-4" />
          ) : document.fileType.includes("text") ? (
            <FileText className="h-20 w-20 text-green-500 mb-4" />
          ) : (
            <File className="h-20 w-20 text-gray-500 mb-4" />
          )}
          <h3 className="text-lg font-medium text-center">{document.name}</h3>
          <p className="text-sm text-gray-500 mt-2">{document.fileType}</p>
          <p className="text-sm text-gray-500">{formatFileSize(document.fileSize)}</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => window.open(document.fileUrl, "_blank")}
          >
            <Download className="h-4 w-4 mr-2" /> Download
          </Button>
        </div>
      );
    }
  };

  if (!document) return null;

  // Get the current document from the index
  const currentDocument = allDocuments.length > 0 ? allDocuments[currentIndex] : document;

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="truncate">{currentDocument.name}</span>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="capitalize">
                {currentDocument.category}
              </Badge>
              <Badge variant="outline">v{currentDocument.version}</Badge>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        {/* Document preview */}
        <div className="my-4 relative">
          {renderDocumentPreview()}
          
          {/* Navigation buttons */}
          {allDocuments.length > 1 && (
            <>
              <Button
                variant="outline"
                size="icon"
                className="absolute left-2 top-1/2 transform -translate-y-1/2 rounded-full bg-white dark:bg-gray-800"
                onClick={handlePrevious}
                disabled={currentIndex === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full bg-white dark:bg-gray-800"
                onClick={handleNext}
                disabled={currentIndex === allDocuments.length - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
        
        {/* Document details */}
        <div className="space-y-2">
          {currentDocument.description && (
            <p className="text-sm text-gray-700 dark:text-gray-300">{currentDocument.description}</p>
          )}
          
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center">
              {currentDocument.uploader && (
                <>
                  <Avatar className="h-6 w-6 mr-2">
                    <AvatarImage src={currentDocument.uploader.profileImageUrl} />
                    <AvatarFallback>
                      {getInitials(`${currentDocument.uploader.firstName || ''} ${currentDocument.uploader.lastName || ''}`)}
                    </AvatarFallback>
                  </Avatar>
                  <span>Uploaded by {currentDocument.uploader.firstName} {currentDocument.uploader.lastName}</span>
                </>
              )}
            </div>
            <span>Last updated {formatDate(currentDocument.updatedAt)}</span>
          </div>
        </div>
        
        <DialogFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => onEdit(currentDocument)}
          >
            Edit Details
          </Button>
          <div>
            <Button 
              variant="outline" 
              className="mr-2"
              onClick={() => window.open(currentDocument.fileUrl, "_blank")}
            >
              <Download className="h-4 w-4 mr-2" /> Download
            </Button>
            <Button 
              variant="outline"
              onClick={onClose}
            >
              Close
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

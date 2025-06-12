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
import { Download, X, ChevronLeft, ChevronRight, FileText, FilePen, FileImage, File, Clock, Loader2, Maximize } from "lucide-react";
import { Document, useDocument } from "@/hooks/use-document";
import { DocumentVersions } from "./document-versions";

// Component to preview text files
function TextFilePreview({ url, filename }: { url: string; filename: string }) {
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchTextContent = async () => {
      try {
        setLoading(true);
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const text = await response.text();
        setContent(text);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load file");
      } finally {
        setLoading(false);
      }
    };

    fetchTextContent();
  }, [url]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading file content...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-red-500">
        <FileText className="h-16 w-16 mb-2" />
        <p>Error loading file: {error}</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <div className="bg-gray-50 dark:bg-gray-900 p-2 border-b">
        <span className="text-sm font-mono text-gray-600 dark:text-gray-400">
          {filename}
        </span>
      </div>
      <pre className="p-4 text-sm bg-white dark:bg-gray-800 overflow-auto h-full whitespace-pre-wrap font-mono">
        {content}
      </pre>
    </div>
  );
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
  const [showVersions, setShowVersions] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const { useDocumentVersions, getDocumentPreviewUrl, getDocumentDownloadUrl } = useDocument();

  // Get the current document from the index
  const currentDocument = allDocuments.length > 0 ? allDocuments[currentIndex] : document;
  
  // Always call hooks - use empty string if no document key available
  const { data: versions } = useDocumentVersions(currentDocument?.key || "");
  useEffect(() => {
    if (document && allDocuments.length > 0) {
      const index = allDocuments.findIndex(doc => doc.id === document.id);
      if (index !== -1) {
        setCurrentIndex(index);
      }
    }
  }, [document, allDocuments]);

  // Fetch preview URL when currentDocument changes
  useEffect(() => {
    const fetchPreviewUrl = async () => {
      if (currentDocument?.key) {
        try {
          const url = await getDocumentPreviewUrl(currentDocument.key);
          setPreviewUrl(url);
        } catch (error) {
          console.error("Failed to get preview URL:", error);
          setPreviewUrl("");
        }
      } else {
        setPreviewUrl("");
      }
    };

    fetchPreviewUrl();
  }, [currentDocument, getDocumentPreviewUrl]);  const getFileIcon = (filename: string) => {
    const fileType = getFileType(filename);
    const iconClasses = "h-4 w-4";
    
    switch (fileType) {
      case 'image':
        return <FileImage className={iconClasses} />;
      case 'pdf':
        return <FileText className={iconClasses} />;
      case 'text':
        return <FileText className={iconClasses} />;
      case 'document':
        return <FilePen className={iconClasses} />;
      default:
        return <File className={iconClasses} />;
    }
  };
  const canPreview = (filename: string) => {
    const fileType = getFileType(filename);
    return ['image', 'pdf', 'text'].includes(fileType);
  };

  // Early return AFTER all hooks have been called
  if (!currentDocument) {
    return null;
  }

  const handleDownload = async () => {
    try {
      const downloadUrl = await getDocumentDownloadUrl(currentDocument.key);
      window.open(downloadUrl, "_blank");
    } catch (error) {
      console.error("Failed to get download URL:", error);
      // Fallback to original URL
      window.open(currentDocument.url, "_blank");
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };  const handleNext = () => {
    if (currentIndex < allDocuments.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleFullscreen = () => {
    if (currentDocument) {
      const documentUrl = previewUrl || currentDocument.url;
      window.open(documentUrl, '_blank');
    }
  };
  const getFileExtension = (filename: string) => {
    return filename.split('.').pop()?.toLowerCase() || '';
  };

  const getFileType = (filename: string) => {
    const extension = getFileExtension(filename);
    
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(extension)) {
      return 'image';
    } else if (['pdf'].includes(extension)) {
      return 'pdf';
    } else if (['txt', 'md', 'json', 'xml', 'csv'].includes(extension)) {
      return 'text';
    } else if (['doc', 'docx'].includes(extension)) {
      return 'document';
    } else if (['xls', 'xlsx'].includes(extension)) {
      return 'spreadsheet';
    } else if (['ppt', 'pptx'].includes(extension)) {
      return 'presentation';
    }
    return 'unknown';
  };

  const renderDocumentPreview = () => {
    if (!currentDocument) return null;

    // Use the presigned preview URL if available, otherwise fallback to the original URL
    const documentUrl = previewUrl || currentDocument.url;
    const fileType = getFileType(currentDocument.key);
    const extension = getFileExtension(currentDocument.key);

    const containerClasses = "flex justify-center items-center bg-gray-100 dark:bg-gray-800 rounded-md p-2 h-[500px] max-h-[500px] overflow-hidden";

    switch (fileType) {
      case 'image':
        return (
          <div className={containerClasses}>
            <img 
              src={documentUrl} 
              alt={currentDocument.key} 
              className="max-h-full max-w-full object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <div className="hidden flex-col items-center justify-center text-gray-500">
              <FileImage className="h-16 w-16 mb-2" />
              <p>Unable to preview image</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={handleDownload}
              >
                <Download className="h-4 w-4 mr-2" />
                Download to view
              </Button>
            </div>
          </div>
        );      case 'pdf':
        return (
          <div className={containerClasses}>
            <div className="w-full h-full relative">
              <iframe
                src={`${documentUrl}#toolbar=1&navpanes=1&scrollbar=1&view=FitH`}
                className="w-full h-full border-0 rounded"
                title={currentDocument.key}
                onLoad={(e) => {
                  // Hide fallback if iframe loads successfully
                  const container = e.currentTarget.parentElement;
                  const fallback = container?.querySelector('.pdf-fallback') as HTMLElement;
                  if (fallback) {
                    fallback.style.display = 'none';
                  }
                }}
                onError={(e) => {
                  // Show fallback if iframe fails to load
                  const container = e.currentTarget.parentElement;
                  const fallback = container?.querySelector('.pdf-fallback') as HTMLElement;
                  if (fallback) {
                    fallback.style.display = 'flex';
                  }
                }}
              />
              {/* Fallback for browsers that don't support PDF iframe */}
              <div className="pdf-fallback absolute inset-0 hidden flex-col items-center justify-center text-gray-500 bg-gray-100 dark:bg-gray-800 rounded">
                <FileText className="h-16 w-16 mb-2 text-red-500" />
                <p className="text-center mb-2">PDF preview not available</p>
                <p className="text-sm text-center mb-4 text-gray-400">
                  Your browser may not support inline PDF viewing
                </p>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open(documentUrl, '_blank')}
                  >
                    Open in new tab
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleDownload}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'text':
        return (
          <div className={containerClasses + " flex-col"}>
            <div className="w-full h-full overflow-auto">
              <TextFilePreview url={documentUrl} filename={currentDocument.key} />
            </div>
          </div>
        );

      default:
        return (
          <div className={containerClasses}>
            <div className="flex flex-col items-center justify-center text-gray-500">
              <File className="h-16 w-16 mb-4" />
              <p className="text-lg font-medium mb-2">{currentDocument.key}</p>
              <p className="text-sm text-center mb-4">
                {extension.toUpperCase()} file - Preview not available
              </p>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.open(documentUrl, '_blank')}
                >
                  Open in new tab
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleDownload}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download to view
                </Button>
              </div>
            </div>
          </div>
        );
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl w-full">        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getFileIcon(currentDocument.key)}
              <span className="truncate">{currentDocument.key}</span>
              {!canPreview(currentDocument.key) && (
                <Badge variant="outline" className="text-xs">
                  No preview
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="capitalize">
                {currentDocument.contentType}
              </Badge>
              <Badge variant={currentDocument.acl === 'PUBLIC_READ' ? "default" : "secondary"}>
                {currentDocument.acl === 'PUBLIC_READ' ? 'Public' : 'Private'}
              </Badge>
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
            <div className="flex items-center gap-4">
              <span>Document ID: {currentDocument.id}</span>
              {versions && versions.length > 0 && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {versions.length} version{versions.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            <span>Access Level: {currentDocument.acl === 'PUBLIC_READ' ? 'Public' : 'Private'}</span>
          </div>
        </div>          <DialogFooter className="flex justify-between">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => onEdit(currentDocument)}
            >
              Edit Details
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowVersions(true)}
            >
              <Clock className="h-4 w-4 mr-2" /> Version History
            </Button>
            <Button 
              variant="outline" 
              onClick={handleFullscreen}
              title="Open in full screen"
            >
              <Maximize className="h-4 w-4 mr-2" /> Full Screen
            </Button>
          </div>
          <div>
            <Button 
              variant="outline" 
              className="mr-2"
              onClick={handleDownload}
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
      
      {/* Document Versions Dialog */}
      <DocumentVersions
        document={currentDocument}
        open={showVersions}
        onClose={() => setShowVersions(false)}
      />
    </Dialog>
  );
}

import { useState, useRef, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Upload, X, FileText, Eye, Lock } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useDocument, Document } from "@/hooks/use-document";

// Schema for document upload with validation
const documentFormSchema = z.object({
  name: z.string()
    .min(1, { message: "Name is required" })
    .max(150, { message: "Name must be less than 150 characters" })
    .refine(
      (name) => {
        // Allow alphanumeric, spaces, hyphens, underscores, dots, and common special characters
        return /^[a-zA-Z0-9\s\-_\.\(\)\[\]]+$/.test(name);
      },
      { message: "Name contains invalid characters" }
    ),
  description: z.string().optional(),
  category: z.enum(["specification", "design", "contract", "invoice", "report", "other"]),
  acl: z.enum(["PUBLIC_READ", "PRIVATE"]),
});

type DocumentFormValues = z.infer<typeof documentFormSchema>;

interface DocumentUploadProps {
  open: boolean;
  onClose: () => void;
  onDocumentUploaded: () => void;
  editDocument?: Document;
  isEditMode?: boolean;
}

export function DocumentUpload({ 
  open, 
  onClose, 
  onDocumentUploaded,
  editDocument,
  isEditMode = false
}: DocumentUploadProps) {
  const { toast } = useToast();
  const { uploadDocument, replaceDocumentFile, updateDocument, isUploading, isUpdating, uploadProgress } = useDocument();
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);  const form = useForm<DocumentFormValues>({
    resolver: zodResolver(documentFormSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "other",
      acl: "PUBLIC_READ",
    },
  });
  // Update form values when editDocument changes
  useEffect(() => {
    if (editDocument && isEditMode) {
      form.reset({
        name: editDocument.key || "",
        description: editDocument.description || "",
        category: (editDocument.contentType as any) || "other",
        acl: editDocument.acl || "PUBLIC_READ",
      });
    } else if (!isEditMode) {
      form.reset({
        name: "",
        description: "",
        category: "other",
        acl: "PUBLIC_READ",
      });
    }
    // Clear file when switching modes or documents
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [editDocument, isEditMode, form]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);
  const resetForm = () => {
    form.reset();
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      // If no name is set yet, use the full filename (including extension)
      if (!form.getValues("name")) {
        form.setValue("name", selectedFile.name);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      setFile(droppedFile);
      
      // If no name is set yet, use the full filename (including extension)
      if (!form.getValues("name")) {
        form.setValue("name", droppedFile.name);
      }
    }
  };  const onSubmit = async (values: DocumentFormValues) => {
    if (!file && !isEditMode) {
      toast({
        title: "File required",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }
      try {
      if (isEditMode && editDocument) {
        // If a new file is selected, replace the existing file (using same key)
        if (file) {
          // Use the new replaceDocumentFile function to keep the same key
          await replaceDocumentFile(file, editDocument.key, values.category, values.acl, values.description);
        } else {
          // Update existing document metadata only
          await updateDocument(editDocument.id, {
            key: editDocument.key, // Keep the same key
            contentType: values.category as any,
            acl: values.acl,
            description: values.description,
          });
        }
      } else if (file) {
        // Upload new document
        await uploadDocument(file, values.name, values.category, values.acl, values.description);
      }
      
      resetForm();
      onDocumentUploaded();
      onClose();
      
      toast({
        title: isEditMode ? "Document updated" : "Document uploaded",
        description: isEditMode 
          ? file 
            ? "Your document file and details have been updated successfully." 
            : "Your document details have been updated successfully."
          : "Your document has been uploaded successfully.",
      });
    } catch (error) {
      console.error("Failed to upload document:", error);
      toast({
        title: isEditMode ? "Update failed" : "Upload failed",
        description: "There was a problem with the operation. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Document" : "Upload Document"}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Show current file info in edit mode */}
            {isEditMode && editDocument && !file && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-4">
                <div className="flex items-center space-x-3">
                  <FileText className="h-8 w-8 text-blue-500" />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      Current File: {editDocument.key}
                    </h4>
                    <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                      Type: {editDocument.contentType} • Access: {editDocument.acl === 'PUBLIC_READ' ? 'Public' : 'Private'}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <div 
              className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center cursor-pointer"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
              />
              {file ? (
                <div className="text-center">
                  <FileText className="h-12 w-12 text-green-500 mx-auto mb-2" />
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-gray-500">Click to change file</p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="mt-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                    }}
                  >
                    <X className="h-4 w-4 mr-1" /> Remove
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm font-medium">
                    {isEditMode ? "Replace file (optional)" : "Upload a file"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {isEditMode 
                      ? "Click here or drag a file to replace the current file" 
                      : "Click here or drag a file to upload"
                    }
                  </p>
                </div>
              )}
            </div>            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Document Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter document name (including file extension)" 
                      {...field} 
                      disabled={isEditMode} // Disable in edit mode
                      className={isEditMode ? "opacity-60 cursor-not-allowed" : ""}
                    />
                  </FormControl>
                  {isEditMode && (
                    <p className="text-sm text-muted-foreground">
                      Document name cannot be changed in edit mode
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter a brief description"
                      className="resize-none"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
              <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="specification">Specification</SelectItem>
                      <SelectItem value="design">Design</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="invoice">Invoice</SelectItem>
                      <SelectItem value="report">Report</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="acl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Access Level</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select access level" />
                      </SelectTrigger>
                    </FormControl>                    <SelectContent>
                      <SelectItem value="PUBLIC_READ">
                        <div className="flex items-center gap-2">
                          <Eye className="h-4 w-4" />
                          Public - Anyone can view
                        </div>
                      </SelectItem>
                      <SelectItem value="PRIVATE">
                        <div className="flex items-center gap-2">
                          <Lock className="h-4 w-4" />
                          Private - Restricted access
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    Choose who can access this document. Public documents are visible to all users, while private documents have restricted access.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
              {(isUploading || isUpdating) && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{isEditMode ? "Updating..." : "Uploading..."}</span>
                  <span>{isEditMode ? "Processing..." : `${uploadProgress}%`}</span>
                </div>
                <Progress value={isEditMode ? 100 : uploadProgress} />
              </div>
            )}
              <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={isUploading || isUpdating}>
                Cancel
              </Button>
              <Button type="submit" disabled={isUploading || isUpdating}>
                {isUploading || isUpdating
                  ? isEditMode ? "Updating..." : "Uploading..." 
                  : isEditMode 
                    ? "Update Document" 
                    : "Upload Document"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

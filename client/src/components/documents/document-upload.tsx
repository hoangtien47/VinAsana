import { useState, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Upload, X, FileText } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { documentCategoryEnum } from "@shared/schema";

// Schema for document upload with validation
const documentFormSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }).max(100),
  description: z.string().optional(),
  category: z.enum(["specification", "design", "contract", "invoice", "report", "other"]),
});

type DocumentFormValues = z.infer<typeof documentFormSchema>;

interface Document {
  id: number;
  name: string;
  description?: string;
  category: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
}

interface DocumentUploadProps {
  open: boolean;
  onClose: () => void;
  onDocumentUploaded: () => void;
  projectId: number;
  editDocument?: Document;
  isEditMode?: boolean;
}

export function DocumentUpload({ 
  open, 
  onClose, 
  onDocumentUploaded,
  projectId,
  editDocument,
  isEditMode = false
}: DocumentUploadProps) {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<DocumentFormValues>({
    resolver: zodResolver(documentFormSchema),
    defaultValues: {
      name: editDocument?.name || "",
      description: editDocument?.description || "",
      category: (editDocument?.category as any) || "other",
    },
  });

  const resetForm = () => {
    form.reset();
    setFile(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      // If no name is set yet, use the filename (without extension)
      if (!form.getValues("name")) {
        const fileName = selectedFile.name.split('.').slice(0, -1).join('.');
        form.setValue("name", fileName);
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
      
      // If no name is set yet, use the filename (without extension)
      if (!form.getValues("name")) {
        const fileName = droppedFile.name.split('.').slice(0, -1).join('.');
        form.setValue("name", fileName);
      }
    }
  };

  const onSubmit = async (values: DocumentFormValues) => {
    if (!file && !isEditMode) {
      toast({
        title: "File required",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      const formData = new FormData();
      formData.append("name", values.name);
      if (values.description) formData.append("description", values.description);
      formData.append("category", values.category);
      
      if (file) {
        formData.append("file", file);
      }
      
      // Use XMLHttpRequest for progress tracking
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percentComplete);
        }
      });
      
      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resetForm();
          onDocumentUploaded();
          onClose();
          
          toast({
            title: isEditMode ? "Document updated" : "Document uploaded",
            description: isEditMode 
              ? "Your document has been updated successfully." 
              : "Your document has been uploaded successfully.",
          });
        } else {
          throw new Error(`Upload failed with status ${xhr.status}`);
        }
        setIsUploading(false);
      });
      
      xhr.addEventListener("error", () => {
        setIsUploading(false);
        toast({
          title: "Upload failed",
          description: "There was a problem with the upload. Please try again.",
          variant: "destructive",
        });
      });
      
      // Open connection and send the data
      if (isEditMode && editDocument) {
        xhr.open("PATCH", `/api/documents/${editDocument.id}`);
      } else {
        xhr.open("POST", `/api/projects/${projectId}/documents`);
      }
      
      xhr.send(formData);
    } catch (error) {
      console.error("Failed to upload document:", error);
      setIsUploading(false);
      toast({
        title: "Upload failed",
        description: "There was a problem with the upload. Please try again.",
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
            {!isEditMode && (
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
                  disabled={isUploading}
                />
                
                {file ? (
                  <div className="flex flex-col items-center text-center">
                    <FileText className="h-10 w-10 text-blue-500 mb-2" />
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
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
                  <div className="flex flex-col items-center text-center">
                    <Upload className="h-10 w-10 text-gray-400 mb-2" />
                    <p className="text-sm font-medium">Click to upload or drag and drop</p>
                    <p className="text-xs text-gray-500 mt-1">
                      PDF, DOCX, XLSX, JPG, PNG (max. 10MB)
                    </p>
                  </div>
                )}
              </div>
            )}
            
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Document Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter document name" {...field} />
                  </FormControl>
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
                      {(Object.keys(documentCategoryEnum.enumValues) as Array<keyof typeof documentCategoryEnum.enumValues>).map((category) => (
                        <SelectItem key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} />
              </div>
            )}
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={isUploading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isUploading}>
                {isUploading 
                  ? "Uploading..." 
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

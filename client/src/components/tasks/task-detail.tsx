import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger,
  SheetFooter,
  SheetClose
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  CalendarIcon, 
  User, 
  Clock, 
  Tag, 
  CheckSquare, 
  Flag, 
  Edit, 
  Trash2, 
  FileIcon, 
  Paperclip, 
  MessageSquare,
  Upload
} from "lucide-react";
import { cn, getInitials, formatDate, getStatusColor, getPriorityColor } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

interface User {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  profileImageUrl?: string;
}

interface Comment {
  id: number;
  text: string;
  taskId: number;
  userId: string;
  user: User;
  createdAt: string;
  updatedAt: string;
}

interface Attachment {
  id: number;
  name: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  taskId: number;
  uploaderId: string;
  createdAt: string;
}

interface Task {
  id: number;
  title: string;
  description?: string;
  status: string;
  priority: string;
  projectId: number;
  assigneeId?: string;
  creatorId: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  order: number;
  assignee?: User;
  creator?: User;
}

interface TaskDetailProps {
  open: boolean;
  onClose: () => void;
  task: Task | null;
  onEdit: (task: Task) => void;
  onDelete: (taskId: number) => void;
  projectId: number;
}

export function TaskDetail({
  open,
  onClose,
  task,
  onEdit,
  onDelete,
  projectId
}: TaskDetailProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Load comments when task changes
  useEffect(() => {
    if (task) {
      loadComments();
      loadAttachments();
    }
  }, [task]);

  const loadComments = async () => {
    if (!task) return;
    
    try {
      const response = await fetch(`/api/tasks/${task.id}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (error) {
      console.error("Failed to load comments:", error);
    }
  };

  const loadAttachments = async () => {
    if (!task) return;
    
    try {
      const response = await fetch(`/api/tasks/${task.id}/attachments`);
      if (response.ok) {
        const data = await response.json();
        setAttachments(data);
      }
    } catch (error) {
      console.error("Failed to load attachments:", error);
    }
  };

  const handleAddComment = async () => {
    if (!task || !newComment.trim()) return;
    
    setIsSubmittingComment(true);
    
    try {
      await apiRequest('POST', `/api/tasks/${task.id}/comments`, {
        text: newComment,
      });
      
      setNewComment("");
      await loadComments();
      toast({
        title: "Comment added",
        description: "Your comment has been added successfully."
      });
    } catch (error) {
      console.error("Failed to add comment:", error);
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!task) return;
    
    setIsLoading(true);
    
    try {
      await apiRequest('DELETE', `/api/tasks/${task.id}`, undefined);
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/tasks`] });
      onDelete(task.id);
      setIsDeleteDialogOpen(false);
      onClose();
      toast({
        title: "Task deleted",
        description: "The task has been deleted successfully."
      });
    } catch (error) {
      console.error("Failed to delete task:", error);
      toast({
        title: "Error",
        description: "Failed to delete the task. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUploadAttachment = async () => {
    if (!task || !file) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    // Create form data
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', file.name);
    
    try {
      // Implement file upload with progress tracking
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percentComplete);
        }
      });
      
      xhr.addEventListener('load', async () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          setIsUploadDialogOpen(false);
          setFile(null);
          await loadAttachments();
          toast({
            title: "File uploaded",
            description: "Your file has been uploaded successfully."
          });
        } else {
          throw new Error(`Upload failed with status ${xhr.status}`);
        }
        setIsUploading(false);
      });
      
      xhr.addEventListener('error', () => {
        setIsUploading(false);
        toast({
          title: "Upload failed",
          description: "There was a problem uploading your file. Please try again.",
          variant: "destructive"
        });
      });
      
      xhr.open('POST', `/api/tasks/${task.id}/attachments`);
      xhr.send(formData);
    } catch (error) {
      console.error("Failed to upload attachment:", error);
      setIsUploading(false);
      toast({
        title: "Upload failed",
        description: "There was a problem uploading your file. Please try again.",
        variant: "destructive"
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (!task) return null;

  return (
    <Sheet open={open} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-xl md:max-w-2xl overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle className="text-xl font-semibold break-words">{task.title}</SheetTitle>
        </SheetHeader>
        
        <div className="space-y-6">
          {/* Task details section */}
          <div className="space-y-4">
            {task.description && (
              <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {task.description}
              </div>
            )}
            
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Created {formatDate(task.createdAt)}
              </Badge>
              
              {task.dueDate && (
                <Badge variant={new Date(task.dueDate) < new Date() ? "destructive" : "secondary"} className="flex items-center gap-1">
                  <CalendarIcon className="h-3 w-3" />
                  Due {formatDate(task.dueDate)}
                </Badge>
              )}
              
              <Badge variant="outline" className={`flex items-center gap-1 ${getStatusColor(task.status)} text-white`}>
                <CheckSquare className="h-3 w-3" />
                {task.status.replace('_', ' ')}
              </Badge>
              
              <Badge variant="outline" className={`flex items-center gap-1 ${getPriorityColor(task.priority)} text-white`}>
                <Flag className="h-3 w-3" />
                {task.priority}
              </Badge>
            </div>
            
            <div className="flex items-center space-x-2 pt-2">
              <div className="text-sm text-gray-500 min-w-[80px]">Assignee:</div>
              {task.assignee ? (
                <div className="flex items-center">
                  <Avatar className="h-6 w-6 mr-2">
                    <AvatarImage src={task.assignee.profileImageUrl} />
                    <AvatarFallback>{getInitials(`${task.assignee.firstName || ''} ${task.assignee.lastName || ''}`)}</AvatarFallback>
                  </Avatar>
                  <span>{task.assignee.firstName} {task.assignee.lastName}</span>
                </div>
              ) : (
                <span className="text-sm text-gray-500">Unassigned</span>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="text-sm text-gray-500 min-w-[80px]">Created by:</div>
              {task.creator ? (
                <div className="flex items-center">
                  <Avatar className="h-6 w-6 mr-2">
                    <AvatarImage src={task.creator.profileImageUrl} />
                    <AvatarFallback>{getInitials(`${task.creator.firstName || ''} ${task.creator.lastName || ''}`)}</AvatarFallback>
                  </Avatar>
                  <span>{task.creator.firstName} {task.creator.lastName}</span>
                </div>
              ) : (
                <span className="text-sm text-gray-500">Unknown</span>
              )}
            </div>
          </div>
          
          {/* Attachments section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium flex items-center">
                <Paperclip className="h-4 w-4 mr-1" /> Attachments
              </h3>
              <Button 
                size="sm" 
                variant="outline" 
                className="h-8" 
                onClick={() => setIsUploadDialogOpen(true)}
              >
                <Upload className="h-4 w-4 mr-1" /> Upload
              </Button>
            </div>
            
            {attachments.length > 0 ? (
              <div className="space-y-2">
                {attachments.map((attachment) => (
                  <div key={attachment.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                    <div className="flex items-center">
                      <FileIcon className="h-4 w-4 mr-2 text-blue-500" />
                      <div>
                        <div className="text-sm font-medium">{attachment.name}</div>
                        <div className="text-xs text-gray-500">{formatFileSize(attachment.fileSize)}</div>
                      </div>
                    </div>
                    <a 
                      href={attachment.fileUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-xs text-blue-500 hover:text-blue-700"
                    >
                      Download
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500 text-center py-2">No attachments</div>
            )}
          </div>
          
          {/* Comments section */}
          <div>
            <h3 className="text-sm font-medium flex items-center mb-3">
              <MessageSquare className="h-4 w-4 mr-1" /> Comments
            </h3>
            
            <div className="space-y-4 mb-4">
              {comments.length > 0 ? (
                comments.map((comment) => (
                  <div key={comment.id} className="flex space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={comment.user.profileImageUrl} />
                      <AvatarFallback>{getInitials(`${comment.user.firstName || ''} ${comment.user.lastName || ''}`)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{comment.user.firstName} {comment.user.lastName}</p>
                        <span className="text-xs text-gray-500">{format(new Date(comment.createdAt), 'MMM d, yyyy h:mm a')}</span>
                      </div>
                      <p className="text-sm mt-1 text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{comment.text}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-500 text-center py-2">No comments yet</div>
              )}
            </div>
            
            <div className="space-y-2">
              <Textarea
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={3}
              />
              <Button 
                onClick={handleAddComment} 
                disabled={isSubmittingComment || !newComment.trim()} 
                className="w-full"
              >
                {isSubmittingComment ? "Submitting..." : "Add Comment"}
              </Button>
            </div>
          </div>
        </div>
        
        {/* Task actions */}
        <SheetFooter className="mt-6 flex justify-between">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(task)}
              className="flex items-center"
            >
              <Edit className="h-4 w-4 mr-1" /> Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="flex items-center"
            >
              <Trash2 className="h-4 w-4 mr-1" /> Delete
            </Button>
          </div>
          <SheetClose asChild>
            <Button variant="outline" size="sm">Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
      
      {/* Delete confirmation dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Task</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this task? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteTask} disabled={isLoading}>
              {isLoading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* File upload dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Attachment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="file">Select File</Label>
              <Input 
                id="file" 
                type="file" 
                onChange={handleFileChange}
                disabled={isUploading}
              />
            </div>
            
            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)} disabled={isUploading}>Cancel</Button>
            <Button onClick={handleUploadAttachment} disabled={!file || isUploading}>
              {isUploading ? "Uploading..." : "Upload"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Sheet>
  );
}

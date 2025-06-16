import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import type { Editor } from '@ckeditor/ckeditor5-core';
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
  Upload,
  MoreHorizontal,
  Save,
  X
} from "lucide-react";
import { cn, getInitials, formatDate, getStatusColor, getPriorityColor } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useUser } from "@/hooks/use-user";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Task, Comment, useTask } from "@/hooks/use-task";

interface User {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  profileImageUrl?: string;
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

interface TaskDetailProps {
  open: boolean;
  onClose: () => void;
  task: Task | null;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  projectId: string;
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
  const { users, getUser } = useUser();
  const { toast } = useToast();
  
  const { 
    getTaskById,
    addComment, 
    updateComment, 
    deleteComment,
    isAddingComment,
    isUpdatingComment,
    isDeletingComment,
    isFetchingTask
  } = useTask();
  
  // State to hold the current task data
  const [currentTaskData, setCurrentTaskData] = useState<Task | null>(null);

  // Function to refresh task data
  const refreshTaskData = async () => {
    if (!task?.id) return;
    
    try {
      const freshData = await getTaskById(task.id);
      if (freshData) {
        setCurrentTaskData({
          ...task,
          comments: freshData.comments || []
        });
      }
    } catch (error) {
      console.error('Failed to fetch fresh task data:', error);
    }
  };

  // Fetch task data when dialog opens or task ID changes
  useEffect(() => {
    if (open && task?.id) {
      // Use the task prop initially
      setCurrentTaskData(task);
      // Then fetch fresh data
      refreshTaskData();
    }
  }, [open, task?.id]);

  // Use the current task data
  const currentTask = currentTaskData;
  const [isLoading, setIsLoading] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [commentUsers, setCommentUsers] = useState<Record<string, any>>({});
  const [fetchingUsers, setFetchingUsers] = useState<Set<string>>(new Set());
  const [newComment, setNewComment] = useState("");
  const [newCommentHtml, setNewCommentHtml] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState("");
  const [editingCommentHtml, setEditingCommentHtml] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const handleAddComment = async () => {
    if (!currentTask || !newCommentHtml.trim() || !user?.sub) return;

    try {
      // Strip HTML tags for plain text version
      const plainText = newCommentHtml.replace(/<[^>]*>/g, '').trim();
      if (!plainText) return;
      
      await addComment(currentTask.id, newCommentHtml, user.sub);
      setNewComment("");
      setNewCommentHtml("");
      // Refresh task data to show the new comment immediately
      await refreshTaskData();
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
    }
  };
    const handleEditComment = async (commentId: string) => {
    if (!currentTask || !editingCommentHtml.trim() || !user?.sub) return;
    
    try {
      // Strip HTML tags for plain text version
      const plainText = editingCommentHtml.replace(/<[^>]*>/g, '').trim();
      if (!plainText) return;
      
      await updateComment(commentId, editingCommentHtml, user.sub, currentTask.id);
      setEditingCommentId(null);
      setEditingCommentText("");
      setEditingCommentHtml("");
      // Refresh task data to show the updated comment immediately
      await refreshTaskData();
      toast({
        title: "Comment updated",
        description: "Your comment has been updated successfully."
      });
    } catch (error) {
      console.error("Failed to update comment:", error);
      toast({
        title: "Error",
        description: "Failed to update comment. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!currentTask) return;
    
    try {
      await deleteComment(commentId, currentTask.id);
      // Refresh task data to show the updated comment list immediately
      await refreshTaskData();
      toast({
        title: "Comment deleted",
        description: "Comment has been deleted successfully."
      });
    } catch (error) {
      console.error("Failed to delete comment:", error);
      toast({
        title: "Error",
        description: "Failed to delete comment. Please try again.",
        variant: "destructive"
      });
    }
  };
  const startEditingComment = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditingCommentText(comment.content);
    setEditingCommentHtml(comment.content);
  };

  const cancelEditingComment = () => {
    setEditingCommentId(null);
    setEditingCommentText("");
    setEditingCommentHtml("");
  };
  
  const handleDeleteTask = async () => {
    if (!currentTask) return;
    
    setIsLoading(true);
    
    try {
      // Use the onDelete callback which properly calls the useTask hook
      await onDelete(currentTask.id);
      setIsDeleteDialogOpen(false);
      onClose();
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
    if (!currentTask || !file) return;
    
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
      
      xhr.open('POST', `/api/tasks/${currentTask.id}/attachments`);
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

  // Function to fetch user data for a comment
  const fetchCommentUser = async (userId: string) => {
    if (commentUsers[userId] || fetchingUsers.has(userId)) {
      return; // Already have data or currently fetching
    }

    setFetchingUsers(prev => new Set(prev).add(userId));

    try {
      const userData = await getUser(userId);
      if (userData) {
        setCommentUsers(prev => ({
          ...prev,
          [userId]: userData
        }));
      }
    } catch (error) {
      console.error(`Failed to fetch user data for ${userId}:`, error);
      // Set a fallback user data
      setCommentUsers(prev => ({
        ...prev,
        [userId]: {
          id: userId,
          nickname: `User ${userId.slice(-4)}`,
          email: '',
          avatar: null
        }
      }));
    } finally {
      setFetchingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };
  // Effect to fetch user data for all comment authors and assignee
  useEffect(() => {
    const userIdsToFetch = new Set<string>();
    
    // Add comment author IDs
    if (currentTask?.comments) {
      currentTask.comments.forEach(comment => {
        userIdsToFetch.add(comment.userId);
      });
    }
    
    // Add assignee ID if it exists and no assignee object is provided
    if (currentTask?.assigneeId && !currentTask.assignee) {
      userIdsToFetch.add(currentTask.assigneeId);
    }
    
    // Fetch user data for all unique user IDs
    userIdsToFetch.forEach(userId => {
      fetchCommentUser(userId);
    });
  }, [currentTask?.comments, currentTask?.assigneeId, currentTask?.assignee]);

  if (!currentTask) return null;

  return (
    <Sheet open={open} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-xl md:max-w-2xl overflow-y-auto">        
        <SheetHeader className="mb-4">
          <SheetTitle className="text-xl font-semibold break-words">{currentTask.title}</SheetTitle>
        </SheetHeader>
        
        <div className="space-y-6">
          {/* Task details section */}
          <div className="space-y-4">
            {currentTask.description && (
              <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {currentTask.description}
              </div>
            )}
            
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Created {formatDate(currentTask.createdAt)}
              </Badge>
              
              {currentTask.dueDate && (
                <Badge variant={new Date(currentTask.dueDate) < new Date() ? "destructive" : "secondary"} className="flex items-center gap-1">
                  <CalendarIcon className="h-3 w-3" />
                  Due {formatDate(currentTask.dueDate)}
                </Badge>
              )}
              
              <Badge variant="outline" className={`flex items-center gap-1 ${getStatusColor(currentTask.status)} text-white`}>
                <CheckSquare className="h-3 w-3" />
                {currentTask.status.replace('_', ' ')}
              </Badge>
              
              <Badge variant="outline" className={`flex items-center gap-1 ${getPriorityColor(currentTask.priority)} text-white`}>
                <Flag className="h-3 w-3" />
                {currentTask.priority}
              </Badge>
            </div>
              <div className="flex items-center space-x-2 pt-2">
              <div className="text-sm text-gray-500 min-w-[80px]">Assignee:</div>
              {currentTask.assignee ? (
                <div className="flex items-center">
                  <Avatar className="h-6 w-6 mr-2">
                    <AvatarImage src={currentTask.assignee.profileImageUrl} />
                    <AvatarFallback>{getInitials(`${currentTask.assignee.firstName || ''} ${currentTask.assignee.lastName || ''}`)}</AvatarFallback>
                  </Avatar>
                  <span>{currentTask.assignee.firstName} {currentTask.assignee.lastName}</span>
                </div>
              ) : currentTask.assigneeId ? (
                (() => {
                  // Use fetched user data first, then fall back to users array
                  const assignedUser = commentUsers[currentTask.assigneeId] || users?.find(u => u.id === currentTask.assigneeId);
                  return assignedUser ? (
                    <div className="flex items-center">
                      <Avatar className="h-6 w-6 mr-2">
                        <AvatarImage src={assignedUser.avatar} />
                        <AvatarFallback>{getInitials(assignedUser.nickname || assignedUser.email || 'User')}</AvatarFallback>
                      </Avatar>
                      <span>{assignedUser.nickname || assignedUser.email || `User ${currentTask.assigneeId.slice(-4)}`}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">User {currentTask.assigneeId.slice(-4)}</span>
                  );
                })()
              ) : (
                <span className="text-sm text-gray-500">Unassigned</span>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="text-sm text-gray-500 min-w-[80px]">Task ID:</div>
              <span className="text-sm">#{currentTask.id}</span>
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
              <MessageSquare className="h-4 w-4 mr-1" /> Comments ({currentTask.comments?.length || 0})
            </h3>
            
            <div className="space-y-4 mb-4">              {currentTask.comments && currentTask.comments.length > 0 ? (
                currentTask.comments.map((comment: Comment) => {
                  // Use fetched comment user data instead of users array
                  const commentUser = commentUsers[comment.userId] || users?.find(u => u.id === comment.userId);
                  const isOwner = user?.sub === comment.userId;
                  const isEditing = editingCommentId === comment.id;
                  
                  return (
                    <div key={comment.id} className="flex space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={commentUser?.avatar} />
                        <AvatarFallback>
                          {commentUser ? 
                            getInitials(commentUser.nickname || commentUser.email || 'User') : 
                            comment.userId.charAt(0).toUpperCase()
                          }
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">                        
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">
                            {commentUser ? (
                              commentUser.nickname || commentUser.email || `User ${comment.userId.slice(-4)}`
                            ) : (
                              `User ${comment.userId.slice(-4)}`
                            )}
                          </p>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500">Just now</span>
                            {isOwner && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                    <MoreHorizontal className="h-3 w-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => startEditingComment(comment)}>
                                    <Edit className="h-3 w-3 mr-2" />
                                    Edit
                                  </DropdownMenuItem>                                  
                                  <DropdownMenuItem 
                                    onClick={() => handleDeleteComment(comment.id)}
                                    className="text-red-600"
                                    disabled={isDeletingComment}
                                  >
                                    <Trash2 className="h-3 w-3 mr-2" />
                                    {isDeletingComment ? "Deleting..." : "Delete"}
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                        </div>                        
                        {isEditing ? (
                          <div className="mt-2 space-y-2">
                            <div className="border rounded-md">                              
                              <CKEditor
                                editor={ClassicEditor as any}
                                data={editingCommentHtml}
                                onChange={(event, editor) => {
                                  const data = editor.getData();
                                  setEditingCommentHtml(data);
                                  // Also set plain text version for validation
                                  const plainText = data.replace(/<[^>]*>/g, '').trim();
                                  setEditingCommentText(plainText);
                                }}                                config={{
                                  placeholder: 'Edit comment...',
                                  toolbar: [
                                    'heading', '|',
                                    'bold', 'italic', 'underline', '|',
                                    'bulletedList', 'numberedList', '|',
                                    'outdent', 'indent', '|',
                                    'blockQuote', 'insertTable', '|',
                                    'undo', 'redo'
                                  ],
                                  heading: {
                                    options: [
                                      { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
                                      { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
                                      { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
                                      { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' }
                                    ]
                                  }
                                }}
                              />
                            </div>
                            <div className="flex space-x-2">                              
                              <Button 
                                size="sm" 
                                onClick={() => handleEditComment(comment.id)}
                                disabled={!editingCommentText.trim() || isUpdatingComment}
                              >
                                <Save className="h-3 w-3 mr-1" />
                                {isUpdatingComment ? "Saving..." : "Save"}
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={cancelEditingComment}
                              >
                                <X className="h-3 w-3 mr-1" />
                                Cancel
                              </Button>
                            </div>
                          </div>                        
                          ) : (
                          <div 
                            className="text-sm mt-1 text-gray-700 dark:text-gray-300 prose prose-sm max-w-none dark:prose-invert"
                            dangerouslySetInnerHTML={{ __html: comment.content }}
                          />
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-sm text-gray-500 text-center py-2">No comments yet</div>
              )}
            </div>
              <div className="space-y-2">
              <div className="border rounded-md">                <CKEditor
                  editor={ClassicEditor as any}
                  data={newCommentHtml}
                  onChange={(event, editor) => {
                    const data = editor.getData();
                    setNewCommentHtml(data);
                    // Also set plain text version for validation
                    const plainText = data.replace(/<[^>]*>/g, '').trim();
                    setNewComment(plainText);
                  }}                  config={{
                    placeholder: 'Add a comment...',
                    toolbar: [
                      'heading', '|',
                      'bold', 'italic', 'underline', '|',
                      'bulletedList', 'numberedList', '|',
                      'outdent', 'indent', '|',
                      'blockQuote', 'insertTable', '|',
                      'undo', 'redo'
                    ],
                    heading: {
                      options: [
                        { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
                        { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
                        { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
                        { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' }
                      ]
                    }
                  }}
                />
              </div>
              <Button 
                onClick={handleAddComment} 
                disabled={isAddingComment || !newComment.trim()} 
                className="w-full"
              >
                {isAddingComment ? "Submitting..." : "Add Comment"}
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
              onClick={() => onEdit(currentTask)}
              className="flex items-center"
            >
              <Edit className="h-4 w-4 mr-1" /> Edit
            </Button>              
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="flex items-center hover:bg-destructive hover:text-destructive-foreground hover:border-destructive"
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

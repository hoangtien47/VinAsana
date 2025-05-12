import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

export function useTask() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [projectId, setProjectId] = useState<number | null>(null);

  // Fetch tasks for the active project
  const {
    data: tasks,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [`/api/projects/${projectId}/tasks`],
    enabled: !!projectId,
  });

  const fetchTasks = async (newProjectId: number) => {
    setProjectId(newProjectId);
    if (newProjectId) {
      return queryClient.fetchQuery({ 
        queryKey: [`/api/projects/${newProjectId}/tasks`] 
      });
    }
  };

  const createTask = async (taskData: any) => {
    if (!projectId) {
      throw new Error("No project selected");
    }

    try {
      const response = await apiRequest("POST", `/api/projects/${projectId}/tasks`, taskData);
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/tasks`] });
      return response.json();
    } catch (error) {
      console.error("Failed to create task:", error);
      throw error;
    }
  };

  const updateTask = async (taskId: number, taskData: any) => {
    try {
      const response = await apiRequest("PATCH", `/api/tasks/${taskId}`, taskData);
      // Invalidate both the task list and the individual task
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/tasks`] });
      queryClient.invalidateQueries({ queryKey: [`/api/tasks/${taskId}`] });
      return response.json();
    } catch (error) {
      console.error("Failed to update task:", error);
      throw error;
    }
  };

  const deleteTask = async (taskId: number) => {
    try {
      await apiRequest("DELETE", `/api/tasks/${taskId}`, undefined);
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/tasks`] });
    } catch (error) {
      console.error("Failed to delete task:", error);
      throw error;
    }
  };

  const addComment = async (taskId: number, text: string) => {
    try {
      const response = await apiRequest("POST", `/api/tasks/${taskId}/comments`, { text });
      queryClient.invalidateQueries({ queryKey: [`/api/tasks/${taskId}/comments`] });
      return response.json();
    } catch (error) {
      console.error("Failed to add comment:", error);
      throw error;
    }
  };

  const uploadAttachment = async (taskId: number, file: File) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("name", file.name);
      
      // Use fetch instead of apiRequest for file uploads
      const response = await fetch(`/api/tasks/${taskId}/attachments`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error(`Failed to upload attachment: ${response.statusText}`);
      }
      
      queryClient.invalidateQueries({ queryKey: [`/api/tasks/${taskId}/attachments`] });
      return response.json();
    } catch (error) {
      console.error("Failed to upload attachment:", error);
      throw error;
    }
  };

  return {
    tasks,
    isLoading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    addComment,
    uploadAttachment,
    setProjectId,
  };
}

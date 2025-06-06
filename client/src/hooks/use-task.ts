import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth0 } from "@auth0/auth0-react";

// Define the comment structure for tasks
export interface Comment {
  id: string;
  content: string;
  userId: string;
  taskId: string;
}

// Define the API response structure
export interface ApiTask {
  id?: string;
  name: string;
  description: string;
  startDate: number; // timestamp
  endDate: number; // timestamp
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  status: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
  assigneeId: string;
  projectId: string;
  comments?: Comment[];
}

// Define the frontend task structure that components expect
export interface Task {
  id: string; // Changed from number to string to match UUID from backend
  title: string;
  description?: string;
  status: string;
  priority: string;
  dueDate?: string;
  assigneeId?: string;
  assignee?: {
    id: string;
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
  };
  order: number;
  createdAt: string; // Required field, not optional
  comments?: Comment[];
}

// Define the paginated response structure
export interface TasksResponse {
  pageIndex: number;
  totalPages: number;
  totalItems: number;
  last: boolean;
  first: boolean;
  items: ApiTask[];
}

export interface CreateTaskData {
  name: string;
  description: string;
  startDate?: number;
  endDate?: number;
  priority?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  status?: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
  assigneeId?: string;
  projectId: string;
  comments?: Comment[];
}

export function useTask() {
  const { toast } = useToast();
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();
  const [projectId, setProjectId] = useState<string | null>(null);

  // Helper function to transform API task to frontend task
  const transformTask = (apiTask: ApiTask): Task => {    // Map API status to component status
    const statusMap: Record<string, string> = {
      "TODO": "todo",
      "IN_PROGRESS": "in_progress",
      "IN_REVIEW": "in_review",
      "DONE": "done"
    };

    // Map API priority to component priority
    const priorityMap: Record<string, string> = {
      "LOW": "low",
      "MEDIUM": "medium",
      "HIGH": "high", 
      "CRITICAL": "urgent"    };    return {
      id: apiTask.id || "0", // Keep as string since backend uses UUID
      title: apiTask.name, // Map name to title
      description: apiTask.description,
      status: statusMap[apiTask.status] || "todo",
      priority: priorityMap[apiTask.priority] || "medium",
      dueDate: apiTask.endDate ? new Date(apiTask.endDate).toISOString() : undefined,
      assigneeId: apiTask.assigneeId,
      order: 0, // Default order
      createdAt: apiTask.startDate ? new Date(apiTask.startDate).toISOString() : new Date().toISOString(),
      comments: apiTask.comments || []
    };
  };

  // Helper function to transform frontend task to API format
  const transformToApiTask = (task: any): any => {    const statusMap: Record<string, string> = {
      "todo": "TODO",
      "in_progress": "IN_PROGRESS",
      "in_review": "IN_REVIEW",
      "done": "DONE"
    };

    const priorityMap: Record<string, string> = {
      "low": "LOW",
      "medium": "MEDIUM",
      "high": "HIGH",
      "urgent": "CRITICAL"
    };

    return {
      name: task.title || task.name,
      description: task.description || "",
      status: statusMap[task.status] || task.status?.toUpperCase() || "TODO",
      priority: priorityMap[task.priority] || task.priority?.toUpperCase() || "MEDIUM",
      startDate: task.startDate || Date.now(),
      endDate: task.endDate || task.dueDate ? new Date(task.dueDate).getTime() : Date.now() + 7 * 24 * 60 * 60 * 1000,
      assigneeId: task.assigneeId || "",
      projectId: task.projectId
    };
  };
  // Helper function to make authenticated API requests
  const authFetch = async (url: string, options: RequestInit = {}) => {
    if (!isAuthenticated) {
      throw new Error("User is not authenticated");
    }

    const token = await getAccessTokenSilently();
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Request failed with status ${response.status}`
      );
    }

    // Check if response has content before parsing JSON
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const text = await response.text();
      return text ? JSON.parse(text) : null;
    }
    
    // For non-JSON responses or empty responses, return null
    return null;
  };

  // Helper function to build filter URL
  const buildTasksUrl = (filters?: { projectId?: string; status?: string; priority?: string; assigneeId?: string }) => {
    const baseUrl = "http://localhost:8080/v1/tasks";
    
    if (!filters || Object.keys(filters).length === 0) {
      return baseUrl;
    }

    // Build filter string for dynamic filtering
    const filterParts: string[] = [];
    
    if (filters.projectId) {
      filterParts.push(`projectId=${filters.projectId}`);
    }
    
    if (filters.status) {
      filterParts.push(`status=${filters.status}`);
    }
    
    if (filters.priority) {
      filterParts.push(`priority=${filters.priority}`);
    }
    
    if (filters.assigneeId) {
      filterParts.push(`assigneeId=${filters.assigneeId}`);
    }

    if (filterParts.length === 0) {
      return baseUrl;
    }

    // Join multiple filters with AND (you might need to check your backend for the exact syntax)
    const filterString = filterParts.join('%20AND%20'); // URL encoded " AND "
    return `${baseUrl}?filter=${encodeURIComponent(filterString)}`;
  };

  // Fetch tasks for the active project
  const {
    data: tasksData,
    isLoading,
    error,
    refetch,
  } = useQuery<TasksResponse>({
    queryKey: ["tasks", projectId],
    queryFn: () => {
      const url = buildTasksUrl(projectId ? { projectId } : undefined);
      console.log("Fetching tasks from URL:", url);
      return authFetch(url);
    },
    enabled: isAuthenticated && !!projectId,
  });
  
  // Transform API tasks to frontend tasks
  const tasks = tasksData?.items?.map(transformTask) || [];
  console.log("Transformed Tasks:", tasks);

  // Fetch tasks with filters
  const fetchTasks = async (newProjectId: string, additionalFilters?: { status?: string; priority?: string; assigneeId?: string }) => {
    setProjectId(newProjectId);
    if (newProjectId) {
      const filters = { projectId: newProjectId, ...additionalFilters };
      const url = buildTasksUrl(filters);
      
      return queryClient.fetchQuery({ 
        queryKey: ["tasks", newProjectId, additionalFilters],
        queryFn: () => authFetch(url)
      });
    }
  };

  // Fetch tasks with custom filters (useful for advanced filtering)
  const fetchTasksWithFilters = async (filters: { projectId?: string; status?: string; priority?: string; assigneeId?: string }) => {
    const url = buildTasksUrl(filters);
    console.log("Fetching tasks with filters:", url);
    
    return queryClient.fetchQuery({ 
      queryKey: ["tasks", "filtered", filters],
      queryFn: () => authFetch(url)
    });
  };
  // Create a new task
  const createTaskMutation = useMutation({
    mutationFn: async (taskData: CreateTaskData) => {
      const response = await fetch("http://localhost:8080/v1/tasks", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${await getAccessTokenSilently()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Request failed with status ${response.status}`
        );
      }
      
      // For CREATE requests, handle empty responses
      const text = await response.text();
      return text ? JSON.parse(text) : {};
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Task created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to create task: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  // Update an existing task
  const updateTaskMutation = useMutation({
    mutationFn: async ({
      taskId,
      taskData,
    }: {
      taskId: string;
      taskData: Partial<CreateTaskData>;
    }) => {
      const response = await fetch(`http://localhost:8080/v1/tasks/${taskId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${await getAccessTokenSilently()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Request failed with status ${response.status}`
        );
      }
      
      // For UPDATE requests, handle empty responses
      const text = await response.text();
      return text ? JSON.parse(text) : {};
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Task updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update task: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  // Delete a task
  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const response = await fetch(`http://localhost:8080/v1/tasks/${taskId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${await getAccessTokenSilently()}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Request failed with status ${response.status}`
        );
      }
      
      // For DELETE requests, handle empty responses
      const text = await response.text();
      return text ? JSON.parse(text) : {};
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Task deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete task: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Get a single task by ID
  const getTask = async (taskId: string) => {
    try {
      return await authFetch(`http://localhost:8080/v1/tasks/${taskId}`);
    } catch (error) {
      console.error("Failed to fetch task:", error);
      throw error;
    }
  };

  // Add a comment to a task
  const addComment = async (taskId: string, text: string) => {
    try {
      return await authFetch(`http://localhost:8080/v1/tasks/${taskId}/comments`, {
        method: "POST",
        body: JSON.stringify({ text }),
      });
    } catch (error) {
      console.error("Failed to add comment:", error);
      throw error;
    }
  };

  // Upload an attachment to a task
  const uploadAttachment = async (taskId: string, file: File) => {
    try {
      const token = await getAccessTokenSilently();
      const formData = new FormData();
      formData.append("file", file);
      
      const response = await fetch(`http://localhost:8080/v1/tasks/${taskId}/attachments`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Failed to upload attachment: ${response.statusText}`);
      }
      
      queryClient.invalidateQueries({ queryKey: [`task-attachments-${taskId}`] });
      return await response.json();
    } catch (error) {
      console.error("Failed to upload attachment:", error);
      throw error;
    }
  };

  return {
    tasks,
    tasksData, // Full paginated response
    isLoading,
    error,
    projectId,
    setProjectId,
    fetchTasks,
    fetchTasksWithFilters, // New method for advanced filtering
    createTask: createTaskMutation.mutate,
    updateTask: updateTaskMutation.mutate,
    deleteTask: deleteTaskMutation.mutate,
    getTask,
    addComment,
    uploadAttachment,
    isCreating: createTaskMutation.isPending,
    isUpdating: updateTaskMutation.isPending,
    isDeleting: deleteTaskMutation.isPending,
  };
}
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth0 } from "@auth0/auth0-react";
import { toApiTimestamp, fromApiTimestamp, getCurrentApiTimestamp, addSecondsToCurrentTime, getApiBaseUrl } from "@/lib/utils";

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

export function useTask(size?: number, page?: number) {
  const { toast } = useToast();
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();
  const [projectId, setProjectId] = useState<string | null>(null);
  const apiBaseUrl = getApiBaseUrl();

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
      priority: priorityMap[apiTask.priority] || "medium",      dueDate: apiTask.endDate ? fromApiTimestamp(apiTask.endDate)?.toISOString() : undefined,
      assigneeId: apiTask.assigneeId,
      order: 0, // Default order
      createdAt: fromApiTimestamp(apiTask.startDate)?.toISOString() || new Date().toISOString(),
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
    };    return {
      name: task.title || task.name,
      description: task.description || "",
      status: statusMap[task.status] || task.status?.toUpperCase() || "TODO",
      priority: priorityMap[task.priority] || task.priority?.toUpperCase() || "MEDIUM",      startDate: task.startDate || getCurrentApiTimestamp(),
      endDate: task.endDate || (task.dueDate ? toApiTimestamp(task.dueDate) : addSecondsToCurrentTime(7 * 24 * 60 * 60)) || getCurrentApiTimestamp(),
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
  };  // Helper function to build filter URL
  const buildTasksUrl = (filters?: { projectId?: string; status?: string; priority?: string; assigneeId?: string; size?: number; page?: number }) => {
    const baseUrl = `${apiBaseUrl}/v1/tasks`;
    const urlParams = new URLSearchParams();
    
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

    // Add pagination parameters
    if (filters.size !== undefined) {
      urlParams.append('size', filters.size.toString());
    }
    
    if (filters.page !== undefined) {
      urlParams.append('page', filters.page.toString());
    }

    // Add filter parameter if there are filters
    if (filterParts.length > 0) {
      const filterString = filterParts.join('%20AND%20'); // URL encoded " AND "
      urlParams.append('filter', filterString);
    }

    // Build final URL
    const queryString = urlParams.toString();
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
  };
  // Fetch tasks for the active project
  const {
    data: tasksData,
    isLoading,
    error,
    refetch,
  } = useQuery<TasksResponse>({
    queryKey: ["tasks", projectId, size, page],
    queryFn: () => {
      const filters = projectId ? { projectId, size, page } : { size, page };
      const url = buildTasksUrl(filters);
      console.log("Fetching tasks from URL:", url);
      return authFetch(url);
    },
    enabled: isAuthenticated && !!projectId,
  });
  
  // Transform API tasks to frontend tasks
  const tasks = tasksData?.items?.map(transformTask) || [];
  console.log("Transformed Tasks:", tasks);
  // Fetch tasks with filters
  const fetchTasks = async (newProjectId: string, additionalFilters?: { status?: string; priority?: string; assigneeId?: string; size?: number; page?: number }) => {
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
  const fetchTasksWithFilters = async (filters: { projectId?: string; status?: string; priority?: string; assigneeId?: string; size?: number; page?: number }) => {
    const url = buildTasksUrl(filters);
    console.log("Fetching tasks with filters:", url);
    
    return queryClient.fetchQuery({ 
      queryKey: ["tasks", "filtered", filters],
      queryFn: () => authFetch(url)
    });
  };
  // Create a new task
  const createTaskMutation = useMutation({    mutationFn: async (taskData: CreateTaskData) => {
      const response = await fetch(`${apiBaseUrl}/v1/tasks`, {
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
    },    onSuccess: () => {
      toast({
        title: "Success",
        description: "Task created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-all-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
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
      taskId: string;      taskData: Partial<CreateTaskData>;
    }) => {
      const response = await fetch(`${apiBaseUrl}/v1/tasks/${taskId}`, {
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
    },    onSuccess: () => {
      toast({
        title: "Success",
        description: "Task updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-all-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
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
  const deleteTaskMutation = useMutation({    mutationFn: async (taskId: string) => {
      const response = await fetch(`${apiBaseUrl}/v1/tasks/${taskId}`, {
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
    },    onSuccess: () => {
      toast({
        title: "Success",        description: "Task deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-all-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete task: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  // Get a single task by ID - using mutation for manual control
  const getTaskByIdMutation = useMutation({    mutationFn: async (taskId: string) => {
      try {
        return await authFetch(`${apiBaseUrl}/v1/tasks/${taskId}`);
      } catch (error) {
        console.error("Failed to fetch task:", error);
        throw error;
      }
    },
  });

  // Helper function for getting task by ID
  const getTaskById = async (taskId: string) => {
    return getTaskByIdMutation.mutateAsync(taskId);
  };

  // Add a comment to a task - using mutation for proper cache invalidation
  const addCommentMutation = useMutation({
    mutationFn: async ({ taskId, content, userId }: { taskId: string; content: string; userId: string }) => {
      return await authFetch(`${apiBaseUrl}/v1/comments`, {
        method: "POST",
        body: JSON.stringify({ content, userId, taskId }),
      });
    },
    onSuccess: (data, variables) => {
      // Invalidate all relevant queries
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-all-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      // Invalidate the specific task-detail query using the taskId from variables
      queryClient.invalidateQueries({ queryKey: ["task-detail", variables.taskId] });
    },
    onError: (error: Error) => {
      console.error("Failed to add comment:", error);
      throw error;    }
  });

  // Update a comment - using mutation for proper cache invalidation
  const updateCommentMutation = useMutation({    mutationFn: async ({ commentId, content, userId, taskId }: { commentId: string; content: string; userId: string; taskId: string }) => {
      return await authFetch(`${apiBaseUrl}/v1/comments/${commentId}`, {
        method: "PUT",
        body: JSON.stringify({ content, userId, taskId }),
      });
    },
    onSuccess: (data, variables) => {
      // Invalidate all relevant queries
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-all-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      // Invalidate the specific task-detail query using the taskId from variables
      queryClient.invalidateQueries({ queryKey: ["task-detail", variables.taskId] });
    },
    onError: (error: Error) => {
      console.error("Failed to update comment:", error);
      throw error;    }
  });

  // Delete a comment - using mutation for proper cache invalidation
  const deleteCommentMutation = useMutation({    mutationFn: async ({ commentId, taskId }: { commentId: string; taskId: string }) => {
      return await authFetch(`${apiBaseUrl}/v1/comments/${commentId}`, {
        method: "DELETE",
      });
    },
    onSuccess: (data, variables) => {
      // Invalidate all relevant queries
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-all-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      // Invalidate the specific task-detail query using the taskId from variables
      queryClient.invalidateQueries({ queryKey: ["task-detail", variables.taskId] });
    },
    onError: (error: Error) => {
      console.error("Failed to delete comment:", error);
      throw error;
    }
  });

  // Helper functions that use the mutations
  const addComment = async (taskId: string, content: string, userId: string) => {
    return addCommentMutation.mutateAsync({ taskId, content, userId });
  };

  const updateComment = async (commentId: string, content: string, userId: string, taskId: string) => {
    return updateCommentMutation.mutateAsync({ commentId, content, userId, taskId });
  };
  const deleteComment = async (commentId: string, taskId: string) => {
    return deleteCommentMutation.mutateAsync({ commentId, taskId });
  };
  return {
    tasks,
    tasksData, // Full paginated response
    isLoading,    error,
    projectId,
    setProjectId,
    fetchTasks,
    fetchTasksWithFilters, // New method for advanced filtering
    createTask: createTaskMutation.mutate,
    updateTask: updateTaskMutation.mutate,
    deleteTask: deleteTaskMutation.mutate,
    getTaskById,
    addComment,
    updateComment,
    deleteComment,
    isCreating: createTaskMutation.isPending,
    isUpdating: updateTaskMutation.isPending,
    isDeleting: deleteTaskMutation.isPending,
    isAddingComment: addCommentMutation.isPending,
    isUpdatingComment: updateCommentMutation.isPending,
    isDeletingComment: deleteCommentMutation.isPending,
    isFetchingTask: getTaskByIdMutation.isPending,
  };
}
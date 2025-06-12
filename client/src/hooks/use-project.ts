import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth0 } from "@auth0/auth0-react";
import { fromApiTimestamp } from "@/lib/utils";

// Project structure from API
export interface Project {
  id?: string; // Assuming ID is returned after creation
  name: string;
  description: string;
  startDate: number; // timestamp
  endDate: number; // timestamp
  progress: number; // percentage
  taskCount: number; // number of tasks in the project
  doneTaskCount: number; // number of tasks completed
}

// Paginated response structure
export interface ProjectsResponse {
  pageIndex: number;
  totalPages: number;
  totalItems: number;
  last: boolean;
  first: boolean;
  items: Project[];
}

export interface CreateProjectData {
  name: string;
  description?: string;
  startDate: number; // timestamp
  endDate: number; // timestamp
}

export interface UpdateProjectData {
  name?: string;
  description?: string;
  startDate?: number; // timestamp
  endDate?: number; // timestamp
}

export function useProject() {
  const { toast } = useToast();
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();
  // Helper function to transform API project to frontend project (convert 10-digit timestamps to 13-digit)
  const transformProject = (apiProject: Project): Project => {
    return {
      ...apiProject,
      startDate: fromApiTimestamp(apiProject.startDate)?.getTime() || apiProject.startDate,
      endDate: fromApiTimestamp(apiProject.endDate)?.getTime() || apiProject.endDate,
    };
  };

  // Helper function to make authenticated API requests
  const authFetch = async (url: string, options: RequestInit = {}) => {
    if (!isAuthenticated) {
      throw new Error("User is not authenticated");
    }

    const token = await getAccessTokenSilently();
    console.log("Token:", token);
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

    return response.json();
  };

  // Fetch all projects with pagination
  const {
    data: projectsData,
    isLoading,
    error,
    refetch,
  } = useQuery<ProjectsResponse>({
    queryKey: ["projects"],
    queryFn: () => authFetch("http://localhost:8080/v1/projects"),
    enabled: isAuthenticated,
  });
  // Extract projects from paginated response and transform timestamps
  const projects = projectsData?.items?.map(transformProject) || [];
  // Create a new project
  const createProjectMutation = useMutation({
    mutationFn: async (projectData: CreateProjectData) => {
      console.log("Creating project with data:", projectData);
      
      const response = await fetch("http://localhost:8080/v1/projects", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${await getAccessTokenSilently()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
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
        description: "Project created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-all-tasks"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to create project: ${error.message}`,
        variant: "destructive",
      });
    },
  });  // Update an existing project
  const updateProjectMutation = useMutation({
    mutationFn: async ({
      projectId,
      projectData,
    }: {
      projectId: string;
      projectData: UpdateProjectData;
    }) => {
      const response = await fetch(`http://localhost:8080/v1/projects/${projectId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${await getAccessTokenSilently()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
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
        description: "Project updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-all-tasks"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update project: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  // Delete a project
  const deleteProjectMutation = useMutation({
    mutationFn: async (projectId: string) => {
      const response = await fetch(`http://localhost:8080/v1/projects/${projectId}`, {
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
      
      // For DELETE requests, we don't need to parse JSON if the response is empty
      const text = await response.text();
      return text ? JSON.parse(text) : {};
    },    onSuccess: () => {
      toast({
        title: "Success",
        description: "Project deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-all-tasks"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete project: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  // Get a single project by ID
  const getProject = async (projectId: string) => {
    try {
      const apiProject = await authFetch(`http://localhost:8080/v1/projects/${projectId}`);
      return transformProject(apiProject);
    } catch (error) {
      console.error("Failed to fetch project:", error);
      throw error;
    }
  };

  const fetchProjectById = (projectId: string) => {
    return queryClient.fetchQuery({
      queryKey: ["project", projectId],
      queryFn: () => getProject(projectId),
    });
  };

  return {
    projects,           // The extracted projects array
    projectsData,       // The full paginated response
    isLoading,
    error,
    refetchProjects: refetch,
    createProject: createProjectMutation.mutate,
    updateProject: updateProjectMutation.mutate,
    deleteProject: deleteProjectMutation.mutate,
    getProject,
    fetchProjectById,
    isCreating: createProjectMutation.isPending,
    isUpdating: updateProjectMutation.isPending,
    isDeleting: deleteProjectMutation.isPending,
  };
}
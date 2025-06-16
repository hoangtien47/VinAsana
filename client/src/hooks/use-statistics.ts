import { useQuery } from "@tanstack/react-query";
import { useAuth0 } from "@auth0/auth0-react";
import { getApiBaseUrl } from "@/lib/utils";

// Define the statistics response structure
export interface TaskCountForAllUsers {
  [userId: string]: number;
}

// Define the task count by status response structure
export interface TaskCountByStatus {
  todo: number;
  inProgress: number;
  inReview: number;
  done: number;
}

export function useStatistics() {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();
  const apiBaseUrl = getApiBaseUrl();

  // Function to fetch with authentication
  const authFetch = async (url: string) => {
    if (!isAuthenticated) {
      throw new Error("User not authenticated");
    }
    
    const token = await getAccessTokenSilently();
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  };  // Get task count for all users in a project
  const useTaskCountForAllUsers = (projectId?: string) => {
    return useQuery({
      queryKey: ["statistics", "task-count-for-all-users", projectId],
      queryFn: async (): Promise<TaskCountForAllUsers> => {
        if (!projectId) {
          throw new Error("Project ID is required");
        }
        const encodedProjectId = encodeURIComponent(projectId);
        return authFetch(`${apiBaseUrl}/v1/statistics/task-count-for-all-users?project-id=${encodedProjectId}`);
      },
      enabled: !!projectId && isAuthenticated,
      staleTime: 5 * 60 * 1000, 
      gcTime: 10 * 60 * 1000, 
    });
  };
  // Get task count by status for each user in a project
  const useTaskCountForEachUser = (projectId?: string, userId?: string) => {
    return useQuery({
      queryKey: ["statistics", "task-count-for-each-user", projectId, userId],
      queryFn: async (): Promise<TaskCountByStatus> => {
        if (!projectId) {
          throw new Error("Project ID is required");
        }
        if (!userId) {
          throw new Error("User ID is required");
        }
        const encodedProjectId = encodeURIComponent(projectId);
        const encodedUserId = encodeURIComponent(userId);
        return authFetch(`${apiBaseUrl}/v1/statistics/task-count-for-each-user?project-id=${encodedProjectId}&user-id=${encodedUserId}`);
      },
      enabled: !!projectId && !!userId && isAuthenticated,
      staleTime: 5 * 60 * 1000, 
      gcTime: 10 * 60 * 1000, 
    });
  };


  return {
    useTaskCountForAllUsers,
    useTaskCountForEachUser,
  };
}

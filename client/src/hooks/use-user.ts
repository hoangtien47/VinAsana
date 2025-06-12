import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth0 } from "@auth0/auth0-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useMemo } from "react";
import { getApiBaseUrl } from "@/lib/utils";

// Define permission structure
export interface Permission {
  value: string;
  description?: string;
}

// Define the API user structure
export interface ApiUser {
  id: string;
  email: string;
  avatar?: string;
  nickname?: string;
  languageCode?: string;
  permissions?: Permission[];
}

// Define the user profile response structure
export interface UserProfile {
  id: string;
  nickname: string;
  email: string;
  avatar: string;
  languageCode: string | null;
  permissions: Permission[];
}

// Define the paginated response structure
export interface UsersResponse {
  pageIndex: number;
  totalPages: number;
  totalItems: number;
  last: boolean;
  first: boolean;
  items: ApiUser[];
}

// Define request data structures
export interface CreateUserData {
  email: string;
  permissions: string[];
}

export interface UpdateUserData {
  email: string;
  permissions: string[];
}

export interface UpdateProfileData {
  avatar: string;
  nickname: string;
  languageCode: string;
}

export interface UpdatePasswordData {
  oldPassword: string;
  newPassword: string;
}

export interface FirstTimePasswordData {
  token: string;
  password: string;
}

// Define filter options for users
export interface UserFilterOptions {
  search?: string;
  permissions?: string[];
  languageCode?: string;
}

export function useUser() {
  const { toast } = useToast();
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<UserFilterOptions>({});
  const apiBaseUrl = getApiBaseUrl();

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
  // Fetch all users
  const {
    data: usersData,
    isLoading,
    error,
    refetch,
  } = useQuery<UsersResponse>({
    queryKey: ["users", filters],    queryFn: () => {
      console.log("Fetching users from API");
      return authFetch(`${apiBaseUrl}/v1/users`);
    },
    enabled: isAuthenticated,
  });

  // Fetch current user profile
  const {
    data: userProfile,
    isLoading: isLoadingProfile,
    error: profileError,
    refetch: refetchProfile,  } = useQuery<UserProfile>({
    queryKey: ["user-profile"],
    queryFn: () => authFetch(`${apiBaseUrl}/v1/users/profile`),
    enabled: isAuthenticated,
  });

  // Fetch all permissions
  const {
    data: permissions,
    isLoading: isLoadingPermissions,
    error: permissionsError,  } = useQuery<Permission[]>({
    queryKey: ["permissions"],
    queryFn: () => authFetch(`${apiBaseUrl}/v1/users/permissions`),
    enabled: isAuthenticated,
  });

  // Transform API users to a more usable format
  const users = usersData?.items || [];
  console.log("Transformed Users:", users);

  // Filter users based on current filters
  const filteredUsers = useMemo(() => {
    if (!users.length) return [];
    
    return users.filter(user => {
      // Handle search filtering (search in email and nickname)
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const matchesEmail = user.email?.toLowerCase().includes(searchTerm);
        const matchesNickname = user.nickname?.toLowerCase().includes(searchTerm);
        if (!matchesEmail && !matchesNickname) return false;
      }
      
      // Handle permissions filtering
      if (filters.permissions && filters.permissions.length > 0) {
        const userPermissions = user.permissions?.map(p => p.value) || [];
        const hasPermission = filters.permissions.some(permission => 
          userPermissions.includes(permission)
        );
        if (!hasPermission) return false;
      }
      
      // Handle language code filtering
      if (filters.languageCode && user.languageCode !== filters.languageCode) {
        return false;
      }
      
      return true;
    });
  }, [users, filters]);

  // Helper function to apply filters
  const applyFilters = (newFilters: UserFilterOptions) => {
    setFilters(newFilters);
  };

  // Helper function to clear all filters
  const clearFilters = () => {
    setFilters({});
  };

  // Create user mutation
  const createUserMutation = useMutation({    mutationFn: async (userData: CreateUserData) => {
      console.log("Creating user with data:", userData);
      return authFetch(`${apiBaseUrl}/v1/users`, {
        method: "POST",
        body: JSON.stringify(userData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({
        title: "Success",
        description: "User created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create user",
        variant: "destructive",
      });
    },
  });

  // Update user mutation
  const updateUserMutation = useMutation({    mutationFn: async ({ userId, userData }: { userId: string; userData: UpdateUserData }) => {
      return authFetch(`${apiBaseUrl}/v1/users/${userId}`, {
        method: "PUT",
        body: JSON.stringify(userData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({
        title: "Success",
        description: "User updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user",
        variant: "destructive",
      });
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({    mutationFn: async (userId: string) => {
      return authFetch(`${apiBaseUrl}/v1/users/${userId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive",
      });
    },
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({    mutationFn: async (profileData: UpdateProfileData) => {
      return authFetch(`${apiBaseUrl}/v1/users/profile`, {
        method: "PUT",
        body: JSON.stringify(profileData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  // Update password mutation
  const updatePasswordMutation = useMutation({    mutationFn: async (passwordData: UpdatePasswordData) => {
      return authFetch(`${apiBaseUrl}/v1/users/password`, {
        method: "PUT",
        body: JSON.stringify(passwordData),
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Password updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update password",
        variant: "destructive",
      });
    },
  });  
  
  // First-time password reset mutation (using token)
  const firstTimePasswordMutation = useMutation({    mutationFn: async (data: FirstTimePasswordData) => {
      // For first-time password reset, we don't need authentication
      const response = await fetch(`${apiBaseUrl}/v1/user-action/reset/${data.token}`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: data.password }),
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
      
      return null;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Password set successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to set password",
        variant: "destructive",
      });
    },
  });


  // Get user by ID
  const getUser = async (userId: string): Promise<ApiUser | null> => {
    try {
      const user: ApiUser | null = await authFetch(`${apiBaseUrl}/v1/users/${userId}`);
      return user;
    } catch (error) {
      console.error("Failed to fetch user:", error);
      throw error;
    }
  };

  return {
    // Users data (filtered and unfiltered)
    users: filteredUsers, // Filtered users
    allUsers: users, // All users without filters
    usersData, // Full paginated response
    isLoading,
    error,
    refetch,
    
    // User profile data
    userProfile,
    isLoadingProfile,
    profileError,
    refetchProfile,
    
    // Permissions data
    permissions,
    isLoadingPermissions,
    permissionsError,
    
    // Filtering functionality
    filters,
    applyFilters,
    clearFilters,
    hasActiveFilters: Object.keys(filters).some(key => 
      filters[key as keyof UserFilterOptions] !== undefined && 
      (Array.isArray(filters[key as keyof UserFilterOptions]) ? 
        (filters[key as keyof UserFilterOptions] as string[]).length > 0 : 
        true)
    ),
      // Mutations
    createUser: createUserMutation.mutate,
    updateUser: updateUserMutation.mutate,
    deleteUser: deleteUserMutation.mutate,
    updateProfile: updateProfileMutation.mutate,
    updatePassword: updatePasswordMutation.mutate,
    setFirstTimePassword: firstTimePasswordMutation.mutate,
    
    // Mutation states
    isCreatingUser: createUserMutation.isPending,
    isUpdatingUser: updateUserMutation.isPending,
    isDeletingUser: deleteUserMutation.isPending,
    isUpdatingProfile: updateProfileMutation.isPending,
    isUpdatingPassword: updatePasswordMutation.isPending,
    isSettingFirstTimePassword: firstTimePasswordMutation.isPending,
    
    getUser,
  };
}

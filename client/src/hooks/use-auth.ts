import { useQuery } from "@tanstack/react-query";
import { useAuth0 } from "@auth0/auth0-react";

const MOCK_AUTH = false; // Set to true to use mock data

export function useAuth() {
  const { user, isLoading, isAuthenticated } = useAuth0();


  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}

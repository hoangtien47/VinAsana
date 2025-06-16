import { useState } from "react";
import { Sidebar } from "@/components/ui/sidebar";
import { Navbar } from "@/components/ui/navbar";
import { Button } from "@/components/ui/button";
import { TeamMemberList } from "@/components/team/team-member-list";
import { TeamCalendar } from "@/components/team/team-calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useUser } from "@/hooks/use-user";
import { Loader2 } from "lucide-react";

export default function Team() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("members");
  // Use the user hook to get all users
  const {
    users,
    isLoading,
    error,
    refetch,
  } = useUser(20);

  console.log("Users:", users.length);

  // Transform API users to match the expected format for TeamMemberList
  const transformedMembers = users.map((apiUser, index) => ({
    id: index + 1, // Use index as numeric ID for compatibility
    projectId: 1, // Dummy project ID since we're showing all users
    userId: apiUser.id,
    user: {
      id: apiUser.id,
      firstName: apiUser.nickname?.split(' ')[0] || apiUser.email?.split('@')[0] || '',
      lastName: apiUser.nickname?.split(' ').slice(1).join(' ') || '',
      email: apiUser.email || '',
      profileImageUrl: apiUser.avatar || '',
    }
  }));

  // Transform current user to match expected format
  const currentUserTransformed = {
    id: user?.sub || '',
    firstName: user?.given_name || user?.nickname?.split(' ')[0] || '',
    lastName: user?.family_name || user?.nickname?.split(' ').slice(1).join(' ') || '',
    email: user?.email || '',
    profileImageUrl: user?.picture || '',
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Failed to load users: {error.message}</p>
          <Button onClick={() => refetch()}>Retry</Button>
        </div>
      </div>
    );
  }  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar title="Team" subtitle={`${users.length} member${users.length !== 1 ? 's' : ''}`} />
        <div className="flex-1 p-6 overflow-auto">
          {/* Tabs for team members and calendar */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <TabsList className="mx-auto">
              <TabsTrigger value="members">Team Members</TabsTrigger>
              <TabsTrigger value="calendar">Team Calendar</TabsTrigger>
            </TabsList>
            
            <TabsContent value="members" className="mt-4">
              <TeamMemberList
                projectId={1} // Dummy project ID since we're showing all users
                members={transformedMembers}
                onMembersChange={refetch}
                currentUser={currentUserTransformed}
              />
            </TabsContent>
            
            <TabsContent value="calendar" className="mt-4">
              <TeamCalendar
                projectId={1} // Dummy project ID
                members={transformedMembers}
                currentUser={currentUserTransformed}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

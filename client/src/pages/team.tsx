import { useState, useEffect } from "react";
import { Sidebar } from "@/components/ui/sidebar";
import { Navbar } from "@/components/ui/navbar";
import { TeamMemberList } from "@/components/team/team-member-list";
import { TeamCalendar } from "@/components/team/team-calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTeam } from "@/hooks/use-team";

export default function Team() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [projectId, setProjectId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("members");

  // Get the first project ID for now, in a real application you'd want to get this from the URL
  const {
    data: projects,
    isLoading: isLoadingProjects,
    error: projectsError,
  } = useQuery({
    queryKey: ['/api/projects'],
    enabled: !!user,
  });

  // Set the first project as active when projects load
  useEffect(() => {
    if (projects && projects.length > 0 && !projectId) {
      setProjectId(projects[0].id);
    }
  }, [projects, projectId]);

  // Fetch team members for the active project
  const {
    data: members,
    isLoading: isLoadingMembers,
    error: membersError,
    refetch: refetchMembers,
  } = useQuery({
    queryKey: [`/api/projects/${projectId}/members`],
    enabled: !!projectId,
  });

  // Loading state
  if (isLoadingProjects) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // No projects state
  if (projects && projects.length === 0) {
    return (
      <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Navbar title="Team" />
          <div className="flex-1 p-6 flex items-center justify-center">
            <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-lg shadow-sm w-full max-w-md">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">No Projects Found</h2>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Create your first project to start managing your team.
              </p>
              <Button className="mt-4">Create Project</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar title="Team" subtitle={projects?.find((p: any) => p.id === projectId)?.name} />
        <div className="flex-1 p-6 overflow-hidden flex flex-col">
          {/* Project selector */}
          {projects && projects.length > 1 && (
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-sm font-medium">Project:</span>
              <select
                className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                value={projectId || ''}
                onChange={(e) => setProjectId(Number(e.target.value))}
              >
                {projects.map((project: any) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Tabs for team members and calendar */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="mx-auto">
              <TabsTrigger value="members">Team Members</TabsTrigger>
              <TabsTrigger value="calendar">Team Calendar</TabsTrigger>
            </TabsList>
            
            <TabsContent value="members" className="flex-1 overflow-hidden mt-4">
              {isLoadingMembers ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <TeamMemberList
                  projectId={projectId!}
                  members={members || []}
                  onMembersChange={refetchMembers}
                  currentUser={user}
                />
              )}
            </TabsContent>
            
            <TabsContent value="calendar" className="flex-1 overflow-hidden mt-4">
              {isLoadingMembers ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <TeamCalendar
                  projectId={projectId!}
                  members={members || []}
                  currentUser={user}
                />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

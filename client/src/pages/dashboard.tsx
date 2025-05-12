import { useState, useEffect } from "react";
import { Sidebar } from "@/components/ui/sidebar";
import { Navbar } from "@/components/ui/navbar";
import { StatsCard } from "@/components/dashboard/stats-card";
import { ProjectSummary } from "@/components/dashboard/project-summary";
import { TaskOverview } from "@/components/dashboard/task-overview";
import { UpcomingDeadlines } from "@/components/dashboard/upcoming-deadlines";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { 
  LayoutDashboard, 
  CheckSquare, 
  Users, 
  Clock, 
  Calendar 
} from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Fetch dashboard statistics
  const { 
    data: stats, 
    isLoading: isLoadingStats, 
    error: statsError 
  } = useQuery({
    queryKey: ['/api/dashboard/stats'],
    enabled: !!user,
  });

  // Fetch user's projects
  const { 
    data: projects,
    isLoading: isLoadingProjects,
    error: projectsError 
  } = useQuery({
    queryKey: ['/api/projects'],
    enabled: !!user,
  });

  useEffect(() => {
    if (statsError) {
      toast({
        title: "Error loading dashboard",
        description: "There was a problem loading your dashboard data.",
        variant: "destructive",
      });
    }
  }, [statsError, toast]);

  // Mock data for example purposes - in production this would come from the API
  const taskStatusDistribution = [
    { name: "Backlog", value: 10, color: "#94a3b8" },
    { name: "To Do", value: 15, color: "#3b82f6" },
    { name: "In Progress", value: 8, color: "#f59e0b" },
    { name: "Review", value: 5, color: "#8b5cf6" },
    { name: "Done", value: 20, color: "#10b981" },
  ];

  const taskPriorityDistribution = [
    { name: "Low", value: 12, color: "#3b82f6" },
    { name: "Medium", value: 25, color: "#f59e0b" },
    { name: "High", value: 15, color: "#f97316" },
    { name: "Urgent", value: 6, color: "#ef4444" },
  ];

  // Format projects for the ProjectSummary component
  const formattedProjects = projects?.slice(0, 3).map((project: any) => ({
    id: project.id,
    name: project.name,
    description: project.description || "No description provided",
    progress: Math.round(Math.random() * 100), // Example - would come from real calculation
    startDate: project.startDate,
    endDate: project.endDate,
    members: [], // Would be populated from project members API
    tasksTotal: 0, // Would be calculated from tasks
    tasksCompleted: 0, // Would be calculated from tasks
  })) || [];

  // Recent activity mock data
  const recentActivities = [
    {
      id: 1,
      type: 'task_created',
      user: {
        id: '1',
        name: 'John Doe',
        avatar: 'https://i.pravatar.cc/150?img=1',
      },
      description: 'Created a new task "Design the landing page"',
      timestamp: new Date().toISOString(),
      project: {
        id: 1,
        name: 'Website Redesign',
      },
    },
    {
      id: 2,
      type: 'task_completed',
      user: {
        id: '2',
        name: 'Jane Smith',
        avatar: 'https://i.pravatar.cc/150?img=5',
      },
      description: 'Completed the task "Create API documentation"',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      project: {
        id: 2,
        name: 'Backend API',
      },
    },
    {
      id: 3,
      type: 'comment_added',
      user: {
        id: '3',
        name: 'Mike Johnson',
        avatar: 'https://i.pravatar.cc/150?img=8',
      },
      description: 'Commented on "Fix login issue": "This has been resolved in the latest commit"',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      project: {
        id: 1,
        name: 'Website Redesign',
      },
    },
    {
      id: 4,
      type: 'document_uploaded',
      user: {
        id: '2',
        name: 'Jane Smith',
        avatar: 'https://i.pravatar.cc/150?img=5',
      },
      description: 'Uploaded document "Product Requirements.pdf"',
      timestamp: new Date(Date.now() - 10800000).toISOString(),
      project: {
        id: 3,
        name: 'Mobile App',
      },
    },
    {
      id: 5,
      type: 'user_joined',
      user: {
        id: '4',
        name: 'Sarah Williams',
        avatar: 'https://i.pravatar.cc/150?img=20',
      },
      description: 'Joined the project team',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      project: {
        id: 2,
        name: 'Backend API',
      },
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar 
          title="Dashboard" 
          subtitle="Welcome back, here's an overview of your projects"
        />
        <ScrollArea className="flex-1 p-6">
          <div className="container mx-auto space-y-8 pb-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatsCard
                title="Total Projects"
                value={stats?.totalProjects || 0}
                icon={LayoutDashboard}
                iconColor="text-blue-500"
                trend={stats?.totalProjects > 0 ? { value: 12, isPositive: true } : undefined}
              />
              <StatsCard
                title="Total Tasks"
                value={stats?.totalTasks || 0}
                icon={CheckSquare}
                iconColor="text-amber-500"
                trend={stats?.totalTasks > 0 ? { value: 8, isPositive: true } : undefined}
              />
              <StatsCard
                title="Team Members"
                value={projects?.[0]?.members?.length || 0}
                icon={Users}
                iconColor="text-purple-500"
              />
              <StatsCard
                title="Upcoming Deadlines"
                value={stats?.upcomingDeadlines?.length || 0}
                icon={Clock}
                iconColor="text-red-500"
                description="Tasks due in the next 7 days"
              />
            </div>

            {/* Project Summary & Task Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ProjectSummary projects={formattedProjects} />
              <TaskOverview 
                statusDistribution={taskStatusDistribution}
                priorityDistribution={taskPriorityDistribution}
              />
            </div>

            {/* Upcoming Deadlines & Activity Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <UpcomingDeadlines tasks={stats?.upcomingDeadlines || []} />
              <ActivityFeed activities={recentActivities} />
            </div>

            {/* Create New Project Button */}
            {!isLoadingProjects && (!projects || projects.length === 0) && (
              <div className="flex justify-center mt-8">
                <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-lg shadow-sm w-full max-w-2xl">
                  <Calendar className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Get Started with Your First Project</h2>
                  <p className="mt-2 text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                    Create your first project to start managing tasks, documents, team members, and more.
                  </p>
                  <Link to="/create-project">
                    <Button size="lg" className="mt-6">
                      Create Your First Project
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

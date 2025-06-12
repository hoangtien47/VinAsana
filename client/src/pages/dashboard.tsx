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
import { useProject, CreateProjectData } from "@/hooks/use-project";
import { useUser } from "@/hooks/use-user";
import { useI18n, useUserLanguageSync } from "@/hooks/use-i18n";
import { useAuth0 } from "@auth0/auth0-react";
import { getApiBaseUrl } from "@/lib/utils";
import { 
  LayoutDashboard, 
  CheckSquare, 
  Users, 
  Clock, 
  Calendar,
  Plus 
} from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ProjectForm } from "@/components/projects/project-form";

export default function Dashboard() {  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useI18n();
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();
  const [isProjectFormOpen, setIsProjectFormOpen] = useState(false);
  const apiBaseUrl = getApiBaseUrl();

  // Sync user language preferences
  useUserLanguageSync();
  
  const { 
    projects, 
    projectsData,
    isLoading: isLoadingProjects, 
  } = useProject();

  // Get user data for team members count
  const {
    users,
    usersData,
    isLoading: isLoadingUsers
  } = useUser();

  // Dedicated query for fetching all tasks for dashboard
  const { 
    data: allTasksData, 
    isLoading: isLoadingTasks, 
    error: allTasksError 
  } = useQuery({
    queryKey: ["dashboard-all-tasks"],
    queryFn: async () => {
      if (!isAuthenticated) {
        throw new Error("User is not authenticated");
      }
        const token = await getAccessTokenSilently();
      const response = await fetch(`${apiBaseUrl}/v1/tasks`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch tasks: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Dashboard: Raw API response:", data);
        // Transform the tasks from API format to frontend format
      const transformedTasks = data.items?.map((apiTask: any) => {        // Map API status to frontend status
        const statusMap: Record<string, string> = {
          "TODO": "todo",
          "IN_PROGRESS": "in_progress",
          "IN_REVIEW": "in_review", 
          "DONE": "done"
        };

        // Map API priority to frontend priority
        const priorityMap: Record<string, string> = {
          "LOW": "low",
          "MEDIUM": "medium",
          "HIGH": "high", 
          "CRITICAL": "urgent"
        };

        return {
          id: parseInt(apiTask.id || "0"),
          title: apiTask.name,
          description: apiTask.description,
          status: statusMap[apiTask.status] || "todo",
          priority: priorityMap[apiTask.priority] || "medium",
          dueDate: apiTask.endDate ? new Date(apiTask.endDate).toISOString() : undefined,
          assigneeId: apiTask.assigneeId,
          order: 0,
          createdAt: apiTask.startDate ? new Date(apiTask.startDate).toISOString() : new Date().toISOString()
        };
      }) || [];

      console.log("Dashboard: Transformed tasks:", transformedTasks);

      return {
        tasks: transformedTasks,
        totalItems: data.totalItems || transformedTasks.length,
        ...data
      };
    },
    enabled: isAuthenticated,
  });

  // Use the dashboard-specific task data
  const tasks = allTasksData?.tasks || [];
  const tasksData = allTasksData;  // Calculate real task statistics from API data
  const calculateTaskStats = () => {
    try {
      const tasksToAnalyze = tasks || [];

      // Debug logging
      console.log('Dashboard - calculateTaskStats:', {
        totalTasks: tasksToAnalyze.length,
        sampleTask: tasksToAnalyze[0],
        tasksWithDueDate: tasksToAnalyze.filter((t: any) => t?.dueDate).length
      });

      // ...existing code...
      if (tasksToAnalyze.length === 0) {
        return {
          statusDistribution: [],
          priorityDistribution: [],
          upcomingDeadlines: 0,
          upcomingDeadlineTasks: []
        };
      }

      // Calculate status distribution
      const statusCounts = tasksToAnalyze.reduce((acc: Record<string, number>, task: any) => {
        if (task && task.status) {
          acc[task.status] = (acc[task.status] || 0) + 1;
        }
        return acc;
      }, {});      const statusDistribution = [
        { name: t('tasks.status.todo'), value: statusCounts.todo || 0, color: "#3b82f6" },
        { name: t('tasks.status.inProgress'), value: statusCounts.in_progress || 0, color: "#f59e0b" },
        { name: t('tasks.status.inReview'), value: statusCounts.in_review || 0, color: "#8b5cf6" },
        { name: t('tasks.status.done'), value: statusCounts.done || 0, color: "#10b981" },
      ].filter(item => item.value > 0);

      // Calculate priority distribution
      const priorityCounts = tasksToAnalyze.reduce((acc: Record<string, number>, task: any) => {
        if (task && task.priority) {
          acc[task.priority] = (acc[task.priority] || 0) + 1;
        }
        return acc;
      }, {});      const priorityDistribution = [
        { name: t('tasks.priority.low'), value: priorityCounts.low || 0, color: "#3b82f6" },
        { name: t('tasks.priority.medium'), value: priorityCounts.medium || 0, color: "#f59e0b" },
        { name: t('tasks.priority.high'), value: priorityCounts.high || 0, color: "#f97316" },
        { name: t('tasks.priority.urgent'), value: priorityCounts.urgent || 0, color: "#ef4444" },
      ].filter(item => item.value > 0);      // Calculate upcoming deadlines (tasks due in next 7 days)
      const now = new Date();
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      console.log('Dashboard - Upcoming deadlines calculation:', {
        now: now.toISOString(),
        nextWeek: nextWeek.toISOString(),
        tasksWithDueDate: tasksToAnalyze.filter((t: any) => t?.dueDate).map((t: any) => ({
          id: t.id,
          title: t.title,
          dueDate: t.dueDate,
          status: t.status
        }))
      });
          const upcomingDeadlineTasks = tasksToAnalyze.filter((task: any) => {
        try {
          if (!task || !task.dueDate || task.status === 'done') return false;
          const dueDate = new Date(task.dueDate);
          // Include tasks due in the next 7 days OR overdue tasks (but not done)
          const isUpcoming = dueDate <= nextWeek;
          
          if (task.dueDate) {
            console.log('Task due date check:', {
              taskId: task.id,
              title: task.title,
              dueDate: task.dueDate,
              parsedDueDate: dueDate.toISOString(),
              status: task.status,
              isUpcoming
            });
          }
          
          return isUpcoming;
        } catch (error) {
          console.error('Error processing task due date:', error, task);
          return false;
        }}).map((task: any) => {
        // Find project info if available
        const taskProject = projects?.find((p: any) => p.id === task.projectId);
        // Find user info if available
        const taskAssignee = users?.find((u: any) => u.id === task.assigneeId);
        
        return {
          ...task,
          // Add project info
          project: taskProject ? {
            id: taskProject.id,
            name: taskProject.name
          } : {
            id: 0,
            name: "Unknown Project"
          },
          // Add assignee info  
          assignee: taskAssignee ? {
            id: taskAssignee.id,
            name: taskAssignee.nickname || taskAssignee.email || "Unknown User",
            avatar: taskAssignee.avatar
          } : (task.assigneeId ? {
            id: task.assigneeId,
            name: "Unknown User",
            avatar: undefined
          } : undefined)
        };
      });

      return {
        statusDistribution,
        priorityDistribution,
        upcomingDeadlines: upcomingDeadlineTasks.length,
        upcomingDeadlineTasks: upcomingDeadlineTasks
      };
    } catch (error) {
      console.error("Error calculating task statistics:", error);      return {
        statusDistribution: [],
        priorityDistribution: [],
        upcomingDeadlines: 0,
        upcomingDeadlineTasks: []
      };
    }
  };
  const taskStats = calculateTaskStats();
  

  // Format projects for the ProjectSummary component
  const formattedProjects = projects?.slice(0, 3).map((project: any) => ({
    id: project.id,
    name: project.name,
    description: project.description || "No description provided",
    progress: project.progress,    startDate: project.startDate,
    endDate: project.endDate,
    members: [], // Would be populated from project members API
    tasksTotal: project.taskCount, // Would be calculated from tasks
    tasksCompleted: project.doneTaskCount, // Would be calculated from tasks
  })) || [];

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">        <Navbar 
          title={t('navigation.dashboard')} 
          subtitle={t('dashboard.welcomeMessage')}
        /><ScrollArea className="flex-1 p-6">
          <div className="container mx-auto space-y-8 pb-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">              <StatsCard
                title={t('dashboard.totalProjects')}
                value={projectsData?.totalItems || 0}
                icon={LayoutDashboard}
                iconColor="text-blue-500"
                trend={(projectsData?.totalItems ?? 0) > 0 ? { value: 12, isPositive: true } : undefined}
              />
              <StatsCard
                title={t('dashboard.totalTasks')}
                value={tasksData?.totalItems || tasks?.length || 0}
                icon={CheckSquare}
                iconColor="text-amber-500"
                trend={(tasksData?.totalItems || tasks?.length || 0) > 0 ? { value: 8, isPositive: true } : undefined}
              />
              <StatsCard
                title={t('dashboard.teamMembers')}
                value={usersData?.totalItems || users?.length || 0}
                icon={Users}
                iconColor="text-purple-500"
                trend={(usersData?.totalItems ?? users?.length ?? 0) > 0 ? { value: 5, isPositive: true } : undefined}
              />
              <StatsCard
                title={t('dashboard.upcomingDeadlines')}
                value={taskStats.upcomingDeadlines}
                icon={Clock}
                iconColor="text-red-500"
                description={t('dashboard.tasksInNext7Days')}
              />
            </div>            {/* Project Summary & Task Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ProjectSummary projects={formattedProjects} />              {isLoadingTasks ? (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-32 bg-gray-200 rounded mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ) : taskStats.statusDistribution.length === 0 && taskStats.priorityDistribution.length === 0 ? (                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                  <div className="text-center py-8">
                    <CheckSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">{t('dashboard.noTasksYet')}</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {t('dashboard.createFirstTask')}
                    </p>
                  </div>
                </div>
              ) : (
                <TaskOverview 
                  statusDistribution={taskStats.statusDistribution}
                  priorityDistribution={taskStats.priorityDistribution}
                />
              )}
            </div>            {/* Upcoming Deadlines & Activity Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <UpcomingDeadlines tasks={taskStats.upcomingDeadlineTasks || []} />
              {/* <ActivityFeed activities={recentActivities} /> */}
            </div>{/* Create New Project Button */}
            {/*!isLoadingProjects &&*/ (!projects || projects.length === 0) && (
              <div className="flex justify-center mt-8">                <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-lg shadow-sm w-full max-w-2xl">
                  <Calendar className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('dashboard.getStartedTitle')}</h2>
                  <p className="mt-2 text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                    {t('dashboard.getStartedDescription')}
                  </p>
                  <Button size="lg" className="mt-6" onClick={() => setIsProjectFormOpen(true)}>
                    {t('dashboard.createFirstProject')}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
      
    </div>
  );
}

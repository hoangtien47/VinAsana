import { useState, useEffect } from "react";
import { Sidebar } from "@/components/ui/sidebar";
import { Navbar } from "@/components/ui/navbar";
import { ProjectAnalytics } from "@/components/analytics/project-analytics";
import { ChartComponent } from "@/components/analytics/chart-component";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useAuth0 } from "@auth0/auth0-react";
import { useProject } from "@/hooks/use-project";
import { useTask } from "@/hooks/use-task";
import { useStatistics } from "@/hooks/use-statistics";
import { useUser } from "@/hooks/use-user";
import { format, addDays, subDays } from "date-fns";
import { getApiBaseUrl } from "@/lib/utils";
import { 
  Loader2, 
  TrendingUp, 
  BarChart, 
  Activity, 
  Clock, 
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Analytics() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();
  const [projectId, setProjectId] = useState<string | null>(null);
  const [workloadData, setWorkloadData] = useState<{ name: string; Tasks: number; }[]>([]);  
  const { projects, isLoading: isLoadingProjects } = useProject();
  const { useTaskCountForAllUsers, useTaskCountForEachUser } = useStatistics();
  const { getUser } = useUser();
  const apiBaseUrl = getApiBaseUrl();

  // Use the task hook to get tasks for the active project
  const {
    tasks,
    isLoading: isLoadingTasks,
    error: tasksError,
    setProjectId: setTaskProjectId,
  } = useTask(50); // Get up to 50 tasks for analytics

  // Component to display individual team member performance using userId
  const TeamMemberPerformance = ({ userId }: { userId: string }) => {
    const { 
      data: taskCounts, 
      isLoading: isLoadingTaskCounts 
    } = useTaskCountForEachUser(projectId || undefined, userId);

    const [userDetails, setUserDetails] = useState<any>(null);
    const [isLoadingUser, setIsLoadingUser] = useState(true);

    // Fetch user details
    useEffect(() => {
      const fetchUserDetails = async () => {
        try {
          setIsLoadingUser(true);
          const user = await getUser(userId);
          setUserDetails(user);
        } catch (error) {
          console.error(`Failed to fetch user ${userId}:`, error);
          setUserDetails({
            nickname: `User ${userId.slice(-4)}`,
            email: `user-${userId.slice(-4)}@example.com`,
          });
        } finally {
          setIsLoadingUser(false);
        }
      };

      fetchUserDetails();
    }, [userId, getUser]);

    if (isLoadingTaskCounts || isLoadingUser) {
      return (
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Loading...</span>
            <span className="text-sm text-gray-500">Loading...</span>
          </div>
          <div className="h-2 bg-gray-200 rounded animate-pulse" />
        </div>
      );
    }

    if (!taskCounts) {
      return (
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {userDetails?.nickname || userDetails?.email || 'Unknown User'}
            </span>
            <span className="text-sm text-gray-500">No data</span>
          </div>
          <div className="h-2 bg-gray-200 rounded" />
        </div>
      );
    }

    const totalTasks = taskCounts.todo + taskCounts.inProgress + taskCounts.inReview + taskCounts.done;
    const completionRate = totalTasks > 0 ? (taskCounts.done / totalTasks) * 100 : 0;

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">
            {userDetails?.nickname || userDetails?.email || 'Unknown User'}
          </span>
          <span className="text-sm text-gray-500">{totalTasks} tasks</span>
        </div>
        <Progress value={completionRate} className="h-2" />
        <div className="flex justify-between text-xs text-gray-500">
          <span>Todo: {taskCounts.todo}</span>
          <span>In Progress: {taskCounts.inProgress}</span>
          <span>Review: {taskCounts.inReview}</span>
          <span>Done: {taskCounts.done}</span>
        </div>
      </div>
    );
  };  

  useEffect(() => {
    if (projects && projects.length > 0 && !projectId) {
      const firstProjectId = projects[0].id || null;
      setProjectId(firstProjectId);
      if (firstProjectId) {
        setTaskProjectId(firstProjectId);
      }
    }
  }, [projects, projectId, setTaskProjectId]);

  // Get current project data
  const currentProject = projects?.find(p => p.id === projectId);

  // Fetch task count statistics for workload distribution
  const {
    data: taskCountData,
    isLoading: isLoadingTaskCount,
    error: taskCountError,
  } = useTaskCountForAllUsers(projectId || undefined);
  const calculateCompletionRate = () => {
    if (!projectId || !projects) return 0;
    const selectedProject = projects.find(p => p.id === projectId);
    if (!selectedProject) return 0;
    
    return selectedProject.progress || 0;
  };

  const generateProductivityData = () => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const completedTasks = Math.floor(Math.random() * 5) + 1; 
      
      data.push({
        date: format(date, 'MMM dd'),
        Completed: completedTasks,
      });
    }
    return data;
  };
  
  // Generate workload distribution data from real statistics
  const generateWorkloadData = async () => {
    if (!taskCountData) return [];
    
    try {
      // Get user details for each user ID in the task count data
      const workloadData = await Promise.all(
        Object.entries(taskCountData).map(async ([userId, taskCount]) => {
          try {
            const user = await getUser(userId);
            return {
              name: user?.nickname || user?.email || 'Unknown User',
              Tasks: taskCount,
            };
          } catch (error) {
            console.error(`Failed to fetch user ${userId}:`, error);
            return {
              name: `User ${userId.slice(-4)}`, // Show last 4 chars of userId as fallback
              Tasks: taskCount,
            };
          }
        })
      );
      
      // Sort by task count descending and return top 10
      return workloadData.sort((a, b) => b.Tasks - a.Tasks).slice(0, 10);
    } catch (error) {
      console.error('Failed to generate workload data:', error);
      return [];
    }  };

  // Update workload data when task count data changes
  useEffect(() => {
    const updateWorkloadData = async () => {
      if (taskCountData) {
        const data = await generateWorkloadData();
        setWorkloadData(data);
      } else {
        setWorkloadData([]);
      }
    };

    updateWorkloadData();
  }, [taskCountData]);

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
          <Navbar title="Analytics" />
          <div className="flex-1 p-6 flex items-center justify-center">
            <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-lg shadow-sm w-full max-w-md">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">No Projects Found</h2>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Create your first project to view analytics.
              </p>
              <Button className="mt-4">Create Project</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  const completionRate = calculateCompletionRate();
  const productivityData = generateProductivityData();

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar title="Analytics" subtitle={projects?.find((p: any) => p.id === projectId)?.name} />
        <div className="flex-1 p-6 overflow-auto">          {/* Project selector */}
          {projects && projects.length > 1 && (
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Project:</span>
              <Select value={projectId || ''} onValueChange={(value) => {
                setProjectId(value);
                setTaskProjectId(value);
              }}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project: any) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Overview cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Project Completion</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">{completionRate}%</span>
                    <TrendingUp className="text-green-500 h-5 w-5" />
                  </div>
                  <Progress value={completionRate} className="h-2" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Total Tasks</CardTitle>
              </CardHeader>              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">{projects?.find(p => p.id === projectId)?.taskCount || 0}</span>
                  <Activity className="text-blue-500 h-5 w-5" />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {projects?.find(p => p.id === projectId)?.doneTaskCount || 0} completed
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Team Members</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">{projects?.find(p => p.id === projectId)?.userIds.length || 0}</span>
                  <Users className="text-purple-500 h-5 w-5" />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Active on this project
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Avg. Completion Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">3.2 days</span>
                  <Clock className="text-amber-500 h-5 w-5" />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Per task average
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="details">Detailed Analysis</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <ChartComponent
                  title="Daily Productivity"
                  description="Tasks completed per day"
                  type="area"
                  data={productivityData}
                  xAxisKey="date"
                  dataKeys={["Completed"]}
                  colors={["#3b82f6"]}
                />
                  <ChartComponent
                  title="Workload Distribution"
                  description={isLoadingTaskCount ? "Loading task assignments..." : "Tasks assigned per team member"}
                  type="horizontalBar"
                  data={isLoadingTaskCount ? [] : workloadData as any}
                  xAxisKey="name"
                  dataKeys={["Tasks"]}
                  colors={["#8b5cf6"]}
                />
              </div>
                {isLoadingTasks ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>              ) : (
                <ProjectAnalytics
                  projectId={projectId!}
                  tasks={tasks || []}
                  members={currentProject?.userIds?.map(userId => ({ userId, user: { id: userId } })) || []}
                />
              )}
            </TabsContent>
              <TabsContent value="details">
              {isLoadingTasks ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Team Performance Analysis</CardTitle>
                    </CardHeader>                    <CardContent>
                      <p className="text-gray-500 mb-4">Detailed analysis of team performance across tasks and timelines.</p>
                        <div className="space-y-4">
                        {currentProject?.userIds?.slice(0, 5).map((userId: string) => (
                          <TeamMemberPerformance key={userId} userId={userId} />
                        ))}
                        
                        {!currentProject?.userIds || currentProject.userIds.length === 0 && (
                          <div className="text-center py-4 text-gray-500">
                            No team members found for this project
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ChartComponent
                      title="Task Status Trend"
                      description="Changes in task status over time"
                      type="line"
                      data={[
                        { date: "Jan", Todo: 10, "In Progress": 5, Completed: 3 },
                        { date: "Feb", Todo: 12, "In Progress": 8, Completed: 5 },
                        { date: "Mar", Todo: 8, "In Progress": 10, Completed: 8 },
                        { date: "Apr", Todo: 6, "In Progress": 12, Completed: 10 },
                        { date: "May", Todo: 4, "In Progress": 8, Completed: 15 },
                        { date: "Jun", Todo: 8, "In Progress": 6, Completed: 18 },
                      ]}
                      xAxisKey="date"
                      dataKeys={["Todo", "In Progress", "Completed"]}
                      colors={["#3b82f6", "#f59e0b", "#10b981"]}
                    />
                    
                    <ChartComponent
                      title="Task Priority Distribution"
                      description="Tasks by priority level"
                      type="pie"
                      data={[
                        { name: "Low", value: tasks?.filter((t: any) => t.priority === "low").length || 0, color: "#3b82f6" },
                        { name: "Medium", value: tasks?.filter((t: any) => t.priority === "medium").length || 0, color: "#f59e0b" },
                        { name: "High", value: tasks?.filter((t: any) => t.priority === "high").length || 0, color: "#f97316" },
                        { name: "Urgent", value: tasks?.filter((t: any) => t.priority === "urgent").length || 0, color: "#ef4444" },
                      ]}
                    />
                  </div>
                </div>
              )}
            </TabsContent>a
          </Tabs>
        </div>
      </div>
    </div>
  );
}

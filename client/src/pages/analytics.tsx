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
import { format, addDays, subDays } from "date-fns";
import { 
  Loader2, 
  TrendingUp, 
  BarChart, 
  Activity, 
  Clock, 
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Analytics() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [projectId, setProjectId] = useState<number | null>(null);

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

  // Fetch tasks for the active project
  const {
    data: tasks,
    isLoading: isLoadingTasks,
    error: tasksError,
  } = useQuery({
    queryKey: [`/api/projects/${projectId}/tasks`],
    enabled: !!projectId,
  });

  // Fetch team members for the active project
  const {
    data: members,
    isLoading: isLoadingMembers,
    error: membersError,
  } = useQuery({
    queryKey: [`/api/projects/${projectId}/members`],
    enabled: !!projectId,
  });

  // Calculate completion rate
  const calculateCompletionRate = () => {
    if (!tasks) return 0;
    const completedTasks = tasks.filter((task: any) => task.status === "done").length;
    return tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
  };

  // Generate sample productivity data for line chart
  const generateProductivityData = () => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const completedTasks = Math.floor(Math.random() * 5) + 1; // Random number between 1-5
      
      data.push({
        date: format(date, 'MMM dd'),
        Completed: completedTasks,
      });
    }
    return data;
  };

  // Generate sample workload distribution data for horizontal bar chart
  const generateWorkloadData = () => {
    if (!members) return [];
    
    return members.slice(0, 5).map((member: any) => ({
      name: `${member.user.firstName || ''} ${member.user.lastName || ''}`,
      Tasks: Math.floor(Math.random() * 10) + 1, // Random number between 1-10
    }));
  };

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
  const workloadData = generateWorkloadData();

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar title="Analytics" subtitle={projects?.find((p: any) => p.id === projectId)?.name} />
        <div className="flex-1 p-6 overflow-auto">
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
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">{tasks?.length || 0}</span>
                  <Activity className="text-blue-500 h-5 w-5" />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {tasks?.filter((t: any) => t.status === "done").length || 0} completed
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Team Members</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">{members?.length || 0}</span>
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
                  description="Tasks assigned per team member"
                  type="horizontalBar"
                  data={workloadData}
                  xAxisKey="name"
                  dataKeys={["Tasks"]}
                  colors={["#8b5cf6"]}
                />
              </div>
              
              {isLoadingTasks || isLoadingMembers ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <ProjectAnalytics
                  projectId={projectId!}
                  tasks={tasks}
                  members={members}
                />
              )}
            </TabsContent>
            
            <TabsContent value="details">
              {isLoadingTasks || isLoadingMembers ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Team Performance Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-500 mb-4">Detailed analysis of team performance across tasks and timelines.</p>
                      
                      <div className="space-y-4">
                        {members?.slice(0, 5).map((member: any, index: number) => (
                          <div key={member.userId} className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">{member.user.firstName} {member.user.lastName}</span>
                              <span className="text-sm text-gray-500">{Math.floor(Math.random() * 20) + 10} tasks</span>
                            </div>
                            <Progress value={Math.floor(Math.random() * 100)} className="h-2" />
                          </div>
                        ))}
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
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

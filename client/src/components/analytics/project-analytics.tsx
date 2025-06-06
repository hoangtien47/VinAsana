import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, 
  LineChart, 
  AreaChart,
  PieChart,
  Legend,
  Bar,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Pie,
  type ValueType
} from "@/components/ui/recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { addDays, format, startOfMonth, endOfMonth, eachWeekOfInterval, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate?: string;
  assigneeId?: string;
  createdAt: string;
  updatedAt?: string;
}

interface User {
  id: string;
  firstName?: string;
  lastName?: string;
}

interface ProjectStats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  todoTasks: number;
  overdueTasks: number;
  tasksByPriority: Record<string, number>;
  tasksByAssignee: Record<string, number>;
  taskCompletionByDate: Array<{ date: string; count: number }>;
  taskCreationByDate: Array<{ date: string; count: number }>;
}

interface ProjectAnalyticsProps {
  projectId: number;
  tasks?: Task[];
  members?: { userId: string; user: User }[];
}

export function ProjectAnalytics({ projectId, tasks = [], members = [] }: ProjectAnalyticsProps) {
  const { toast } = useToast();
  const [selectedTimeframe, setSelectedTimeframe] = useState("30days");
  const [stats, setStats] = useState<ProjectStats>({
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    todoTasks: 0,
    overdueTasks: 0,
    tasksByPriority: {},
    tasksByAssignee: {},
    taskCompletionByDate: [],
    taskCreationByDate: [],
  });

  useEffect(() => {
    // Calculate analytics based on tasks data
    calculateStats();
  }, [tasks, selectedTimeframe]);

  const calculateStats = () => {
    if (!tasks.length) return;

    let filteredTasks = [...tasks];
    const now = new Date();
    
    // Filter tasks based on timeframe
    if (selectedTimeframe === "7days") {
      const cutoffDate = addDays(now, -7);
      filteredTasks = filteredTasks.filter(task => new Date(task.createdAt) >= cutoffDate);
    } else if (selectedTimeframe === "30days") {
      const cutoffDate = addDays(now, -30);
      filteredTasks = filteredTasks.filter(task => new Date(task.createdAt) >= cutoffDate);
    } else if (selectedTimeframe === "90days") {
      const cutoffDate = addDays(now, -90);
      filteredTasks = filteredTasks.filter(task => new Date(task.createdAt) >= cutoffDate);
    }
    
    // Calculate basic stats
    const completedTasks = filteredTasks.filter(task => task.status === "done").length;
    const inProgressTasks = filteredTasks.filter(task => task.status === "in_progress").length;
    const todoTasks = filteredTasks.filter(task => task.status === "todo" || task.status === "backlog").length;
    const overdueTasks = filteredTasks.filter(task => 
      task.dueDate && new Date(task.dueDate) < now && task.status !== "done"
    ).length;
    
    // Tasks by priority
    const tasksByPriority = filteredTasks.reduce<Record<string, number>>((acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1;
      return acc;
    }, {});
    
    // Tasks by assignee
    const tasksByAssignee = filteredTasks.reduce<Record<string, number>>((acc, task) => {
      const assigneeId = task.assigneeId || "unassigned";
      acc[assigneeId] = (acc[assigneeId] || 0) + 1;
      return acc;
    }, {});
    
    // Task completion by date
    let timeFrame: Date[];
    let format_string = "MMM d";
    
    if (selectedTimeframe === "7days") {
      timeFrame = eachDayOfInterval({
        start: addDays(now, -7),
        end: now
      });
    } else if (selectedTimeframe === "30days") {
      timeFrame = eachWeekOfInterval({
        start: addDays(now, -30),
        end: now
      }, { weekStartsOn: 1 });
      format_string = "'Week of' MMM d";
    } else {
      // 90 days
      timeFrame = eachWeekOfInterval({
        start: addDays(now, -90),
        end: now
      }, { weekStartsOn: 1 });
      format_string = "'Week of' MMM d";
    }
    
    const taskCompletionByDate = timeFrame.map(date => {
      let start, end;
      
      if (selectedTimeframe === "7days") {
        start = new Date(date);
        start.setHours(0, 0, 0, 0);
        end = new Date(date);
        end.setHours(23, 59, 59, 999);
      } else {
        start = startOfWeek(date, { weekStartsOn: 1 });
        end = endOfWeek(date, { weekStartsOn: 1 });
      }
      
      const count = filteredTasks.filter(task => 
        task.status === "done" && 
        new Date(task.updatedAt ?? task.createdAt) >= start &&
        new Date(task.updatedAt ?? task.createdAt) <= end
      ).length;
      
      return {
        date: format(date, format_string),
        count
      };
    });
    
    const taskCreationByDate = timeFrame.map(date => {
      let start, end;
      
      if (selectedTimeframe === "7days") {
        start = new Date(date);
        start.setHours(0, 0, 0, 0);
        end = new Date(date);
        end.setHours(23, 59, 59, 999);
      } else {
        start = startOfWeek(date, { weekStartsOn: 1 });
        end = endOfWeek(date, { weekStartsOn: 1 });
      }
      
      const count = filteredTasks.filter(task => 
        new Date(task.createdAt) >= start &&
        new Date(task.createdAt) <= end
      ).length;
      
      return {
        date: format(date, format_string),
        count
      };
    });
    
    setStats({
      totalTasks: filteredTasks.length,
      completedTasks,
      inProgressTasks,
      todoTasks,
      overdueTasks,
      tasksByPriority,
      tasksByAssignee,
      taskCompletionByDate,
      taskCreationByDate,
    });
  };

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  const STATUS_COLORS = {
    completed: '#10B981', // green
    inProgress: '#F59E0B', // amber
    todo: '#3B82F6', // blue
    overdue: '#EF4444', // red
  };
  
  const PRIORITY_COLORS = {
    low: '#3B82F6', // blue
    medium: '#F59E0B', // amber
    high: '#F97316', // orange
    urgent: '#EF4444', // red
  };

  // Prepare data for pie charts
  const taskStatusData = [
    { name: 'Completed', value: stats.completedTasks, color: STATUS_COLORS.completed },
    { name: 'In Progress', value: stats.inProgressTasks, color: STATUS_COLORS.inProgress },
    { name: 'To Do', value: stats.todoTasks, color: STATUS_COLORS.todo },
    { name: 'Overdue', value: stats.overdueTasks, color: STATUS_COLORS.overdue },
  ].filter(item => item.value > 0);

  const taskPriorityData = Object.entries(stats.tasksByPriority).map(([key, value], index) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value,
    color: PRIORITY_COLORS[key as keyof typeof PRIORITY_COLORS] || COLORS[index % COLORS.length],
  }));

  const taskAssigneeData = Object.entries(stats.tasksByAssignee).map(([key, value], index) => {
    let name = 'Unassigned';
    if (key !== 'unassigned') {
      const member = members.find(m => m.userId === key);
      name = member ? `${member.user.firstName || ''} ${member.user.lastName || ''}` : 'Unknown User';
    }
    return {
      name,
      value,
      color: COLORS[index % COLORS.length],
    };
  });

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-2 border rounded shadow-md">
          <p className="text-sm font-medium">{label}</p>
          <p className="text-sm">{`${payload[0].name}: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
          <CardTitle className="text-lg">Project Analytics</CardTitle>
          <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            {/* Task Distribution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Task Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={taskStatusData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          innerRadius={50}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          labelLine={false}
                        >
                          {taskStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Task Creation & Completion</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={stats.taskCreationByDate.map((item, index) => ({
                          date: item.date,
                          'Created': item.count,
                          'Completed': stats.taskCompletionByDate[index]?.count || 0
                        }))}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Area type="monotone" dataKey="Created" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.2} />
                        <Area type="monotone" dataKey="Completed" stroke="#10B981" fill="#10B981" fillOpacity={0.2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="tasks" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Tasks by Priority</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={taskPriorityData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" name="Tasks">
                          {taskPriorityData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Weekly Task Velocity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={stats.taskCompletionByDate}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="count" name="Completed Tasks" stroke="#8884d8" activeDot={{ r: 8 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="team" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Tasks by Assignee</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        layout="vertical"
                        data={taskAssigneeData}
                        margin={{ top: 20, right: 30, left: 80, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis 
                          type="category" 
                          dataKey="name" 
                          tick={{ fontSize: 12 }}
                          width={80}
                        />
                        <Tooltip />
                        <Bar dataKey="value" name="Tasks">
                          {taskAssigneeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Team Contribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={taskAssigneeData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          labelLine={true}
                        >
                          {taskAssigneeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

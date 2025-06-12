import { useState, useEffect } from "react";
import { Sidebar } from "@/components/ui/sidebar";
import { Navbar } from "@/components/ui/navbar";
import { KanbanBoard } from "@/components/tasks/kanban-board";
import { TaskForm } from "@/components/tasks/task-form";
import { TaskDetail } from "@/components/tasks/task-detail";
import { GanttChart } from "@/components/tasks/gantt-chart";
import { TaskFilter, FilterOptions } from "@/components/tasks/task-filter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useUser } from "@/hooks/use-user";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useTask } from "@/hooks/use-task";
import { toApiTimestamp, getCurrentApiTimestamp, addSecondsToCurrentTime } from "@/lib/utils";
import { useProject } from "@/hooks/use-project";

export default function Tasks() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { users } = useUser();
  
  // Use the hooks instead of direct queries
  const { 
    projects, 
    isLoading: isLoadingProjects 
  } = useProject();
  
  const {
    tasks,
    isLoading: isLoadingTasks,
    createTask,
    updateTask,
    deleteTask,
    fetchTasks,
    projectId,
    setProjectId
  } = useTask();

  const [activeTab, setActiveTab] = useState("kanban");
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({});

  // Set the first project as active when projects load
  useEffect(() => {
    if (projects && projects.length > 0 && !projectId) {
      const firstProjectId = projects[0].id;
      if (firstProjectId) {        setProjectId(firstProjectId);
        fetchTasks(firstProjectId);
      }
    }
  }, [projects, projectId, setProjectId, fetchTasks]);

  // Handle project change
  const handleProjectChange = (newProjectId: string) => {
    setProjectId(newProjectId);
    fetchTasks(newProjectId);
  };

  const handleAddTask = (status: string) => {
    setSelectedTask(null);
    setIsEditMode(false);
    setIsTaskFormOpen(true);
  };

  const handleTaskClick = (task: any) => {
    setSelectedTask(task);
    setIsTaskDetailOpen(true);
  };

  const handleEditTask = (task: any) => {
    console.log("Editing task:", task); // Debug log
    setSelectedTask(task);
    setIsEditMode(true);
    setIsTaskDetailOpen(false);
    setIsTaskFormOpen(true);
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      toast({
        title: "Task deleted",
        description: "The task has been deleted successfully."
      });
    } catch (error) {
      console.error("Failed to delete task:", error);
      toast({
        title: "Error",
        description: "Failed to delete task. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleTaskFormSubmit = async (values: any) => {
    if (!projectId) {
      toast({
        title: "Error",
        description: "Please select a project first.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Map form priority to API priority (including "urgent" -> "CRITICAL")
      const priorityMap: Record<string, string> = {
        "low": "LOW",
        "medium": "MEDIUM",
        "high": "HIGH",
        "urgent": "CRITICAL"
      };

      // Map form status to API status
      const statusMap: Record<string, string> = {
        "todo": "TODO",
        "in_progress": "IN_PROGRESS",
        "in_review": "IN_REVIEW",
        "done": "DONE"
      };      // Transform form values to API format with proper typing
      const apiTaskData = {
        name: values.title, // Map title to name for API
        description: values.description || "",
        status: (statusMap[values.status] || "TODO") as "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE",        priority: (priorityMap[values.priority] || "MEDIUM") as "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
        startDate: getCurrentApiTimestamp(),
        endDate: values.dueDate ? toApiTimestamp(values.dueDate) || addSecondsToCurrentTime(7 * 24 * 60 * 60) : addSecondsToCurrentTime(7 * 24 * 60 * 60),
        assigneeId: values.assigneeId || "",
        projectId: projectId.toString() // Ensure it's a string
      };

      console.log("Submitting task data:", apiTaskData); // Debug log

      if (isEditMode && selectedTask) {
        // Convert number ID to string for API
        const taskIdString = typeof selectedTask.id === 'number' ? selectedTask.id.toString() : selectedTask.id;
        console.log("Updating task with ID:", taskIdString, "Data:", apiTaskData); // Debug log
        await updateTask({ taskId: taskIdString, taskData: apiTaskData });
        toast({
          title: "Task updated",
          description: "The task has been updated successfully."
        });
      } else {
        await createTask(apiTaskData);
        toast({
          title: "Task created",
          description: "The task has been created successfully."
        });
      }
      
      setIsTaskFormOpen(false);
      setSelectedTask(null);
      setIsEditMode(false);
    } catch (error) {
      console.error("Failed to submit task:", error);
      toast({
        title: "Error",
        description: `Failed to ${isEditMode ? "update" : "create"} task. Please try again.`,
        variant: "destructive"
      });
    }
  };

  // Filter tasks based on filters
  const filteredTasks = tasks?.filter((task) => {
    // Handle status filtering (filters.status is an array)
    if (filters.status && filters.status.length > 0 && !filters.status.includes(task.status)) return false;
    
    // Handle priority filtering (filters.priority is an array)
    if (filters.priority && filters.priority.length > 0 && !filters.priority.includes(task.priority)) return false;
    
    // Handle assignee filtering (filters.assigneeId is a string)
    if (filters.assigneeId && task.assigneeId !== filters.assigneeId) return false;
    
    // Handle search filtering
    if (filters.search && !task.title.toLowerCase().includes(filters.search.toLowerCase())) return false;
    
    return true;
  }) || [];

  // Transform users for the filter component
  const filterUsers = users.map((user: any) => ({
    id: user.id,
    nickname: user.nickname || '',
    avatar: user.avatar
  }));
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
          <Navbar title="Tasks" />
          <div className="flex-1 p-6 flex items-center justify-center">
            <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-lg shadow-sm w-full max-w-md">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">No Projects Found</h2>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Create your first project to start managing tasks.
              </p>
              <Button className="mt-4">Create Project</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar 
          title="Tasks" 
          subtitle={projects?.find((p: any) => p.id === projectId)?.name} 
        />
        <div className="flex-1 p-6 flex flex-col space-y-4 overflow-y-auto">
          {/* Project selector */}
          {projects && projects.length > 1 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Project:</span>
              <Select
                value={projectId?.toString() || undefined}
                onValueChange={(value) => handleProjectChange(value)}
              >
                <SelectTrigger className="w-[250px]">
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project: any) => (
                    <SelectItem key={project.id} value={project.id.toString()}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Task filter */}
          <TaskFilter
            onFilterChange={setFilters}
            users={filterUsers}
            className="mb-4"
          />

          {/* Tabs for different views */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
            <TabsList className="mx-auto">
              <TabsTrigger value="kanban">Kanban Board</TabsTrigger>
              <TabsTrigger value="gantt">Gantt Chart</TabsTrigger>
            </TabsList>
            
            <TabsContent value="kanban" className="flex-1 mt-4 min-h-0">
              {isLoadingTasks ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <KanbanBoard
                  projectId={(projectId || "0")}
                  tasks={filteredTasks}
                  onTaskClick={handleTaskClick}
                  onAddClick={handleAddTask}
                  onTasksUpdated={() => projectId && fetchTasks(projectId)}
                  updateTask={updateTask}
                />
              )}
            </TabsContent>
            
            <TabsContent value="gantt" className="flex-1 mt-4 min-h-0">
              {isLoadingTasks ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <GanttChart
                  tasks={filteredTasks}
                  onTaskClick={handleTaskClick}
                />
              )}
            </TabsContent>
          </Tabs>

          {/* Task form dialog */}
          <TaskForm
            open={isTaskFormOpen}
            onClose={() => {
              setIsTaskFormOpen(false);
              setSelectedTask(null);
              setIsEditMode(false);
            }}
            onSubmit={handleTaskFormSubmit}
            projectId={parseInt(projectId || "0")}
            defaultValues={isEditMode ? selectedTask : undefined}
            isEditMode={isEditMode}
          />

          {/* Task detail sheet */}
          <TaskDetail
            open={isTaskDetailOpen}
            onClose={() => {
              setIsTaskDetailOpen(false);
              setSelectedTask(null);
            }}
            task={selectedTask}
            onEdit={handleEditTask}
            onDelete={handleDeleteTask}
            projectId={parseInt(projectId || "0")}
          />        </div>
      </div>
    </div>
  );
}
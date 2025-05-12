import { useState, useEffect } from "react";
import { Sidebar } from "@/components/ui/sidebar";
import { Navbar } from "@/components/ui/navbar";
import { KanbanBoard } from "@/components/tasks/kanban-board";
import { TaskForm } from "@/components/tasks/task-form";
import { TaskDetail } from "@/components/tasks/task-detail";
import { GanttChart } from "@/components/tasks/gantt-chart";
import { TaskFilter, FilterOptions } from "@/components/tasks/task-filter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useParams } from "wouter";
import { Loader2 } from "lucide-react";
import { useTask } from "@/hooks/use-task";

export default function Tasks() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { createTask, updateTask } = useTask();
  const [activeTab, setActiveTab] = useState("kanban");
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({});
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
    refetch: refetchTasks,
  } = useQuery({
    queryKey: [`/api/projects/${projectId}/tasks`, filters],
    enabled: !!projectId,
  });

  // Fetch project members for task assignment
  const {
    data: members,
    isLoading: isLoadingMembers,
  } = useQuery({
    queryKey: [`/api/projects/${projectId}/members`],
    enabled: !!projectId,
  });

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
    setSelectedTask(task);
    setIsEditMode(true);
    setIsTaskDetailOpen(false);
    setIsTaskFormOpen(true);
  };

  const handleDeleteTask = (taskId: number) => {
    refetchTasks();
  };

  const handleTaskFormSubmit = async (values: any) => {
    try {
      if (isEditMode && selectedTask) {
        await updateTask(selectedTask.id, values);
        toast({
          title: "Task updated",
          description: "The task has been updated successfully."
        });
      } else {
        await createTask(values);
        toast({
          title: "Task created",
          description: "The task has been created successfully."
        });
      }
      
      refetchTasks();
    } catch (error) {
      console.error("Failed to submit task:", error);
      toast({
        title: "Error",
        description: `Failed to ${isEditMode ? "update" : "create"} task. Please try again.`,
        variant: "destructive"
      });
    }
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
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar title="Tasks" subtitle={projects?.find((p: any) => p.id === projectId)?.name} />
        <div className="flex-1 p-6 flex flex-col space-y-4 overflow-hidden">
          {/* Project selector */}
          {projects && projects.length > 1 && (
            <div className="flex items-center space-x-2">
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

          {/* Task filter */}
          <TaskFilter
            onFilterChange={setFilters}
            users={members?.map((m: any) => m.user) || []}
            className="mb-4"
          />

          {/* Tabs for different views */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="mx-auto">
              <TabsTrigger value="kanban">Kanban Board</TabsTrigger>
              <TabsTrigger value="gantt">Gantt Chart</TabsTrigger>
            </TabsList>
            
            <TabsContent value="kanban" className="flex-1 overflow-hidden mt-4">
              {isLoadingTasks ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <KanbanBoard
                  projectId={projectId!}
                  tasks={tasks || []}
                  onTaskClick={handleTaskClick}
                  onAddClick={handleAddTask}
                  onTasksUpdated={refetchTasks}
                />
              )}
            </TabsContent>
            
            <TabsContent value="gantt" className="flex-1 overflow-hidden mt-4">
              {isLoadingTasks ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <GanttChart
                  tasks={tasks || []}
                  onTaskClick={handleTaskClick}
                />
              )}
            </TabsContent>
          </Tabs>

          {/* Task form dialog */}
          <TaskForm
            open={isTaskFormOpen}
            onClose={() => setIsTaskFormOpen(false)}
            onSubmit={handleTaskFormSubmit}
            projectId={projectId!}
            defaultValues={isEditMode ? selectedTask : undefined}
            isEditMode={isEditMode}
          />

          {/* Task detail sheet */}
          <TaskDetail
            open={isTaskDetailOpen}
            onClose={() => setIsTaskDetailOpen(false)}
            task={selectedTask}
            onEdit={handleEditTask}
            onDelete={handleDeleteTask}
            projectId={projectId!}
          />
        </div>
      </div>
    </div>
  );
}

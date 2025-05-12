import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDate, getInitials, getPriorityColor } from "@/lib/utils";
import { Plus, AlertCircle, Clock } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

interface Task {
  id: number;
  title: string;
  description?: string;
  status: string;
  priority: string;
  dueDate?: string;
  assigneeId?: string;
  assignee?: {
    id: string;
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
  };
  order: number;
}

interface KanbanColumn {
  id: string;
  title: string;
  tasks: Task[];
}

interface KanbanBoardProps {
  projectId: number;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onAddClick: (status: string) => void;
  onTasksUpdated: () => void;
}

export function KanbanBoard({ 
  projectId,
  tasks,
  onTaskClick,
  onAddClick,
  onTasksUpdated
}: KanbanBoardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [columns, setColumns] = useState<KanbanColumn[]>([]);

  // Define columns
  const columnDefinitions = [
    { id: "backlog", title: "Backlog" },
    { id: "todo", title: "To Do" },
    { id: "in_progress", title: "In Progress" },
    { id: "review", title: "Review" },
    { id: "done", title: "Done" },
  ];

  // Initialize columns with tasks
  useEffect(() => {
    if (tasks) {
      const newColumns = columnDefinitions.map((col) => ({
        ...col,
        tasks: tasks
          .filter((task) => task.status === col.id)
          .sort((a, b) => a.order - b.order),
      }));
      setColumns(newColumns);
    }
  }, [tasks]);

  // Handle drag and drop
  const handleDragEnd = async (result: any) => {
    const { destination, source, draggableId } = result;

    // If dropped outside a valid area
    if (!destination) return;

    // If dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Find the task being dragged
    const taskId = parseInt(draggableId.replace("task-", ""));
    const draggedTask = tasks.find(task => task.id === taskId);
    
    if (!draggedTask) return;

    // Create a copy of our columns
    const newColumns = [...columns];

    // Remove from source column
    const sourceColumn = newColumns.find(col => col.id === source.droppableId);
    if (!sourceColumn) return;
    
    // Add to destination column
    const destColumn = newColumns.find(col => col.id === destination.droppableId);
    if (!destColumn) return;

    // If moving within the same column
    if (source.droppableId === destination.droppableId) {
      const newTasks = Array.from(sourceColumn.tasks);
      const [removed] = newTasks.splice(source.index, 1);
      newTasks.splice(destination.index, 0, removed);
      
      // Update the order values
      const updatedTasks = newTasks.map((task, index) => ({
        ...task,
        order: index
      }));
      
      sourceColumn.tasks = updatedTasks;
    } else {
      // Moving between columns
      const sourceTasks = Array.from(sourceColumn.tasks);
      const [removed] = sourceTasks.splice(source.index, 1);
      sourceColumn.tasks = sourceTasks;
      
      const destTasks = Array.from(destColumn.tasks);
      destTasks.splice(destination.index, 0, {
        ...removed,
        status: destination.droppableId
      });
      
      // Update order values for destination column
      destColumn.tasks = destTasks.map((task, index) => ({
        ...task,
        order: index
      }));
    }
    
    setColumns(newColumns);
    
    // Update the task in the backend
    try {
      await apiRequest('PATCH', `/api/tasks/${taskId}`, {
        status: destination.droppableId,
        order: destination.index
      });
      
      // Call the callback to refresh tasks
      onTasksUpdated();
    } catch (error) {
      console.error('Failed to update task:', error);
      toast({
        title: 'Failed to update task',
        description: 'The task could not be updated. Please try again.',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="h-full">
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 h-full">
          {columns.map((column) => (
            <div key={column.id} className="flex flex-col h-full">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium flex items-center">
                  {column.title}{" "}
                  <Badge variant="secondary" className="ml-2">
                    {column.tasks.length}
                  </Badge>
                </h3>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-8 w-8" 
                  onClick={() => onAddClick(column.id)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <Droppable droppableId={column.id} type="TASK">
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 p-2 rounded-lg overflow-y-auto min-h-[200px] ${
                      snapshot.isDraggingOver ? "bg-gray-100 dark:bg-gray-800" : "bg-gray-50 dark:bg-gray-900"
                    }`}
                  >
                    {column.tasks.map((task, index) => (
                      <Draggable
                        key={`task-${task.id}`}
                        draggableId={`task-${task.id}`}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            onClick={() => onTaskClick(task)}
                            className={`p-3 mb-2 bg-white dark:bg-gray-800 rounded-md border shadow-sm cursor-pointer ${
                              snapshot.isDragging ? "shadow-md" : ""
                            }`}
                          >
                            <div className="space-y-2">
                              <h4 className="text-sm font-medium line-clamp-2">
                                {task.title}
                              </h4>
                              {task.description && (
                                <p className="text-xs text-gray-500 line-clamp-2">
                                  {task.description}
                                </p>
                              )}
                              <div className="flex items-center justify-between">
                                <Badge variant="outline" className={`text-[10px] ${getPriorityColor(task.priority)} text-white bg-opacity-90`}>
                                  {task.priority}
                                </Badge>
                                
                                {task.dueDate && (
                                  <div className="flex items-center text-xs text-gray-500">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {formatDate(task.dueDate)}
                                  </div>
                                )}
                              </div>
                              
                              {task.assignee ? (
                                <div className="flex justify-end">
                                  <Avatar className="h-6 w-6">
                                    <AvatarImage 
                                      src={task.assignee.profileImageUrl} 
                                      alt={`${task.assignee.firstName} ${task.assignee.lastName}`} 
                                    />
                                    <AvatarFallback>
                                      {getInitials(`${task.assignee.firstName} ${task.assignee.lastName}`)}
                                    </AvatarFallback>
                                  </Avatar>
                                </div>
                              ) : null}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    {column.tasks.length === 0 && (
                      <div className="flex flex-col items-center justify-center h-20 text-gray-400">
                        <AlertCircle className="h-4 w-4 mb-1" />
                        <span className="text-xs">No tasks</span>
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}

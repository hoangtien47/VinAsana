import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDate, getInitials, getPriorityColor, getCurrentApiTimestamp } from "@/lib/utils";
import { Plus, AlertCircle, Clock } from "lucide-react";
import { Task, useTask } from "@/hooks/use-task";
import { useUser } from "@/hooks/use-user";


interface KanbanColumn {
  id: string;
  title: string;
  tasks: Task[];
}

interface KanbanBoardProps {
  projectId: string;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onAddClick: (status: string) => void;
  onTasksUpdated: () => void;
  updateTask?: (data: { taskId: string; taskData: any }) => void;
}

export function KanbanBoard({ 
  projectId,
  tasks,
  onTaskClick,
  onAddClick,
  onTasksUpdated,
  updateTask
}: KanbanBoardProps) {
  const [columns, setColumns] = useState<KanbanColumn[]>([]);
  const { getUser } = useUser();
  const [taskUsers, setTaskUsers] = useState<Record<string, any>>({});
  const [fetchingUsers, setFetchingUsers] = useState<Set<string>>(new Set());
  
  // Function to fetch user data for a task assignee
  const fetchTaskUser = async (userId: string) => {
    if (taskUsers[userId] || fetchingUsers.has(userId)) {
      return; // Already have data or currently fetching
    }

    setFetchingUsers(prev => new Set(prev).add(userId));

    try {
      const userData = await getUser(userId);
      if (userData) {
        setTaskUsers(prev => ({
          ...prev,
          [userId]: userData
        }));
      }
    } catch (error) {
      console.error(`Failed to fetch user data for ${userId}:`, error);
      // Set a fallback user data
      setTaskUsers(prev => ({
        ...prev,
        [userId]: {
          id: userId,
          nickname: `User ${userId.slice(-4)}`,
          email: '',
          avatar: null
        }
      }));
    } finally {
      setFetchingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };
  
  // Effect to fetch user data for task assignees
  useEffect(() => {
    const userIdsToFetch = new Set<string>();
    
    // Add assignee IDs from tasks that don't have assignee objects
    if (tasks) {
      tasks.forEach(task => {
        if (task.assigneeId && !task.assignee) {
          userIdsToFetch.add(task.assigneeId);
        }
      });
    }
    
    // Fetch user data for all unique user IDs
    userIdsToFetch.forEach(userId => {
      fetchTaskUser(userId);
    });
  }, [tasks]);

  // Define columns
  const columnDefinitions = [
    { id: "todo", title: "To Do" },
    { id: "in_progress", title: "In Progress" },
    { id: "in_review", title: "In Review" },
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
    }    // Find the task being dragged
    const taskId = draggableId.replace("task-", "");
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
      // Update the task in the backend using the proper updateTask function
    if (updateTask) {
      try {        // Map the frontend status to backend status format
        const statusMap: Record<string, string> = {
          "todo": "TODO",
          "in_progress": "IN_PROGRESS", 
          "in_review": "IN_REVIEW",
          "done": "DONE"
        };

        // Map priority to API format 
        const priorityMap: Record<string, string> = {
          "low": "LOW",
          "medium": "MEDIUM",
          "high": "HIGH",
          "urgent": "CRITICAL"
        };        
        
        // Create complete task data for API that matches working edit form structure
        const updatedTaskData = {
                    name: draggedTask.title,
          description: draggedTask.description || "",
          status: (statusMap[destination.droppableId] || "TODO") as "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE",
          priority: (priorityMap[draggedTask.priority] || "MEDIUM") as "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
          startDate: draggedTask.createdAt ? Math.floor(new Date(draggedTask.createdAt).getTime() / 1000) : getCurrentApiTimestamp(),
          endDate: draggedTask.dueDate ? Math.floor(new Date(draggedTask.dueDate).getTime() / 1000) : getCurrentApiTimestamp() + 7 * 24 * 60 * 60,
          assigneeId: draggedTask.assigneeId || "",
          projectId: projectId.toString()
        };
        console.log('Updating task with data:', updatedTaskData);
        console.log('Task ID:', taskId);
        updateTask({
          taskId: taskId,
          taskData: updatedTaskData
        });
      } catch (error) {
        console.error('Failed to update task:', error);
        // Revert the optimistic update on error
        setColumns(columns);
      }
    } else {
      // Fallback: just call onTasksUpdated to refresh
      onTasksUpdated();
    }
  };

  return (
    <div className="h-full">
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-2 h-full">
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
                        {(provided, snapshot) => {
                          return (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              onClick={() => onTaskClick(task)}
                              className={`kanban-card p-3 mb-2 bg-white dark:bg-gray-800 rounded-md border shadow-sm cursor-pointer ${
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
                                ) : task.assigneeId ? (
                                  (() => {
                                    const assignedUser = taskUsers[task.assigneeId];
                                    return assignedUser ? (
                                      <div className="flex justify-end">
                                        <Avatar className="h-6 w-6">
                                          <AvatarImage src={assignedUser.avatar} />
                                          <AvatarFallback>
                                            {getInitials(assignedUser.nickname || assignedUser.email || 'User')}
                                          </AvatarFallback>
                                        </Avatar>
                                      </div>
                                    ) : null;
                                  })()
                                ) : null}
                              </div>
                            </div>
                          );
                        }}
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

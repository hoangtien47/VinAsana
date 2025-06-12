import { useEffect, useState, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { format, addDays, startOfMonth, endOfMonth, addMonths, subMonths, eachDayOfInterval, isToday, isBefore, isWeekend } from "date-fns";

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate?: string;
  createdAt: string;
}

interface GanttChartProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

// Vibrant color palette for task bars (matching calendar style)
const TASK_COLORS = [
  { bg: "bg-pink-500", border: "border-pink-600", text: "text-white" },
  { bg: "bg-emerald-500", border: "border-emerald-600", text: "text-white" },
  { bg: "bg-orange-500", border: "border-orange-600", text: "text-white" },
  { bg: "bg-purple-500", border: "border-purple-600", text: "text-white" },
  { bg: "bg-blue-500", border: "border-blue-600", text: "text-white" },
  { bg: "bg-rose-500", border: "border-rose-600", text: "text-white" },
  { bg: "bg-teal-500", border: "border-teal-600", text: "text-white" },
  { bg: "bg-indigo-500", border: "border-indigo-600", text: "text-white" },
  { bg: "bg-cyan-500", border: "border-cyan-600", text: "text-white" },
  { bg: "bg-amber-500", border: "border-amber-600", text: "text-white" },
  { bg: "bg-lime-500", border: "border-lime-600", text: "text-white" },
  { bg: "bg-fuchsia-500", border: "border-fuchsia-600", text: "text-white" }
];

// Simple hash function to consistently assign colors to tasks
const getTaskColor = (taskId: string) => {
  let hash = 0;
  for (let i = 0; i < taskId.length; i++) {
    const char = taskId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return TASK_COLORS[Math.abs(hash) % TASK_COLORS.length];
};

// Format status for display
const formatStatus = (status: string) => {
  const statusMap: Record<string, string> = {
    'todo': 'TO DO',
    'in_progress': 'IN PROGRESS', 
    'review': 'REVIEW',
    'done': 'DONE',
    'backlog': 'BACKLOG'
  };
  return statusMap[status] || status.replace('_', ' ').toUpperCase();
};

// Format priority for display
const formatPriority = (priority: string) => {
  const priorityMap: Record<string, string> = {
    'low': 'LOW',
    'medium': 'MED',
    'high': 'HIGH', 
    'urgent': 'URG'
  };
  return priorityMap[priority] || priority.toUpperCase();
};

export function GanttChart({ tasks, onTaskClick }: GanttChartProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dates, setDates] = useState<Date[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Get tasks for a specific date
  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return taskDate.getDate() === date.getDate() && 
             taskDate.getMonth() === date.getMonth() &&
             taskDate.getFullYear() === date.getFullYear();
    });
  };
  // Generate array of dates for the entire month
  useEffect(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const newDates = eachDayOfInterval({ start: monthStart, end: monthEnd });
    setDates(newDates);
    
    // Auto-scroll to today when viewing current month
    if (currentDate.getMonth() === new Date().getMonth() && 
        currentDate.getFullYear() === new Date().getFullYear()) {
      setTimeout(() => {
        const todayIndex = newDates.findIndex(date => isToday(date));
        if (scrollRef.current && todayIndex >= 0) {
          const dayWidth = 150;
          const containerWidth = scrollRef.current.clientWidth;
          const scrollPosition = Math.max(0, (todayIndex * dayWidth) - (containerWidth / 2));
          scrollRef.current.scrollLeft = scrollPosition;
        }
      }, 100);
    }
  }, [currentDate]);
  const handleScrollToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    
    setTimeout(() => {
      const todayIndex = dates.findIndex(date => isToday(date));
      const dayWidth = 150; // Fixed width per day
      if (scrollRef.current && todayIndex >= 0) {
        // Center today in the view
        const containerWidth = scrollRef.current.clientWidth;
        const scrollPosition = Math.max(0, (todayIndex * dayWidth) - (containerWidth / 2));
        scrollRef.current.scrollLeft = scrollPosition;
      }
    }, 100);
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => addMonths(prev, 1));
  };

  const handlePrevMonth = () => {
    setCurrentDate(prev => subMonths(prev, 1));
  };

  // Calculate task position and width based on created and due dates
  const getTaskStyle = (task: Task) => {
    const start = new Date(task.createdAt);
    const end = task.dueDate ? new Date(task.dueDate) : addDays(start, 1);
    
    const startIndex = dates.findIndex(date => 
      date.getDate() === start.getDate() && 
      date.getMonth() === start.getMonth() &&
      date.getFullYear() === start.getFullYear()
    );
    
    const endIndex = dates.findIndex(date => 
      date.getDate() === end.getDate() && 
      date.getMonth() === end.getMonth() &&
      date.getFullYear() === end.getFullYear()
    );
    
    const visibleStartIndex = startIndex >= 0 ? startIndex : isBefore(start, dates[0]) ? 0 : dates.length - 1;
    const visibleEndIndex = endIndex >= 0 ? endIndex : isBefore(end, dates[0]) ? 0 : dates.length - 1;
    
    const taskWidth = Math.max(1, (visibleEndIndex - visibleStartIndex) + 1);
    const taskColor = getTaskColor(task.id);
    
    return {
      startIndex: visibleStartIndex,
      width: taskWidth,
      taskColor,
      isCompleted: task.status === "done",
    };
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <span>{format(currentDate, 'MMMM yyyy')}</span>
            <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
              ({dates.length} days)
            </span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handlePrevMonth}>
              <ChevronLeft className="h-4 w-4" />
              <span className="ml-1 hidden sm:inline">Prev</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleScrollToToday}
              className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
            >
              Today
            </Button>
            <Button variant="outline" size="sm" onClick={handleNextMonth}>
              <span className="mr-1 hidden sm:inline">Next</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div ref={scrollRef} className="overflow-x-auto">          {/* Calendar Header - All days of the month */}
          <div className="flex border-b bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700" style={{ minWidth: `${dates.length * 150}px` }}>
            {dates.map((date, i) => {
              const dayTasks = getTasksForDate(date);
              const taskCount = dayTasks.length;
              
              return (
                <div 
                  key={`header-${i}`} 
                  className={`flex-shrink-0 py-4 px-3 text-center border-r border-gray-200 dark:border-gray-600 transition-colors relative ${
                    isToday(date) ? 'bg-blue-500 text-white font-bold shadow-md' : 
                    isWeekend(date) ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400' : 
                    'hover:bg-white dark:hover:bg-gray-600 cursor-pointer'
                  }`}
                  style={{ width: '150px' }}
                >
                  <div className="text-xs font-medium uppercase tracking-wider mb-1">
                    {format(date, 'EEE')}
                  </div>
                  <div className={`text-2xl font-bold ${
                    isToday(date) ? 'text-white' : 'text-gray-800 dark:text-gray-200'
                  }`}>
                    {format(date, 'd')}
                  </div>
                  {isToday(date) && (
                    <div className="text-xs font-medium text-blue-100 mt-1">
                      TODAY
                    </div>
                  )}
                  
                  {/* Task count indicator */}
                  {taskCount > 0 && (
                    <div className={`
                      absolute top-2 right-2 w-6 h-6 rounded-full text-xs font-bold
                      flex items-center justify-center
                      ${isToday(date) ? 'bg-white text-blue-600' : 
                        'bg-blue-500 text-white shadow-sm'}
                    `}>
                      {taskCount}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Calendar Body with Tasks */}
          <div className="relative bg-white dark:bg-gray-900" style={{ 
            minHeight: '600px',
            minWidth: `${dates.length * 150}px` 
          }}>            {/* Grid Background - All days of the month */}
            <div className="absolute inset-0 flex">
              {dates.map((date, i) => (
                <div 
                  key={`grid-${i}`} 
                  className={`flex-shrink-0 border-r border-gray-200 dark:border-gray-700 h-full transition-colors ${
                    isToday(date) ? 'bg-blue-50/70 dark:bg-blue-900/20 border-r-blue-300 dark:border-r-blue-600' : 
                    isWeekend(date) ? 'bg-rose-50/30 dark:bg-rose-900/10' : 
                    'hover:bg-gray-50/50 dark:hover:bg-gray-800/30'
                  }`}
                  style={{ width: '150px' }}
                >
                  {/* Day indicator line for today */}
                  {isToday(date) && (
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-blue-400 dark:bg-blue-500 opacity-50" />
                  )}
                </div>
              ))}
            </div>

            {/* Task Bars */}
            <div className="relative p-4">
              {tasks
                .filter(task => task.dueDate)
                .map((task, taskIndex) => {
                  const taskData = getTaskStyle(task);
                  const { taskColor, isCompleted, startIndex, width } = taskData;
                  
                  // Stack tasks vertically with 60px spacing
                  const rowOffset = Math.floor(taskIndex * 60);
                  
                  return (
                    <TooltipProvider key={task.id}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className={`
                              absolute rounded-lg px-4 py-3 cursor-pointer
                              transition-all duration-200 hover:scale-[1.02] hover:shadow-xl
                              ${isCompleted ? 'bg-green-500 border border-green-600' : `${taskColor.bg} border ${taskColor.border}`}
                              shadow-lg transform hover:z-20
                            `}
                            style={{
                              left: `${startIndex * 150 + 8}px`,
                              width: `${width * 150 - 16}px`,
                              top: `${20 + rowOffset}px`,
                              minHeight: '50px',
                              zIndex: 10,
                            }}
                            onClick={() => onTaskClick(task)}
                          >
                            {/* Subtle gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-white/10 rounded-lg" />
                            
                            {/* Task Content */}
                            <div className="relative z-10 flex flex-col justify-center h-full text-white">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-semibold text-sm truncate pr-2">
                                  {task.title}
                                </span>
                                <div className={`
                                  w-2 h-2 rounded-full flex-shrink-0
                                  ${isCompleted ? 'bg-white' : 'bg-white/80'}
                                `} />
                              </div>
                              
                              <div className="flex items-center gap-2 flex-wrap">
                                {/* Status Badge */}
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-white/30 text-white">
                                  {formatStatus(task.status)}
                                </span>
                                
                                {/* Priority Badge */}
                                <span className={`
                                  inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                                  ${task.priority === 'urgent' ? 'bg-red-600/90 text-white' : 
                                    task.priority === 'high' ? 'bg-orange-600/90 text-white' : 
                                    task.priority === 'medium' ? 'bg-yellow-600/90 text-white' : 
                                    'bg-blue-600/90 text-white'}
                                `}>
                                  {formatPriority(task.priority)}
                                </span>
                                
                                {/* Due Date */}
                                {task.dueDate && (
                                  <span className="text-xs text-white/90 font-medium ml-auto">
                                    Due: {format(new Date(task.dueDate), 'MMM d')}
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            {/* Bottom Accent Line */}
                            <div className={`
                              absolute bottom-0 left-0 right-0 h-1 rounded-b-lg
                              ${isCompleted ? 'bg-green-300' : 'bg-white/40'}
                            `} />
                          </div>
                        </TooltipTrigger>
                        
                        <TooltipContent className="max-w-xs">
                          <div className="space-y-2">
                            <p className="font-semibold text-base">{task.title}</p>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <span className="text-gray-500">Status:</span>
                                <br />
                                <span className="font-medium">{formatStatus(task.status)}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Priority:</span>
                                <br />
                                <span className="font-medium">{formatPriority(task.priority)}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Created:</span>
                                <br />
                                <span className="font-medium">{format(new Date(task.createdAt), 'MMM d, yyyy')}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Due:</span>
                                <br />
                                <span className="font-medium">
                                  {task.dueDate ? format(new Date(task.dueDate), 'MMM d, yyyy') : 'Not set'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  );
                })
              }            </div>
          </div>
        </div>
        
        {/* Month Summary */}
        <div className="border-t bg-gray-50 dark:bg-gray-800 px-6 py-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-6">
              <span className="text-gray-600 dark:text-gray-400">
                <strong>{tasks.length}</strong> total tasks
              </span>
              <span className="text-gray-600 dark:text-gray-400">
                <strong>{tasks.filter(t => t.status === 'done').length}</strong> completed
              </span>
              <span className="text-gray-600 dark:text-gray-400">
                <strong>{tasks.filter(t => t.dueDate).length}</strong> with due dates
              </span>
            </div>
            <div className="text-gray-500 dark:text-gray-400">
              Month view: {format(dates[0] || new Date(), 'MMM d')} - {format(dates[dates.length - 1] || new Date(), 'MMM d, yyyy')}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

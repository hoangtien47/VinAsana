import { useEffect, useState, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { format, addDays, startOfWeek, addWeeks, subWeeks, isWithinInterval, isToday, isBefore } from "date-fns";
import { getStatusColor, getPriorityColor } from "@/lib/utils";

interface Task {
  id: number;
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

export function GanttChart({ tasks, onTaskClick }: GanttChartProps) {
  const [startDate, setStartDate] = useState(startOfWeek(new Date()));
  const [dates, setDates] = useState<Date[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Generate array of 14 dates starting from startDate
  useEffect(() => {
    const newDates = Array.from({ length: 14 }, (_, i) => addDays(startDate, i));
    setDates(newDates);
  }, [startDate]);

  const handleScrollToToday = () => {
    const today = new Date();
    setStartDate(startOfWeek(today));
    
    // Scroll to today column after render
    setTimeout(() => {
      const todayIndex = dates.findIndex(date => isToday(date));
      const dayWidth = scrollRef.current?.clientWidth ? scrollRef.current.clientWidth / 7 : 100;
      if (scrollRef.current && todayIndex >= 0) {
        scrollRef.current.scrollLeft = dayWidth * todayIndex;
      }
    }, 100);
  };

  const handleNextWeek = () => {
    setStartDate(prev => addWeeks(prev, 1));
  };

  const handlePrevWeek = () => {
    setStartDate(prev => subWeeks(prev, 1));
  };

  // Calculate task position and width based on created and due dates
  const getTaskStyle = (task: Task) => {
    // Default to showing tasks that span 1 day starting from created date
    const start = new Date(task.createdAt);
    const end = task.dueDate ? new Date(task.dueDate) : addDays(start, 1);
    
    // Calculate position
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
    
    // If task dates are outside our current view, try to find closest matches
    const visibleStartIndex = startIndex >= 0 ? startIndex : isBefore(start, dates[0]) ? 0 : dates.length - 1;
    const visibleEndIndex = endIndex >= 0 ? endIndex : isBefore(end, dates[0]) ? 0 : dates.length - 1;
    
    // Calculate width (minimum 1 day)
    const taskWidth = Math.max(1, (visibleEndIndex - visibleStartIndex) + 1);
    
    // Task is completed if status is "done"
    const isCompleted = task.status === "done";
    
    // Get appropriate background color
    const bgColorClass = isCompleted ? "bg-green-200 dark:bg-green-900" : `${getStatusColor(task.status)} bg-opacity-20`;
    const borderColorClass = isCompleted ? "border-green-500" : getPriorityColor(task.priority);
    
    return {
      gridColumnStart: visibleStartIndex + 1,
      gridColumnEnd: visibleStartIndex + taskWidth + 1,
      backgroundColor: `var(--${bgColorClass})`,
      borderLeft: `3px solid var(--${borderColorClass})`,
      cursor: "pointer",
    };
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Gantt Chart</CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handlePrevWeek}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleScrollToToday}>
              Today
            </Button>
            <Button variant="outline" size="sm" onClick={handleNextWeek}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="border-b">
          <div className="grid grid-cols-7 border-b">
            {dates.slice(0, 7).map((date, i) => (
              <div 
                key={`header-${i}`} 
                className={`py-2 px-2 text-center text-sm font-medium ${
                  isToday(date) ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : ''
                }`}
              >
                {format(date, 'EEE d MMM')}
              </div>
            ))}
          </div>
          <div ref={scrollRef} className="overflow-x-auto">
            <div className="grid grid-cols-[repeat(7,_minmax(120px,_1fr))] min-w-full">
              {dates.slice(0, 7).map((date, i) => (
                <div 
                  key={`day-${i}`} 
                  className={`h-8 border-r border-t ${
                    isToday(date) ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                />
              ))}
            </div>
            
            <div className="relative min-h-[300px]">
              {/* Grid lines */}
              <div className="grid grid-cols-[repeat(7,_minmax(120px,_1fr))] min-w-full absolute inset-0">
                {dates.slice(0, 7).map((date, i) => (
                  <div 
                    key={`grid-${i}`} 
                    className={`border-r h-full ${
                      isToday(date) ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                  />
                ))}
              </div>
              
              {/* Tasks */}
              <div className="grid grid-cols-[repeat(7,_minmax(120px,_1fr))] min-w-full relative p-2 gap-2">
                {tasks
                  .filter(task => task.dueDate) // Only show tasks with due dates
                  .map(task => {
                    const style = getTaskStyle(task);
                    return (
                      <TooltipProvider key={task.id}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              className="rounded p-2 text-sm overflow-hidden whitespace-nowrap text-ellipsis"
                              style={style}
                              onClick={() => onTaskClick(task)}
                            >
                              {task.title}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="space-y-1">
                              <p className="font-medium">{task.title}</p>
                              <p className="text-xs">Status: {task.status}</p>
                              <p className="text-xs">Priority: {task.priority}</p>
                              <p className="text-xs">Due: {task.dueDate ? format(new Date(task.dueDate), 'PP') : 'Not set'}</p>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    );
                  })
                }
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

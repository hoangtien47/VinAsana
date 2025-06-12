import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isToday, 
  isWeekend,
  addMonths,
  subMonths,
  isSameDay,
  addDays
} from "date-fns";

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate?: string;
  createdAt: string;
}

interface CalendarMonthViewProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

// Color palette for task bars
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

const getTaskColor = (taskId: string) => {
  let hash = 0;
  for (let i = 0; i < taskId.length; i++) {
    const char = taskId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return TASK_COLORS[Math.abs(hash) % TASK_COLORS.length];
};

interface TaskBar {
  task: Task;
  startCol: number;
  endCol: number;
  row: number;
  width: number;
}

export function CalendarMonthView({ tasks, onTaskClick }: CalendarMonthViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<Date[]>([]);
  const [taskBars, setTaskBars] = useState<TaskBar[]>([]);
  const [maxRows, setMaxRows] = useState(3);

  // Generate calendar grid (6 weeks x 7 days = 42 days)
  useEffect(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 }); // Start on Sunday
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    
    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    setCalendarDays(days);

    // Calculate task bars that span across days, breaking at week boundaries
    const bars: TaskBar[] = [];
    const weeklyRowCounters: Record<number, number> = {}; // Track rows per week

    tasks
      .filter(task => task.dueDate)
      .forEach((task, taskIndex) => {
        const startDate = new Date(task.createdAt);
        const endDate = task.dueDate ? new Date(task.dueDate) : addDays(startDate, 1);

        // Find start and end column positions in the calendar grid
        const startCol = days.findIndex(day => isSameDay(day, startDate));
        const endCol = days.findIndex(day => isSameDay(day, endDate));

        // If task spans across the calendar view
        if (startCol >= 0 || endCol >= 0) {
          const visibleStartCol = Math.max(0, startCol >= 0 ? startCol : 0);
          const visibleEndCol = Math.min(days.length - 1, endCol >= 0 ? endCol : days.length - 1);

          // Break the task into segments for each week
          const startWeek = Math.floor(visibleStartCol / 7);
          const endWeek = Math.floor(visibleEndCol / 7);

          for (let week = startWeek; week <= endWeek; week++) {
            const weekStartCol = week * 7;
            const weekEndCol = weekStartCol + 6;
            
            // Calculate the segment for this week
            const segmentStartCol = Math.max(visibleStartCol, weekStartCol);
            const segmentEndCol = Math.min(visibleEndCol, weekEndCol);
            
            if (segmentStartCol <= segmentEndCol) {
              // Initialize week row counter if not exists
              if (!(week in weeklyRowCounters)) {
                weeklyRowCounters[week] = 0;
              }

              // Find available row for this week segment
              let row = 0;
              const existingBarsInWeek = bars.filter(bar => 
                Math.floor(bar.startCol / 7) === week &&
                !(segmentEndCol < bar.startCol || segmentStartCol > bar.endCol)
              );
              
              if (existingBarsInWeek.length > 0) {
                const usedRows = existingBarsInWeek.map(bar => bar.row);
                while (usedRows.includes(row)) {
                  row++;
                }
              }

              bars.push({
                task,
                startCol: segmentStartCol,
                endCol: segmentEndCol,
                row,
                width: segmentEndCol - segmentStartCol + 1
              });

              weeklyRowCounters[week] = Math.max(weeklyRowCounters[week], row + 1);
            }
          }
        }
      });    setTaskBars(bars);
    setMaxRows(Math.max(3, Math.max(...Object.values(weeklyRowCounters).concat([0]))));
  }, [currentDate, tasks]);

  const handlePrevMonth = () => {
    setCurrentDate(prev => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => addMonths(prev, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Week days for header
  const weekDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold">
            {format(currentDate, 'MMMM yyyy')}
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handlePrevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleToday}>
              Today
            </Button>
            <Button variant="outline" size="sm" onClick={handleNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {/* Calendar Grid */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          {/* Week header */}
          <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
            {weekDays.map(day => (
              <div key={day} className="p-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar days grid with task bars */}
          <div className="relative">
            {/* Background grid */}
            <div className="grid grid-cols-7">
              {calendarDays.map((date, index) => {
                const isCurrentMonth = isSameMonth(date, currentDate);
                const isCurrentDay = isToday(date);
                
                return (
                  <div
                    key={index}
                    className={`
                      relative border-r border-b border-gray-200 dark:border-gray-700 p-2
                      ${!isCurrentMonth ? 'bg-gray-50 dark:bg-gray-800/50' : 'bg-white dark:bg-gray-900'}
                      ${isWeekend(date) && isCurrentMonth ? 'bg-gray-50/50 dark:bg-gray-800/30' : ''}
                      hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors
                    `}
                    style={{ minHeight: `${80 + (maxRows * 55)}px` }}
                  >
                    {/* Date number */}
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`
                          text-sm font-medium
                          ${!isCurrentMonth ? 'text-gray-400 dark:text-gray-600' : 'text-gray-900 dark:text-gray-100'}
                          ${isCurrentDay ? 'bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold' : ''}
                        `}
                      >
                        {format(date, 'd')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>            {/* Task bars overlay */}
            <div className="absolute inset-0 pointer-events-none">
              {taskBars.map((taskBar, index) => {
                const { task, startCol, width, row } = taskBar;
                const taskColor = getTaskColor(task.id);
                const isCompleted = task.status === 'done';
                
                // Calculate position
                const colWidth = 100 / 7; // percentage width per column
                const left = (startCol % 7) * colWidth;
                const top = Math.floor(startCol / 7) * (80 + (maxRows * 55)) + 30 + (row * 55);
                const barWidth = (width * colWidth) - 1; // subtract 1% for spacing
                
                return (                  <TooltipProvider key={`${task.id}-${index}`}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className={`
                            absolute rounded-lg px-4 py-3 cursor-pointer pointer-events-auto
                            transition-all duration-200 hover:scale-[1.02] hover:shadow-xl
                            ${isCompleted ? 'bg-green-500 border border-green-600' : `${taskColor.bg} border ${taskColor.border}`}
                            shadow-lg transform hover:z-20
                          `}
                          style={{
                            left: `${left}%`,
                            width: `${barWidth}%`,
                            top: `${top}px`,
                            height: '50px',
                            zIndex: 10,
                          }}
                          onClick={() => onTaskClick(task)}                        >
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
              })}
            </div>
          </div>
        </div>
        
        {/* Month Summary */}
        <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4">
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
              Calendar view
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

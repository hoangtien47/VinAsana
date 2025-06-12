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
  { bg: "bg-pink-500", text: "text-white" },
  { bg: "bg-emerald-500", text: "text-white" },
  { bg: "bg-orange-500", text: "text-white" },
  { bg: "bg-purple-500", text: "text-white" },
  { bg: "bg-blue-500", text: "text-white" },
  { bg: "bg-rose-500", text: "text-white" },
  { bg: "bg-teal-500", text: "text-white" },
  { bg: "bg-indigo-500", text: "text-white" },
  { bg: "bg-cyan-500", text: "text-white" },
  { bg: "bg-amber-500", text: "text-white" },
  { bg: "bg-lime-500", text: "text-white" },
  { bg: "bg-fuchsia-500", text: "text-white" }
];

const getTaskColor = (taskId: string) => {
  let hash = 0;
  for (let i = 0; i < taskId.length; i++) {
    const char = taskId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return TASK_COLORS[Math.abs(hash) % TASK_COLORS.length];
};

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

const formatPriority = (priority: string) => {
  const priorityMap: Record<string, string> = {
    'low': 'LOW',
    'medium': 'MED',
    'high': 'HIGH', 
    'urgent': 'URG'
  };
  return priorityMap[priority] || priority.toUpperCase();
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

  // Generate calendar grid (6 weeks x 7 days = 42 days)
  useEffect(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 }); // Start on Sunday
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    
    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    setCalendarDays(days);

    // Calculate task bars that span across days
    const bars: TaskBar[] = [];
    let currentRow = 0;

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

          // Calculate which row this task should be in (avoid overlaps)
          let row = 0;
          const existingBarsInTimeframe = bars.filter(bar => 
            !(visibleEndCol < bar.startCol || visibleStartCol > bar.endCol)
          );
          
          if (existingBarsInTimeframe.length > 0) {
            const usedRows = existingBarsInTimeframe.map(bar => bar.row);
            while (usedRows.includes(row)) {
              row++;
            }
          }

          bars.push({
            task,
            startCol: visibleStartCol,
            endCol: visibleEndCol,
            row,
            width: visibleEndCol - visibleStartCol + 1
          });

          currentRow = Math.max(currentRow, row);
        }
      });

    setTaskBars(bars);
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
  const maxRows = Math.max(3, Math.max(...taskBars.map(bar => bar.row)) + 1);

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
                    style={{ minHeight: `${80 + (maxRows * 35)}px` }}
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
            </div>

            {/* Task bars overlay */}
            <div className="absolute inset-0 pointer-events-none">
              {taskBars.map((taskBar, index) => {
                const { task, startCol, width, row } = taskBar;
                const taskColor = getTaskColor(task.id);
                const isCompleted = task.status === 'done';
                
                // Calculate position
                const colWidth = 100 / 7; // percentage width per column
                const left = (startCol % 7) * colWidth;
                const top = Math.floor(startCol / 7) * (80 + (maxRows * 35)) + 30 + (row * 35);
                const barWidth = (width * colWidth) - 1; // subtract 1% for spacing
                
                return (
                  <TooltipProvider key={`${task.id}-${index}`}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className={`
                            absolute rounded-md px-2 py-1 cursor-pointer pointer-events-auto
                            transition-all duration-200 hover:shadow-lg hover:scale-105 hover:z-20
                            ${isCompleted ? 'bg-green-500 text-white' : `${taskColor.bg} ${taskColor.text}`}
                            text-xs font-medium truncate shadow-sm
                          `}
                          style={{
                            left: `${left}%`,
                            width: `${barWidth}%`,
                            top: `${top}px`,
                            height: '30px',
                            zIndex: 10,
                          }}
                          onClick={() => onTaskClick(task)}
                        >
                          <div className="flex items-center gap-1 h-full">
                            {/* Priority indicator dot */}
                            <div className={`
                              w-1.5 h-1.5 rounded-full flex-shrink-0
                              ${task.priority === 'urgent' ? 'bg-red-300' : 
                                task.priority === 'high' ? 'bg-orange-300' : 
                                task.priority === 'medium' ? 'bg-yellow-300' : 
                                'bg-blue-300'}
                            `} />
                            <span className="truncate">{task.title}</span>
                          </div>
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

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate, getStatusColor, getPriorityColor } from "@/lib/utils";
import { Clock, AlertTriangle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { Link } from "wouter";

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate: string;
  project: {
    id: string;
    name: string;
  };
  assignee?: {
    id: string;
    name: string;
    avatar?: string;
  };
}

interface UpcomingDeadlinesProps {
  tasks: Task[];
}

export function UpcomingDeadlines({ tasks }: UpcomingDeadlinesProps) {
  // Helper to calculate days remaining
  const getDaysRemaining = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
  // Helper to determine the badge color based on days remaining
  const getDeadlineBadgeVariant = (daysRemaining: number) => {
    if (daysRemaining < 0) return "destructive";
    if (daysRemaining === 0) return "destructive";
    if (daysRemaining <= 2) return "outline"; // Changed from "warning" to "outline"
    return "secondary";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Upcoming Deadlines</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tasks.length > 0 ? (
            tasks.map((task) => {
              const daysRemaining = getDaysRemaining(task.dueDate);
              return (
                <div key={task.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                  <div className="space-y-1">
                    <Link to={`/tasks/${task.id}`}>
                      <h4 className="text-sm font-medium hover:text-primary">{task.title}</h4>
                    </Link>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{task.project.name}</span>
                      <span>•</span>
                      <Badge variant="outline" className="text-[10px] px-1 flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(task.status)}`} />
                        {task.status}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] px-1 flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`} />
                        {task.priority}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {task.assignee ? (
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={task.assignee.avatar} alt={task.assignee.name} />
                        <AvatarFallback>{getInitials(task.assignee.name)}</AvatarFallback>
                      </Avatar>
                    ) : (
                      <Avatar className="h-6 w-6">
                        <AvatarFallback>?</AvatarFallback>
                      </Avatar>
                    )}
                    <Badge variant={getDeadlineBadgeVariant(daysRemaining)} className="flex items-center gap-1">
                      {daysRemaining < 0 ? (
                        <AlertTriangle className="h-3 w-3" />
                      ) : (
                        <Clock className="h-3 w-3" />
                      )}
                      <span>
                        {daysRemaining < 0
                          ? `${Math.abs(daysRemaining)} days overdue`
                          : daysRemaining === 0
                          ? "Due today"
                          : `${daysRemaining} days left`}
                      </span>
                    </Badge>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-6">
              <p className="text-sm text-gray-500">No upcoming deadlines</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

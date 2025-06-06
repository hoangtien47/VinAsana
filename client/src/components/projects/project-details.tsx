import { useState } from "react";
import { Project } from "@/hooks/use-project";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { 
  Calendar, 
  Users, 
  CheckSquare, 
  BarChart3, 
  FileText, 
  Clock,
  Target,
  TrendingUp,
  AlertCircle,
  Edit2
} from "lucide-react";
import { getInitials } from "@/lib/utils";

interface ProjectDetailsProps {
  project: Project | null;
  open: boolean;
  onClose: () => void;
  onEdit: (project: Project) => void;
}

export function ProjectDetails({ project, open, onClose, onEdit }: ProjectDetailsProps) {
  if (!project) return null;

  const getStatusInfo = () => {
    const now = new Date();
    const startDate = new Date(project.startDate);
    const endDate = new Date(project.endDate);
    
    if (project.progress === 100) {
      return { status: "Completed", color: "bg-green-500", variant: "default" as const };
    } else if (now > endDate) {
      return { status: "Overdue", color: "bg-red-500", variant: "destructive" as const };
    } else if (now >= startDate) {
      return { status: "In Progress", color: "bg-blue-500", variant: "default" as const };
    } else {
      return { status: "Not Started", color: "bg-gray-500", variant: "secondary" as const };
    }
  };

  const statusInfo = getStatusInfo();
  const daysRemaining = Math.ceil((new Date(project.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  const totalDays = Math.ceil((new Date(project.endDate).getTime() - new Date(project.startDate).getTime()) / (1000 * 60 * 60 * 24));
  const daysElapsed = totalDays - daysRemaining;

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">        <DialogHeader className="flex flex-row items-start justify-between space-y-0 pr-12">
          <div className="space-y-1">
            <DialogTitle className="text-2xl font-bold line-clamp-2">{project.name}</DialogTitle>
            {project.description && (
              <p className="text-gray-600 dark:text-gray-400 line-clamp-2">
                {project.description}
              </p>
            )}
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onEdit(project)}
            className="flex items-center gap-2 ml-4"
          >
            <Edit2 className="h-4 w-4" />
            Edit
          </Button>
        </DialogHeader>

        <Tabs defaultValue="overview" className="h-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[calc(90vh-200px)] mt-4">
            <TabsContent value="overview" className="space-y-6">
              {/* Status and Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Status</CardTitle>
                    <Target className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <Badge variant={statusInfo.variant} className={statusInfo.color}>
                      {statusInfo.status}
                    </Badge>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Progress</CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{project.progress}%</div>
                    <Progress value={project.progress} className="mt-2" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Tasks</CardTitle>
                    <CheckSquare className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{project.taskCount || 0}</div>
                    <p className="text-xs text-muted-foreground">Total tasks</p>
                  </CardContent>
                </Card>
              </div>

              {/* Project Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Timeline
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Start Date</span>
                      <span className="text-sm">{format(new Date(project.startDate), 'MMM dd, yyyy')}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">End Date</span>
                      <span className="text-sm">{format(new Date(project.endDate), 'MMM dd, yyyy')}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Duration</span>
                      <span className="text-sm">{totalDays} days</span>
                    </div>
                    {daysRemaining > 0 ? (
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Days Remaining</span>
                        <Badge variant={daysRemaining < 7 ? "destructive" : "secondary"}>
                          {daysRemaining} days
                        </Badge>
                      </div>
                    ) : daysRemaining === 0 ? (
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Status</span>
                        <Badge variant="destructive">Due Today</Badge>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Status</span>
                        <Badge variant="destructive">Overdue by {Math.abs(daysRemaining)} days</Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Project Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <span className="text-sm font-medium">Description</span>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {project.description || "No description provided"}
                      </p>
                    </div>                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Start Date</span>
                      <span className="text-sm">{format(new Date(project.startDate), 'MMM dd, yyyy')}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">End Date</span>
                      <span className="text-sm">{format(new Date(project.endDate), 'MMM dd, yyyy')}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="progress" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Progress Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Overall Progress</span>
                        <span className="text-sm font-bold">{project.progress}%</span>
                      </div>
                      <Progress value={project.progress} className="h-3" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Time Progress</span>
                        <span className="text-sm font-bold">
                          {totalDays > 0 ? Math.round((daysElapsed / totalDays) * 100) : 0}%
                        </span>
                      </div>
                      <Progress 
                        value={totalDays > 0 ? (daysElapsed / totalDays) * 100 : 0} 
                        className="h-3" 
                      />
                    </div>

                    {project.progress > 0 && (
                      <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Project is {project.progress > (daysElapsed / totalDays) * 100 ? "ahead of" : "behind"} schedule
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CheckSquare className="h-5 w-5" />
                      Task Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <p className="text-sm text-gray-500">Task breakdown will be displayed here</p>
                      <p className="text-xs text-gray-400 mt-1">Integrate with task management system</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="team" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Team Members
                  </CardTitle>
                  <CardDescription>
                    Manage project team and permissions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-sm text-gray-500">Team management will be displayed here</p>
                    <p className="text-xs text-gray-400 mt-1">Integrate with team management system</p>
                    <Button variant="outline" className="mt-4">
                      Manage Team
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="timeline" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Project Timeline
                  </CardTitle>
                  <CardDescription>
                    View project milestones and key dates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Project Started</p>
                        <p className="text-xs text-gray-500">{format(new Date(project.startDate), 'MMM dd, yyyy')}</p>
                      </div>
                    </div>

                    {project.progress > 0 && (
                      <div className="flex items-center space-x-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Progress Update</p>
                          <p className="text-xs text-gray-500">{project.progress}% completed</p>
                        </div>
                      </div>
                    )}

                    <div className={`flex items-center space-x-4 p-3 rounded-lg ${
                      new Date() > new Date(project.endDate) 
                        ? 'bg-red-50 dark:bg-red-900/20' 
                        : 'bg-gray-50 dark:bg-gray-800'
                    }`}>
                      <div className={`w-3 h-3 rounded-full ${
                        new Date() > new Date(project.endDate) ? 'bg-red-500' : 'bg-gray-400'
                      }`}></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Project Deadline</p>
                        <p className="text-xs text-gray-500">{format(new Date(project.endDate), 'MMM dd, yyyy')}</p>
                      </div>
                      {new Date() > new Date(project.endDate) && (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

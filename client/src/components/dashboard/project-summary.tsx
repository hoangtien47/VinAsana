import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDate, getInitials } from "@/lib/utils";
import { Link } from "wouter";
import { ChevronRight, Clock } from "lucide-react";

interface ProjectMember {
  id: string;
  name: string;
  avatar?: string;
}

interface Project {
  id: number;
  name: string;
  description: string;
  progress: number;
  startDate: string;
  endDate: string;
  members: ProjectMember[];
  tasksTotal: number;
  tasksCompleted: number;
}

interface ProjectSummaryProps {
  projects: Project[];
}

export function ProjectSummary({ projects }: ProjectSummaryProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Active Projects</CardTitle>
        <Link to="/projects">
          <Button variant="ghost" size="sm" className="h-8 gap-1">
            View all
            <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {projects.length > 0 ? (
            projects.map((project) => (
              <div key={project.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{project.name}</h3>
                    <p className="text-sm text-gray-500 line-clamp-1">{project.description}</p>
                  </div>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>
                      {formatDate(project.endDate)}
                    </span>
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1 flex-1 mr-4">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span className="font-medium">{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} />
                  </div>
                  <div className="flex -space-x-2">
                    {project.members.slice(0, 3).map((member) => (
                      <Avatar key={member.id} className="h-8 w-8 border-2 border-white">
                        <AvatarImage src={member.avatar} alt={member.name} />
                        <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                      </Avatar>
                    ))}
                    {project.members.length > 3 && (
                      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium border-2 border-white">
                        +{project.members.length - 3}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between text-sm text-gray-500">
                  <span>
                    {project.tasksCompleted} of {project.tasksTotal} tasks completed
                  </span>
                  <span>
                    {formatDate(project.startDate)} - {formatDate(project.endDate)}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-gray-500">No active projects</p>
              <Button size="sm" className="mt-2">
                Create Project
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

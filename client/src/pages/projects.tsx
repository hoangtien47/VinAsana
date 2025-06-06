import { useState } from "react";
import { Sidebar } from "@/components/ui/sidebar";
import { Navbar } from "@/components/ui/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ProjectForm } from "@/components/projects/project-form";
import { ProjectDetails } from "@/components/projects/project-details";
import { EditProjectDialog } from "@/components/projects/edit-project-dialog";
import { useProject, CreateProjectData, Project, UpdateProjectData } from "@/hooks/use-project";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { 
  Plus, 
  Calendar, 
  Users, 
  MoreHorizontal, 
  Edit2, 
  Trash2, 
  Eye,
  FolderPlus,
  Search
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Projects() {
  const [isProjectFormOpen, setIsProjectFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const { projects, isLoading, createProject, deleteProject, updateProject, isCreating, isDeleting, isUpdating } = useProject();
  const { toast } = useToast();

  const handleCreateProject = async (data: CreateProjectData) => {
    try {
      createProject(data);
      setIsProjectFormOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create project",
        variant: "destructive",
      });
    }
  };
  const handleDeleteClick = (project: Project) => {
    setProjectToDelete(project);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (projectToDelete?.id) {
      deleteProject(projectToDelete.id);
      setDeleteDialogOpen(false);
      setProjectToDelete(null);
    }
  };
  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setProjectToDelete(null);
  };

  const handleViewDetails = (project: Project) => {
    setSelectedProject(project);
    setIsDetailsOpen(true);
  };

  const handleEditProject = (project: Project) => {
    setSelectedProject(project);
    setIsEditOpen(true);
  };

  const handleDetailsClose = () => {
    setIsDetailsOpen(false);
    setSelectedProject(null);
  };
  const handleEditClose = () => {
    setIsEditOpen(false);
    setSelectedProject(null);
  };
  const handleEditSubmit = async (projectId: string, data: UpdateProjectData) => {
    try {
      await updateProject({ projectId, projectData: data });
      setIsEditOpen(false);
      setSelectedProject(null);
      toast({
        title: "Success",
        description: "Project updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update project",
        variant: "destructive",
      });
    }
  };

  const filteredProjects = projects?.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const sortedProjects = [...filteredProjects].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name);
      case "progress":
        return b.progress - a.progress;
      case "startDate":
        return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
      case "endDate":
        return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
      default:
        return 0;
    }
  });

  const getStatusBadge = (project: Project) => {
    const now = new Date();
    const startDate = new Date(project.startDate);
    const endDate = new Date(project.endDate);
    
    if (project.progress === 100) {
      return <Badge variant="default" className="bg-green-500">Completed</Badge>;
    } else if (now > endDate) {
      return <Badge variant="destructive">Overdue</Badge>;
    } else if (now >= startDate) {
      return <Badge variant="default" className="bg-blue-500">In Progress</Badge>;
    } else {
      return <Badge variant="secondary">Not Started</Badge>;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar 
          title="Projects" 
          subtitle="Manage your projects and track progress"
        />
        
        <ScrollArea className="flex-1 p-6">
          <div className="container mx-auto space-y-6 pb-8">
            {/* Header with Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  All Projects
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                  {projects?.length || 0} total projects
                </p>
              </div>
                <Button 
                onClick={() => setIsProjectFormOpen(true)} 
                className="flex items-center gap-2"
                disabled={isCreating}
              >
                <Plus className="h-4 w-4" />
                {isCreating ? "Creating..." : "New Project"}
              </Button>
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="progress">Progress</SelectItem>
                  <SelectItem value="startDate">Start Date</SelectItem>
                  <SelectItem value="endDate">End Date</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Projects Grid */}
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : sortedProjects.length === 0 ? (
              <div className="text-center py-12">
                <FolderPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  {projects?.length === 0 ? "No projects yet" : "No projects found"}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  {projects?.length === 0 
                    ? "Create your first project to get started with task management."
                    : "Try adjusting your search or filter criteria."
                  }
                </p>                {projects?.length === 0 && (
                  <Button 
                    onClick={() => setIsProjectFormOpen(true)} 
                    className="flex items-center gap-2"
                    disabled={isCreating}
                  >
                    <Plus className="h-4 w-4" />
                    {isCreating ? "Creating..." : "Create Project"}
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {sortedProjects.map((project) => (
                  <Card key={project.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                      <div className="space-y-1 flex-1">
                        <CardTitle className="text-lg line-clamp-2">{project.name}</CardTitle>
                        {project.description && (
                          <CardDescription className="line-clamp-2">
                            {project.description}
                          </CardDescription>
                        )}
                      </div>
                        <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" disabled={isDeleting}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />                          <DropdownMenuItem onClick={() => handleViewDetails(project)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditProject(project)}>
                            <Edit2 className="h-4 w-4 mr-2" />
                            Edit Project
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-600 focus:text-red-600"
                            onClick={() => handleDeleteClick(project)}
                            disabled={isDeleting}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {isDeleting && projectToDelete?.id === project.id ? "Deleting..." : "Delete Project"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {/* Status Badge */}
                      <div className="flex items-center justify-between">
                        {getStatusBadge(project)}
                        <span className="text-sm text-gray-500">
                          {project.taskCount} tasks
                        </span>
                      </div>

                      {/* Progress */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Progress</span>
                          <span className="font-medium">{project.progress}%</span>
                        </div>
                        <Progress value={project.progress} className="h-2" />
                        <div className="text-xs text-gray-500">
                          {project.doneTaskCount} of {project.taskCount} tasks completed
                        </div>
                      </div>

                      {/* Dates */}
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>
                            {format(new Date(project.startDate), "MMM d, yyyy")} - {" "}
                            {format(new Date(project.endDate), "MMM d, yyyy")}
                          </span>
                        </div>
                      </div>                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleViewDetails(project)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Users className="h-4 w-4 mr-2" />
                          Team
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>        {/* Project Form Dialog */}
        <ProjectForm
          open={isProjectFormOpen}
          onClose={() => setIsProjectFormOpen(false)}
          onSubmit={handleCreateProject}
        />

        {/* Project Details Dialog */}
        {selectedProject && (
          <ProjectDetails
            project={selectedProject}
            open={isDetailsOpen}
            onClose={handleDetailsClose}
            onEdit={() => {
              setIsDetailsOpen(false);
              setIsEditOpen(true);
            }}
          />
        )}        {/* Edit Project Dialog */}
        {selectedProject && (
          <EditProjectDialog
            project={selectedProject}
            open={isEditOpen}
            onClose={handleEditClose}
            onSubmit={handleEditSubmit}
            isLoading={isUpdating}
          />
        )}{/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete the project "{projectToDelete?.name}"? 
                This action cannot be undone and will permanently remove:
                <ul className="mt-2 ml-4 list-disc space-y-1">
                  <li>All project data and settings</li>
                  <li>All associated tasks ({projectToDelete?.taskCount || 0} tasks)</li>
                  <li>All project documents and files</li>
                  <li>All team member assignments</li>
                </ul>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleDeleteCancel} disabled={isDeleting}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteConfirm} 
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete Project"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

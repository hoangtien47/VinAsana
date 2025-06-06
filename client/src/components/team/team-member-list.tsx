import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/hooks/use-user";
import { getInitials } from "@/lib/utils";
import { MoreVertical, UserPlus, Mail, Trash2, Search, X, Eye, Edit, Trash, Users, FileText, FolderOpen, Info, Loader2 } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface User {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  profileImageUrl?: string;
}

interface ProjectMember {
  id: number;
  projectId: number;
  userId: string;
  user: User;
}

interface TeamMemberListProps {
  projectId: number;
  members: ProjectMember[];
  onMembersChange: () => void;
  currentUser: User;
}

export function TeamMemberList({ 
  projectId, 
  members,
  onMembersChange,
  currentUser
}: TeamMemberListProps) {  const { toast } = useToast();
  const { getUser, deleteUser, isDeletingUser, createUser, isCreatingUser } = useUser(); // Updated to include createUser and isCreatingUser
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<ProjectMember | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberPermissions, setNewMemberPermissions] = useState({
    tasks: { read: false, write: false, delete: false },
    files: { read: false, write: false, delete: false },
    projects: { read: false, write: false, delete: false },
    users: { read: false, write: false, delete: false }
  });
  const [expandedMember, setExpandedMember] = useState<string | null>(null);
  const [loadingPermissions, setLoadingPermissions] = useState<Record<string, boolean>>({});
  const [fetchedPermissions, setFetchedPermissions] = useState<Record<string, any>>({});


  // Function to transform API permissions to component format
  const transformPermissions = (permissions: Array<{value: string, description?: string}>) => {
    const permissionMap = permissions.reduce((acc, perm) => {
      acc[perm.value] = true;
      return acc;
    }, {} as Record<string, boolean>);

    return {
      tasks: {
        read: permissionMap['read:tasks'] || false,
        write: permissionMap['write:tasks'] || false,
        delete: permissionMap['delete:tasks'] || false,
      },
      files: {
        read: permissionMap['read:files'] || false,
        write: permissionMap['write:files'] || false,
        delete: permissionMap['delete:files'] || false,
      },
      projects: {
        read: permissionMap['read:projects'] || false,
        write: permissionMap['write:projects'] || false,
        delete: permissionMap['delete:projects'] || false,
      },
      users: {
        read: permissionMap['read:users'] || false,
        write: permissionMap['write:users'] || false,
        delete: permissionMap['delete:users'] || false,
      },
    };
  };

  // Function to fetch individual user permissions
  const fetchUserPermissions = async (userId: string) => {
    // Don't fetch if already loading or already have permissions
    if (loadingPermissions[userId] || fetchedPermissions[userId]) {
      return;
    }

    setLoadingPermissions(prev => ({ ...prev, [userId]: true }));

    try {
      const apiUser = await getUser(userId);
      console.log("Fetched user permissions:", apiUser);
      
      if (apiUser?.permissions) {
        const transformedPermissions = transformPermissions(apiUser.permissions);
        setFetchedPermissions(prev => ({ 
          ...prev, 
          [userId]: transformedPermissions 
        }));
      }
    } catch (error) {
      console.error("Failed to fetch user permissions:", error);
      toast({
        title: "Error",
        description: "Failed to fetch user permissions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingPermissions(prev => ({ ...prev, [userId]: false }));
    }
  };

  // Render permission icons
  const renderPermissionIcons = (permission: { read: boolean; write: boolean; delete: boolean }) => {
    return (
      <div className="flex items-center space-x-1">
        {permission.read && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Eye className="h-3 w-3 text-blue-500" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Read</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        {permission.write && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Edit className="h-3 w-3 text-green-500" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Write</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        {permission.delete && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Trash className="h-3 w-3 text-red-500" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        {!permission.read && !permission.write && !permission.delete && (
          <span className="text-xs text-gray-400">No access</span>
        )}
      </div>
    );
  };
  
  // Filter members based on search query
  const filteredMembers = members.filter(member => {
    const fullName = `${member.user.firstName || ''} ${member.user.lastName || ''}`
    return fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
           (member.user.email && member.user.email.toLowerCase().includes(searchQuery.toLowerCase()));
  });
  const handleAddMemberClick = () => {
    setNewMemberEmail("");
    setNewMemberPermissions({
      tasks: { read: false, write: false, delete: false },
      files: { read: false, write: false, delete: false },
      projects: { read: false, write: false, delete: false },
      users: { read: false, write: false, delete: false }
    });
    setIsAddDialogOpen(true);
  };

  const handleRemoveMemberClick = (member: ProjectMember) => {
    setSelectedMember(member);
    setIsRemoveDialogOpen(true);
  };  // Convert permissions object to array format expected by API
  const convertPermissionsToArray = (permissions: typeof newMemberPermissions): string[] => {
    const permissionArray: string[] = [];
    
    // Tasks permissions
    if (permissions.tasks.read) permissionArray.push('read:tasks');
    if (permissions.tasks.write) permissionArray.push('write:tasks');
    if (permissions.tasks.delete) permissionArray.push('delete:tasks');
    
    // Files permissions
    if (permissions.files.read) permissionArray.push('read:files');
    if (permissions.files.write) permissionArray.push('write:files');
    if (permissions.files.delete) permissionArray.push('delete:files');
    
    // Projects permissions
    if (permissions.projects.read) permissionArray.push('read:projects');
    if (permissions.projects.write) permissionArray.push('write:projects');
    if (permissions.projects.delete) permissionArray.push('delete:projects');
    
    // Users permissions
    if (permissions.users.read) permissionArray.push('read:users');
    if (permissions.users.write) permissionArray.push('write:users');
    if (permissions.users.delete) permissionArray.push('delete:users');
    
    return permissionArray;
  };

  const handleAddMember = async () => {
    if (!newMemberEmail.trim()) {
      toast({
        title: "Email required",
        description: "Please enter an email address for the new user.",
        variant: "destructive",
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newMemberEmail)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const permissionsArray = convertPermissionsToArray(newMemberPermissions);
      
      await createUser({
        email: newMemberEmail.trim(),
        permissions: permissionsArray,
      });
      

      // Success is handled by the mutation's onSuccess callback
      setIsAddDialogOpen(false);
      setNewMemberEmail("");
      setNewMemberPermissions({
        tasks: { read: false, write: false, delete: false },
        files: { read: false, write: false, delete: false },
        projects: { read: false, write: false, delete: false },
        users: { read: false, write: false, delete: false }
      });
      
      // Trigger parent component refresh
      onMembersChange();
    } catch (error) {
      // Error is handled by the mutation's onError callback
      console.error("Failed to create user:", error);
    }
  };

  const handleRemoveMember = () => { // No longer needs to be async itself
    if (!selectedMember) return;

    // setIsLoading(true); // Removed: isDeletingUser will be used for the button state

    deleteUser(selectedMember.userId, {
      onSuccess: () => {
        // The useUser hook's onSuccess for deleteUser already handles:
        // - queryClient.invalidateQueries({ queryKey: ["users"] });
        // - toast({ title: "Success", description: "User deleted successfully" });
        
        onMembersChange(); // Prop to refetch or update parent component's list
        setIsRemoveDialogOpen(false);
        setSelectedMember(null);
      },
      onError: (error: Error) => {
        // The useUser hook's onError for deleteUser already handles the toast
        console.error("Failed to remove member (from mutation):", error.message);
        // Dialog can remain open for the user to retry or cancel.
        // setIsLoading(false); // Removed
      }
    });  };

  // Handle permissions button click
  const handlePermissionsClick = async (userId: string) => {
    const isExpanded = expandedMember === userId;
    
    if (!isExpanded) {
      // Expanding - fetch permissions if we don't have them
      setExpandedMember(userId);
      await fetchUserPermissions(userId);
    } else {
      // Collapsing
      setExpandedMember(null);
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
          <CardTitle className="text-lg">Team Members</CardTitle>
          <Button onClick={handleAddMemberClick} className="space-x-1">
            <UserPlus className="h-4 w-4" />
            <span>Add Member</span>
          </Button>
        </div>
        
        <div className="relative mt-2">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
          <Input
            type="search"
            placeholder="Search members..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent>        {filteredMembers.length > 0 ? (
          <div className="space-y-4">            {filteredMembers.map((member) => {
              // Use fetched permissions if available, otherwise fall back to member.permissions
              const permissions = fetchedPermissions[member.userId];
              const isExpanded = expandedMember === member.userId;
              const isLoadingPermissions = loadingPermissions[member.userId];
              
              return (
                <div key={member.id} className="border rounded-lg">
                  <div className="flex items-center justify-between p-3 hover:border-primary transition-colors">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={member.user.profileImageUrl} />
                        <AvatarFallback>
                          {getInitials(`${member.user.firstName || ''} ${member.user.lastName || ''}`)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-medium">{member.user.firstName} {member.user.lastName}</h3>
                        <p className="text-sm text-gray-500">{member.user.email}</p>
                      </div>
                    </div>                    <div className="flex items-center space-x-2">                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePermissionsClick(member.userId)}
                        className="text-xs"
                        disabled={loadingPermissions[member.userId]}
                      >
                        {loadingPermissions[member.userId] ? (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <Info className="h-4 w-4 mr-1" />
                        )}
                        {loadingPermissions[member.userId] ? "Loading..." : "Permissions"}
                      </Button>
                        {/* Only show dropdown for non-current user members or if current user has admin permissions */}
                      {(member.userId !== currentUser.id) && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              onClick={() => window.location.href = `mailto:${member.user.email}`}
                              disabled={!member.user.email}
                            >
                              <Mail className="h-4 w-4 mr-2" />
                              Send Email
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {member.userId !== currentUser.id && (
                              <DropdownMenuItem 
                                className="text-red-500 focus:text-red-500"
                                onClick={() => handleRemoveMemberClick(member)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Remove
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                    {/* Permissions Details */}
                  <Collapsible open={isExpanded}>
                    <CollapsibleContent className="px-3 pb-3">
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-3 mt-2">
                        <h4 className="text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
                          User Permissions
                        </h4>
                        
                        {isLoadingPermissions ? (
                          <div className="flex items-center justify-center py-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                            <span className="ml-2 text-sm text-gray-500">Loading permissions...</span>
                          </div>
                        ) : permissions ? ( // Check if permissions object exists
                          <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <FolderOpen className="h-4 w-4 text-gray-500" />
                                  <span>Tasks</span>
                                </div>
                                {renderPermissionIcons(permissions.tasks)}
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <FileText className="h-4 w-4 text-gray-500" />
                                  <span>Files</span>
                                </div>
                                {renderPermissionIcons(permissions.files)}
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <FolderOpen className="h-4 w-4 text-gray-500" />
                                  <span>Projects</span>
                                </div>
                                {renderPermissionIcons(permissions.projects)}
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <Users className="h-4 w-4 text-gray-500" />
                                  <span>Users</span>
                                </div>
                                {renderPermissionIcons(permissions.users)}
                              </div>
                            </div>
                              {/* Permission descriptions */}
                            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                              <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                                {/* Check for read-only access */}
                                {(permissions.tasks?.read || permissions.files?.read || permissions.projects?.read || permissions.users?.read) && 
                                 !(permissions.tasks?.write || permissions.files?.write || permissions.projects?.write || permissions.users?.write) && (
                                  <p>• Has read-only access to selected resources</p>
                                )}
                                
                                {/* Check for write access without delete */}
                                {(permissions.tasks?.write || permissions.files?.write || permissions.projects?.write || permissions.users?.write) && 
                                 !permissions.users?.delete && (
                                  <p>• Can read and write to selected resources.</p>
                                )}
                                
                                {/* Check for full admin access */}
                                {permissions.users?.delete && (
                                  <p>• Has full administrative access</p>
                                )}
                                
                                {/* Show if no permissions */}
                                {!(permissions.tasks?.read || permissions.files?.read || permissions.projects?.read || permissions.users?.read) && (
                                  <p>• No specific permissions granted</p>
                                )}
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="text-xs text-gray-500 p-3 text-center">
                            Permissions data not available. Click the 'Permissions' button above to load.
                          </div>
                        )}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10">
            {searchQuery ? (
              <>
                <p className="text-gray-500 mb-2">No members found matching "{searchQuery}"</p>
                <Button variant="outline" onClick={() => setSearchQuery("")}>
                  Clear search
                </Button>
              </>
            ) : (
              <>
                <p className="text-gray-500 mb-2">No team members yet</p>
                <Button onClick={handleAddMemberClick}>Add Your First Member</Button>
              </>
            )}
          </div>
        )}
      </CardContent>
      
      {/* Add Member Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
          </DialogHeader>          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email Address</label>
              <Input
                type="email"
                placeholder="Enter user email address..."
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                A new user will be created with this email address.
              </p>
            </div><div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Permissions</label>
                <p className="text-xs text-gray-500 mt-1">Select the specific permissions for this user</p>
              </div>
              
              {/* Quick Selection Buttons */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-600">Quick Select:</p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setNewMemberPermissions({
                      tasks: { read: true, write: false, delete: false },
                      files: { read: true, write: false, delete: false },
                      projects: { read: true, write: false, delete: false },
                      users: { read: true, write: false, delete: false }
                    })}
                  >
                    Read-Only
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setNewMemberPermissions({
                      tasks: { read: true, write: true, delete: false },
                      files: { read: true, write: true, delete: false },
                      projects: { read: true, write: true, delete: false },
                      users: { read: true, write: true, delete: false }
                    })}
                  >
                    Read/Write
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setNewMemberPermissions({
                      tasks: { read: true, write: true, delete: true },
                      files: { read: true, write: true, delete: true },
                      projects: { read: true, write: true, delete: true },
                      users: { read: true, write: true, delete: true }
                    })}
                  >
                    Full Access
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setNewMemberPermissions({
                      tasks: { read: false, write: false, delete: false },
                      files: { read: false, write: false, delete: false },
                      projects: { read: false, write: false, delete: false },
                      users: { read: false, write: false, delete: false }
                    })}
                  >
                    Clear All
                  </Button>
                </div>
              </div>
                {/* Permissions Grid - 2 Columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Tasks Permissions */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium flex items-center space-x-2">
                    <FolderOpen className="h-4 w-4 text-gray-500" />
                    <span>Tasks</span>
                  </h4>
                  <div className="space-y-2 ml-6">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="tasks-read"
                        checked={newMemberPermissions.tasks.read}
                        onCheckedChange={(checked) =>
                          setNewMemberPermissions(prev => ({
                            ...prev,
                            tasks: { ...prev.tasks, read: !!checked }
                          }))
                        }
                      />
                      <label htmlFor="tasks-read" className="text-sm">View tasks</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="tasks-write"
                        checked={newMemberPermissions.tasks.write}
                        onCheckedChange={(checked) =>
                          setNewMemberPermissions(prev => ({
                            ...prev,
                            tasks: { ...prev.tasks, write: !!checked }
                          }))
                        }
                      />
                      <label htmlFor="tasks-write" className="text-sm">Create and edit tasks</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="tasks-delete"
                        checked={newMemberPermissions.tasks.delete}
                        onCheckedChange={(checked) =>
                          setNewMemberPermissions(prev => ({
                            ...prev,
                            tasks: { ...prev.tasks, delete: !!checked }
                          }))
                        }
                      />
                      <label htmlFor="tasks-delete" className="text-sm">Delete tasks</label>
                    </div>
                  </div>
                </div>

                {/* Files Permissions */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span>Files</span>
                  </h4>
                  <div className="space-y-2 ml-6">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="files-read"
                        checked={newMemberPermissions.files.read}
                        onCheckedChange={(checked) =>
                          setNewMemberPermissions(prev => ({
                            ...prev,
                            files: { ...prev.files, read: !!checked }
                          }))
                        }
                      />
                      <label htmlFor="files-read" className="text-sm">View files</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="files-write"
                        checked={newMemberPermissions.files.write}
                        onCheckedChange={(checked) =>
                          setNewMemberPermissions(prev => ({
                            ...prev,
                            files: { ...prev.files, write: !!checked }
                          }))
                        }
                      />
                      <label htmlFor="files-write" className="text-sm">Upload and edit files</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="files-delete"
                        checked={newMemberPermissions.files.delete}
                        onCheckedChange={(checked) =>
                          setNewMemberPermissions(prev => ({
                            ...prev,
                            files: { ...prev.files, delete: !!checked }
                          }))
                        }
                      />
                      <label htmlFor="files-delete" className="text-sm">Delete files</label>
                    </div>
                  </div>
                </div>

                {/* Projects Permissions */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium flex items-center space-x-2">
                    <FolderOpen className="h-4 w-4 text-gray-500" />
                    <span>Projects</span>
                  </h4>
                  <div className="space-y-2 ml-6">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="projects-read"
                        checked={newMemberPermissions.projects.read}
                        onCheckedChange={(checked) =>
                          setNewMemberPermissions(prev => ({
                            ...prev,
                            projects: { ...prev.projects, read: !!checked }
                          }))
                        }
                      />
                      <label htmlFor="projects-read" className="text-sm">View projects</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="projects-write"
                        checked={newMemberPermissions.projects.write}
                        onCheckedChange={(checked) =>
                          setNewMemberPermissions(prev => ({
                            ...prev,
                            projects: { ...prev.projects, write: !!checked }
                          }))
                        }
                      />
                      <label htmlFor="projects-write" className="text-sm">Create and edit projects</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="projects-delete"
                        checked={newMemberPermissions.projects.delete}
                        onCheckedChange={(checked) =>
                          setNewMemberPermissions(prev => ({
                            ...prev,
                            projects: { ...prev.projects, delete: !!checked }
                          }))
                        }
                      />
                      <label htmlFor="projects-delete" className="text-sm">Delete projects</label>
                    </div>
                  </div>
                </div>

                {/* Users Permissions */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium flex items-center space-x-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span>Users</span>
                  </h4>
                  <div className="space-y-2 ml-6">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="users-read"
                        checked={newMemberPermissions.users.read}
                        onCheckedChange={(checked) =>
                          setNewMemberPermissions(prev => ({
                            ...prev,
                            users: { ...prev.users, read: !!checked }
                          }))
                        }
                      />
                      <label htmlFor="users-read" className="text-sm">View users</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="users-write"
                        checked={newMemberPermissions.users.write}
                        onCheckedChange={(checked) =>
                          setNewMemberPermissions(prev => ({
                            ...prev,
                            users: { ...prev.users, write: !!checked }
                          }))
                        }
                      />
                      <label htmlFor="users-write" className="text-sm">Add and edit users</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="users-delete"
                        checked={newMemberPermissions.users.delete}
                        onCheckedChange={(checked) =>
                          setNewMemberPermissions(prev => ({
                            ...prev,
                            users: { ...prev.users, delete: !!checked }
                          }))
                        }
                      />
                      <label htmlFor="users-delete" className="text-sm">Delete users</label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddMember} disabled={isCreatingUser || !newMemberEmail.trim()}>
              {isCreatingUser ? "Creating..." : "Create User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Remove Member Dialog */}
      <Dialog open={isRemoveDialogOpen} onOpenChange={setIsRemoveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Team Member</DialogTitle>
          </DialogHeader>
          {selectedMember && (
            <div>
              <p>
                Are you sure you want to remove <strong>{selectedMember.user.firstName} {selectedMember.user.lastName}</strong> from this project?
              </p>
              <p className="text-sm text-gray-500 mt-2">
                This action cannot be undone. The user will lose access to this project.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRemoveDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRemoveMember}
              disabled={isDeletingUser} // Changed from isLoading
            >
              {isDeletingUser ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} {/* Changed from isLoading */}
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

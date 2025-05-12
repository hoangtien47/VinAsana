import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { getInitials } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MoreVertical, UserPlus, Mail, Trash2, Search, X } from "lucide-react";
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
  role: string;
  joinedAt: string;
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
}: TeamMemberListProps) {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<ProjectMember | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("member");
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  
  // Filter members based on search query
  const filteredMembers = members.filter(member => {
    const fullName = `${member.user.firstName || ''} ${member.user.lastName || ''}`
    return fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
           (member.user.email && member.user.email.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const users = await response.json();
        // Filter out users that are already members
        const memberUserIds = members.map(member => member.userId);
        const availableUsers = users.filter((user: User) => !memberUserIds.includes(user.id));
        setAvailableUsers(availableUsers);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast({
        title: "Error",
        description: "Failed to fetch users. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddMemberClick = () => {
    setNewMemberEmail("");
    setNewMemberRole("member");
    setSelectedUserId(null);
    setUserSearchQuery("");
    fetchUsers();
    setIsAddDialogOpen(true);
  };

  const handleRemoveMemberClick = (member: ProjectMember) => {
    setSelectedMember(member);
    setIsRemoveDialogOpen(true);
  };

  const handleAddMember = async () => {
    if (!selectedUserId) {
      toast({
        title: "User required",
        description: "Please select a user to add to the project.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      await apiRequest('POST', `/api/projects/${projectId}/members`, {
        userId: selectedUserId,
        role: newMemberRole,
      });
      
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/members`] });
      onMembersChange();
      setIsAddDialogOpen(false);
      toast({
        title: "Member added",
        description: "Team member has been added successfully.",
      });
    } catch (error) {
      console.error("Failed to add member:", error);
      toast({
        title: "Error",
        description: "Failed to add member. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!selectedMember) return;
    
    setIsLoading(true);
    
    try {
      await apiRequest('DELETE', `/api/projects/${projectId}/members/${selectedMember.userId}`, undefined);
      
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/members`] });
      onMembersChange();
      setIsRemoveDialogOpen(false);
      setSelectedMember(null);
      toast({
        title: "Member removed",
        description: "Team member has been removed successfully.",
      });
    } catch (error) {
      console.error("Failed to remove member:", error);
      toast({
        title: "Error",
        description: "Failed to remove member. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter available users for the Add Member dialog
  const filteredUsers = availableUsers.filter(user => {
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`;
    const email = user.email || '';
    return fullName.toLowerCase().includes(userSearchQuery.toLowerCase()) || 
           email.toLowerCase().includes(userSearchQuery.toLowerCase());
  });

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "default";
      case "manager":
        return "secondary";
      default:
        return "outline";
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
      <CardContent>
        {filteredMembers.length > 0 ? (
          <div className="space-y-4">
            {filteredMembers.map((member) => (
              <div 
                key={member.id} 
                className="flex items-center justify-between p-3 border rounded-lg hover:border-primary transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={member.user.profileImageUrl} />
                    <AvatarFallback>
                      {getInitials(`${member.user.firstName || ''} ${member.user.lastName || ''}`)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{member.user.firstName} {member.user.lastName}</h3>
                    <p className="text-sm text-gray-500">{member.user.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={getRoleBadgeVariant(member.role)} className="capitalize">
                    {member.role}
                  </Badge>
                  {/* Only show dropdown for non-current user members or if current user is admin */}
                  {(member.userId !== currentUser.id || member.role === "admin") && (
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
            ))}
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
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select User</label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search by name or email..."
                  className="pl-8"
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                />
              </div>
              {userSearchQuery && filteredUsers.length === 0 && (
                <p className="text-sm text-gray-500">No users found matching your search</p>
              )}
              <div className="max-h-[200px] overflow-y-auto mt-2 space-y-2">
                {filteredUsers.map((user) => (
                  <div 
                    key={user.id} 
                    className={`flex items-center space-x-3 p-2 rounded-md cursor-pointer ${
                      selectedUserId === user.id ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                    onClick={() => setSelectedUserId(user.id)}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.profileImageUrl} />
                      <AvatarFallback>
                        {getInitials(`${user.firstName || ''} ${user.lastName || ''}`)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.firstName} {user.lastName}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    {selectedUserId === user.id && (
                      <div className="ml-auto">
                        <Badge variant="default">Selected</Badge>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <Select value={newMemberRole} onValueChange={setNewMemberRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddMember} disabled={isLoading || !selectedUserId}>
              {isLoading ? "Adding..." : "Add Member"}
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
            <Button variant="destructive" onClick={handleRemoveMember} disabled={isLoading}>
              {isLoading ? "Removing..." : "Remove Member"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

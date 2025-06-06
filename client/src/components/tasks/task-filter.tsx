import { useState } from "react";
import { Search, Filter, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

interface User {
  id: string;
  nickname?: string;
  avatar?: string;
}

interface TaskFilterProps {
  onFilterChange: (filters: FilterOptions) => void;
  users?: User[];
  className?: string;
}

export interface FilterOptions {
  search?: string;
  status?: string[];
  priority?: string[];
  assigneeId?: string;
}


export function TaskFilter({ onFilterChange, users = [], className }: TaskFilterProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
  const [selectedAssignee, setSelectedAssignee] = useState<string | undefined>(undefined);
    const statusOptions = [
    { value: "todo", label: "To Do" },
    { value: "in_progress", label: "In Progress" },
    { value: "in_review", label: "In Review" },
    { value: "done", label: "Done" },
  ];
  
  const priorityOptions = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "urgent", label: "Urgent" },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
  };

  const toggleStatus = (value: string) => {
    setSelectedStatuses(prev => {
      if (prev.includes(value)) {
        return prev.filter(s => s !== value);
      } else {
        return [...prev, value];
      }
    });
  };

  const togglePriority = (value: string) => {
    setSelectedPriorities(prev => {
      if (prev.includes(value)) {
        return prev.filter(p => p !== value);
      } else {
        return [...prev, value];
      }
    });
  };

  const handleAssigneeChange = (value: string) => {
    setSelectedAssignee(value === "all" ? undefined : value);
  };

  const applyFilters = () => {
    onFilterChange({
      search: searchQuery || undefined,
      status: selectedStatuses.length > 0 ? selectedStatuses : undefined,
      priority: selectedPriorities.length > 0 ? selectedPriorities : undefined,
      assigneeId: selectedAssignee,
    });
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedStatuses([]);
    setSelectedPriorities([]);
    setSelectedAssignee(undefined);
    onFilterChange({});
  };

  const removeStatusFilter = (status: string) => {
    setSelectedStatuses(prev => prev.filter(s => s !== status));
    applyFilters();
  };

  const removePriorityFilter = (priority: string) => {
    setSelectedPriorities(prev => prev.filter(p => p !== priority));
    applyFilters();
  };

  const hasActiveFilters = !!searchQuery || selectedStatuses.length > 0 || selectedPriorities.length > 0 || !!selectedAssignee;

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center space-x-2">
            <form onSubmit={handleSearch} className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <Input
                type="search"
                placeholder="Search tasks..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="space-x-1">
                  <Filter className="h-4 w-4" />
                  <span className="hidden sm:inline">Filter</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>Filter Tasks</DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                <DropdownMenuGroup>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <span>Status</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent>
                        {statusOptions.map((status) => (
                          <DropdownMenuItem key={status.value} onSelect={(e) => e.preventDefault()}>
                            <div className="flex items-center space-x-2">
                              <Checkbox 
                                id={`status-${status.value}`} 
                                checked={selectedStatuses.includes(status.value)}
                                onCheckedChange={() => {
                                  toggleStatus(status.value);
                                }}
                              />
                              <label 
                                htmlFor={`status-${status.value}`}
                                className="text-sm cursor-pointer flex-1"
                              >
                                {status.label}
                              </label>
                            </div>
                          </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="justify-center"
                          onSelect={() => {
                            applyFilters();
                          }}
                        >
                          Apply
                        </DropdownMenuItem>
                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>
                  
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <span>Priority</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent>
                        {priorityOptions.map((priority) => (
                          <DropdownMenuItem key={priority.value} onSelect={(e) => e.preventDefault()}>
                            <div className="flex items-center space-x-2">
                              <Checkbox 
                                id={`priority-${priority.value}`} 
                                checked={selectedPriorities.includes(priority.value)}
                                onCheckedChange={() => {
                                  togglePriority(priority.value);
                                }}
                              />
                              <label 
                                htmlFor={`priority-${priority.value}`}
                                className="text-sm cursor-pointer flex-1"
                              >
                                {priority.label}
                              </label>
                            </div>
                          </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="justify-center"
                          onSelect={() => {
                            applyFilters();
                          }}
                        >
                          Apply
                        </DropdownMenuItem>
                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>
                </DropdownMenuGroup>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem 
                  className="justify-center text-red-500 focus:text-red-500"
                  onSelect={clearFilters}
                >
                  Clear All Filters
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Select 
              value={selectedAssignee || "all"} 
              onValueChange={(value) => {
                handleAssigneeChange(value);
                applyFilters();
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Assignee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All assignees</SelectItem>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    <div className="flex items-center">
                      <Avatar className="h-5 w-5 mr-2">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>{getInitials(`${user.nickname || ''}`)}</AvatarFallback>
                      </Avatar>
                      {user.nickname}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Active filters */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2">
              {searchQuery && (
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <span>Search: {searchQuery}</span>
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => {
                      setSearchQuery("");
                      applyFilters();
                    }}
                  />
                </Badge>
              )}
              
              {selectedStatuses.map(status => (
                <Badge key={`status-${status}`} variant="secondary" className="flex items-center space-x-1">
                  <span>Status: {statusOptions.find(s => s.value === status)?.label}</span>
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removeStatusFilter(status)}
                  />
                </Badge>
              ))}
              
              {selectedPriorities.map(priority => (
                <Badge key={`priority-${priority}`} variant="secondary" className="flex items-center space-x-1">
                  <span>Priority: {priorityOptions.find(p => p.value === priority)?.label}</span>
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removePriorityFilter(priority)}
                  />
                </Badge>
              ))}
              
              {selectedAssignee && (
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <span>
                    Assignee: {selectedAssignee === "unassigned" 
                      ? "Unassigned" 
                      : `${users.find(u => u.id === selectedAssignee)?.nickname || ''}`}
                  </span>
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => {
                      setSelectedAssignee(undefined);
                      applyFilters();
                    }}
                  />
                </Badge>
              )}
              
              {hasActiveFilters && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 text-xs text-gray-500"
                  onClick={clearFilters}
                >
                  Clear all
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

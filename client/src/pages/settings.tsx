import { useState } from "react";
import { Sidebar } from "@/components/ui/sidebar";
import { Navbar } from "@/components/ui/navbar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { getInitials } from "@/lib/utils";
import { BellRing, Lock, User, BellOff, Moon, Info, Mail, Share2 } from "lucide-react";

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");
  
  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    title: "Project Manager",
    bio: "Experienced project manager with expertise in agile methodologies and team leadership."
  });
  
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    taskAssignments: true,
    taskUpdates: true,
    projectUpdates: true,
    teamMessages: true,
    weeklyDigest: false
  });
  
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileForm({
      ...profileForm,
      [name]: value
    });
  };
  
  const handleNotificationToggle = (setting: keyof typeof notificationSettings) => {
    setNotificationSettings({
      ...notificationSettings,
      [setting]: !notificationSettings[setting]
    });
  };
  
  const handleSaveProfile = () => {
    // In a real app, we would save the profile to the backend
    toast({
      title: "Profile updated",
      description: "Your profile has been updated successfully.",
    });
  };
  
  const handleSaveNotifications = () => {
    // In a real app, we would save notification settings to the backend
    toast({
      title: "Notification settings updated",
      description: "Your notification preferences have been saved.",
    });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar title="Settings" />
        <div className="flex-1 p-6 overflow-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full md:w-auto md:inline-flex grid-cols-2 md:grid-cols-none">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="hidden md:inline">Profile</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <BellRing className="h-4 w-4" />
                <span className="hidden md:inline">Notifications</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                <span className="hidden md:inline">Security</span>
              </TabsTrigger>
              <TabsTrigger value="appearance" className="flex items-center gap-2">
                <Moon className="h-4 w-4" />
                <span className="hidden md:inline">Appearance</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your profile information visible to other team members
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex flex-col items-center gap-4">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src={user?.profileImageUrl} />
                        <AvatarFallback className="text-lg">
                          {getInitials(`${user?.firstName || ''} ${user?.lastName || ''}`)}
                        </AvatarFallback>
                      </Avatar>
                      <Button variant="outline" size="sm">Change Avatar</Button>
                    </div>
                    
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input 
                          id="firstName" 
                          name="firstName" 
                          value={profileForm.firstName} 
                          onChange={handleProfileChange} 
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input 
                          id="lastName" 
                          name="lastName" 
                          value={profileForm.lastName} 
                          onChange={handleProfileChange} 
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input 
                          id="email" 
                          name="email" 
                          type="email" 
                          value={profileForm.email} 
                          onChange={handleProfileChange} 
                          disabled 
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="title">Job Title</Label>
                        <Input 
                          id="title" 
                          name="title" 
                          value={profileForm.title} 
                          onChange={handleProfileChange} 
                        />
                      </div>
                      
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="bio">Bio</Label>
                        <textarea 
                          id="bio" 
                          name="bio" 
                          value={profileForm.bio} 
                          onChange={handleProfileChange} 
                          className="w-full min-h-[100px] p-3 border rounded-md"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button onClick={handleSaveProfile}>Save Changes</Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>
                    Control how and when you receive notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive notifications via email
                        </p>
                      </div>
                      <Switch 
                        checked={notificationSettings.emailNotifications}
                        onCheckedChange={() => handleNotificationToggle("emailNotifications")}
                      />
                    </div>
                    
                    <div className="border-t pt-4">
                      <h3 className="font-medium mb-3 flex items-center">
                        <Mail className="h-4 w-4 mr-2" />
                        Task Notifications
                      </h3>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="taskAssignments" className="flex-1">Task assignments</Label>
                          <Switch 
                            id="taskAssignments"
                            checked={notificationSettings.taskAssignments}
                            onCheckedChange={() => handleNotificationToggle("taskAssignments")}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <Label htmlFor="taskUpdates" className="flex-1">Task updates and status changes</Label>
                          <Switch 
                            id="taskUpdates"
                            checked={notificationSettings.taskUpdates}
                            onCheckedChange={() => handleNotificationToggle("taskUpdates")}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="border-t pt-4">
                      <h3 className="font-medium mb-3 flex items-center">
                        <Info className="h-4 w-4 mr-2" />
                        Project Notifications
                      </h3>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="projectUpdates" className="flex-1">Project updates and milestones</Label>
                          <Switch 
                            id="projectUpdates"
                            checked={notificationSettings.projectUpdates}
                            onCheckedChange={() => handleNotificationToggle("projectUpdates")}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="border-t pt-4">
                      <h3 className="font-medium mb-3 flex items-center">
                        <Share2 className="h-4 w-4 mr-2" />
                        Team Communications
                      </h3>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="teamMessages" className="flex-1">Team messages and mentions</Label>
                          <Switch 
                            id="teamMessages"
                            checked={notificationSettings.teamMessages}
                            onCheckedChange={() => handleNotificationToggle("teamMessages")}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <Label htmlFor="weeklyDigest" className="flex-1">Weekly activity digest</Label>
                          <Switch 
                            id="weeklyDigest"
                            checked={notificationSettings.weeklyDigest}
                            onCheckedChange={() => handleNotificationToggle("weeklyDigest")}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button onClick={handleSaveNotifications}>Save Preferences</Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>
                    Manage your account security and login preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    {/* Two-factor authentication would be implemented here */}
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Two-Factor Authentication</Label>
                        <p className="text-sm text-muted-foreground">
                          Add an extra layer of security to your account
                        </p>
                      </div>
                      <Button variant="outline">Set Up</Button>
                    </div>
                    
                    <div className="border-t pt-4">
                      <h3 className="font-medium mb-3">Password</h3>
                      <Button variant="outline">Change Password</Button>
                    </div>
                    
                    <div className="border-t pt-4">
                      <h3 className="font-medium mb-3">Login Sessions</h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                          <div>
                            <p className="font-medium">Current Session</p>
                            <p className="text-sm text-gray-500">Last active: Just now</p>
                          </div>
                          <Button variant="ghost" size="sm">Current</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="appearance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Appearance</CardTitle>
                  <CardDescription>
                    Customize your interface preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Theme</Label>
                      <div className="grid grid-cols-3 gap-2">
                        <Button variant="outline" className="justify-start">
                          <Sun className="h-4 w-4 mr-2" />
                          Light
                        </Button>
                        <Button variant="outline" className="justify-start">
                          <Moon className="h-4 w-4 mr-2" />
                          Dark
                        </Button>
                        <Button variant="outline" className="justify-start">
                          <Monitor className="h-4 w-4 mr-2" />
                          System
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2 border-t pt-4">
                      <Label>Density</Label>
                      <Select defaultValue="comfortable">
                        <SelectTrigger>
                          <SelectValue placeholder="Select display density" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="compact">Compact</SelectItem>
                          <SelectItem value="comfortable">Comfortable</SelectItem>
                          <SelectItem value="spacious">Spacious</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2 border-t pt-4">
                      <Label>Default View</Label>
                      <Select defaultValue="kanban">
                        <SelectTrigger>
                          <SelectValue placeholder="Select default task view" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="kanban">Kanban Board</SelectItem>
                          <SelectItem value="gantt">Gantt Chart</SelectItem>
                          <SelectItem value="list">List View</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button>Save Preferences</Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function Sun(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  );
}

function Monitor(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <line x1="8" x2="16" y1="21" y2="21" />
      <line x1="12" x2="12" y1="17" y2="21" />
    </svg>
  );
}

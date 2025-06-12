import { useState, useEffect } from "react";
import { useLocation } from "wouter";
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
import { useUser } from "@/hooks/use-user";
import { useToast } from "@/hooks/use-toast";
import { useAppearance, Theme, Density, DefaultView } from "@/hooks/use-appearance";
import { useI18n } from "@/hooks/use-i18n";
import { getInitials } from "@/lib/utils";
import { BellRing, Lock, User, BellOff, Moon, Info, Mail, Share2, Loader2 } from "lucide-react";

export default function Settings() {
  const { userProfile, isLoadingProfile, updateProfile, isUpdatingProfile } = useUser();
  const { toast } = useToast();
  const { settings: appearanceSettings, updateSettings: updateAppearance, getEffectiveTheme } = useAppearance();
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState("profile");
  const [, setLocation] = useLocation();
  
  const [profileForm, setProfileForm] = useState({
    nickname: "",
    email: "",
    avatar: "",
    languageCode: ""
  });
  
  // Update form when userProfile is loaded
  useEffect(() => {
    if (userProfile) {
      setProfileForm({
        nickname: userProfile.nickname || "",
        email: userProfile.email || "",
        avatar: userProfile.avatar || "",
        languageCode: userProfile.languageCode || ""
      });
    }
  }, [userProfile]);
    const [notificationSettings, setNotificationSettings] = useState(() => {
    const saved = localStorage.getItem('vinasana-notification-settings');
    return saved ? JSON.parse(saved) : {
      emailNotifications: true,
      taskAssignments: true,
      taskUpdates: true,
      projectUpdates: true,
      teamMessages: true,
      weeklyDigest: false
    };
  });
  
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileForm({
      ...profileForm,
      [name]: value
    });
  };
    const handleNotificationToggle = (setting: keyof typeof notificationSettings) => {
    const updatedSettings = {
      ...notificationSettings,
      [setting]: !notificationSettings[setting]
    };
    setNotificationSettings(updatedSettings);
    localStorage.setItem('vinasana-notification-settings', JSON.stringify(updatedSettings));
  };
    const handleSaveProfile = () => {
    // Update profile using the updateProfile mutation
    updateProfile({
      nickname: profileForm.nickname,
      avatar: profileForm.avatar,
      languageCode: profileForm.languageCode
    });
  };  const handleSaveNotifications = () => {
    // Settings are already saved to localStorage in handleNotificationToggle
    toast({
      title: t("settings.notifications.saveSuccess"),
      description: t("settings.notifications.saveSuccessDescription"),
    });
  };

  const handleThemeChange = (theme: Theme) => {
    updateAppearance({ theme });
  };

  const handleDensityChange = (density: Density) => {
    updateAppearance({ density });
  };

  const handleDefaultViewChange = (defaultView: DefaultView) => {
    updateAppearance({ defaultView });
  };  const handleSaveAppearance = () => {
    toast({
      title: t("settings.appearance.saveSuccess"),
      description: t("settings.appearance.saveSuccessDescription"),
    });
  };

  const handleChangePassword = () => {
    setLocation("/reset-password");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <Sidebar />      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar title={t("navigation.settings")} />
        <div className="flex-1 p-6 overflow-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">            <TabsList className="grid w-full md:w-auto md:inline-flex grid-cols-2 md:grid-cols-none">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="hidden md:inline">{t("settings.profile.title")}</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <BellRing className="h-4 w-4" />
                <span className="hidden md:inline">{t("settings.notifications.title")}</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                <span className="hidden md:inline">{t("settings.security.title")}</span>
              </TabsTrigger>
              <TabsTrigger value="appearance" className="flex items-center gap-2">
                <Moon className="h-4 w-4" />
                <span className="hidden md:inline">{t("settings.appearance.title")}</span>
              </TabsTrigger>
            </TabsList>
              <TabsContent value="profile" className="space-y-6">              <Card>
                <CardHeader>
                  <CardTitle>{t("settings.profile.information")}</CardTitle>
                  <CardDescription>
                    {t("settings.profile.informationDescription")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">                  {isLoadingProfile ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <span className="ml-2">{t("settings.profile.loading")}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex flex-col items-center gap-4">
                        <Avatar className="h-24 w-24">
                          <AvatarImage src={profileForm.avatar} />
                          <AvatarFallback className="text-lg">
                            {getInitials(profileForm.nickname || profileForm.email)}
                          </AvatarFallback>
                        </Avatar>                        <Button variant="outline" size="sm">{t("settings.profile.changeAvatar")}</Button>
                      </div>
                      
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="nickname">{t("settings.profile.nickname")}</Label>
                          <Input 
                            id="nickname" 
                            name="nickname" 
                            value={profileForm.nickname} 
                            onChange={handleProfileChange}
                            placeholder={t("settings.profile.nicknamePlaceholder")} 
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="email">{t("settings.profile.email")}</Label>
                          <Input 
                            id="email" 
                            name="email" 
                            type="email" 
                            value={profileForm.email} 
                            disabled 
                            className="bg-gray-50 dark:bg-gray-800"
                          />
                          <p className="text-sm text-muted-foreground">{t("settings.profile.emailNote")}</p>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="avatar">{t("settings.profile.avatarUrl")}</Label>
                          <Input 
                            id="avatar" 
                            name="avatar" 
                            value={profileForm.avatar} 
                            onChange={handleProfileChange}
                            placeholder={t("settings.profile.avatarPlaceholder")} 
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="languageCode">{t("settings.profile.language")}</Label>
                          <Select 
                            value={profileForm.languageCode} 
                            onValueChange={(value) => setProfileForm({...profileForm, languageCode: value})}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={t("settings.profile.languagePlaceholder")} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="en">{t("languages.english")}</SelectItem>
                              <SelectItem value="es">{t("languages.spanish")}</SelectItem>
                              <SelectItem value="fr">{t("languages.french")}</SelectItem>
                              <SelectItem value="de">{t("languages.german")}</SelectItem>
                              <SelectItem value="it">{t("languages.italian")}</SelectItem>
                              <SelectItem value="pt">{t("languages.portuguese")}</SelectItem>
                              <SelectItem value="ja">{t("languages.japanese")}</SelectItem>
                              <SelectItem value="ko">{t("languages.korean")}</SelectItem>
                              <SelectItem value="zh">{t("languages.chinese")}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button 
                    onClick={handleSaveProfile} 
                    disabled={isUpdatingProfile || isLoadingProfile}
                  >                    {isUpdatingProfile ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        {t("common.saving")}
                      </>
                    ) : (
                      t("common.saveChanges")
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
              <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t("settings.notifications.preferences")}</CardTitle>
                  <CardDescription>
                    {t("settings.notifications.preferencesDescription")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">{t("settings.notifications.emailNotifications")}</Label>
                        <p className="text-sm text-muted-foreground">
                          {t("settings.notifications.emailNotificationsDescription")}
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
                        {t("settings.notifications.taskNotifications")}
                      </h3>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="taskAssignments" className="flex-1">{t("settings.notifications.taskAssignments")}</Label>
                          <Switch 
                            id="taskAssignments"
                            checked={notificationSettings.taskAssignments}
                            onCheckedChange={() => handleNotificationToggle("taskAssignments")}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <Label htmlFor="taskUpdates" className="flex-1">{t("settings.notifications.taskUpdates")}</Label>
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
                        {t("settings.notifications.projectNotifications")}
                      </h3>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="projectUpdates" className="flex-1">{t("settings.notifications.projectUpdates")}</Label>
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
                        {t("settings.notifications.teamCommunications")}
                      </h3>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="teamMessages" className="flex-1">{t("settings.notifications.teamMessages")}</Label>
                          <Switch 
                            id="teamMessages"
                            checked={notificationSettings.teamMessages}
                            onCheckedChange={() => handleNotificationToggle("teamMessages")}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <Label htmlFor="weeklyDigest" className="flex-1">{t("settings.notifications.weeklyDigest")}</Label>
                          <Switch 
                            id="weeklyDigest"
                            checked={notificationSettings.weeklyDigest}
                            onCheckedChange={() => handleNotificationToggle("weeklyDigest")}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>                <CardFooter className="flex justify-end">
                  <Button onClick={handleSaveNotifications}>{t("common.savePreferences")}</Button>
                </CardFooter>
              </Card>
            </TabsContent>
              <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t("settings.security.securitySettings")}</CardTitle>
                  <CardDescription>
                    {t("settings.security.securitySettingsDescription")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    {/* Two-factor authentication would be implemented here */}
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">{t("settings.security.twoFactorAuth")}</Label>
                        <p className="text-sm text-muted-foreground">
                          {t("settings.security.twoFactorAuthDescription")}
                        </p>
                      </div>
                      <Button variant="outline">{t("settings.security.setUp")}</Button>
                    </div>
                      <div className="border-t pt-4">
                      <h3 className="font-medium mb-3">{t("settings.security.password")}</h3>
                      <Button variant="outline" onClick={handleChangePassword}>
                        {t("settings.security.changePassword")}
                      </Button>
                    </div>
                    
                    <div className="border-t pt-4">
                      <h3 className="font-medium mb-3">{t("settings.security.loginSessions")}</h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                          <div>
                            <p className="font-medium">{t("settings.security.currentSession")}</p>
                            <p className="text-sm text-gray-500">{t("settings.security.lastActive")}</p>
                          </div>
                          <Button variant="ghost" size="sm">{t("settings.security.current")}</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>              <TabsContent value="appearance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t("settings.appearance.title")}</CardTitle>
                  <CardDescription>
                    {t("settings.appearance.description")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>{t("settings.appearance.theme")}</Label>
                      <div className="grid grid-cols-3 gap-2">
                        <Button 
                          variant={appearanceSettings.theme === "light" ? "default" : "outline"} 
                          className="justify-start"
                          onClick={() => handleThemeChange("light")}
                        >
                          <Sun className="h-4 w-4 mr-2" />
                          {t("settings.appearance.light")}
                        </Button>
                        <Button 
                          variant={appearanceSettings.theme === "dark" ? "default" : "outline"} 
                          className="justify-start"
                          onClick={() => handleThemeChange("dark")}
                        >
                          <Moon className="h-4 w-4 mr-2" />
                          {t("settings.appearance.dark")}
                        </Button>
                        <Button 
                          variant={appearanceSettings.theme === "system" ? "default" : "outline"} 
                          className="justify-start"
                          onClick={() => handleThemeChange("system")}
                        >
                          <Monitor className="h-4 w-4 mr-2" />
                          {t("settings.appearance.system")}
                        </Button>
                      </div>
                      {appearanceSettings.theme === "system" && (
                        <p className="text-sm text-muted-foreground">
                          {t("settings.appearance.currentlyUsing", { theme: getEffectiveTheme() })}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2 border-t pt-4">
                      <Label>{t("settings.appearance.density")}</Label>
                      <Select value={appearanceSettings.density} onValueChange={handleDensityChange}>
                        <SelectTrigger>
                          <SelectValue placeholder={t("settings.appearance.densityPlaceholder")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="compact">{t("settings.appearance.compact")}</SelectItem>
                          <SelectItem value="comfortable">{t("settings.appearance.comfortable")}</SelectItem>
                          <SelectItem value="spacious">{t("settings.appearance.spacious")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2 border-t pt-4">
                      <Label>{t("settings.appearance.defaultView")}</Label>
                      <Select value={appearanceSettings.defaultView} onValueChange={handleDefaultViewChange}>
                        <SelectTrigger>
                          <SelectValue placeholder={t("settings.appearance.defaultViewPlaceholder")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="kanban">{t("settings.appearance.kanban")}</SelectItem>
                          <SelectItem value="gantt">{t("settings.appearance.gantt")}</SelectItem>
                          <SelectItem value="list">{t("settings.appearance.list")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button onClick={handleSaveAppearance}>{t("common.savePreferences")}</Button>
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

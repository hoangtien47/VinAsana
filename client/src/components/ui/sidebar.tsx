import { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  CheckSquare,
  FolderOpen,
  FileText, 
  Users, 
  BarChart2, 
  Settings, 
  ChevronRight,
  Menu,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/hooks/use-i18n";
import { getInitials } from "@/lib/utils";
import { useAuth0 } from "@auth0/auth0-react"; // Import Auth0 hook


interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [location] = useLocation();
  const { user } = useAuth();
  const { logout } = useAuth0(); // Get logout function from Auth0
  const { t } = useI18n();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleLogout = () => {
    logout({ 
      logoutParams: {
        returnTo: window.location.origin // Redirect to the homepage after logout
      }
    });
  };  const navItems = [
    {
      name: t("navigation.dashboard"),
      path: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      name: t("navigation.projects"),
      path: "/projects",
      icon: <FolderOpen className="h-5 w-5" />,
    },
    {
      name: t("navigation.tasks"),
      path: "/tasks",
      icon: <CheckSquare className="h-5 w-5" />,
    },
    {
      name: t("navigation.documents"),
      path: "/documents",
      icon: <FileText className="h-5 w-5" />,
    },
    {
      name: t("navigation.team"),
      path: "/team",
      icon: <Users className="h-5 w-5" />,
    },
    {
      name: t("navigation.analytics"),
      path: "/analytics",
      icon: <BarChart2 className="h-5 w-5" />,
    },
    {
      name: t("navigation.settings"),
      path: "/settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  const toggleMobileSidebar = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden absolute top-4 left-4 z-50">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleMobileSidebar}
          className="text-gray-500 hover:text-gray-700"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </div>

      {/* Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed lg:sticky top-0 z-50 flex h-screen flex-col border-r bg-white dark:bg-gray-950 dark:border-gray-800 transition-all lg:translate-x-0 w-64",
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
          className
        )}
      >
        <div className="flex h-14 items-center px-4 border-b dark:border-gray-800">
          <Link to="/" className="flex items-center font-bold text-xl text-primary">
            ProManage
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMobileSidebar}
            className="ml-auto lg:hidden"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>        <div className="flex-1 overflow-auto py-2">
          <nav className="grid gap-1 px-2">
            {navItems.map((item, index) => (
              <Link key={index} to={item.path}>
                <div
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 sidebar-item",
                    location === item.path &&
                      "bg-gray-100 text-primary dark:bg-gray-800"
                  )}
                >
                  {item.icon}
                  <span>{item.name}</span>
                  <ChevronRight
                    className={cn(
                      "ml-auto h-4 w-4 text-gray-500",
                      location === item.path && "text-primary"
                    )}
                  />
                </div>
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-auto border-t p-4 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={user?.profileImageUrl} alt={user?.firstName || "User"} />
              <AvatarFallback>
                {getInitials(user?.firstName && user?.lastName 
                  ? `${user.firstName} ${user.lastName}` 
                  : user?.email || "User")}
              </AvatarFallback>
            </Avatar>
            <div className="text-sm">
              <div className="font-medium">
                {user?.firstName && user?.lastName 
                  ? `${user.firstName} ${user.lastName}` 
                  : user?.email}
              </div>
            <button 
              onClick={handleLogout}
              className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              Logout
            </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

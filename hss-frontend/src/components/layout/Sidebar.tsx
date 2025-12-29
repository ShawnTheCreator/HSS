
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  Calendar, 
  ClipboardCheck, 
  LayoutDashboard, 
  LogOut, 
  Menu, 
  Settings, 
  Users, 
  Bell, 
  FileText,
  ChevronLeft
} from "lucide-react";
import { authApi } from "@/lib/api";

type SidebarLink = {
  label: string;
  href: string;
  icon: React.ReactNode;
};

const adminLinks: SidebarLink[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    label: "Staff Directory",
    href: "/staff",
    icon: <Users className="h-5 w-5" />,
  },
  {
    label: "Scheduling",
    href: "/scheduling",
    icon: <Calendar className="h-5 w-5" />,
  },
  {
    label: "Compliance",
    href: "/compliance",
    icon: <ClipboardCheck className="h-5 w-5" />,
  },
  {
    label: "Notifications",
    href: "/notifications",
    icon: <Bell className="h-5 w-5" />,
  },
  {
    label: "Reports",
    href: "/reports",
    icon: <FileText className="h-5 w-5" />,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: <Settings className="h-5 w-5" />,
  },
];

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  
  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div 
      className={cn(
        "h-screen bg-sidebar flex flex-col transition-all duration-300 border-r border-sidebar-border",
        collapsed ? "w-[80px]" : "w-[250px]"
      )}
    >
      <div className="flex items-center justify-between px-4 h-16">
        {!collapsed && (
          <Link to="/" className="text-sidebar-foreground font-bold text-xl">
            <span className="text-hss-purple-vivid">HSS</span>
            <span className="ml-1 opacity-80">Secure</span>
          </Link>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleSidebar} 
          className="text-sidebar-foreground"
        >
          {collapsed ? <Menu className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </Button>
      </div>
      
      <div className="flex-1 py-6 space-y-1 overflow-y-auto scrollbar-thin">
        {adminLinks.map((link) => (
          <Link
            key={link.href}
            to={link.href}
            className={cn(
              "flex items-center py-3 px-4 text-sidebar-foreground hover:bg-sidebar-accent mx-2 rounded-md transition-colors group",
              location.pathname === link.href && "bg-sidebar-accent text-primary"
            )}
          >
            <div className={cn(
              "flex items-center",
              location.pathname === link.href && "text-hss-purple-vivid"
            )}>
              {link.icon}
            </div>
            {!collapsed && (
              <span className="ml-3 text-sm font-medium">{link.label}</span>
            )}
          </Link>
        ))}
      </div>
      
      <div className="p-4 border-t border-sidebar-border">
        <Button
  variant="ghost"
  className={cn(
    "w-full flex items-center justify-start px-4 py-2 text-sidebar-foreground hover:bg-sidebar-accent",
    collapsed && "justify-center"
  )}
  onClick={async () => {
    try {
      await authApi.logout();
      window.location.href = '/login';
    } catch (err) {
      console.error('Logout error:', err);
    }
  }}
>
  <LogOut className="h-5 w-5" />
  {!collapsed && <span className="ml-3 text-sm font-medium">Logout</span>}
</Button>
      </div>
    </div>
  );
};

export default Sidebar;

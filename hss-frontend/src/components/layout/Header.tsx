
import { useState } from "react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, User, LogOut, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Header = () => {
  const [notifications, setNotifications] = useState(3);

  return (
    <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-background">
      <div className="flex items-center gap-4">
        <div className="md:hidden">
          <Link to="/" className="text-foreground font-bold text-xl">
            <span className="text-hss-purple-vivid">HSS</span>
            <span className="opacity-80">Secure</span>
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {notifications > 0 && (
                <Badge 
                  className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center bg-hss-purple-vivid text-xs animate-pulse-glow"
                >
                  {notifications}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-[300px] overflow-y-auto">
              <DropdownMenuItem className="p-3 cursor-pointer">
                <div className="flex flex-col gap-1">
                  <div className="font-medium">Shift Update</div>
                  <div className="text-sm text-muted-foreground">Your shift on Friday has been updated to 9AM-5PM</div>
                  <div className="text-xs text-muted-foreground">1 hour ago</div>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem className="p-3 cursor-pointer">
                <div className="flex flex-col gap-1">
                  <div className="font-medium">Compliance Alert</div>
                  <div className="text-sm text-muted-foreground">Your CPR certification expires in 14 days</div>
                  <div className="text-xs text-muted-foreground">3 hours ago</div>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem className="p-3 cursor-pointer">
                <div className="flex flex-col gap-1">
                  <div className="font-medium">New Staff Member</div>
                  <div className="text-sm text-muted-foreground">Dr. Sarah Johnson has joined the Neurology department</div>
                  <div className="text-xs text-muted-foreground">1 day ago</div>
                </div>
              </DropdownMenuItem>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/notifications" className="cursor-pointer flex justify-center font-medium text-hss-purple-vivid">
                View all notifications
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative pl-2 pr-4 h-10" aria-label="User menu">
              <Avatar className="h-8 w-8 mr-2">
                <AvatarImage src="/placeholder.svg" alt="Admin" />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start text-sm">
                <span className="font-medium">Admin User</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;

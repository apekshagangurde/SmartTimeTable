import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { 
  CalendarIcon, 
  BellIcon, 
  Menu, 
  Settings, 
  User as UserIcon,
  LogOut, 
  ChevronDown 
} from "lucide-react";

interface HeaderProps {
  toggleSidebar: () => void;
}

export default function Header({ toggleSidebar }: HeaderProps) {
  const [notificationCount, setNotificationCount] = useState(3);
  const [userData] = useState({
    name: "Admin",
    initials: "AD",
    role: "Administrator"
  });

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleSidebar} 
            className="lg:hidden text-neutral-dark hover:text-primary"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold text-primary flex items-center">
            <CalendarIcon className="mr-2" />
            <span>Smart Timetable Management</span>
          </h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <BellIcon className="h-5 w-5" />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-secondary text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {notificationCount}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-72 p-0">
              <div className="p-2 border-b">
                <h3 className="text-sm font-medium">Notifications</h3>
              </div>
              <div className="max-h-64 overflow-y-auto">
                <div className="p-3 hover:bg-gray-100 border-b">
                  <p className="text-xs text-neutral-medium">Just now</p>
                  <p className="text-sm">Room change: CS302 moved to IT Lab for today's lecture</p>
                </div>
                <div className="p-3 hover:bg-gray-100 border-b">
                  <p className="text-xs text-neutral-medium">2 hours ago</p>
                  <p className="text-sm">Prof. Johnson marked as "Upset" for today's lectures</p>
                </div>
                <div className="p-3 hover:bg-gray-100">
                  <p className="text-xs text-neutral-medium">Yesterday</p>
                  <p className="text-sm">New timetable published for CSE Division B</p>
                </div>
              </div>
              <div className="p-2 text-center border-t">
                <Button variant="link" className="text-primary text-sm">View all notifications</Button>
              </div>
            </PopoverContent>
          </Popover>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2">
                <Avatar className="h-8 w-8 bg-primary">
                  <AvatarFallback>{userData.initials}</AvatarFallback>
                </Avatar>
                <span className="hidden md:inline">{userData.name}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-48 p-0">
              <div className="py-1">
                <Button variant="ghost" className="w-full justify-start text-sm px-4 py-2">
                  <UserIcon className="mr-2 h-4 w-4" />
                  My Profile
                </Button>
                <Button variant="ghost" className="w-full justify-start text-sm px-4 py-2">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Button>
                <div className="border-t my-1"></div>
                <Button variant="ghost" className="w-full justify-start text-sm px-4 py-2 text-red-500">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </header>
  );
}

import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  Home, 
  CalendarDays,
  Users, 
  DoorOpen, 
  Building, 
  GitCompareArrows, 
  History,
  Bell, 
  BarChart2, 
  Weight, 
  PieChart 
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
}

export default function Sidebar({ isOpen }: SidebarProps) {
  const [location] = useLocation();

  const navItems = [
    {
      section: "Main",
      items: [
        { name: "Dashboard", icon: <Home className="w-5 h-5" />, path: "/" },
        { name: "Timetables", icon: <CalendarDays className="w-5 h-5" />, path: "/timetables" },
        { name: "Teachers", icon: <Users className="w-5 h-5" />, path: "/teachers" },
        { name: "Classrooms", icon: <DoorOpen className="w-5 h-5" />, path: "/classrooms" },
        { name: "Departments", icon: <Building className="w-5 h-5" />, path: "/departments" },
      ]
    },
    {
      section: "Management",
      items: [
        { name: "Substitutions", icon: <GitCompareArrows className="w-5 h-5" />, path: "/substitutions" },
        { name: "Change History", icon: <History className="w-5 h-5" />, path: "/history" },
        { name: "Notifications", icon: <Bell className="w-5 h-5" />, path: "/notifications" },
      ]
    },
    {
      section: "Reports",
      items: [
        { name: "Analytics", icon: <BarChart2 className="w-5 h-5" />, path: "/analytics" },
        { name: "Teacher Workload", icon: <Weight className="w-5 h-5" />, path: "/workload" },
        { name: "Room Utilization", icon: <PieChart className="w-5 h-5" />, path: "/utilization" },
      ]
    }
  ];

  const baseClasses = "bg-white shadow-md w-64 flex-shrink-0 overflow-y-auto transition-all duration-300 ease-in-out";
  const mobileClasses = !isOpen ? "hidden" : "fixed inset-0 z-30 w-64 lg:relative lg:inset-auto";

  return (
    <aside className={cn(baseClasses, mobileClasses, "lg:block")}>
      <nav className="px-4 py-4">
        {navItems.map((section) => (
          <div key={section.section} className="mb-6">
            <h5 className="text-xs uppercase text-neutral-medium font-bold tracking-wider mb-3">
              {section.section}
            </h5>
            <ul className="space-y-1">
              {section.items.map((item) => {
                const isActive = location === item.path;
                return (
                  <li key={item.name}>
                    <Link href={item.path}>
                      <a
                        className={cn(
                          "flex items-center px-2 py-2 rounded-md",
                          isActive
                            ? "text-primary bg-primary/10"
                            : "text-neutral-dark hover:bg-neutral-lightest"
                        )}
                      >
                        <span className="w-5 text-center mr-2">{item.icon}</span>
                        <span>{item.name}</span>
                      </a>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}

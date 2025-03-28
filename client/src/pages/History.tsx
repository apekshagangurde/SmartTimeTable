import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { History, ArrowUpDown, Clock } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function ChangeHistory() {
  // Sample history data - would come from the backend in a real app
  const recentChanges = [
    { id: 1, date: "Mar 28, 2025, 10:23 AM", user: "Admin", action: "Added new slot", details: "Data Structures class on Monday at 11:00 AM" },
    { id: 2, date: "Mar 28, 2025, 9:45 AM", user: "Admin", action: "Updated classroom", details: "Moved Algorithms class to CS Lab 304" },
    { id: 3, date: "Mar 27, 2025, 3:12 PM", user: "Admin", action: "Assigned substitute", details: "Prof. Williams for Dr. Chen on Thursday" },
    { id: 4, date: "Mar 27, 2025, 1:30 PM", user: "Admin", action: "Created timetable", details: "Summer semester 2025 for CSE Division B" },
    { id: 5, date: "Mar 26, 2025, 11:15 AM", user: "Admin", action: "Deleted slot", details: "Operating Systems on Wednesday at 2:00 PM" },
    { id: 6, date: "Mar 26, 2025, 10:00 AM", user: "Admin", action: "Created department", details: "Electrical Engineering department" },
    { id: 7, date: "Mar 25, 2025, 4:45 PM", user: "Admin", action: "Added teacher", details: "Dr. Martinez joined Computer Science" },
    { id: 8, date: "Mar 25, 2025, 2:30 PM", user: "Admin", action: "Modified timetable", details: "Adjusted lunch break for all classes" },
  ];
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Change History</h1>
        <Button variant="outline">
          <ArrowUpDown className="mr-2 h-4 w-4" />
          Filter Changes
        </Button>
      </div>
      
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Changes</CardTitle>
            <History className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              Changes made on Mar 28, 2025
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              Total changes in the past 7 days
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Active User</CardTitle>
            <History className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Admin</div>
            <p className="text-xs text-muted-foreground">
              Made 8 changes in the past week
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>Activity Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="recent">
            <TabsList className="mb-4">
              <TabsTrigger value="recent">Recent Changes</TabsTrigger>
              <TabsTrigger value="teachers">Teacher Changes</TabsTrigger>
              <TabsTrigger value="timetables">Timetable Changes</TabsTrigger>
            </TabsList>
            
            <TabsContent value="recent" className="space-y-4">
              <ScrollArea className="h-[400px] rounded-md border p-4">
                <div className="relative">
                  <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                  
                  {recentChanges.map(change => (
                    <div key={change.id} className="relative pl-6 pb-6">
                      <div className="absolute left-0 top-2 w-2.5 h-2.5 rounded-full bg-primary"></div>
                      <div className="mb-1 text-sm text-muted-foreground">{change.date}</div>
                      <div className="font-medium">{change.action}</div>
                      <div className="text-sm">{change.details}</div>
                      <div className="text-xs text-muted-foreground mt-1">By {change.user}</div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="teachers">
              <div className="p-8 text-center text-muted-foreground">
                Filter to view only teacher-related changes
              </div>
            </TabsContent>
            
            <TabsContent value="timetables">
              <div className="p-8 text-center text-muted-foreground">
                Filter to view only timetable-related changes
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, User, Calendar, AlertTriangle, Check } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useTimetable } from "@/context/TimetableContext";

export default function Notifications() {
  const { conflicts } = useTimetable();
  
  // Sample notifications data - would come from the backend in a real app
  const notifications = [
    { 
      id: 1, 
      type: "conflict", 
      title: "Teacher Schedule Conflict", 
      message: "Dr. Chen is scheduled for two classes at the same time on Monday.", 
      date: "28 Mar 2025", 
      read: false 
    },
    { 
      id: 2, 
      type: "update", 
      title: "Timetable Updated", 
      message: "The timetable for CSE Division A has been updated for the Summer semester.", 
      date: "27 Mar 2025", 
      read: true 
    },
    { 
      id: 3, 
      type: "teacher", 
      title: "Teacher Availability", 
      message: "Prof. Williams has marked unavailability for Thursday afternoons.", 
      date: "26 Mar 2025", 
      read: true 
    },
    { 
      id: 4, 
      type: "conflict", 
      title: "Classroom Double Booking", 
      message: "CS Lab 302 has two classes scheduled at the same time on Tuesday.", 
      date: "26 Mar 2025", 
      read: false 
    },
    { 
      id: 5, 
      type: "update", 
      title: "New Department Added", 
      message: "Electrical Engineering department has been added to the system.", 
      date: "25 Mar 2025", 
      read: true 
    },
  ];

  // Combine app conflicts with notifications
  const conflictNotifications = conflicts.map(conflict => ({
    id: `conflict-${conflict.id}`,
    type: "conflict",
    title: conflict.type === "TeacherClash" ? "Teacher Schedule Conflict" : 
           conflict.type === "RoomConflict" ? "Classroom Double Booking" : "Time Allocation Issue",
    message: conflict.description,
    date: "Today",
    read: false
  }));

  const allNotifications = [...conflictNotifications, ...notifications];
  const unreadCount = allNotifications.filter(n => !n.read).length;
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
        <Button variant="outline">
          <Check className="mr-2 h-4 w-4" />
          Mark All as Read
        </Button>
      </div>
      
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread Notifications</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unreadCount}</div>
            <p className="text-xs text-muted-foreground">
              Requiring your attention
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conflict Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conflicts.length}</div>
            <p className="text-xs text-muted-foreground">
              Active timetable conflicts
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notification Preferences</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Switch id="email-notif" />
              <Label htmlFor="email-notif">Email Notifications</Label>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>All Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="conflicts">Conflicts</TabsTrigger>
              <TabsTrigger value="updates">System Updates</TabsTrigger>
              <TabsTrigger value="teachers">Teacher Related</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-4">
              {allNotifications.length > 0 ? (
                allNotifications.map(notification => (
                  <div key={notification.id} className={`p-4 border rounded-lg ${!notification.read ? 'bg-primary/5 border-primary/20' : ''}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {notification.type === 'conflict' && <AlertTriangle className="h-5 w-5 text-red-500" />}
                        {notification.type === 'update' && <Calendar className="h-5 w-5 text-blue-500" />}
                        {notification.type === 'teacher' && <User className="h-5 w-5 text-green-500" />}
                        <div>
                          <h4 className="font-medium">{notification.title}</h4>
                          <p className="text-sm text-muted-foreground">{notification.message}</p>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">{notification.date}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  No notifications found
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="conflicts">
              <div className="space-y-4">
                {conflictNotifications.length > 0 ? (
                  conflictNotifications.map(notification => (
                    <div key={notification.id} className="p-4 border rounded-lg bg-primary/5 border-primary/20">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <AlertTriangle className="h-5 w-5 text-red-500" />
                          <div>
                            <h4 className="font-medium">{notification.title}</h4>
                            <p className="text-sm text-muted-foreground">{notification.message}</p>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">{notification.date}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    No conflict notifications found
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="updates">
              <div className="p-8 text-center text-muted-foreground">
                Filter to view only system update notifications
              </div>
            </TabsContent>
            
            <TabsContent value="teachers">
              <div className="p-8 text-center text-muted-foreground">
                Filter to view only teacher-related notifications
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
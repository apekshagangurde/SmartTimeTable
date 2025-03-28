import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { PieChart, PieChartIcon, BarChart2, Download } from "lucide-react";
import { useTimetable } from "@/context/TimetableContext";

export default function RoomUtilization() {
  const { classrooms, slots } = useTimetable();
  
  // Time range constants in minutes (assuming 8AM to 5PM daily)
  const MINUTES_IN_DAY = 9 * 60; // 9 hours of potential classroom use per day
  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  
  // Calculate room utilization
  const calculateRoomUtilization = (classroomId: number) => {
    const roomSlots = slots.filter(slot => slot.classroomId === classroomId);
    
    // Count total minutes used
    let totalMinutesUsed = 0;
    
    roomSlots.forEach(slot => {
      // Calculate duration in minutes
      const startParts = slot.startTime.split(':');
      const endParts = slot.endTime.split(':');
      
      const startMinutes = parseInt(startParts[0]) * 60 + parseInt(startParts[1]);
      const endMinutes = parseInt(endParts[0]) * 60 + parseInt(endParts[1]);
      
      totalMinutesUsed += endMinutes - startMinutes;
    });
    
    // Calculate utilization percentage
    const totalAvailableMinutes = MINUTES_IN_DAY * DAYS.length;
    const utilizationPercentage = Math.round((totalMinutesUsed / totalAvailableMinutes) * 100);
    
    // Count classes per day
    const classesByDay: Record<string, number> = {};
    roomSlots.forEach(slot => {
      classesByDay[slot.day] = (classesByDay[slot.day] || 0) + 1;
    });
    
    // Find day with most classes
    let busiestDay = "";
    let maxClasses = 0;
    
    for (const [day, count] of Object.entries(classesByDay)) {
      if (count > maxClasses) {
        busiestDay = day;
        maxClasses = count;
      }
    }
    
    // Determine utilization level
    let utilizationLevel = "Low";
    if (utilizationPercentage > 70) utilizationLevel = "High";
    else if (utilizationPercentage > 40) utilizationLevel = "Medium";
    
    return {
      classroomId,
      totalMinutesUsed,
      utilizationPercentage,
      utilizationLevel,
      classesByDay,
      busiestDay,
      maxClassesInDay: maxClasses
    };
  };
  
  const roomUtilizations = classrooms.map(classroom => ({
    classroom,
    ...calculateRoomUtilization(classroom.id)
  })).sort((a, b) => b.utilizationPercentage - a.utilizationPercentage);
  
  // Calculate average stats
  const averageUtilization = roomUtilizations.reduce((sum, ru) => sum + ru.utilizationPercentage, 0) / 
                             (roomUtilizations.length || 1);
  
  const underutilizedRooms = roomUtilizations.filter(ru => ru.utilizationLevel === "Low").length;
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Room Utilization</h1>
        <div className="flex gap-2">
          <Button variant="outline">
            <BarChart2 className="mr-2 h-4 w-4" />
            Detailed View
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Utilization</CardTitle>
            <PieChartIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageUtilization.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Of available classroom time
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Underutilized Rooms</CardTitle>
            <PieChartIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{underutilizedRooms}</div>
            <p className="text-xs text-muted-foreground">
              Rooms with utilization below 40%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Utilized Room</CardTitle>
            <PieChartIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {roomUtilizations.length > 0 ? `Room ${roomUtilizations[0].classroom.id}` : "None"}
            </div>
            <p className="text-xs text-muted-foreground">
              {roomUtilizations.length > 0 ? `${roomUtilizations[0].utilizationPercentage}% utilization` : "No data available"}
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>Classroom Utilization Analysis</CardTitle>
          <CardDescription>
            Detailed breakdown of classroom usage across the week
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Classroom</TableHead>
                <TableHead>Utilization</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Busiest Day</TableHead>
                <TableHead>Weekly Classes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roomUtilizations.map(({ classroom, utilizationPercentage, utilizationLevel, busiestDay, maxClassesInDay }) => (
                <TableRow key={classroom.id}>
                  <TableCell className="font-medium">Room {classroom.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span>{utilizationPercentage}%</span>
                      <Progress value={utilizationPercentage} className="h-2 w-24" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={utilizationLevel === "High" ? "default" : 
                              utilizationLevel === "Medium" ? "secondary" : "outline"}
                    >
                      {utilizationLevel}
                    </Badge>
                  </TableCell>
                  <TableCell>{busiestDay} ({maxClassesInDay} classes)</TableCell>
                  <TableCell>
                    {slots.filter(slot => slot.classroomId === classroom.id).length}
                  </TableCell>
                </TableRow>
              ))}
              {roomUtilizations.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                    No classroom data available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
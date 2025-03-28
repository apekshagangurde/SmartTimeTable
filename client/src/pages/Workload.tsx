import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Weight, Download, BarChart2 } from "lucide-react";
import { useTimetable } from "@/context/TimetableContext";

export default function TeacherWorkload() {
  const { teachers, slots } = useTimetable();
  
  // Calculate teacher workload
  const calculateTeacherWorkload = (teacherId: number) => {
    const teacherSlots = slots.filter(slot => slot.teacherId === teacherId);
    
    // Count classes per day
    const classesByDay: Record<string, number> = {};
    teacherSlots.forEach(slot => {
      classesByDay[slot.day] = (classesByDay[slot.day] || 0) + 1;
    });
    
    // Calculate total teaching hours (assuming each slot is 1 hour)
    const totalHours = teacherSlots.length;
    
    // Determine workload level based on total hours
    let workloadLevel = "Low";
    if (totalHours > 15) workloadLevel = "High";
    else if (totalHours > 10) workloadLevel = "Medium";
    
    // Calculate workload percentage for progress bar (assuming 20 hours is 100%)
    const workloadPercentage = Math.min(Math.round((totalHours / 20) * 100), 100);
    
    // Find day with most classes
    let busiestDay = "";
    let maxClasses = 0;
    
    for (const [day, count] of Object.entries(classesByDay)) {
      if (count > maxClasses) {
        busiestDay = day;
        maxClasses = count;
      }
    }
    
    return {
      teacherId,
      totalHours,
      workloadLevel,
      workloadPercentage,
      classesByDay,
      busiestDay,
      maxClassesInDay: maxClasses
    };
  };
  
  const teacherWorkloads = teachers.map(teacher => ({
    teacher,
    ...calculateTeacherWorkload(teacher.id)
  })).sort((a, b) => b.totalHours - a.totalHours);
  
  // Calculate average stats
  const averageHours = teacherWorkloads.reduce((sum, tw) => sum + tw.totalHours, 0) / 
                      (teacherWorkloads.length || 1);
  
  const highWorkloadCount = teacherWorkloads.filter(tw => tw.workloadLevel === "High").length;
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Teacher Workload</h1>
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
            <CardTitle className="text-sm font-medium">Average Teaching Hours</CardTitle>
            <Weight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageHours.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              Hours per teacher per week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Workload Teachers</CardTitle>
            <Weight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{highWorkloadCount}</div>
            <p className="text-xs text-muted-foreground">
              Teachers with heavy schedules
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Busiest Day</CardTitle>
            <Weight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {teacherWorkloads.length > 0
                ? Object.entries(teacherWorkloads.reduce((acc, tw) => {
                    acc[tw.busiestDay] = (acc[tw.busiestDay] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>))
                    .sort((a, b) => b[1] - a[1])
                    .map(([day]) => day)[0] || "Monday"
                : "Monday"
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Most teachers are busiest on this day
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>Teacher Workload Analysis</CardTitle>
          <CardDescription>
            Detailed breakdown of teaching hours and schedule balance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Teacher</TableHead>
                <TableHead>Weekly Hours</TableHead>
                <TableHead>Workload Level</TableHead>
                <TableHead>Busiest Day</TableHead>
                <TableHead>Schedule Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teacherWorkloads.map(({ teacher, totalHours, workloadLevel, workloadPercentage, busiestDay, maxClassesInDay }) => (
                <TableRow key={teacher.id}>
                  <TableCell className="font-medium">Teacher {teacher.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span>{totalHours}</span>
                      <Progress value={workloadPercentage} className="h-2 w-20" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={workloadLevel === "High" ? "destructive" : 
                              workloadLevel === "Medium" ? "default" : "outline"}
                    >
                      {workloadLevel}
                    </Badge>
                  </TableCell>
                  <TableCell>{busiestDay} ({maxClassesInDay} classes)</TableCell>
                  <TableCell>
                    {maxClassesInDay > 3 ? 
                      <span className="text-red-500">Unbalanced</span> : 
                      <span className="text-green-500">Balanced</span>
                    }
                  </TableCell>
                </TableRow>
              ))}
              {teacherWorkloads.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                    No teacher data available
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
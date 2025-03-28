import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useTimetable } from "@/context/TimetableContext";

export default function Analytics() {
  const { slots, teachers, classrooms, subjects } = useTimetable();

  // Calculate data for charts
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  
  // Classes per day
  const classesPerDay = daysOfWeek.map(day => ({
    day,
    classes: slots.filter(slot => slot.day === day).length
  }));
  
  // Teacher workload data (simple calculation for demo)
  const teacherWorkload = teachers.map(teacher => {
    const teacherSlots = slots.filter(slot => slot.teacherId === teacher.id);
    return {
      name: `Teacher ${teacher.id}`,
      hours: teacherSlots.length * 1.5, // Assuming each slot is 1.5 hours
      slots: teacherSlots.length
    };
  }).sort((a, b) => b.hours - a.hours).slice(0, 5); // Top 5 teachers
  
  // Classroom utilization
  const classroomData = classrooms.map(classroom => {
    const total = daysOfWeek.length * 8; // Assuming 8 potential slots per day
    const used = slots.filter(slot => slot.classroomId === classroom.id).length;
    const utilizationRate = Math.round((used / total) * 100);
    
    return {
      name: `Room ${classroom.id}`,
      value: utilizationRate
    };
  });
  
  // Subject distribution
  const subjectData = subjects.map(subject => {
    const count = slots.filter(slot => slot.subjectId === subject.id).length;
    return {
      name: `Subject ${subject.id}`,
      value: count
    };
  });
  
  // Colors for pie charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
        <div className="text-sm text-muted-foreground">
          Last updated: March 28, 2025
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{slots.length}</div>
            <p className="text-xs text-muted-foreground">
              Across all timetables
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Teachers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teachers.length}</div>
            <p className="text-xs text-muted-foreground">
              Active in timetables
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Classrooms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{classrooms.length}</div>
            <p className="text-xs text-muted-foreground">
              Being utilized
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {slots.length > 0 ? 
                Math.round((slots.length / (classrooms.length * daysOfWeek.length * 8)) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Of available time slots
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Timetable Analytics</CardTitle>
          <CardDescription>
            Visualize and analyze your timetable data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="classes">
            <TabsList className="mb-4">
              <TabsTrigger value="classes">Classes per Day</TabsTrigger>
              <TabsTrigger value="teachers">Teacher Workload</TabsTrigger>
              <TabsTrigger value="classrooms">Classroom Utilization</TabsTrigger>
              <TabsTrigger value="subjects">Subject Distribution</TabsTrigger>
            </TabsList>
            
            <TabsContent value="classes">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={classesPerDay} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="classes" fill="#8884d8" name="Classes" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
            
            <TabsContent value="teachers">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={teacherWorkload} layout="vertical" margin={{ top: 20, right: 30, left: 100, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" />
                    <Tooltip />
                    <Bar dataKey="hours" fill="#82ca9d" name="Teaching Hours" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
            
            <TabsContent value="classrooms">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={classroomData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {classroomData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
            
            <TabsContent value="subjects">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={subjectData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {subjectData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
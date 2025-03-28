import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { GitCompareArrows, Calendar, UserCheck } from "lucide-react";
import { useTimetable } from "@/context/TimetableContext";

export default function Substitutions() {
  const { slots, teachers } = useTimetable();
  
  // Filter slots that have substitutions
  const substitutionSlots = slots.filter(slot => slot.isSubstitution);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Substitute Teachers</h1>
        <Button>
          <GitCompareArrows className="mr-2 h-4 w-4" />
          Assign New Substitute
        </Button>
      </div>
      
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Substitutions</CardTitle>
            <GitCompareArrows className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{substitutionSlots.length}</div>
            <p className="text-xs text-muted-foreground">
              Currently active substitute arrangements
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Schedule Changes</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">
              Changes planned for next week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Teachers</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teachers.filter(t => !t.isUpset).length}</div>
            <p className="text-xs text-muted-foreground">
              Teachers available for substitution
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Recent Substitutions</CardTitle>
          <CardDescription>
            Overview of all current and recently completed substitution arrangements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Original Teacher</TableHead>
                <TableHead>Substitute Teacher</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {substitutionSlots.length > 0 ? (
                substitutionSlots.map((slot) => (
                  <TableRow key={slot.id}>
                    <TableCell>{slot.day}</TableCell>
                    <TableCell>{slot.subjectId}</TableCell>
                    <TableCell>{slot.originalTeacherId}</TableCell>
                    <TableCell>{slot.teacherId}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                        Active
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                    No substitution records found
                  </TableCell>
                </TableRow>
              )}
              <TableRow>
                <TableCell>Friday, Mar 29</TableCell>
                <TableCell>Web Development</TableCell>
                <TableCell>Prof. Jenkins</TableCell>
                <TableCell>Dr. Martinez</TableCell>
                <TableCell>
                  <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                    Scheduled
                  </span>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Thursday, Mar 28</TableCell>
                <TableCell>Algorithms</TableCell>
                <TableCell>Dr. Chen</TableCell>
                <TableCell>Prof. Williams</TableCell>
                <TableCell>
                  <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                    Completed
                  </span>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
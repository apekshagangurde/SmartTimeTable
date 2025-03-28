import { useState } from "react";
import { useTimetable } from "@/context/TimetableContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  PlusCircle, 
  Search, 
  CheckCircle, 
  Calendar, 
  Edit, 
  Trash,
  XCircle,
  UserPlus
} from "lucide-react";
import { Switch } from "@/components/ui/switch";

export default function Teachers() {
  const { teachers, subjects, markTeacherAsUpset } = useTimetable();
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddTeacherDialog, setShowAddTeacherDialog] = useState(false);

  // Filter teachers based on search term
  const filteredTeachers = teachers.filter(
    (teacher) =>
      teacher.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.subjects?.some((subject) =>
        subject.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  const handleSetTeacherUpset = async (teacherId: number, isUpset: boolean) => {
    try {
      await markTeacherAsUpset(teacherId, isUpset);
    } catch (error) {
      console.error("Failed to update teacher status:", error);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Teachers</h1>
        <Button onClick={() => setShowAddTeacherDialog(true)}>
          <UserPlus className="mr-2 h-4 w-4" /> Add New Teacher
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Search Teachers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or subject..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Subjects</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTeachers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                    No teachers found
                  </TableCell>
                </TableRow>
              ) : (
                filteredTeachers.map((teacher) => (
                  <TableRow key={teacher.id}>
                    <TableCell className="font-medium">{teacher.user?.name}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {teacher.subjects?.map((subject) => (
                          <Badge key={subject.id} variant="outline" className="bg-primary/10 text-primary">
                            {subject.name}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {teacher.isUpset ? (
                          <Badge variant="destructive" className="flex items-center">
                            <XCircle className="mr-1 h-3 w-3" /> Upset
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-green-100 text-green-800 flex items-center">
                            <CheckCircle className="mr-1 h-3 w-3" /> Available
                          </Badge>
                        )}
                        <Switch
                          checked={!teacher.isUpset}
                          onCheckedChange={(checked) => handleSetTeacherUpset(teacher.id, !checked)}
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Calendar className="h-4 w-4 mr-1" /> Schedule
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-1" /> Edit
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-500">
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showAddTeacherDialog} onOpenChange={setShowAddTeacherDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Teacher</DialogTitle>
            <DialogDescription>
              Fill in the details to add a new teacher to the system.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" placeholder="Enter teacher's full name" />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" placeholder="Enter email address" />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="subjects">Subjects</Label>
              <select
                id="subjects"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                multiple
              >
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">Hold Ctrl to select multiple subjects</p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddTeacherDialog(false)}>
              Cancel
            </Button>
            <Button>Add Teacher</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

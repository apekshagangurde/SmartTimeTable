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
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  PlusCircle, 
  Search, 
  Users, 
  BookOpen, 
  DoorOpen, 
  Edit, 
  Trash,
  Building
} from "lucide-react";

export default function Departments() {
  const { departments } = useTimetable();
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddDepartmentDialog, setShowAddDepartmentDialog] = useState(false);

  // Mock counts (would come from API in real implementation)
  const getDivisionCount = (departmentId: number) => Math.floor(Math.random() * 5) + 1;
  const getTeacherCount = (departmentId: number) => Math.floor(Math.random() * 20) + 5;
  const getSubjectCount = (departmentId: number) => Math.floor(Math.random() * 15) + 5;
  const getClassroomCount = (departmentId: number) => Math.floor(Math.random() * 10) + 2;

  // Filter departments based on search term
  const filteredDepartments = departments.filter(
    (department) =>
      department.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      department.shortName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Departments</h1>
        <Button onClick={() => setShowAddDepartmentDialog(true)}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Department
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Search Departments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search departments..."
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
                <TableHead>Department Name</TableHead>
                <TableHead>Short Name</TableHead>
                <TableHead>Divisions</TableHead>
                <TableHead>Teachers</TableHead>
                <TableHead>Subjects</TableHead>
                <TableHead>Classrooms</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDepartments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                    No departments found
                  </TableCell>
                </TableRow>
              ) : (
                filteredDepartments.map((department) => (
                  <TableRow key={department.id}>
                    <TableCell className="font-medium">{department.name}</TableCell>
                    <TableCell>{department.shortName}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Users className="text-primary h-4 w-4 mr-1" />
                        <span>{getDivisionCount(department.id)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Users className="text-primary h-4 w-4 mr-1" />
                        <span>{getTeacherCount(department.id)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <BookOpen className="text-primary h-4 w-4 mr-1" />
                        <span>{getSubjectCount(department.id)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <DoorOpen className="text-primary h-4 w-4 mr-1" />
                        <span>{getClassroomCount(department.id)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
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

      <Dialog open={showAddDepartmentDialog} onOpenChange={setShowAddDepartmentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Department</DialogTitle>
            <DialogDescription>
              Fill in the details to add a new department to the system.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="departmentName">Department Name</Label>
              <Input id="departmentName" placeholder="e.g., Computer Science Engineering" />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="shortName">Short Name</Label>
              <Input id="shortName" placeholder="e.g., CSE" />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDepartmentDialog(false)}>
              Cancel
            </Button>
            <Button>Add Department</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

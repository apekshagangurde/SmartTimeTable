import { useState } from "react";
import { useTimetable } from "@/context/TimetableContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
} from "@/components/ui/dialog";
import { 
  PlusCircle, 
  Search, 
  Calendar, 
  Edit, 
  Trash,
  DoorOpen
} from "lucide-react";

export default function Classrooms() {
  const { classrooms, departments, selectedDepartment, setSelectedDepartment } = useTimetable();
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddClassroomDialog, setShowAddClassroomDialog] = useState(false);

  // Filter classrooms based on search term and selected department
  const filteredClassrooms = classrooms.filter(
    (classroom) => 
      (selectedDepartment ? classroom.departmentId === selectedDepartment.id : true) &&
      classroom.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Classrooms</h1>
        <Button onClick={() => setShowAddClassroomDialog(true)}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Classroom
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filter Classrooms</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search classrooms..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="department">Department</Label>
              <Select 
                value={selectedDepartment?.id.toString() || ""} 
                onValueChange={(value) => {
                  const dept = departments.find(d => d.id.toString() === value);
                  if (dept) setSelectedDepartment(dept);
                  else setSelectedDepartment(null);
                }}
              >
                <SelectTrigger id="department">
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id.toString()}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Classroom Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClassrooms.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                    No classrooms found
                  </TableCell>
                </TableRow>
              ) : (
                filteredClassrooms.map((classroom) => (
                  <TableRow key={classroom.id}>
                    <TableCell className="font-medium">{classroom.name}</TableCell>
                    <TableCell>
                      {departments.find(d => d.id === classroom.departmentId)?.name || "Unknown"}
                    </TableCell>
                    <TableCell>{classroom.capacity} seats</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" size="sm">
                          <Calendar className="h-4 w-4 mr-1" /> View Schedule
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

      <Dialog open={showAddClassroomDialog} onOpenChange={setShowAddClassroomDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Classroom</DialogTitle>
            <DialogDescription>
              Fill in the details to add a new classroom to the system.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="classroomName">Classroom Name</Label>
              <Input id="classroomName" placeholder="e.g., CS Lab 302" />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="department">Department</Label>
              <Select value="">
                <SelectTrigger id="department">
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id.toString()}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="capacity">Capacity</Label>
              <Input id="capacity" type="number" placeholder="Enter capacity" min="1" />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddClassroomDialog(false)}>
              Cancel
            </Button>
            <Button>Add Classroom</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

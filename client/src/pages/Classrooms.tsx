import { useState, useEffect } from "react";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  PlusCircle, 
  Search, 
  Calendar, 
  Edit, 
  Trash,
  DoorOpen,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Classrooms() {
  const { classrooms, departments, selectedDepartment, setSelectedDepartment, refetchClassrooms } = useTimetable();
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddClassroomDialog, setShowAddClassroomDialog] = useState(false);
  const [newClassroomName, setNewClassroomName] = useState("");
  const [selectedDeptId, setSelectedDeptId] = useState<string>("default");
  const [capacity, setCapacity] = useState<string>("30");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  // States for classroom deletion
  const [deleting, setDeleting] = useState<number | null>(null);
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);
  const [classroomToDelete, setClassroomToDelete] = useState<{id: number, name: string} | null>(null);
  
  // Make sure we refresh classroom data when component mounts
  useEffect(() => {
    refetchClassrooms();
  }, [refetchClassrooms]);

  // Handle classroom form submission
  const handleAddClassroom = async () => {
    if (!newClassroomName.trim() || selectedDeptId === "default" || !capacity.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const response = await apiRequest(
        "POST", 
        '/firebase-api/classrooms', 
        {
          name: newClassroomName.trim(),
          departmentId: parseInt(selectedDeptId),
          capacity: parseInt(capacity)
        }
      );
      
      if (response) {
        toast({
          title: "Classroom Added",
          description: `${newClassroomName} has been added successfully`
        });
        
        // Reset form
        setNewClassroomName("");
        setSelectedDeptId("default");
        setCapacity("30");
        setShowAddClassroomDialog(false);
        
        // Refresh classrooms list
        await refetchClassrooms();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add classroom. Please try again.",
        variant: "destructive"
      });
      console.error("Failed to add classroom:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle classroom deletion
  const handleDeleteClassroom = async () => {
    if (!classroomToDelete) return;
    
    try {
      setDeleting(classroomToDelete.id);
      
      await apiRequest(
        "DELETE", 
        `/firebase-api/classrooms/${classroomToDelete.id}`
      );
      
      toast({
        title: "Classroom Deleted",
        description: `${classroomToDelete.name} has been deleted successfully`
      });
      
      // Close dialog and reset state
      setShowDeleteConfirmDialog(false);
      setClassroomToDelete(null);
      
      // Refresh classrooms list
      await refetchClassrooms();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete classroom. Please try again.",
        variant: "destructive"
      });
      console.error("Failed to delete classroom:", error);
    } finally {
      setDeleting(null);
    }
  };

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
                value={selectedDepartment?.id.toString() || "all"} 
                onValueChange={(value) => {
                  if (value === "all") {
                    setSelectedDepartment(null);
                  } else {
                    const dept = departments.find(d => d.id.toString() === value);
                    if (dept) setSelectedDepartment(dept);
                  }
                }}
              >
                <SelectTrigger id="department">
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
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
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => toast({
                            title: "Schedule View",
                            description: `Viewing schedule for ${classroom.name}`,
                          })}
                        >
                          <Calendar className="h-4 w-4 mr-1" /> View Schedule
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => toast({
                            title: "Edit Classroom",
                            description: "Classroom edit functionality will be implemented soon.",
                          })}
                        >
                          <Edit className="h-4 w-4 mr-1" /> Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-red-500"
                          onClick={() => {
                            setClassroomToDelete({
                              id: classroom.id,
                              name: classroom.name
                            });
                            setShowDeleteConfirmDialog(true);
                          }}
                          disabled={deleting === classroom.id}
                        >
                          {deleting === classroom.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash className="h-4 w-4" />
                          )}
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
              <Input 
                id="classroomName" 
                placeholder="e.g., CS Lab 302" 
                value={newClassroomName}
                onChange={(e) => setNewClassroomName(e.target.value)}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="department">Department</Label>
              <Select 
                value={selectedDeptId}
                onValueChange={setSelectedDeptId}
              >
                <SelectTrigger id="department">
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default" disabled>Select Department</SelectItem>
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
              <Input 
                id="capacity" 
                type="number" 
                placeholder="Enter capacity" 
                min="1" 
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddClassroomDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddClassroom}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Adding...' : 'Add Classroom'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteConfirmDialog} onOpenChange={setShowDeleteConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Classroom</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {classroomToDelete?.name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => {
                setClassroomToDelete(null);
                setShowDeleteConfirmDialog(false);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteClassroom}
              className="bg-red-500 hover:bg-red-600"
            >
              {deleting === classroomToDelete?.id ? (
                <div className="flex items-center gap-1">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Deleting...
                </div>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

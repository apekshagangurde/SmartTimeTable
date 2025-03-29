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
  Users, 
  BookOpen, 
  DoorOpen, 
  Edit, 
  Trash,
  Building
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Departments() {
  const { departments, refetchDepartments } = useTimetable();
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddDepartmentDialog, setShowAddDepartmentDialog] = useState(false);
  const [newDepartmentName, setNewDepartmentName] = useState("");
  const [newDepartmentShortName, setNewDepartmentShortName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Mock counts (would come from API in real implementation)
  const getDivisionCount = (departmentId: number) => Math.floor(Math.random() * 5) + 1;
  const getTeacherCount = (departmentId: number) => Math.floor(Math.random() * 20) + 5;
  const getSubjectCount = (departmentId: number) => Math.floor(Math.random() * 15) + 5;
  const getClassroomCount = (departmentId: number) => Math.floor(Math.random() * 10) + 2;
  
  // Handle department deletion
  const [deleting, setDeleting] = useState<number | null>(null);
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState<{id: number, name: string} | null>(null);
  
  const handleDeleteDepartment = async () => {
    if (!departmentToDelete) return;
    
    try {
      setDeleting(departmentToDelete.id);
      
      await apiRequest(
        "DELETE", 
        `/firebase-api/departments/${departmentToDelete.id}`
      );
      
      toast({
        title: "Department Deleted",
        description: `${departmentToDelete.name} has been deleted successfully`
      });
      
      // Close dialog and reset state
      setShowDeleteConfirmDialog(false);
      setDepartmentToDelete(null);
      
      // Refresh departments list
      if (refetchDepartments) {
        refetchDepartments();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete department. Please try again.",
        variant: "destructive"
      });
      console.error("Failed to delete department:", error);
    } finally {
      setDeleting(null);
    }
  };
  
  const handleAddDepartment = async () => {
    if (!newDepartmentName.trim() || !newDepartmentShortName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both department name and short name",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const response = await apiRequest(
        "POST", 
        '/firebase-api/departments', 
        {
          name: newDepartmentName.trim(),
          shortName: newDepartmentShortName.trim()
        }
      );
      
      if (response) {
        toast({
          title: "Department Added",
          description: `${newDepartmentName} has been added successfully`
        });
        
        // Reset form
        setNewDepartmentName("");
        setNewDepartmentShortName("");
        setShowAddDepartmentDialog(false);
        
        // Refresh departments list
        if (refetchDepartments) {
          refetchDepartments();
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add department. Please try again.",
        variant: "destructive"
      });
      console.error("Failed to add department:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

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
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-red-500"
                          onClick={() => {
                            setDepartmentToDelete({ id: department.id, name: department.name });
                            setShowDeleteConfirmDialog(true);
                          }}
                        >
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
              <Input 
                id="departmentName" 
                placeholder="e.g., Computer Science Engineering" 
                value={newDepartmentName}
                onChange={(e) => setNewDepartmentName(e.target.value)}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="shortName">Short Name</Label>
              <Input 
                id="shortName" 
                placeholder="e.g., CSE" 
                value={newDepartmentShortName}
                onChange={(e) => setNewDepartmentShortName(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDepartmentDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddDepartment}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Adding...' : 'Add Department'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirmDialog} onOpenChange={setShowDeleteConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete the department "{departmentToDelete?.name}".
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDepartmentToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteDepartment}
              className="bg-red-500 hover:bg-red-600"
              disabled={!!deleting}
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

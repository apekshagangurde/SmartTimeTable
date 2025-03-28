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
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { PlusCircle, Search, Calendar, ArrowRight, FileEdit, Trash, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useTimetable } from "@/context/TimetableContext";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Schema for creating a new timetable
const createTimetableSchema = z.object({
  divisionId: z.string().min(1, { message: "Please select a division" }),
  createdBy: z.number().default(1), // Default to admin user for now
});

export default function Timetables() {
  const { toast } = useToast();
  const [location, navigate] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { 
    departments, 
    divisions, 
    selectedDepartment, 
    setSelectedDepartment,
    selectedDivision,
    setSelectedDivision,
    createTimetable
  } = useTimetable();
  const [searchTerm, setSearchTerm] = useState("");
  
  // Initialize form for creating timetable
  const form = useForm<z.infer<typeof createTimetableSchema>>({
    resolver: zodResolver(createTimetableSchema),
    defaultValues: {
      divisionId: "",
      createdBy: 1,
    },
  });

  // Mock timetable data (in real implementation, this would come from the API)
  const timetables = [
    { 
      id: 1, 
      name: "CSE-A Semester 3", 
      department: "Computer Science Engineering", 
      division: "A", 
      createdAt: "2023-10-15", 
      updatedAt: "2023-10-16", 
      createdBy: "Admin" 
    },
    { 
      id: 2, 
      name: "CSE-B Semester 3", 
      department: "Computer Science Engineering", 
      division: "B", 
      createdAt: "2023-10-15", 
      updatedAt: "2023-10-17", 
      createdBy: "Admin" 
    },
    { 
      id: 3, 
      name: "IT-A Semester 4", 
      department: "Information Technology", 
      division: "A", 
      createdAt: "2023-10-14", 
      updatedAt: "2023-10-14", 
      createdBy: "Admin" 
    },
  ];

  const filteredTimetables = timetables.filter(
    (timetable) =>
      timetable.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      timetable.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      timetable.division.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Submit handler for creating a new timetable
  const onSubmit = async (data: z.infer<typeof createTimetableSchema>) => {
    if (!selectedDepartment) {
      toast({
        title: "Error",
        description: "Please select a department first",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Convert divisionId to number
      const timetableData = {
        divisionId: parseInt(data.divisionId),
        createdBy: data.createdBy,
      };
      
      // Create timetable
      const newTimetable = await createTimetable(timetableData);
      
      toast({
        title: "Success",
        description: "Timetable created successfully. You can now add classes.",
      });
      
      // Navigate to the edit page for the new timetable
      navigate(`/timetables/${newTimetable.id}/edit`);
      
    } catch (error) {
      console.error("Error creating timetable:", error);
      toast({
        title: "Error",
        description: "Failed to create timetable. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setShowCreateDialog(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Timetables</h1>
        <Button onClick={() => setShowCreateDialog(true)}>
          <PlusCircle className="mr-2 h-4 w-4" /> Create New Timetable
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filter Timetables</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search timetables..."
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
                }}
              >
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
            <div>
              <Label htmlFor="division">Division</Label>
              <Select 
                value={selectedDivision?.id.toString() || "all"} 
                onValueChange={(value) => {
                  if (value === "all") {
                    setSelectedDivision(null);
                  } else {
                    const div = divisions.find(d => d.id.toString() === value);
                    if (div) setSelectedDivision(div);
                  }
                }}
              >
                <SelectTrigger id="division">
                  <SelectValue placeholder="Select Division" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Divisions</SelectItem>
                  {divisions.map((div) => (
                    <SelectItem key={div.id} value={div.id.toString()}>
                      {div.name}
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
                <TableHead>Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Division</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Created By</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTimetables.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                    No timetables found
                  </TableCell>
                </TableRow>
              ) : (
                filteredTimetables.map((timetable) => (
                  <TableRow key={timetable.id}>
                    <TableCell className="font-medium">{timetable.name}</TableCell>
                    <TableCell>{timetable.department}</TableCell>
                    <TableCell>{timetable.division}</TableCell>
                    <TableCell>{timetable.createdAt}</TableCell>
                    <TableCell>{timetable.updatedAt}</TableCell>
                    <TableCell>{timetable.createdBy}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/timetable/view/${timetable.id}`)}
                        >
                          <Calendar className="h-4 w-4 mr-1" /> View
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/timetable/${timetable.id}`)}
                        >
                          <FileEdit className="h-4 w-4 mr-1" /> Edit
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
      
      {/* Create Timetable Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Timetable</DialogTitle>
            <DialogDescription>
              Create a new timetable for a specific division. You'll be able to add classes after creation.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="divisionId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Division</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={!selectedDepartment}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select division" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {divisions
                          .filter(div => div.departmentId === selectedDepartment?.id)
                          .map(division => (
                            <SelectItem key={division.id} value={division.id.toString()}>
                              {division.name} ({selectedDepartment?.shortName})
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      {!selectedDepartment ? 
                        "Please select a department first" : 
                        "Select the division for which you want to create a timetable"
                      }
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting || !selectedDepartment || divisions.filter(d => d.departmentId === selectedDepartment?.id).length === 0}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Timetable"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

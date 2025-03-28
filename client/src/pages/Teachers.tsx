import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  CheckCircle, 
  Calendar, 
  Edit, 
  Trash,
  XCircle,
  UserPlus,
  Loader2
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TeacherType, SubjectType } from "@/types/timetable";
// Form schema for adding a new teacher
const teacherFormSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters" }),
  email: z.string().email({ message: "Must be a valid email address" }),
  role: z.string().default("teacher"),
  subjects: z.array(z.string()).optional(),
});

export default function Teachers() {
  const { teachers, subjects, markTeacherAsUpset, createTeacher } = useTimetable();
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddTeacherDialog, setShowAddTeacherDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Initialize react-hook-form
  const form = useForm<z.infer<typeof teacherFormSchema>>({
    resolver: zodResolver(teacherFormSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "teacher",
      subjects: [],
    },
  });

  // Filter teachers based on search term
  const filteredTeachers = teachers.filter(
    (teacher: TeacherType) => {
      // First attempt to filter by teacher name if available
      if (teacher.user?.name && teacher.user.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return true;
      }
      
      // Then try to filter by subject if available
      if (teacher.subjects && teacher.subjects.length > 0) {
        return teacher.subjects.some((subject: SubjectType) => 
          subject.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      // If no user or subjects available, include in results when no search term
      return searchTerm === "";
    }
  );

  // Format subjects for multi-select
  const subjectOptions = subjects.map(subject => ({
    value: subject.id.toString(),
    label: subject.name
  }));

  const handleSetTeacherUpset = async (teacherId: number, isUpset: boolean) => {
    try {
      await markTeacherAsUpset(teacherId, isUpset);
    } catch (error) {
      console.error("Failed to update teacher status:", error);
    }
  };

  const onSubmit = async (data: z.infer<typeof teacherFormSchema>) => {
    setIsSubmitting(true);
    try {
      // First create a user
      const userResponse = await apiRequest(
        "POST",
        "/api/users",
        {
          username: data.email.split('@')[0],
          password: "teacher123", // Default password
          name: data.name,
          email: data.email,
          role: data.role,
        }
      );
      
      const userData = await userResponse.json();
      
      // Then create a teacher linked to that user
      await createTeacher({
        userId: userData.id,
        isUpset: false,
      });
      
      // Invalidate queries to update the UI
      queryClient.invalidateQueries({ queryKey: ["/api/teachers"] });
      
      // Close the dialog first before showing the toast
      setShowAddTeacherDialog(false);
      form.reset();
      
      // Show toast after dialog is closed
      setTimeout(() => {
        toast({
          title: "Teacher added successfully",
          description: `${data.name} has been added as a teacher.`,
        });
      }, 100);
    } catch (error) {
      console.error("Error adding teacher:", error);
      toast({
        title: "Failed to add teacher",
        description: "There was an error adding the teacher. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form when dialog closes
  useEffect(() => {
    if (!showAddTeacherDialog) {
      form.reset();
    }
  }, [showAddTeacherDialog, form]);

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
                filteredTeachers.map((teacher: TeacherType) => (
                  <TableRow key={teacher.id}>
                    <TableCell className="font-medium">{teacher.user?.name || `Teacher ${teacher.id}`}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {teacher.subjects && teacher.subjects.length > 0 ? (
                          teacher.subjects.map((subject: SubjectType) => (
                            <Badge key={subject.id} variant="outline" className="bg-primary/10 text-primary">
                              {subject.name}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-muted-foreground text-sm">No subjects assigned</span>
                        )}
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
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter teacher's full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Enter email address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Subject selection handled separately after teacher creation */}
              <div className="mt-4">
                <Label>Subjects (Optional)</Label>
                <div className="border rounded-md p-3 mt-2 bg-muted/20">
                  <div className="text-sm text-muted-foreground mb-2">
                    Subjects can be assigned to the teacher after creation
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {subjects.map(subject => (
                      <Badge key={subject.id} variant="outline">
                        {subject.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setShowAddTeacherDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    "Add Teacher"
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

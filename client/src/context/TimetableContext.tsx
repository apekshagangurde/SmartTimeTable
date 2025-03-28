import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  DepartmentType, 
  DivisionType, 
  TeacherType, 
  ClassroomType, 
  SubjectType, 
  TimetableType, 
  SlotType, 
  ConflictType,
  WeekdayType
} from "../types";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface TimetableContextType {
  // Current selections
  selectedDepartment: DepartmentType | null;
  setSelectedDepartment: (department: DepartmentType | null) => void;
  selectedDivision: DivisionType | null;
  setSelectedDivision: (division: DivisionType | null) => void;
  collegeStartTime: string;
  setCollegeStartTime: (time: string) => void;
  collegeEndTime: string;
  setCollegeEndTime: (time: string) => void;
  currentWeek: string;
  setCurrentWeek: (week: string) => void;
  
  // Data
  departments: DepartmentType[];
  divisions: DivisionType[];
  teachers: TeacherType[];
  classrooms: ClassroomType[];
  subjects: SubjectType[];
  slots: SlotType[];
  conflicts: ConflictType[];

  // Actions
  createSlot: (slot: Partial<SlotType>) => Promise<void>;
  updateSlot: (id: number, slot: Partial<SlotType>) => Promise<void>;
  deleteSlot: (id: number) => Promise<void>;
  createTeacher: (teacher: { userId: number, isUpset: boolean }) => Promise<void>;
  markTeacherAsUpset: (teacherId: number, isUpset: boolean) => Promise<void>;
  assignSubstitute: (slotId: number, newTeacherId: number) => Promise<void>;
  resolveConflict: (conflictId: number) => Promise<void>;
  createTimetable: (timetable: { divisionId: number, createdBy: number }) => Promise<any>;
  
  // Loading states
  isLoading: boolean;
}

// Context with defaultValue to fix type issues
export const TimetableContext = createContext<TimetableContextType>({
  // Current selections
  selectedDepartment: null,
  setSelectedDepartment: () => null,
  selectedDivision: null,
  setSelectedDivision: () => null,
  collegeStartTime: "08:00",
  setCollegeStartTime: () => {},
  collegeEndTime: "16:00",
  setCollegeEndTime: () => {},
  currentWeek: "",
  setCurrentWeek: () => {},
  
  // Data
  departments: [],
  divisions: [],
  teachers: [],
  classrooms: [],
  subjects: [],
  slots: [],
  conflicts: [],
  
  // Actions
  createSlot: async () => {},
  updateSlot: async () => {},
  deleteSlot: async () => {},
  createTeacher: async () => {},
  markTeacherAsUpset: async () => {},
  assignSubstitute: async () => {},
  resolveConflict: async () => {},
  createTimetable: async () => null,
  
  // Loading states
  isLoading: false
});

export function TimetableProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const [selectedDepartment, setSelectedDepartment] = useState<DepartmentType | null>(null);
  const [selectedDivision, setSelectedDivision] = useState<DivisionType | null>(null);
  const [collegeStartTime, setCollegeStartTime] = useState<string>("08:00");
  const [collegeEndTime, setCollegeEndTime] = useState<string>("15:00");
  const [currentWeek, setCurrentWeek] = useState<string>(getCurrentWeekRange());

  // Fetch departments
  const { data: departments = [] as DepartmentType[], isLoading: isDepartmentsLoading } = useQuery<DepartmentType[]>({
    queryKey: ["/api/departments"],
  });

  // Fetch divisions when department changes
  const { data: divisions = [] as DivisionType[], isLoading: isDivisionsLoading } = useQuery<DivisionType[]>({
    queryKey: ["/api/divisions", selectedDepartment?.id],
    enabled: !!selectedDepartment,
  });

  // Fetch teachers
  const { data: teachers = [] as TeacherType[], isLoading: isTeachersLoading } = useQuery<TeacherType[]>({
    queryKey: ["/api/teachers"],
  });

  // Fetch classrooms filtered by department
  const { data: classrooms = [] as ClassroomType[], isLoading: isClassroomsLoading } = useQuery<ClassroomType[]>({
    queryKey: ["/api/classrooms", selectedDepartment?.id],
    enabled: !!selectedDepartment,
  });

  // Fetch subjects filtered by department
  const { data: subjects = [] as SubjectType[], isLoading: isSubjectsLoading } = useQuery<SubjectType[]>({
    queryKey: ["/api/subjects", selectedDepartment?.id],
    enabled: !!selectedDepartment,
  });

  // Fetch slots for the selected division and week
  const { data: slots = [] as SlotType[], isLoading: isSlotsLoading } = useQuery<SlotType[]>({
    queryKey: ["/api/slots", selectedDivision?.id, currentWeek],
    enabled: !!selectedDivision,
  });

  // Fetch conflicts
  const { data: conflicts = [] as ConflictType[], isLoading: isConflictsLoading } = useQuery<ConflictType[]>({
    queryKey: ["/api/conflicts", selectedDivision?.id],
    enabled: !!selectedDivision,
  });

  // Create slot mutation
  const createSlotMutation = useMutation({
    mutationFn: async (slot: Partial<SlotType>) => {
      const res = await apiRequest("POST", "/api/slots", slot);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/slots"] });
      queryClient.invalidateQueries({ queryKey: ["/api/conflicts"] });
      toast({
        title: "Success",
        description: "Slot created successfully",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to create slot: ${error.message}`,
      });
    },
  });

  // Update slot mutation
  const updateSlotMutation = useMutation({
    mutationFn: async ({ id, slot }: { id: number; slot: Partial<SlotType> }) => {
      const res = await apiRequest("PATCH", `/api/slots/${id}`, slot);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/slots"] });
      queryClient.invalidateQueries({ queryKey: ["/api/conflicts"] });
      toast({
        title: "Success",
        description: "Slot updated successfully",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to update slot: ${error.message}`,
      });
    },
  });

  // Delete slot mutation
  const deleteSlotMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/slots/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/slots"] });
      queryClient.invalidateQueries({ queryKey: ["/api/conflicts"] });
      toast({
        title: "Success",
        description: "Slot deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to delete slot: ${error.message}`,
      });
    },
  });

  // Create teacher mutation
  const createTeacherMutation = useMutation({
    mutationFn: async (teacher: { userId: number, isUpset: boolean }) => {
      const res = await apiRequest("POST", "/api/teachers", teacher);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teachers"] });
      toast({
        title: "Success",
        description: "Teacher created successfully",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to create teacher: ${error.message}`,
      });
    },
  });

  // Mark teacher as upset mutation
  const markTeacherAsUpsetMutation = useMutation({
    mutationFn: async ({ teacherId, isUpset }: { teacherId: number; isUpset: boolean }) => {
      const res = await apiRequest("PATCH", `/api/teachers/${teacherId}/upset`, { isUpset });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teachers"] });
      toast({
        title: "Success",
        description: "Teacher status updated successfully",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to update teacher status: ${error.message}`,
      });
    },
  });

  // Assign substitute mutation
  const assignSubstituteMutation = useMutation({
    mutationFn: async ({ slotId, newTeacherId }: { slotId: number; newTeacherId: number }) => {
      const res = await apiRequest("POST", `/api/slots/${slotId}/substitute`, { newTeacherId });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/slots"] });
      toast({
        title: "Success",
        description: "Substitute assigned successfully",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to assign substitute: ${error.message}`,
      });
    },
  });

  // Resolve conflict mutation
  const resolveConflictMutation = useMutation({
    mutationFn: async (conflictId: number) => {
      const res = await apiRequest("PATCH", `/api/conflicts/${conflictId}/resolve`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conflicts"] });
      toast({
        title: "Success",
        description: "Conflict resolved successfully",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to resolve conflict: ${error.message}`,
      });
    },
  });
  
  // Create timetable mutation
  const createTimetableMutation = useMutation({
    mutationFn: async (timetable: { divisionId: number, createdBy: number }) => {
      const res = await apiRequest("POST", "/api/timetables", timetable);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/timetables"] });
      toast({
        title: "Success",
        description: "Timetable created successfully",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to create timetable: ${error.message}`,
      });
    },
  });

  const isLoading =
    isDepartmentsLoading ||
    isDivisionsLoading ||
    isTeachersLoading ||
    isClassroomsLoading ||
    isSubjectsLoading ||
    isSlotsLoading ||
    isConflictsLoading;

  // Set default department and division if available and none selected
  useEffect(() => {
    if (departments && departments.length > 0 && !selectedDepartment) {
      setSelectedDepartment(departments[0]);
    }
  }, [departments, selectedDepartment]);

  useEffect(() => {
    if (divisions && divisions.length > 0 && !selectedDivision) {
      setSelectedDivision(divisions[0]);
    }
  }, [divisions, selectedDivision]);

  // Helper function to get current week range (e.g., "Oct 16 - Oct 22, 2023")
  function getCurrentWeekRange(): string {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust when day is Sunday
    
    const monday = new Date(now.setDate(diff));
    const sunday = new Date(now.setDate(diff + 6));
    
    const mondayStr = monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const sundayStr = sunday.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    
    return `${mondayStr} - ${sundayStr}`;
  }

  const value = {
    // Current selections
    selectedDepartment,
    setSelectedDepartment,
    selectedDivision,
    setSelectedDivision,
    collegeStartTime,
    setCollegeStartTime,
    collegeEndTime,
    setCollegeEndTime,
    currentWeek,
    setCurrentWeek,
    
    // Data
    departments,
    divisions,
    teachers,
    classrooms,
    subjects,
    slots,
    conflicts,

    // Actions
    createSlot: async (slot: Partial<SlotType>) => {
      await createSlotMutation.mutateAsync(slot);
    },
    updateSlot: async (id: number, slot: Partial<SlotType>) => {
      await updateSlotMutation.mutateAsync({ id, slot });
    },
    deleteSlot: async (id: number) => {
      await deleteSlotMutation.mutateAsync(id);
    },
    createTeacher: async (teacher: { userId: number, isUpset: boolean }) => {
      await createTeacherMutation.mutateAsync(teacher);
    },
    markTeacherAsUpset: async (teacherId: number, isUpset: boolean) => {
      await markTeacherAsUpsetMutation.mutateAsync({ teacherId, isUpset });
    },
    assignSubstitute: async (slotId: number, newTeacherId: number) => {
      await assignSubstituteMutation.mutateAsync({ slotId, newTeacherId });
    },
    resolveConflict: async (conflictId: number) => {
      await resolveConflictMutation.mutateAsync(conflictId);
    },
    createTimetable: async (timetable: { divisionId: number, createdBy: number }) => {
      return await createTimetableMutation.mutateAsync(timetable);
    },
    
    // Loading state
    isLoading,
  };

  return <TimetableContext.Provider value={value}>{children}</TimetableContext.Provider>;
}

export function useTimetable() {
  const context = useContext(TimetableContext);
  if (context === undefined) {
    throw new Error("useTimetable must be used within a TimetableProvider");
  }
  return context;
}

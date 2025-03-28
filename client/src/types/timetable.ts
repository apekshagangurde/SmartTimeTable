import { Department, Division, Teacher, Subject, Classroom, Slot, Conflict, User } from "../../../shared/schema";

// Exported type aliases for better readability
export type DepartmentType = Department;
export type DivisionType = Division;
export type TeacherType = Teacher & {
  user?: User;
  subjects?: Subject[];
  name?: string; // For CSV-stored teachers that may have name directly on them
  email?: string; // For CSV-stored teachers that may have email directly on them
};
export type SubjectType = Subject;
export type ClassroomType = Classroom;
export type ConflictType = Conflict;

// Additional types for the timetable application
export type WeekdayType = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday";

// Extended SlotType based on the Slot type from schema but with additional type safety
export type SlotType = {
  id: number;
  timetableId: number;
  day: WeekdayType; // Using our WeekdayType instead of string
  startTime: string;
  endTime: string;
  subjectId: number;
  teacherId: number;
  classroomId: number;
  type: "Lecture" | "Lab" | "Tutorial";
  isSubstitution: boolean | null;
  originalTeacherId: number | null;
  // Optional populated fields
  subject?: SubjectType;
  teacher?: TeacherType;
  classroom?: ClassroomType;
  originalTeacher?: TeacherType;
};

// Resource item types for drag and drop
export type ResourceItem = {
  id: number;
  type: "teacher" | "subject" | "classroom" | "slot";
  name: string;
  details?: string;
  color?: string;
};

// Types for timetable cell positioning
export type TimetableCell = {
  day: WeekdayType;
  hour: number;
  occupied: boolean;
};

// Grid cell position for drag and drop
export type GridCellPosition = {
  day: WeekdayType;
  hour: number;
};

// Class session type representing a scheduled class
export type ClassSessionType = {
  id: number;
  subject: SubjectType;
  teacher: TeacherType;
  classroom: ClassroomType;
  day: WeekdayType;
  startTime: string;
  endTime: string;
  type: "Lecture" | "Lab" | "Tutorial";
};

// Timetable view options
export type TimetableViewOption = "week" | "day" | "teacher" | "classroom";

// Conflict levels
export type ConflictLevel = "warning" | "error";

// Export settings
export type ExportFormat = "pdf" | "png" | "csv" | "ical";

// Timetable filter options
export type TimetableFilterOptions = {
  departments?: number[];
  divisions?: number[];
  teachers?: number[];
  subjects?: number[];
  classrooms?: number[];
  days?: WeekdayType[];
};
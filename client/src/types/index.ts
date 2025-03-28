export type DepartmentType = {
  id: number;
  name: string;
  shortName: string;
};

export type DivisionType = {
  id: number;
  name: string;
  departmentId: number;
};

export type ClassroomType = {
  id: number;
  name: string;
  capacity: number;
  departmentId: number;
  department?: DepartmentType;
};

export type SubjectType = {
  id: number;
  name: string;
  shortName: string;
  credits: number;
  semester: number;
  departmentId: number;
  department?: DepartmentType;
};

export type UserType = {
  id: number;
  username: string;
  name: string;
  email: string;
  role: "admin" | "teacher";
};

export type TeacherType = {
  id: number;
  userId: number;
  isUpset: boolean;
  user?: UserType;
  subjects?: SubjectType[];
};

export type SlotType = {
  id: number;
  timetableId: number;
  day: WeekdayType;
  startTime: string;
  endTime: string;
  subjectId: number;
  teacherId: number;
  classroomId: number;
  type: "Lecture" | "Lab" | "Tutorial";
  isSubstitution: boolean;
  originalTeacherId?: number;
  // Populated fields
  subject?: SubjectType;
  teacher?: TeacherType;
  classroom?: ClassroomType;
  originalTeacher?: TeacherType;
};

export type TimetableType = {
  id: number;
  divisionId: number;
  createdAt: string;
  updatedAt: string;
  createdBy: number;
  division?: DivisionType;
  slots?: SlotType[];
};

export type WeekdayType = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";

export type TimeSlotType = {
  hour: number;
  minute: number;
};

export type ConflictType = {
  id: number;
  type: "TeacherClash" | "RoomConflict" | "TimeAllocation";
  description: string;
  day: WeekdayType;
  time: string;
  resolved: boolean;
  details: any;
};

export type DraggableItemType = {
  type: "teacher" | "classroom" | "subject" | "slot";
  id: number;
  data: TeacherType | ClassroomType | SubjectType | SlotType;
};

export type GridCellPosition = {
  day: WeekdayType;
  hour: number;
  minute: number;
};

import { pgTable, text, serial, integer, boolean, time, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("teacher"), // admin or teacher
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
});

export const departments = pgTable("departments", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  shortName: text("short_name").notNull().unique(),
});

export const divisions = pgTable("divisions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  departmentId: integer("department_id").notNull(),
});

export const classrooms = pgTable("classrooms", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  capacity: integer("capacity").notNull(),
  departmentId: integer("department_id").notNull(),
});

export const subjects = pgTable("subjects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  shortName: text("short_name").notNull(),
  credits: integer("credits").notNull(),
  semester: integer("semester").notNull(),
  departmentId: integer("department_id").notNull(),
});

export const teachers = pgTable("teachers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  isUpset: boolean("is_upset").notNull().default(false),
});

export const teacherSubjects = pgTable("teacher_subjects", {
  id: serial("id").primaryKey(),
  teacherId: integer("teacher_id").notNull(),
  subjectId: integer("subject_id").notNull(),
});

export const collegeHours = pgTable("college_hours", {
  id: serial("id").primaryKey(),
  divisionId: integer("division_id").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
});

export const timetables = pgTable("timetables", {
  id: serial("id").primaryKey(),
  divisionId: integer("division_id").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
  createdBy: integer("created_by").notNull(),
});

export const slots = pgTable("slots", {
  id: serial("id").primaryKey(),
  timetableId: integer("timetable_id").notNull(),
  day: text("day").notNull(), // Monday, Tuesday, etc.
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  subjectId: integer("subject_id").notNull(),
  teacherId: integer("teacher_id").notNull(),
  classroomId: integer("classroom_id").notNull(),
  type: text("type").notNull(), // Lecture, Lab, Tutorial
  isSubstitution: boolean("is_substitution").default(false),
  originalTeacherId: integer("original_teacher_id"),
});

export const conflicts = pgTable("conflicts", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // TeacherClash, RoomConflict, TimeAllocation
  description: text("description").notNull(),
  day: text("day").notNull(),
  time: text("time").notNull(),
  resolved: boolean("resolved").default(false),
  details: jsonb("details").notNull(),
});

// Insert schemas
export const insertDepartmentSchema = createInsertSchema(departments).omit({ id: true });
export const insertDivisionSchema = createInsertSchema(divisions).omit({ id: true });
export const insertClassroomSchema = createInsertSchema(classrooms).omit({ id: true });
export const insertSubjectSchema = createInsertSchema(subjects).omit({ id: true });
export const insertTeacherSchema = createInsertSchema(teachers).omit({ id: true });
export const insertTeacherSubjectSchema = createInsertSchema(teacherSubjects).omit({ id: true });
export const insertCollegeHoursSchema = createInsertSchema(collegeHours).omit({ id: true });
export const insertTimetableSchema = createInsertSchema(timetables).omit({ id: true });
export const insertSlotSchema = createInsertSchema(slots).omit({ id: true });
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertConflictSchema = createInsertSchema(conflicts).omit({ id: true });

// Types
export type Department = typeof departments.$inferSelect;
export type InsertDepartment = z.infer<typeof insertDepartmentSchema>;

export type Division = typeof divisions.$inferSelect;
export type InsertDivision = z.infer<typeof insertDivisionSchema>;

export type Classroom = typeof classrooms.$inferSelect;
export type InsertClassroom = z.infer<typeof insertClassroomSchema>;

export type Subject = typeof subjects.$inferSelect;
export type InsertSubject = z.infer<typeof insertSubjectSchema>;

export type Teacher = typeof teachers.$inferSelect;
export type InsertTeacher = z.infer<typeof insertTeacherSchema>;

export type TeacherSubject = typeof teacherSubjects.$inferSelect;
export type InsertTeacherSubject = z.infer<typeof insertTeacherSubjectSchema>;

export type CollegeHour = typeof collegeHours.$inferSelect;
export type InsertCollegeHour = z.infer<typeof insertCollegeHoursSchema>;

export type Timetable = typeof timetables.$inferSelect;
export type InsertTimetable = z.infer<typeof insertTimetableSchema>;

export type Slot = typeof slots.$inferSelect;
export type InsertSlot = z.infer<typeof insertSlotSchema>;

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Conflict = typeof conflicts.$inferSelect;
export type InsertConflict = z.infer<typeof insertConflictSchema>;

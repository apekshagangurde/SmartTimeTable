import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { csvStorage } from "./csv-storage";
import { z } from "zod";
import { 
  insertDepartmentSchema, 
  insertDivisionSchema, 
  insertClassroomSchema,
  insertSubjectSchema,
  insertTeacherSchema,
  insertTeacherSubjectSchema,
  insertCollegeHoursSchema,
  insertTimetableSchema,
  insertSlotSchema,
  insertUserSchema,
  insertConflictSchema
} from "@shared/schema";
import { format } from 'date-fns';
import { WebSocketServer, WebSocket } from 'ws';

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes
  
  // Users
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const newUser = await storage.createUser(userData);
      res.status(201).json(newUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  // Departments
  app.get("/api/departments", async (req, res) => {
    try {
      // Combine departments from both storage systems
      const memDepartments = await storage.getDepartments();
      const csvDepartments = csvStorage.getDepartments();
      
      // Filter out duplicates by ID (CSV storage takes precedence)
      const csvIds = new Set(csvDepartments.map(d => d.id));
      const combinedDepartments = [
        ...memDepartments.filter(d => !csvIds.has(d.id)),
        ...csvDepartments
      ];
      
      res.json(combinedDepartments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch departments" });
    }
  });

  app.get("/api/departments/:id", async (req, res) => {
    try {
      const departmentId = parseInt(req.params.id);
      
      // Try to get from CSV first, then fall back to memory storage
      let department = csvStorage.getDepartment(departmentId);
      if (!department) {
        department = await storage.getDepartment(departmentId);
      }
      
      if (!department) {
        return res.status(404).json({ message: "Department not found" });
      }
      
      res.json(department);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch department" });
    }
  });

  app.post("/api/departments", async (req, res) => {
    try {
      const departmentData = insertDepartmentSchema.parse(req.body);
      
      // Store in CSV instead of memory
      const newDepartment = csvStorage.createDepartment(departmentData);
      
      // Also update in-memory for compatibility with other operations
      await storage.createDepartment(departmentData);
      
      res.status(201).json(newDepartment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid department data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create department" });
    }
  });

  // Divisions
  app.get("/api/divisions", async (req, res) => {
    try {
      const departmentId = req.query.departmentId ? parseInt(req.query.departmentId as string) : undefined;
      const divisions = await storage.getDivisions(departmentId);
      res.json(divisions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch divisions" });
    }
  });

  app.post("/api/divisions", async (req, res) => {
    try {
      const divisionData = insertDivisionSchema.parse(req.body);
      const newDivision = await storage.createDivision(divisionData);
      res.status(201).json(newDivision);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid division data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create division" });
    }
  });

  // Classrooms
  app.get("/api/classrooms", async (req, res) => {
    try {
      const departmentId = req.query.departmentId ? parseInt(req.query.departmentId as string) : undefined;
      
      // Combine classrooms from both storage systems
      const memClassrooms = await storage.getClassrooms(departmentId);
      const csvClassrooms = csvStorage.getClassrooms(departmentId);
      
      // Filter out duplicates by ID (CSV storage takes precedence)
      const csvIds = new Set(csvClassrooms.map(c => c.id));
      const combinedClassrooms = [
        ...memClassrooms.filter(c => !csvIds.has(c.id)),
        ...csvClassrooms
      ];
      
      res.json(combinedClassrooms);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch classrooms" });
    }
  });

  app.post("/api/classrooms", async (req, res) => {
    try {
      const classroomData = insertClassroomSchema.parse(req.body);
      
      // Store in CSV instead of memory
      const newClassroom = csvStorage.createClassroom(classroomData);
      
      // Also store in memory for compatibility with other operations
      await storage.createClassroom(classroomData);
      
      res.status(201).json(newClassroom);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid classroom data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create classroom" });
    }
  });

  // Subjects
  app.get("/api/subjects", async (req, res) => {
    try {
      const departmentId = req.query.departmentId ? parseInt(req.query.departmentId as string) : undefined;
      
      // Combine subjects from both storage systems
      const memSubjects = await storage.getSubjects(departmentId);
      const csvSubjects = csvStorage.getSubjects(departmentId);
      
      // Filter out duplicates by ID (CSV storage takes precedence)
      const csvIds = new Set(csvSubjects.map(s => s.id));
      const combinedSubjects = [
        ...memSubjects.filter(s => !csvIds.has(s.id)),
        ...csvSubjects
      ];
      
      res.json(combinedSubjects);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch subjects" });
    }
  });

  app.post("/api/subjects", async (req, res) => {
    try {
      const subjectData = insertSubjectSchema.parse(req.body);
      
      // Store in CSV instead of memory
      const newSubject = csvStorage.createSubject(subjectData);
      
      // Also store in memory for compatibility with other operations
      await storage.createSubject(subjectData);
      
      res.status(201).json(newSubject);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid subject data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create subject" });
    }
  });

  // Teachers
  app.get("/api/teachers", async (req, res) => {
    try {
      // Combine teachers from both storage systems
      const memTeachers = await storage.getTeachers();
      const csvTeachers = csvStorage.getTeachers();
      
      // Filter out duplicates by ID (CSV storage takes precedence)
      const csvIds = new Set(csvTeachers.map(t => t.id));
      const combinedTeachers = [
        ...memTeachers.filter(t => !csvIds.has(t.id)),
        ...csvTeachers
      ];
      
      res.json(combinedTeachers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch teachers" });
    }
  });

  app.post("/api/teachers", async (req, res) => {
    try {
      const teacherData = insertTeacherSchema.parse(req.body);
      
      // First create the user if needed
      let userId = teacherData.userId;
      const user = await storage.getUser(userId);
      
      // Store the teacher in CSV
      const newTeacher = csvStorage.createTeacher({
        ...teacherData,
        name: user?.name || 'Unknown', 
        email: user?.email || 'unknown@example.com'
      });
      
      // Also store in memory for compatibility with other operations
      await storage.createTeacher(teacherData);
      
      res.status(201).json(newTeacher);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid teacher data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create teacher" });
    }
  });

  app.patch("/api/teachers/:id/upset", async (req, res) => {
    try {
      const teacherId = parseInt(req.params.id);
      const { isUpset } = req.body;
      
      if (typeof isUpset !== 'boolean') {
        return res.status(400).json({ message: "isUpset must be a boolean" });
      }
      
      // Update in both storage systems
      const csvTeacher = csvStorage.updateTeacherUpsetStatus(teacherId, isUpset);
      const memTeacher = await storage.updateTeacherUpsetStatus(teacherId, isUpset);
      
      // Prefer CSV data if available
      const updatedTeacher = csvTeacher || memTeacher;
      
      if (!updatedTeacher) {
        return res.status(404).json({ message: "Teacher not found" });
      }
      
      res.json(updatedTeacher);
    } catch (error) {
      res.status(500).json({ message: "Failed to update teacher status" });
    }
  });

  // Teacher Subjects
  app.post("/api/teacher-subjects", async (req, res) => {
    try {
      const teacherSubjectData = insertTeacherSubjectSchema.parse(req.body);
      const newTeacherSubject = await storage.assignSubjectToTeacher(
        teacherSubjectData.teacherId,
        teacherSubjectData.subjectId
      );
      res.status(201).json(newTeacherSubject);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid teacher-subject data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to assign subject to teacher" });
    }
  });

  // College Hours
  app.get("/api/college-hours", async (req, res) => {
    try {
      const divisionId = req.query.divisionId ? parseInt(req.query.divisionId as string) : undefined;
      if (!divisionId) {
        return res.status(400).json({ message: "Division ID is required" });
      }
      
      const collegeHours = await storage.getCollegeHours(divisionId);
      res.json(collegeHours);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch college hours" });
    }
  });

  app.post("/api/college-hours", async (req, res) => {
    try {
      const collegeHoursData = insertCollegeHoursSchema.parse(req.body);
      const newCollegeHours = await storage.setCollegeHours(collegeHoursData);
      res.status(201).json(newCollegeHours);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid college hours data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to set college hours" });
    }
  });

  // Timetables
  app.get("/api/timetables", async (req, res) => {
    try {
      const divisionId = req.query.divisionId ? parseInt(req.query.divisionId as string) : undefined;
      const timetables = await storage.getTimetables(divisionId);
      res.json(timetables);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch timetables" });
    }
  });

  app.post("/api/timetables", async (req, res) => {
    try {
      const timetableData = insertTimetableSchema.parse(req.body);
      // Add current date as created/updated dates
      const now = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
      const newTimetable = await storage.createTimetable({
        ...timetableData,
        createdAt: now,
        updatedAt: now,
      });
      res.status(201).json(newTimetable);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid timetable data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create timetable" });
    }
  });

  // Slots
  app.get("/api/slots", async (req, res) => {
    try {
      const timetableId = req.query.timetableId ? parseInt(req.query.timetableId as string) : undefined;
      const divisionId = req.query.divisionId ? parseInt(req.query.divisionId as string) : undefined;
      const day = req.query.day as string | undefined;
      
      const slots = await storage.getSlots(timetableId, divisionId, day);
      res.json(slots);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch slots" });
    }
  });

  app.post("/api/slots", async (req, res) => {
    try {
      const slotData = insertSlotSchema.parse(req.body);
      const newSlot = await storage.createSlot(slotData);
      
      // Detect conflicts after creating a new slot
      await storage.detectAndRecordConflicts();
      
      res.status(201).json(newSlot);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid slot data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create slot" });
    }
  });

  app.patch("/api/slots/:id", async (req, res) => {
    try {
      const slotId = parseInt(req.params.id);
      const updatedSlot = await storage.updateSlot(slotId, req.body);
      if (!updatedSlot) {
        return res.status(404).json({ message: "Slot not found" });
      }
      
      // Re-detect conflicts after updating a slot
      await storage.detectAndRecordConflicts();
      
      res.json(updatedSlot);
    } catch (error) {
      res.status(500).json({ message: "Failed to update slot" });
    }
  });

  app.delete("/api/slots/:id", async (req, res) => {
    try {
      const slotId = parseInt(req.params.id);
      await storage.deleteSlot(slotId);
      
      // Re-detect conflicts after deleting a slot
      await storage.detectAndRecordConflicts();
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete slot" });
    }
  });

  app.post("/api/slots/:id/substitute", async (req, res) => {
    try {
      const slotId = parseInt(req.params.id);
      const { newTeacherId } = req.body;
      
      if (!newTeacherId || typeof newTeacherId !== 'number') {
        return res.status(400).json({ message: "newTeacherId is required and must be a number" });
      }
      
      const updatedSlot = await storage.assignSubstitute(slotId, newTeacherId);
      if (!updatedSlot) {
        return res.status(404).json({ message: "Slot not found" });
      }
      
      res.json(updatedSlot);
    } catch (error) {
      res.status(500).json({ message: "Failed to assign substitute" });
    }
  });

  // Conflicts
  app.get("/api/conflicts", async (req, res) => {
    try {
      const divisionId = req.query.divisionId ? parseInt(req.query.divisionId as string) : undefined;
      const conflicts = await storage.getConflicts(divisionId);
      res.json(conflicts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch conflicts" });
    }
  });

  app.patch("/api/conflicts/:id/resolve", async (req, res) => {
    try {
      const conflictId = parseInt(req.params.id);
      const resolvedConflict = await storage.resolveConflict(conflictId);
      if (!resolvedConflict) {
        return res.status(404).json({ message: "Conflict not found" });
      }
      
      res.json(resolvedConflict);
    } catch (error) {
      res.status(500).json({ message: "Failed to resolve conflict" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}

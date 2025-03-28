import { 
  users, 
  departments, 
  divisions, 
  classrooms, 
  subjects, 
  teachers, 
  teacherSubjects, 
  collegeHours, 
  timetables, 
  slots, 
  conflicts,
  type User, 
  type InsertUser, 
  type Department, 
  type InsertDepartment, 
  type Division, 
  type InsertDivision, 
  type Classroom, 
  type InsertClassroom, 
  type Subject, 
  type InsertSubject,
  type Teacher, 
  type InsertTeacher, 
  type TeacherSubject, 
  type InsertTeacherSubject, 
  type CollegeHour, 
  type InsertCollegeHour,
  type Timetable, 
  type InsertTimetable, 
  type Slot, 
  type InsertSlot,
  type Conflict,
  type InsertConflict
} from "@shared/schema";

// Storage interface for the Smart Timetable Management System
export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;

  // Departments
  getDepartment(id: number): Promise<Department | undefined>;
  getDepartments(): Promise<Department[]>;
  createDepartment(department: InsertDepartment): Promise<Department>;

  // Divisions
  getDivision(id: number): Promise<Division | undefined>;
  getDivisions(departmentId?: number): Promise<Division[]>;
  createDivision(division: InsertDivision): Promise<Division>;

  // Classrooms
  getClassroom(id: number): Promise<Classroom | undefined>;
  getClassrooms(departmentId?: number): Promise<Classroom[]>;
  createClassroom(classroom: InsertClassroom): Promise<Classroom>;

  // Subjects
  getSubject(id: number): Promise<Subject | undefined>;
  getSubjects(departmentId?: number): Promise<Subject[]>;
  createSubject(subject: InsertSubject): Promise<Subject>;

  // Teachers
  getTeacher(id: number): Promise<Teacher | undefined>;
  getTeachers(): Promise<Teacher[]>;
  createTeacher(teacher: InsertTeacher): Promise<Teacher>;
  updateTeacherUpsetStatus(id: number, isUpset: boolean): Promise<Teacher | undefined>;

  // Teacher Subjects
  getTeacherSubjects(teacherId: number): Promise<Subject[]>;
  assignSubjectToTeacher(teacherId: number, subjectId: number): Promise<TeacherSubject>;

  // College Hours
  getCollegeHours(divisionId: number): Promise<CollegeHour | undefined>;
  setCollegeHours(collegeHours: InsertCollegeHour): Promise<CollegeHour>;

  // Timetables
  getTimetable(id: number): Promise<Timetable | undefined>;
  getTimetables(divisionId?: number): Promise<Timetable[]>;
  createTimetable(timetable: InsertTimetable): Promise<Timetable>;

  // Slots
  getSlot(id: number): Promise<Slot | undefined>;
  getSlots(timetableId?: number, divisionId?: number, day?: string): Promise<Slot[]>;
  createSlot(slot: InsertSlot): Promise<Slot>;
  updateSlot(id: number, updates: Partial<Slot>): Promise<Slot | undefined>;
  deleteSlot(id: number): Promise<void>;
  assignSubstitute(slotId: number, newTeacherId: number): Promise<Slot | undefined>;

  // Conflicts
  getConflict(id: number): Promise<Conflict | undefined>;
  getConflicts(divisionId?: number): Promise<Conflict[]>;
  detectAndRecordConflicts(): Promise<Conflict[]>;
  resolveConflict(id: number): Promise<Conflict | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private departments: Map<number, Department>;
  private divisions: Map<number, Division>;
  private classrooms: Map<number, Classroom>;
  private subjects: Map<number, Subject>;
  private teachers: Map<number, Teacher>;
  private teacherSubjects: Map<number, TeacherSubject>;
  private collegeHours: Map<number, CollegeHour>;
  private timetables: Map<number, Timetable>;
  private slots: Map<number, Slot>;
  private conflicts: Map<number, Conflict>;

  // Auto-incrementing IDs
  private userIdCounter: number;
  private departmentIdCounter: number;
  private divisionIdCounter: number;
  private classroomIdCounter: number;
  private subjectIdCounter: number;
  private teacherIdCounter: number;
  private teacherSubjectIdCounter: number;
  private collegeHourIdCounter: number;
  private timetableIdCounter: number;
  private slotIdCounter: number;
  private conflictIdCounter: number;

  constructor() {
    this.users = new Map();
    this.departments = new Map();
    this.divisions = new Map();
    this.classrooms = new Map();
    this.subjects = new Map();
    this.teachers = new Map();
    this.teacherSubjects = new Map();
    this.collegeHours = new Map();
    this.timetables = new Map();
    this.slots = new Map();
    this.conflicts = new Map();

    this.userIdCounter = 1;
    this.departmentIdCounter = 1;
    this.divisionIdCounter = 1;
    this.classroomIdCounter = 1;
    this.subjectIdCounter = 1;
    this.teacherIdCounter = 1;
    this.teacherSubjectIdCounter = 1;
    this.collegeHourIdCounter = 1;
    this.timetableIdCounter = 1;
    this.slotIdCounter = 1;
    this.conflictIdCounter = 1;

    // Initialize with sample data
    this.initializeSampleData();
  }

  // Initialize sample data for demonstration
  private async initializeSampleData() {
    // Add admin user
    const adminUser = await this.createUser({
      username: "admin",
      password: "admin123", // In a real app, would be hashed
      name: "Admin User",
      email: "admin@example.com",
      role: "admin"
    });

    // Add departments
    const cseDepartment = await this.createDepartment({
      name: "Computer Science Engineering",
      shortName: "CSE"
    });

    const csAndDesignDepartment = await this.createDepartment({
      name: "Computer Science and Design",
      shortName: "CSD"
    });

    const aiDepartment = await this.createDepartment({
      name: "Artificial Intelligence Engineering",
      shortName: "AIE"
    });

    const dataSciDepartment = await this.createDepartment({
      name: "Data Science Engineering",
      shortName: "DSE"
    });

    const itDepartment = await this.createDepartment({
      name: "Information Technology",
      shortName: "IT"
    });

    const civilDepartment = await this.createDepartment({
      name: "Civil Engineering",
      shortName: "Civil"
    });

    const electronicsDepartment = await this.createDepartment({
      name: "Electronics & Telecommunication",
      shortName: "E&TC"
    });

    // Add divisions
    const cseADivision = await this.createDivision({
      name: "A",
      departmentId: cseDepartment.id
    });

    const cseBDivision = await this.createDivision({
      name: "B",
      departmentId: cseDepartment.id
    });

    const itADivision = await this.createDivision({
      name: "A",
      departmentId: itDepartment.id
    });

    // Add classrooms
    const cseLab = await this.createClassroom({
      name: "CS Lab 302",
      capacity: 60,
      departmentId: cseDepartment.id
    });

    const cseRoom201 = await this.createClassroom({
      name: "Room 201",
      capacity: 80,
      departmentId: cseDepartment.id
    });

    const itLab = await this.createClassroom({
      name: "IT Lab 102",
      capacity: 50,
      departmentId: itDepartment.id
    });

    const room305 = await this.createClassroom({
      name: "Room 305",
      capacity: 100,
      departmentId: cseDepartment.id
    });

    // Add subjects
    const dataStructures = await this.createSubject({
      name: "Data Structures",
      shortName: "DS",
      credits: 4,
      semester: 3,
      departmentId: cseDepartment.id
    });

    const compilerDesign = await this.createSubject({
      name: "Compiler Design",
      shortName: "CD",
      credits: 3,
      semester: 5,
      departmentId: cseDepartment.id
    });

    const dbms = await this.createSubject({
      name: "Database Systems",
      shortName: "DBMS",
      credits: 4,
      semester: 4,
      departmentId: cseDepartment.id
    });

    const webDev = await this.createSubject({
      name: "Web Development",
      shortName: "WebDev",
      credits: 3,
      semester: 5,
      departmentId: itDepartment.id
    });

    // Add teachers
    const teacherJohnson = await this.createUser({
      username: "johnson",
      password: "pass123", // In a real app, would be hashed
      name: "Prof. Johnson",
      email: "johnson@example.com",
      role: "teacher"
    });

    const teacherSmith = await this.createUser({
      username: "smith",
      password: "pass123", // In a real app, would be hashed
      name: "Prof. Smith",
      email: "smith@example.com",
      role: "teacher"
    });

    const teacherDavis = await this.createUser({
      username: "davis",
      password: "pass123", // In a real app, would be hashed
      name: "Prof. Davis",
      email: "davis@example.com",
      role: "teacher"
    });

    const teacherWilson = await this.createUser({
      username: "wilson",
      password: "pass123", // In a real app, would be hashed
      name: "Prof. Wilson",
      email: "wilson@example.com",
      role: "teacher"
    });

    // Create teacher records
    const johnsonTeacher = await this.createTeacher({
      userId: teacherJohnson.id,
      isUpset: false
    });

    const smithTeacher = await this.createTeacher({
      userId: teacherSmith.id,
      isUpset: false
    });

    const davisTeacher = await this.createTeacher({
      userId: teacherDavis.id,
      isUpset: false
    });

    const wilsonTeacher = await this.createTeacher({
      userId: teacherWilson.id,
      isUpset: false
    });

    // Assign subjects to teachers
    await this.assignSubjectToTeacher(johnsonTeacher.id, dataStructures.id);
    await this.assignSubjectToTeacher(smithTeacher.id, compilerDesign.id);
    await this.assignSubjectToTeacher(davisTeacher.id, dbms.id);
    await this.assignSubjectToTeacher(wilsonTeacher.id, webDev.id);

    // Set college hours
    await this.setCollegeHours({
      divisionId: cseADivision.id,
      startTime: "08:00",
      endTime: "15:00"
    });

    // Create a timetable
    const cseTimetable = await this.createTimetable({
      divisionId: cseADivision.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: adminUser.id
    });

    // Add a few slots to the timetable
    await this.createSlot({
      timetableId: cseTimetable.id,
      day: "Monday",
      startTime: "09:00",
      endTime: "11:00",
      subjectId: dataStructures.id,
      teacherId: johnsonTeacher.id,
      classroomId: cseLab.id,
      type: "Lab"
    });

    await this.createSlot({
      timetableId: cseTimetable.id,
      day: "Monday",
      startTime: "13:00",
      endTime: "14:00",
      subjectId: compilerDesign.id,
      teacherId: smithTeacher.id,
      classroomId: cseRoom201.id,
      type: "Lecture"
    });

    await this.createSlot({
      timetableId: cseTimetable.id,
      day: "Tuesday",
      startTime: "09:00",
      endTime: "10:00",
      subjectId: dbms.id,
      teacherId: davisTeacher.id,
      classroomId: room305.id,
      type: "Lecture"
    });

    // Detect conflicts
    await this.detectAndRecordConflicts();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const newUser: User = { ...user, id };
    this.users.set(id, newUser);
    return newUser;
  }

  // Department methods
  async getDepartment(id: number): Promise<Department | undefined> {
    return this.departments.get(id);
  }

  async getDepartments(): Promise<Department[]> {
    return Array.from(this.departments.values());
  }

  async createDepartment(department: InsertDepartment): Promise<Department> {
    const id = this.departmentIdCounter++;
    const newDepartment: Department = { ...department, id };
    this.departments.set(id, newDepartment);
    return newDepartment;
  }

  // Division methods
  async getDivision(id: number): Promise<Division | undefined> {
    return this.divisions.get(id);
  }

  async getDivisions(departmentId?: number): Promise<Division[]> {
    const allDivisions = Array.from(this.divisions.values());
    if (departmentId !== undefined) {
      return allDivisions.filter(div => div.departmentId === departmentId);
    }
    return allDivisions;
  }

  async createDivision(division: InsertDivision): Promise<Division> {
    const id = this.divisionIdCounter++;
    const newDivision: Division = { ...division, id };
    this.divisions.set(id, newDivision);
    return newDivision;
  }

  // Classroom methods
  async getClassroom(id: number): Promise<Classroom | undefined> {
    return this.classrooms.get(id);
  }

  async getClassrooms(departmentId?: number): Promise<Classroom[]> {
    const allClassrooms = Array.from(this.classrooms.values());
    if (departmentId !== undefined) {
      return allClassrooms.filter(classroom => classroom.departmentId === departmentId);
    }
    return allClassrooms;
  }

  async createClassroom(classroom: InsertClassroom): Promise<Classroom> {
    const id = this.classroomIdCounter++;
    const newClassroom: Classroom = { ...classroom, id };
    this.classrooms.set(id, newClassroom);
    return newClassroom;
  }

  // Subject methods
  async getSubject(id: number): Promise<Subject | undefined> {
    return this.subjects.get(id);
  }

  async getSubjects(departmentId?: number): Promise<Subject[]> {
    const allSubjects = Array.from(this.subjects.values());
    if (departmentId !== undefined) {
      return allSubjects.filter(subject => subject.departmentId === departmentId);
    }
    return allSubjects;
  }

  async createSubject(subject: InsertSubject): Promise<Subject> {
    const id = this.subjectIdCounter++;
    const newSubject: Subject = { ...subject, id };
    this.subjects.set(id, newSubject);
    return newSubject;
  }

  // Teacher methods
  async getTeacher(id: number): Promise<Teacher | undefined> {
    return this.teachers.get(id);
  }

  async getTeachers(): Promise<Teacher[]> {
    const teachers = Array.from(this.teachers.values());
    // Populate each teacher with user and subject data
    return Promise.all(teachers.map(async (teacher) => {
      const user = await this.getUser(teacher.userId);
      const subjects = await this.getTeacherSubjects(teacher.id);
      return { ...teacher, user, subjects };
    }));
  }

  async createTeacher(teacher: InsertTeacher): Promise<Teacher> {
    const id = this.teacherIdCounter++;
    const newTeacher: Teacher = { ...teacher, id };
    this.teachers.set(id, newTeacher);
    return newTeacher;
  }

  async updateTeacherUpsetStatus(id: number, isUpset: boolean): Promise<Teacher | undefined> {
    const teacher = await this.getTeacher(id);
    if (!teacher) return undefined;
    
    const updatedTeacher: Teacher = { ...teacher, isUpset };
    this.teachers.set(id, updatedTeacher);
    return updatedTeacher;
  }

  // Teacher Subjects methods
  async getTeacherSubjects(teacherId: number): Promise<Subject[]> {
    const teacherSubjectEntries = Array.from(this.teacherSubjects.values())
      .filter(ts => ts.teacherId === teacherId);
    
    const subjects: Subject[] = [];
    for (const entry of teacherSubjectEntries) {
      const subject = await this.getSubject(entry.subjectId);
      if (subject) subjects.push(subject);
    }
    
    return subjects;
  }

  async assignSubjectToTeacher(teacherId: number, subjectId: number): Promise<TeacherSubject> {
    const id = this.teacherSubjectIdCounter++;
    const newTeacherSubject: TeacherSubject = { id, teacherId, subjectId };
    this.teacherSubjects.set(id, newTeacherSubject);
    return newTeacherSubject;
  }

  // College Hours methods
  async getCollegeHours(divisionId: number): Promise<CollegeHour | undefined> {
    const hours = Array.from(this.collegeHours.values())
      .find(hours => hours.divisionId === divisionId);
    return hours;
  }

  async setCollegeHours(collegeHours: InsertCollegeHour): Promise<CollegeHour> {
    // Check if hours already exist for this division
    const existingHours = await this.getCollegeHours(collegeHours.divisionId);
    
    if (existingHours) {
      // Update existing hours
      const updatedHours: CollegeHour = { 
        ...existingHours, 
        startTime: collegeHours.startTime, 
        endTime: collegeHours.endTime 
      };
      this.collegeHours.set(existingHours.id, updatedHours);
      return updatedHours;
    } else {
      // Create new hours
      const id = this.collegeHourIdCounter++;
      const newHours: CollegeHour = { ...collegeHours, id };
      this.collegeHours.set(id, newHours);
      return newHours;
    }
  }

  // Timetable methods
  async getTimetable(id: number): Promise<Timetable | undefined> {
    return this.timetables.get(id);
  }

  async getTimetables(divisionId?: number): Promise<Timetable[]> {
    const allTimetables = Array.from(this.timetables.values());
    if (divisionId !== undefined) {
      return allTimetables.filter(timetable => timetable.divisionId === divisionId);
    }
    return allTimetables;
  }

  async createTimetable(timetable: InsertTimetable): Promise<Timetable> {
    const id = this.timetableIdCounter++;
    const newTimetable: Timetable = { ...timetable, id };
    this.timetables.set(id, newTimetable);
    return newTimetable;
  }

  // Slot methods
  async getSlot(id: number): Promise<Slot | undefined> {
    const slot = this.slots.get(id);
    if (!slot) return undefined;

    // Populate with related entities
    const populatedSlot = { ...slot };
    
    const subject = await this.getSubject(slot.subjectId);
    if (subject) {
      populatedSlot.subject = subject;
    }
    
    const teacher = await this.getTeacher(slot.teacherId);
    if (teacher) {
      const user = await this.getUser(teacher.userId);
      populatedSlot.teacher = { ...teacher, user };
    }
    
    const classroom = await this.getClassroom(slot.classroomId);
    if (classroom) {
      populatedSlot.classroom = classroom;
    }
    
    if (slot.originalTeacherId) {
      const originalTeacher = await this.getTeacher(slot.originalTeacherId);
      if (originalTeacher) {
        const user = await this.getUser(originalTeacher.userId);
        populatedSlot.originalTeacher = { ...originalTeacher, user };
      }
    }
    
    return populatedSlot as Slot;
  }

  async getSlots(timetableId?: number, divisionId?: number, day?: string): Promise<Slot[]> {
    let filteredSlots = Array.from(this.slots.values());
    
    if (timetableId !== undefined) {
      filteredSlots = filteredSlots.filter(slot => slot.timetableId === timetableId);
    }
    
    if (divisionId !== undefined) {
      // Filter slots by division (need to get timetable first)
      const divisionTimetables = await this.getTimetables(divisionId);
      const timetableIds = divisionTimetables.map(t => t.id);
      filteredSlots = filteredSlots.filter(slot => timetableIds.includes(slot.timetableId));
    }
    
    if (day !== undefined) {
      filteredSlots = filteredSlots.filter(slot => slot.day === day);
    }
    
    // Populate each slot with related entities
    const populatedSlots = await Promise.all(
      filteredSlots.map(async (slot) => this.getSlot(slot.id))
    );
    
    return populatedSlots.filter((slot): slot is Slot => slot !== undefined);
  }

  async createSlot(slot: InsertSlot): Promise<Slot> {
    const id = this.slotIdCounter++;
    const newSlot: Slot = { 
      ...slot, 
      id, 
      isSubstitution: slot.isSubstitution !== undefined ? slot.isSubstitution : false 
    };
    this.slots.set(id, newSlot);
    
    // Return a populated slot
    return this.getSlot(id) as Promise<Slot>;
  }

  async updateSlot(id: number, updates: Partial<Slot>): Promise<Slot | undefined> {
    const slot = this.slots.get(id);
    if (!slot) return undefined;
    
    const updatedSlot: Slot = { ...slot, ...updates };
    this.slots.set(id, updatedSlot);
    
    // Return a populated slot
    return this.getSlot(id);
  }

  async deleteSlot(id: number): Promise<void> {
    this.slots.delete(id);
  }

  async assignSubstitute(slotId: number, newTeacherId: number): Promise<Slot | undefined> {
    const slot = this.slots.get(slotId);
    if (!slot) return undefined;
    
    const updatedSlot: Slot = { 
      ...slot, 
      originalTeacherId: slot.teacherId, 
      teacherId: newTeacherId,
      isSubstitution: true
    };
    this.slots.set(slotId, updatedSlot);
    
    // Return a populated slot
    return this.getSlot(slotId);
  }

  // Conflict methods
  async getConflict(id: number): Promise<Conflict | undefined> {
    return this.conflicts.get(id);
  }

  async getConflicts(divisionId?: number): Promise<Conflict[]> {
    let allConflicts = Array.from(this.conflicts.values());
    
    if (divisionId !== undefined) {
      // Filter conflicts related to the division
      // This would require looking at the slots and their associated timetables
      const divisionTimetables = await this.getTimetables(divisionId);
      const timetableIds = divisionTimetables.map(t => t.id);
      
      allConflicts = allConflicts.filter(conflict => {
        // Check if conflict's slots belong to this division's timetables
        if (conflict.details && conflict.details.slots) {
          const slots = conflict.details.slots as Slot[];
          return slots.some(slot => timetableIds.includes(slot.timetableId));
        }
        return false;
      });
    }
    
    return allConflicts;
  }

  async detectAndRecordConflicts(): Promise<Conflict[]> {
    // Clear existing unresolved conflicts
    Array.from(this.conflicts.entries())
      .filter(([_, conflict]) => !conflict.resolved)
      .forEach(([id, _]) => this.conflicts.delete(id));
    
    const allSlots = await this.getSlots();
    const newConflicts: Conflict[] = [];
    
    // Detect teacher clashes
    const teacherClashes = this.detectTeacherClashes(allSlots);
    newConflicts.push(...teacherClashes);
    
    // Detect classroom conflicts
    const roomConflicts = this.detectClassroomConflicts(allSlots);
    newConflicts.push(...roomConflicts);
    
    // Detect time allocation issues
    // For simplicity, we'll assume college hours are 8 AM to 5 PM
    const timeAllocationConflicts = this.detectTimeAllocationIssues(allSlots, "08:00", "17:00");
    newConflicts.push(...timeAllocationConflicts);
    
    // Store the detected conflicts
    for (const conflict of newConflicts) {
      const id = this.conflictIdCounter++;
      this.conflicts.set(id, { ...conflict, id });
    }
    
    return this.getConflicts();
  }

  async resolveConflict(id: number): Promise<Conflict | undefined> {
    const conflict = this.conflicts.get(id);
    if (!conflict) return undefined;
    
    const resolvedConflict: Conflict = { ...conflict, resolved: true };
    this.conflicts.set(id, resolvedConflict);
    
    return resolvedConflict;
  }

  // Helper methods for conflict detection
  private detectTeacherClashes(slots: Slot[]): Conflict[] {
    const conflicts: Conflict[] = [];
    
    // Group slots by day
    const slotsByDay: Record<string, Slot[]> = {};
    for (const slot of slots) {
      if (!slotsByDay[slot.day]) {
        slotsByDay[slot.day] = [];
      }
      slotsByDay[slot.day].push(slot);
    }
    
    // Check for teacher clashes within each day
    for (const [day, daySlots] of Object.entries(slotsByDay)) {
      for (let i = 0; i < daySlots.length; i++) {
        for (let j = i + 1; j < daySlots.length; j++) {
          const slot1 = daySlots[i];
          const slot2 = daySlots[j];
          
          // Skip if different teachers
          if (slot1.teacherId !== slot2.teacherId) continue;
          
          // Check if time periods overlap
          if (this.timePeriodsOverlap(
            slot1.startTime, slot1.endTime, 
            slot2.startTime, slot2.endTime
          )) {
            const teacher = this.teachers.get(slot1.teacherId);
            const user = teacher ? this.users.get(teacher.userId) : undefined;
            const teacherName = user ? user.name : "Unknown Teacher";
            
            conflicts.push({
              id: 0, // Will be assigned when stored
              type: "TeacherClash",
              description: `${teacherName} is assigned to multiple classes at the same time`,
              day: slot1.day,
              time: `${slot1.startTime} - ${slot1.endTime}`,
              resolved: false,
              details: {
                teacherId: slot1.teacherId,
                teacherName,
                slots: [slot1, slot2]
              }
            });
          }
        }
      }
    }
    
    return conflicts;
  }

  private detectClassroomConflicts(slots: Slot[]): Conflict[] {
    const conflicts: Conflict[] = [];
    
    // Group slots by day
    const slotsByDay: Record<string, Slot[]> = {};
    for (const slot of slots) {
      if (!slotsByDay[slot.day]) {
        slotsByDay[slot.day] = [];
      }
      slotsByDay[slot.day].push(slot);
    }
    
    // Check for classroom conflicts within each day
    for (const [day, daySlots] of Object.entries(slotsByDay)) {
      for (let i = 0; i < daySlots.length; i++) {
        for (let j = i + 1; j < daySlots.length; j++) {
          const slot1 = daySlots[i];
          const slot2 = daySlots[j];
          
          // Skip if different classrooms
          if (slot1.classroomId !== slot2.classroomId) continue;
          
          // Check if time periods overlap
          if (this.timePeriodsOverlap(
            slot1.startTime, slot1.endTime, 
            slot2.startTime, slot2.endTime
          )) {
            const classroom = this.classrooms.get(slot1.classroomId);
            const classroomName = classroom ? classroom.name : "Unknown Classroom";
            
            conflicts.push({
              id: 0, // Will be assigned when stored
              type: "RoomConflict",
              description: `${classroomName} is assigned to multiple classes at the same time`,
              day: slot1.day,
              time: `${slot1.startTime} - ${slot1.endTime}`,
              resolved: false,
              details: {
                classroomId: slot1.classroomId,
                classroomName,
                slots: [slot1, slot2]
              }
            });
          }
        }
      }
    }
    
    return conflicts;
  }

  private detectTimeAllocationIssues(slots: Slot[], collegeStartTime: string, collegeEndTime: string): Conflict[] {
    const conflicts: Conflict[] = [];
    
    const startMinutes = this.timeToMinutes(collegeStartTime);
    const endMinutes = this.timeToMinutes(collegeEndTime);
    
    for (const slot of slots) {
      const slotStartMinutes = this.timeToMinutes(slot.startTime);
      const slotEndMinutes = this.timeToMinutes(slot.endTime);
      
      if (slotStartMinutes < startMinutes || slotEndMinutes > endMinutes) {
        const subject = this.subjects.get(slot.subjectId);
        const subjectName = subject ? subject.name : "Unknown Subject";
        
        conflicts.push({
          id: 0, // Will be assigned when stored
          type: "TimeAllocation",
          description: `${subjectName} is scheduled outside college hours (${collegeStartTime} - ${collegeEndTime})`,
          day: slot.day,
          time: `${slot.startTime} - ${slot.endTime}`,
          resolved: false,
          details: {
            slot,
            collegeHours: {
              start: collegeStartTime,
              end: collegeEndTime
            }
          }
        });
      }
    }
    
    return conflicts;
  }

  private timePeriodsOverlap(start1: string, end1: string, start2: string, end2: string): boolean {
    const start1Minutes = this.timeToMinutes(start1);
    const end1Minutes = this.timeToMinutes(end1);
    const start2Minutes = this.timeToMinutes(start2);
    const end2Minutes = this.timeToMinutes(end2);
    
    return (
      (start1Minutes < end2Minutes && end1Minutes > start2Minutes) ||
      (start2Minutes < end1Minutes && end2Minutes > start1Minutes)
    );
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  }
}

export const storage = new MemStorage();

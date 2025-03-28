import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Department, InsertDepartment, Teacher, InsertTeacher, Subject, InsertSubject, Classroom, InsertClassroom } from '../shared/schema';

// Fix for ESM modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define base directory for storing CSV files
const CSV_DIR = path.join(__dirname, '../data');

// Ensure directory exists
if (!fs.existsSync(CSV_DIR)) {
  fs.mkdirSync(CSV_DIR, { recursive: true });
}

// CSV file paths
const DEPARTMENTS_CSV = path.join(CSV_DIR, 'departments.csv');
const TEACHERS_CSV = path.join(CSV_DIR, 'teachers.csv');
const SUBJECTS_CSV = path.join(CSV_DIR, 'subjects.csv');
const CLASSROOMS_CSV = path.join(CSV_DIR, 'classrooms.csv');

// Initialize CSV files if they don't exist
function initializeCsvFiles() {
  if (!fs.existsSync(DEPARTMENTS_CSV)) {
    fs.writeFileSync(DEPARTMENTS_CSV, 'id,name,shortName\n');
  }
  
  if (!fs.existsSync(TEACHERS_CSV)) {
    fs.writeFileSync(TEACHERS_CSV, 'id,userId,name,email,isUpset\n');
  }
  
  if (!fs.existsSync(SUBJECTS_CSV)) {
    fs.writeFileSync(SUBJECTS_CSV, 'id,name,shortName,credits,semester,departmentId\n');
  }
  
  if (!fs.existsSync(CLASSROOMS_CSV)) {
    fs.writeFileSync(CLASSROOMS_CSV, 'id,name,capacity,departmentId\n');
  }
}

// Parse CSV to array of objects
function parseCsv(csvPath: string): any[] {
  if (!fs.existsSync(csvPath)) {
    return [];
  }
  
  const content = fs.readFileSync(csvPath, 'utf8');
  const lines = content.trim().split('\n');
  
  if (lines.length <= 1) {
    return []; // Only headers, no data
  }
  
  const headers = lines[0].split(',');
  
  return lines.slice(1).map(line => {
    const values = line.split(',');
    const obj: Record<string, any> = {};
    
    headers.forEach((header, index) => {
      // Convert string values to appropriate types
      const value = values[index];
      if (value === 'true') {
        obj[header] = true;
      } else if (value === 'false') {
        obj[header] = false;
      } else if (!isNaN(Number(value)) && value !== '') {
        obj[header] = Number(value);
      } else {
        obj[header] = value;
      }
    });
    
    return obj;
  });
}

// Convert array of objects to CSV string
function objectsToCsv(objects: any[], headers: string[]): string {
  const headerRow = headers.join(',');
  const rows = objects.map(obj => {
    return headers.map(header => {
      const value = obj[header] ?? '';
      return value;
    }).join(',');
  });
  
  return [headerRow, ...rows].join('\n');
}

// Write data to CSV file
function writeCsv(csvPath: string, data: any[], headers: string[]): void {
  const csvContent = objectsToCsv(data, headers);
  fs.writeFileSync(csvPath, csvContent);
}

// CSV Storage implementation
export class CsvStorage {
  private departmentIdCounter: number = 1;
  private teacherIdCounter: number = 1;
  private subjectIdCounter: number = 1;
  private classroomIdCounter: number = 1;
  
  constructor() {
    initializeCsvFiles();
    this.loadCounters();
  }
  
  // Load the highest IDs from existing data
  private loadCounters(): void {
    const departments = this.getDepartments();
    if (departments.length > 0) {
      this.departmentIdCounter = Math.max(...departments.map(d => d.id)) + 1;
    }
    
    const teachers = this.getTeachers();
    if (teachers.length > 0) {
      this.teacherIdCounter = Math.max(...teachers.map(t => t.id)) + 1;
    }
    
    const subjects = this.getSubjects();
    if (subjects.length > 0) {
      this.subjectIdCounter = Math.max(...subjects.map(s => s.id)) + 1;
    }
    
    const classrooms = this.getClassrooms();
    if (classrooms.length > 0) {
      this.classroomIdCounter = Math.max(...classrooms.map(c => c.id)) + 1;
    }
  }
  
  // Department operations
  getDepartments(): Department[] {
    return parseCsv(DEPARTMENTS_CSV) as Department[];
  }
  
  getDepartment(id: number): Department | undefined {
    return this.getDepartments().find(d => d.id === id);
  }
  
  createDepartment(department: InsertDepartment): Department {
    const departments = this.getDepartments();
    const newDepartment = { 
      ...department, 
      id: this.departmentIdCounter++ 
    };
    
    departments.push(newDepartment);
    writeCsv(DEPARTMENTS_CSV, departments, ['id', 'name', 'shortName']);
    
    return newDepartment;
  }
  
  // Teacher operations
  getTeachers(): Teacher[] {
    return parseCsv(TEACHERS_CSV) as Teacher[];
  }
  
  getTeacher(id: number): Teacher | undefined {
    return this.getTeachers().find(t => t.id === id);
  }
  
  createTeacher(teacher: InsertTeacher & { name: string, email: string }): Teacher {
    const teachers = this.getTeachers();
    const newTeacher = { 
      ...teacher, 
      id: this.teacherIdCounter++,
      isUpset: false
    };
    
    teachers.push(newTeacher);
    writeCsv(TEACHERS_CSV, teachers, ['id', 'userId', 'name', 'email', 'isUpset']);
    
    return newTeacher;
  }
  
  updateTeacherUpsetStatus(id: number, isUpset: boolean): Teacher | undefined {
    const teachers = this.getTeachers();
    const teacherIndex = teachers.findIndex(t => t.id === id);
    
    if (teacherIndex === -1) return undefined;
    
    const updatedTeacher = { ...teachers[teacherIndex], isUpset };
    teachers[teacherIndex] = updatedTeacher;
    
    writeCsv(TEACHERS_CSV, teachers, ['id', 'userId', 'name', 'email', 'isUpset']);
    
    return updatedTeacher;
  }
  
  // Subject operations
  getSubjects(departmentId?: number): Subject[] {
    const subjects = parseCsv(SUBJECTS_CSV) as Subject[];
    
    if (departmentId !== undefined) {
      return subjects.filter(s => s.departmentId === departmentId);
    }
    
    return subjects;
  }
  
  getSubject(id: number): Subject | undefined {
    return this.getSubjects().find(s => s.id === id);
  }
  
  createSubject(subject: InsertSubject): Subject {
    const subjects = this.getSubjects();
    const newSubject = { 
      ...subject, 
      id: this.subjectIdCounter++ 
    };
    
    subjects.push(newSubject);
    writeCsv(SUBJECTS_CSV, subjects, ['id', 'name', 'shortName', 'credits', 'semester', 'departmentId']);
    
    return newSubject;
  }
  
  // Classroom operations
  getClassrooms(departmentId?: number): Classroom[] {
    const classrooms = parseCsv(CLASSROOMS_CSV) as Classroom[];
    
    if (departmentId !== undefined) {
      return classrooms.filter(c => c.departmentId === departmentId);
    }
    
    return classrooms;
  }
  
  getClassroom(id: number): Classroom | undefined {
    return this.getClassrooms().find(c => c.id === id);
  }
  
  createClassroom(classroom: InsertClassroom): Classroom {
    const classrooms = this.getClassrooms();
    const newClassroom = { 
      ...classroom, 
      id: this.classroomIdCounter++ 
    };
    
    classrooms.push(newClassroom);
    writeCsv(CLASSROOMS_CSV, classrooms, ['id', 'name', 'capacity', 'departmentId']);
    
    return newClassroom;
  }
}

// Create singleton instance
export const csvStorage = new CsvStorage();
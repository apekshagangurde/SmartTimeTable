import { useToast } from '@/hooks/use-toast';
import { Slot, Teacher, Subject, Classroom, Division, Timetable } from '@shared/schema';
import { firebaseApiRequest } from './queryClient';
import { queryClient } from './queryClient';
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// This utility function is needed by shadcn components
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(time: string): string {
  try {
    // Check if time is already in HH:MM format
    if (/^\d{1,2}:\d{2}$/.test(time)) {
      return time;
    }
    
    // Parse time as a date object (assuming it's in ISO format)
    const date = new Date(time);
    if (isNaN(date.getTime())) {
      return time; // Return as is if it's not a valid date
    }
    
    // Format to HH:MM
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  } catch (error) {
    console.error('Error formatting time:', error);
    return time; // Return original value if there's an error
  }
}

export function formatDate(date: string | Date): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) {
      return String(date); // Return as is if it's not a valid date
    }
    
    // Format to DD/MM/YYYY
    return `${dateObj.getDate().toString().padStart(2, '0')}/${(dateObj.getMonth() + 1).toString().padStart(2, '0')}/${dateObj.getFullYear()}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return String(date); // Return original value if there's an error
  }
}

export function getRandomColor(seed: number): string {
  // Generate a random color based on a seed number
  const hue = (seed * 137.5) % 360;
  return `hsl(${hue}, 70%, 85%)`;
}

export function useConfirmation() {
  const { toast } = useToast();
  
  const showConfirmation = (message: string, action: () => void) => {
    toast({
      title: 'Confirmation',
      description: message,
      // Using simpler version without action element
      // This avoids the React element type issue
    });
    // Execute action immediately instead of relying on toast action
    setTimeout(action, 100);
  };
  
  return { showConfirmation };
}

// Function to extract time from a datetime string
export function extractTime(dateTimeString: string): string {
  try {
    const date = new Date(dateTimeString);
    if (isNaN(date.getTime())) {
      return dateTimeString; // Return as is if it's not a valid date
    }
    
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  } catch (error) {
    console.error('Error extracting time:', error);
    return dateTimeString; // Return original value if there's an error
  }
}

// Function to extract date from a datetime string
export function extractDate(dateTimeString: string): string {
  try {
    const date = new Date(dateTimeString);
    if (isNaN(date.getTime())) {
      return dateTimeString; // Return as is if it's not a valid date
    }
    
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
  } catch (error) {
    console.error('Error extracting date:', error);
    return dateTimeString; // Return original value if there's an error
  }
}

// Function to generate sample data in Firebase for testing
export async function generateSampleData(
  useFirebase: boolean = true
): Promise<{ success: boolean; message: string }> {
  try {
    if (!useFirebase) {
      return { success: false, message: 'Sample data generation is only available with Firebase' };
    }
    
    // Create sample departments
    const department = await createSampleDepartment();
    
    // Create sample divisions
    const division = await createSampleDivision(department.id);
    
    // Create sample subjects
    const subjects = await createSampleSubjects(department.id);
    
    // Create sample classrooms
    const classrooms = await createSampleClassrooms(department.id);
    
    // Create sample teachers
    const teachers = await createSampleTeachers();
    
    // Create sample timetable
    const timetable = await createSampleTimetable(division.id);
    
    // Create sample slots
    await createSampleSlots(timetable.id, subjects, teachers, classrooms);
    
    return { success: true, message: 'Sample data generated successfully' };
  } catch (error) {
    console.error('Error generating sample data:', error);
    return { 
      success: false, 
      message: `An error occurred while generating sample data: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

// Helper function to create a sample department
async function createSampleDepartment(): Promise<any> {
  const response = await firebaseApiRequest('POST', 'departments', {
    name: 'Computer Science',
    shortName: 'CS'
  });
  const department = await response.json();
  
  // Invalidate queries
  queryClient.invalidateQueries({ queryKey: ['/firebase-api/departments'] });
  
  return department;
}

// Helper function to create a sample division
async function createSampleDivision(departmentId: string): Promise<any> {
  const response = await firebaseApiRequest('POST', 'divisions', {
    name: 'Computer Science - Year 1',
    departmentId
  });
  const division = await response.json();
  
  // Invalidate queries
  queryClient.invalidateQueries({ queryKey: ['/firebase-api/divisions'] });
  
  return division;
}

// Helper function to create sample subjects
async function createSampleSubjects(departmentId: string): Promise<any[]> {
  const subjectNames = [
    'Introduction to Programming',
    'Data Structures',
    'Algorithms',
    'Database Systems',
    'Operating Systems',
    'Computer Networks',
    'Software Engineering',
    'Artificial Intelligence',
    'Machine Learning',
    'Theoretical Computer Science'
  ];
  
  const subjects = [];
  
  for (const name of subjectNames) {
    const response = await firebaseApiRequest('POST', 'subjects', {
      name,
      shortName: name.split(' ').map(word => word[0]).join(''),
      departmentId,
      credits: Math.floor(Math.random() * 3) + 2 // Random credits between 2 and 4
    });
    
    subjects.push(await response.json());
  }
  
  // Invalidate queries
  queryClient.invalidateQueries({ queryKey: ['/firebase-api/subjects'] });
  
  return subjects;
}

// Helper function to create sample classrooms
async function createSampleClassrooms(departmentId: string): Promise<any[]> {
  const classroomNames = [
    'Lab 1',
    'Lab 2',
    'Lecture Hall A',
    'Lecture Hall B',
    'Seminar Room 1',
    'Seminar Room 2',
    'Tutorial Room 1',
    'Tutorial Room 2'
  ];
  
  const classrooms = [];
  
  for (const name of classroomNames) {
    const response = await firebaseApiRequest('POST', 'classrooms', {
      name,
      capacity: Math.floor(Math.random() * 50) + 30, // Random capacity between 30 and 79
      departmentId,
      building: 'Main Building',
      floor: Math.floor(Math.random() * 3) + 1 // Random floor between 1 and 3
    });
    
    classrooms.push(await response.json());
  }
  
  // Invalidate queries
  queryClient.invalidateQueries({ queryKey: ['/firebase-api/classrooms'] });
  
  return classrooms;
}

// Helper function to create sample teachers
async function createSampleTeachers(): Promise<any[]> {
  const teacherNames = [
    { name: 'Dr. John Smith', email: 'john.smith@example.com' },
    { name: 'Prof. Jane Doe', email: 'jane.doe@example.com' },
    { name: 'Dr. Robert Johnson', email: 'robert.johnson@example.com' },
    { name: 'Prof. Emily Brown', email: 'emily.brown@example.com' },
    { name: 'Dr. Michael Davis', email: 'michael.davis@example.com' },
    { name: 'Prof. Sarah Wilson', email: 'sarah.wilson@example.com' },
    { name: 'Dr. David Miller', email: 'david.miller@example.com' },
    { name: 'Prof. Jessica Taylor', email: 'jessica.taylor@example.com' }
  ];
  
  const teachers = [];
  
  // First create users
  let userId = 1;
  for (const teacher of teacherNames) {
    // Create user
    const userResponse = await firebaseApiRequest('POST', 'users', {
      name: teacher.name,
      email: teacher.email,
      username: teacher.email.split('@')[0],
      password: 'password123',
      role: 'teacher'
    });
    
    const user = await userResponse.json();
    
    // Create teacher
    const teacherResponse = await firebaseApiRequest('POST', 'teachers', {
      userId: user.id,
      name: teacher.name,
      email: teacher.email,
      isUpset: false
    });
    
    teachers.push(await teacherResponse.json());
    userId++;
  }
  
  // Invalidate queries
  queryClient.invalidateQueries({ queryKey: ['/firebase-api/users'] });
  queryClient.invalidateQueries({ queryKey: ['/firebase-api/teachers'] });
  
  return teachers;
}

// Helper function to create a sample timetable
async function createSampleTimetable(divisionId: string): Promise<any> {
  const now = new Date().toISOString();
  
  const response = await firebaseApiRequest('POST', 'timetables', {
    divisionId,
    createdAt: now,
    updatedAt: now,
    createdBy: '1' // Assuming user with ID 1
  });
  
  const timetable = await response.json();
  
  // Invalidate queries
  queryClient.invalidateQueries({ queryKey: ['/firebase-api/timetables'] });
  
  return timetable;
}

// Helper function to create sample slots
async function createSampleSlots(
  timetableId: string,
  subjects: any[],
  teachers: any[],
  classrooms: any[]
): Promise<void> {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const timeSlots = [
    { start: '09:00', end: '10:30' },
    { start: '10:45', end: '12:15' },
    { start: '13:00', end: '14:30' },
    { start: '14:45', end: '16:15' },
    { start: '16:30', end: '18:00' }
  ];
  
  let slotId = 1;
  
  for (const day of days) {
    for (const timeSlot of timeSlots) {
      // Randomly decide whether to create a slot
      if (Math.random() > 0.3) { // 70% chance to create a slot
        const subjectIndex = Math.floor(Math.random() * subjects.length);
        const teacherIndex = Math.floor(Math.random() * teachers.length);
        const classroomIndex = Math.floor(Math.random() * classrooms.length);
        
        await firebaseApiRequest('POST', 'slots', {
          timetableId,
          day,
          startTime: timeSlot.start,
          endTime: timeSlot.end,
          subjectId: subjects[subjectIndex].id,
          teacherId: teachers[teacherIndex].id,
          classroomId: classrooms[classroomIndex].id,
          type: Math.random() > 0.7 ? 'Lab' : 'Lecture',
          isSubstitution: Math.random() > 0.9 // 10% chance for substitution
        });
        
        slotId++;
      }
    }
  }
  
  // Invalidate queries
  queryClient.invalidateQueries({ queryKey: ['/firebase-api/slots'] });
}
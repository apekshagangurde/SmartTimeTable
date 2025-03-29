import { storage } from "./storage";
import { csvStorage } from "./csv-storage";
import { firebaseService } from "./firebase-service";
import { log } from "./vite";

// This service helps migrate data from our current storage systems to Firebase
// and ensures data consistency across all storage systems

export class MigrationService {
  // Flag to track if initial migration has been completed
  private static initialMigrationCompleted = false;

  // Migrate all data from current storage systems to Firebase
  static async migrateAllDataToFirebase(): Promise<void> {
    if (this.initialMigrationCompleted) {
      return;
    }

    try {
      log("Starting data migration to Firebase...", "migration");
      
      // Migrate departments
      await this.migrateDepartments();
      
      // Migrate divisions
      await this.migrateDivisions();
      
      // Migrate classrooms
      await this.migrateClassrooms();
      
      // Migrate subjects
      await this.migrateSubjects();
      
      // Migrate users
      await this.migrateUsers();
      
      // Migrate teachers
      await this.migrateTeachers();
      
      // Migrate timetables
      await this.migrateTimetables();
      
      // Migrate slots
      await this.migrateSlots();
      
      log("Data migration to Firebase completed successfully!", "migration");
      this.initialMigrationCompleted = true;
    } catch (error) {
      log(`Error during migration: ${error}`, "migration");
      throw error;
    }
  }

  // Department migration
  private static async migrateDepartments(): Promise<void> {
    try {
      log("Migrating departments...", "migration");
      
      // Get departments from in-memory storage
      const memDepartments = await storage.getDepartments();
      
      // Get departments from CSV storage
      const csvDepartments = csvStorage.getDepartments();
      
      // Combine departments, giving preference to CSV versions
      const csvIds = new Set(csvDepartments.map(d => d.id));
      const combinedDepartments = [
        ...memDepartments.filter(d => !csvIds.has(d.id)),
        ...csvDepartments
      ];
      
      // Add departments to Firebase if they don't already exist
      for (const department of combinedDepartments) {
        try {
          // Convert numeric ID to string for Firebase
          const firebaseDept = await firebaseService.getDepartment(department.id.toString());
          
          if (!firebaseDept) {
            // Create a new document with the numeric ID as a string
            await firebaseService.createDepartment({
              ...department,
              id: department.id.toString() // Convert ID to string
            });
            log(`Department ${department.name} (ID: ${department.id}) migrated to Firebase`, "migration");
          }
        } catch (err) {
          log(`Error migrating department ${department.id}: ${err}`, "migration");
        }
      }
    } catch (error) {
      log(`Department migration failed: ${error}`, "migration");
      throw error;
    }
  }

  // Division migration
  private static async migrateDivisions(): Promise<void> {
    try {
      log("Migrating divisions...", "migration");
      
      // Get divisions from in-memory storage
      const divisions = await storage.getDivisions();
      
      // Add divisions to Firebase
      for (const division of divisions) {
        try {
          // Convert numeric ID to string for Firebase
          const firebaseDiv = await firebaseService.getDivision(division.id.toString());
          
          if (!firebaseDiv) {
            // Create a new document with the numeric ID as a string
            await firebaseService.createDivision({
              ...division,
              id: division.id.toString(),
              departmentId: division.departmentId.toString()
            });
            log(`Division ${division.name} (ID: ${division.id}) migrated to Firebase`, "migration");
          }
        } catch (err) {
          log(`Error migrating division ${division.id}: ${err}`, "migration");
        }
      }
    } catch (error) {
      log(`Division migration failed: ${error}`, "migration");
      throw error;
    }
  }

  // Classroom migration
  private static async migrateClassrooms(): Promise<void> {
    try {
      log("Migrating classrooms...", "migration");
      
      // Get classrooms from in-memory storage
      const memClassrooms = await storage.getClassrooms();
      
      // Get classrooms from CSV storage
      const csvClassrooms = csvStorage.getClassrooms();
      
      // Combine classrooms, giving preference to CSV versions
      const csvIds = new Set(csvClassrooms.map(c => c.id));
      const combinedClassrooms = [
        ...memClassrooms.filter(c => !csvIds.has(c.id)),
        ...csvClassrooms
      ];
      
      // Add classrooms to Firebase
      for (const classroom of combinedClassrooms) {
        try {
          // Convert numeric ID to string for Firebase
          const firebaseClassroom = await firebaseService.getClassroom(classroom.id.toString());
          
          if (!firebaseClassroom) {
            // Create a new document with the numeric ID as a string
            await firebaseService.createClassroom({
              ...classroom,
              id: classroom.id.toString(),
              departmentId: classroom.departmentId.toString()
            });
            log(`Classroom ${classroom.name} (ID: ${classroom.id}) migrated to Firebase`, "migration");
          }
        } catch (err) {
          log(`Error migrating classroom ${classroom.id}: ${err}`, "migration");
        }
      }
    } catch (error) {
      log(`Classroom migration failed: ${error}`, "migration");
      throw error;
    }
  }

  // Subject migration
  private static async migrateSubjects(): Promise<void> {
    try {
      log("Migrating subjects...", "migration");
      
      // Get subjects from in-memory storage
      const memSubjects = await storage.getSubjects();
      
      // Get subjects from CSV storage
      const csvSubjects = csvStorage.getSubjects();
      
      // Combine subjects, giving preference to CSV versions
      const csvIds = new Set(csvSubjects.map(s => s.id));
      const combinedSubjects = [
        ...memSubjects.filter(s => !csvIds.has(s.id)),
        ...csvSubjects
      ];
      
      // Add subjects to Firebase
      for (const subject of combinedSubjects) {
        try {
          // Convert numeric ID to string for Firebase
          const firebaseSubject = await firebaseService.getSubject(subject.id.toString());
          
          if (!firebaseSubject) {
            // Create a new document with the numeric ID as a string
            await firebaseService.createSubject({
              ...subject,
              id: subject.id.toString(),
              departmentId: subject.departmentId.toString()
            });
            log(`Subject ${subject.name} (ID: ${subject.id}) migrated to Firebase`, "migration");
          }
        } catch (err) {
          log(`Error migrating subject ${subject.id}: ${err}`, "migration");
        }
      }
    } catch (error) {
      log(`Subject migration failed: ${error}`, "migration");
      throw error;
    }
  }

  // User migration
  private static async migrateUsers(): Promise<void> {
    try {
      log("Migrating users...", "migration");
      
      // Get users from in-memory storage
      const users = await storage.getUsers();
      
      // Add users to Firebase
      for (const user of users) {
        try {
          // Convert numeric ID to string for Firebase
          const firebaseUser = await firebaseService.getUser(user.id.toString());
          
          if (!firebaseUser) {
            // Create a new document with the numeric ID as a string
            await firebaseService.createUser({
              ...user,
              id: user.id.toString()
            });
            log(`User ${user.name} (ID: ${user.id}) migrated to Firebase`, "migration");
          }
        } catch (err) {
          log(`Error migrating user ${user.id}: ${err}`, "migration");
        }
      }
    } catch (error) {
      log(`User migration failed: ${error}`, "migration");
      throw error;
    }
  }

  // Teacher migration
  private static async migrateTeachers(): Promise<void> {
    try {
      log("Migrating teachers...", "migration");
      
      // Get teachers from in-memory storage
      const memTeachers = await storage.getTeachers();
      
      // Get teachers from CSV storage
      const csvTeachers = csvStorage.getTeachers();
      
      // Combine teachers, giving preference to CSV versions
      const csvIds = new Set(csvTeachers.map(t => t.id));
      const combinedTeachers = [
        ...memTeachers.filter(t => !csvIds.has(t.id)),
        ...csvTeachers
      ];
      
      // Add teachers to Firebase
      for (const teacher of combinedTeachers) {
        try {
          // Convert numeric ID to string for Firebase
          const firebaseTeacher = await firebaseService.getTeacher(teacher.id.toString());
          
          if (!firebaseTeacher) {
            // Create a new document with the numeric ID as a string
            await firebaseService.createTeacher({
              ...teacher,
              id: teacher.id.toString(),
              userId: teacher.userId.toString()
            });
            log(`Teacher ID: ${teacher.id} migrated to Firebase`, "migration");
          }
        } catch (err) {
          log(`Error migrating teacher ${teacher.id}: ${err}`, "migration");
        }
      }
    } catch (error) {
      log(`Teacher migration failed: ${error}`, "migration");
      throw error;
    }
  }

  // Timetable migration
  private static async migrateTimetables(): Promise<void> {
    try {
      log("Migrating timetables...", "migration");
      
      // Get timetables from in-memory storage
      const timetables = await storage.getTimetables();
      
      // Add timetables to Firebase
      for (const timetable of timetables) {
        try {
          // Convert numeric ID to string for Firebase
          const firebaseTimetable = await firebaseService.getTimetable(timetable.id.toString());
          
          if (!firebaseTimetable) {
            // Create a new document with the numeric ID as a string
            await firebaseService.createTimetable({
              ...timetable,
              id: timetable.id.toString(),
              divisionId: timetable.divisionId.toString(),
              createdBy: timetable.createdBy.toString()
            });
            log(`Timetable ID: ${timetable.id} migrated to Firebase`, "migration");
          }
        } catch (err) {
          log(`Error migrating timetable ${timetable.id}: ${err}`, "migration");
        }
      }
    } catch (error) {
      log(`Timetable migration failed: ${error}`, "migration");
      throw error;
    }
  }

  // Slot migration
  private static async migrateSlots(): Promise<void> {
    try {
      log("Migrating slots...", "migration");
      
      // Get slots from in-memory storage
      const slots = await storage.getSlots();
      
      // Add slots to Firebase
      for (const slot of slots) {
        try {
          // Convert numeric ID to string for Firebase
          const firebaseSlot = await firebaseService.getSlot(slot.id.toString());
          
          if (!firebaseSlot) {
            // Create a new document with the numeric ID as a string
            await firebaseService.createSlot({
              ...slot,
              id: slot.id.toString(),
              timetableId: slot.timetableId.toString(),
              subjectId: slot.subjectId.toString(),
              teacherId: slot.teacherId.toString(),
              classroomId: slot.classroomId.toString(),
              originalTeacherId: slot.originalTeacherId ? slot.originalTeacherId.toString() : null
            });
            log(`Slot ID: ${slot.id} migrated to Firebase`, "migration");
          }
        } catch (err) {
          log(`Error migrating slot ${slot.id}: ${err}`, "migration");
        }
      }
    } catch (error) {
      log(`Slot migration failed: ${error}`, "migration");
      throw error;
    }
  }
}

// Function to initialize migration process
export async function initializeMigration() {
  try {
    await MigrationService.migrateAllDataToFirebase();
    log("Firebase migration initialization complete", "migration");
  } catch (error) {
    log(`Migration initialization failed: ${error}`, "migration");
  }
}
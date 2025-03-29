import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc,
  deleteDoc, 
  query,
  where
} from "firebase/firestore";
import { log } from "./vite";

// Firebase configuration from your provided details
const firebaseConfig = {
  apiKey: "AIzaSyByap2Fp2yQ8NC4eYrUkWO68h9ajYDkp1s",
  authDomain: "be2025-46116.firebaseapp.com",
  projectId: "be2025-46116",
  storageBucket: "be2025-46116.firebasestorage.app",
  messagingSenderId: "381743137482",
  appId: "1:381743137482:web:32a3a3092ab13d127b6a33",
  measurementId: "G-YH6JCJFQR6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

class FirebaseService {
  // Collection references
  private departmentsRef = collection(firestore, 'departments');
  private divisionsRef = collection(firestore, 'divisions');
  private classroomsRef = collection(firestore, 'classrooms');
  private subjectsRef = collection(firestore, 'subjects');
  private teachersRef = collection(firestore, 'teachers');
  private teacherSubjectsRef = collection(firestore, 'teacherSubjects');
  private collegeHoursRef = collection(firestore, 'collegeHours');
  private timetablesRef = collection(firestore, 'timetables');
  private slotsRef = collection(firestore, 'slots');
  private usersRef = collection(firestore, 'users');
  private conflictsRef = collection(firestore, 'conflicts');

  // Generic create document method with automatic ID generation
  private async createDocument(collectionRef: any, data: Record<string, any>): Promise<Record<string, any>> {
    try {
      const docData = {
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const docRef = await addDoc(collectionRef, docData);
      return {
        id: docRef.id,
        ...data
      };
    } catch (error) {
      log(`Error creating document: ${error}`, 'firebase');
      throw error;
    }
  }

  // Generic create document method with specified ID
  private async createDocumentWithId(collectionRef: any, id: string, data: Record<string, any>): Promise<Record<string, any>> {
    try {
      const docRef = doc(collectionRef, id);
      const docData = {
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await setDoc(docRef, docData);
      return {
        id,
        ...data
      };
    } catch (error) {
      log(`Error creating document with ID: ${error}`, 'firebase');
      throw error;
    }
  }

  // Generic update document method
  private async updateDocument(collectionRef: any, id: string, data: Record<string, any>): Promise<Record<string, any>> {
    try {
      const docRef = doc(collectionRef, id);
      const updateData = {
        ...data,
        updatedAt: new Date().toISOString()
      };
      await updateDoc(docRef, updateData);
      const updatedDoc = await getDoc(docRef);
      const docData = updatedDoc.data() as Record<string, any>;
      return {
        id,
        ...docData
      };
    } catch (error) {
      log(`Error updating document: ${error}`, 'firebase');
      throw error;
    }
  }

  // Generic delete document method
  private async deleteDocument(collectionRef: any, id: string): Promise<void> {
    try {
      await deleteDoc(doc(collectionRef, id));
    } catch (error) {
      log(`Error deleting document: ${error}`, 'firebase');
      throw error;
    }
  }

  // Generic get all documents method
  private async getAllDocuments(collectionRef: any): Promise<any[]> {
    try {
      const snapshot = await getDocs(collectionRef);
      return snapshot.docs.map(doc => {
        const data = doc.data() as Record<string, any>;
        return {
          id: doc.id,
          ...data
        };
      });
    } catch (error) {
      log(`Error getting all documents: ${error}`, 'firebase');
      throw error;
    }
  }

  // Generic get document by ID method
  private async getDocumentById(collectionRef: any, id: string): Promise<any> {
    try {
      const docRef = doc(collectionRef, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data() as Record<string, any>;
        return {
          id: docSnap.id,
          ...data
        };
      } else {
        return null;
      }
    } catch (error) {
      log(`Error getting document by ID: ${error}`, 'firebase');
      throw error;
    }
  }

  // Generic query documents method
  private async queryDocuments(collectionRef: any, field: string, value: any): Promise<any[]> {
    try {
      const q = query(collectionRef, where(field, '==', value));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data() as Record<string, any>;
        return {
          id: doc.id,
          ...data
        };
      });
    } catch (error) {
      log(`Error querying documents: ${error}`, 'firebase');
      throw error;
    }
  }

  // Department methods
  async getDepartments() {
    return this.getAllDocuments(this.departmentsRef);
  }

  async getDepartment(id: string) {
    return this.getDocumentById(this.departmentsRef, id);
  }

  async createDepartment(department: any) {
    return this.createDocument(this.departmentsRef, department);
  }

  // Division methods
  async getDivisions(departmentId?: string) {
    if (departmentId) {
      return this.queryDocuments(this.divisionsRef, 'departmentId', departmentId);
    }
    return this.getAllDocuments(this.divisionsRef);
  }

  async getDivision(id: string) {
    return this.getDocumentById(this.divisionsRef, id);
  }

  async createDivision(division: any) {
    return this.createDocument(this.divisionsRef, division);
  }

  // Classroom methods
  async getClassrooms(departmentId?: string) {
    if (departmentId) {
      return this.queryDocuments(this.classroomsRef, 'departmentId', departmentId);
    }
    return this.getAllDocuments(this.classroomsRef);
  }

  async getClassroom(id: string) {
    return this.getDocumentById(this.classroomsRef, id);
  }

  async createClassroom(classroom: any) {
    return this.createDocument(this.classroomsRef, classroom);
  }

  // Subject methods
  async getSubjects(departmentId?: string) {
    if (departmentId) {
      return this.queryDocuments(this.subjectsRef, 'departmentId', departmentId);
    }
    return this.getAllDocuments(this.subjectsRef);
  }

  async getSubject(id: string) {
    return this.getDocumentById(this.subjectsRef, id);
  }

  async createSubject(subject: any) {
    return this.createDocument(this.subjectsRef, subject);
  }

  // Teacher methods
  async getTeachers() {
    return this.getAllDocuments(this.teachersRef);
  }

  async getTeacher(id: string) {
    return this.getDocumentById(this.teachersRef, id);
  }

  async createTeacher(teacher: any) {
    return this.createDocument(this.teachersRef, teacher);
  }

  async updateTeacherUpsetStatus(id: string, isUpset: boolean) {
    return this.updateDocument(this.teachersRef, id, { isUpset });
  }

  // Teacher Subject methods
  async getTeacherSubjects(teacherId: string) {
    return this.queryDocuments(this.teacherSubjectsRef, 'teacherId', teacherId);
  }

  async assignSubjectToTeacher(teacherId: string, subjectId: string) {
    return this.createDocument(this.teacherSubjectsRef, { teacherId, subjectId });
  }

  // College Hour methods
  async getCollegeHours(divisionId: string) {
    const results = await this.queryDocuments(this.collegeHoursRef, 'divisionId', divisionId);
    return results.length > 0 ? results[0] : null;
  }

  async setCollegeHours(collegeHours: any) {
    // Check if hours already exist for this division
    const existing = await this.getCollegeHours(collegeHours.divisionId);
    
    if (existing) {
      return this.updateDocument(this.collegeHoursRef, existing.id, collegeHours);
    } else {
      return this.createDocument(this.collegeHoursRef, collegeHours);
    }
  }

  // Timetable methods
  async getTimetables(divisionId?: string) {
    if (divisionId) {
      return this.queryDocuments(this.timetablesRef, 'divisionId', divisionId);
    }
    return this.getAllDocuments(this.timetablesRef);
  }

  async getTimetable(id: string) {
    return this.getDocumentById(this.timetablesRef, id);
  }

  async createTimetable(timetable: any) {
    return this.createDocument(this.timetablesRef, timetable);
  }

  // Slot methods
  async getSlots(timetableId?: string, divisionId?: string, day?: string) {
    if (timetableId) {
      return this.queryDocuments(this.slotsRef, 'timetableId', timetableId);
    }
    // Note: This implementation is simplified. For more complex queries with multiple conditions,
    // you would need to build a more sophisticated query.
    return this.getAllDocuments(this.slotsRef);
  }

  async getSlot(id: string) {
    return this.getDocumentById(this.slotsRef, id);
  }

  async createSlot(slot: any) {
    return this.createDocument(this.slotsRef, slot);
  }

  async updateSlot(id: string, updates: any) {
    return this.updateDocument(this.slotsRef, id, updates);
  }

  async deleteSlot(id: string) {
    return this.deleteDocument(this.slotsRef, id);
  }

  async assignSubstitute(slotId: string, newTeacherId: string) {
    const slot = await this.getSlot(slotId);
    if (!slot) return null;
    
    return this.updateDocument(this.slotsRef, slotId, {
      originalTeacherId: slot.teacherId,
      teacherId: newTeacherId,
      isSubstitution: true
    });
  }

  // User methods
  async getUsers() {
    return this.getAllDocuments(this.usersRef);
  }

  async getUser(id: string) {
    return this.getDocumentById(this.usersRef, id);
  }

  async getUserByUsername(username: string) {
    const users = await this.queryDocuments(this.usersRef, 'username', username);
    return users.length > 0 ? users[0] : null;
  }

  async createUser(user: any) {
    return this.createDocument(this.usersRef, user);
  }

  // Conflict methods
  async getConflicts(divisionId?: string) {
    if (divisionId) {
      return this.queryDocuments(this.conflictsRef, 'divisionId', divisionId);
    }
    return this.getAllDocuments(this.conflictsRef);
  }

  async getConflict(id: string) {
    return this.getDocumentById(this.conflictsRef, id);
  }

  async createConflict(conflict: any) {
    return this.createDocument(this.conflictsRef, conflict);
  }

  async resolveConflict(id: string) {
    return this.updateDocument(this.conflictsRef, id, { resolved: true });
  }

  // Method to detect and record conflicts
  async detectAndRecordConflicts() {
    // This would need to implement the conflict detection logic
    // For now, we'll just return an empty array
    return [];
  }
}

export const firebaseService = new FirebaseService();
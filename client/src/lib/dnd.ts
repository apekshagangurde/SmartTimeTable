import { Slot, Teacher, Subject, Classroom } from "@shared/schema";
import { canTeacherBeAssigned } from "./conflicts";
import { firebaseApiRequest } from "./queryClient";
import { queryClient } from "./queryClient";

// Define DnD item types
export const ItemTypes = {
  TEACHER: "teacher",
  SUBJECT: "subject",
  CLASSROOM: "classroom",
  SLOT: "slot",
};

// Interface for drag items
export interface DragItem {
  type: string;
  id: number;
  name: string;
  data: any;
}

// Interface for drop result
export interface DropResult {
  success: boolean;
  message?: string;
  slot?: Slot;
}

// Function to validate if an item can be dropped in a slot
export async function validateDrop(
  itemType: string,
  itemId: number,
  slotId: number,
  timetableId: number,
  slots: Slot[],
  teachers: Teacher[],
  subjects: Subject[],
  classrooms: Classroom[]
): Promise<DropResult> {
  // Find the target slot
  const targetSlot = slots.find(slot => slot.id === slotId);
  if (!targetSlot) {
    return { success: false, message: "Target slot not found" };
  }
  
  // Different validation based on item type
  switch (itemType) {
    case ItemTypes.TEACHER:
      // Check if the teacher is already assigned to another slot at the same time
      const teacher = teachers.find(t => t.id === itemId);
      if (!teacher) {
        return { success: false, message: "Teacher not found" };
      }
      
      const teacherAssignmentCheck = await canTeacherBeAssigned(targetSlot, itemId, slots);
      if (!teacherAssignmentCheck.canAssign) {
        return { success: false, message: teacherAssignmentCheck.reason };
      }
      
      return { success: true };
      
    case ItemTypes.SUBJECT:
      // Check if the subject exists
      const subject = subjects.find(s => s.id === itemId);
      if (!subject) {
        return { success: false, message: "Subject not found" };
      }
      
      return { success: true };
      
    case ItemTypes.CLASSROOM:
      // Check if the classroom is already in use at this time
      const classroom = classrooms.find(c => c.id === itemId);
      if (!classroom) {
        return { success: false, message: "Classroom not found" };
      }
      
      // Check if classroom is in use in another slot at the same time
      const classroomConflict = slots.find(
        slot => 
          slot.id !== slotId && 
          slot.classroomId === itemId &&
          slot.day === targetSlot.day &&
          ((slot.startTime <= targetSlot.startTime && slot.endTime > targetSlot.startTime) ||
           (slot.startTime >= targetSlot.startTime && slot.startTime < targetSlot.endTime))
      );
      
      if (classroomConflict) {
        return { 
          success: false, 
          message: `Classroom already in use at this time (${classroomConflict.day} ${classroomConflict.startTime} - ${classroomConflict.endTime})`
        };
      }
      
      return { success: true };
      
    default:
      return { success: false, message: "Invalid item type" };
  }
}

// Function to handle dropping a draggable item in a slot
export async function handleDrop(
  itemType: string,
  itemId: number,
  slotId: number,
  timetableId: number,
  useFirebase: boolean = false
): Promise<DropResult> {
  try {
    // Prepare update data based on item type
    let updateData: any = {};
    
    switch (itemType) {
      case ItemTypes.TEACHER:
        updateData = { teacherId: itemId };
        break;
      case ItemTypes.SUBJECT:
        updateData = { subjectId: itemId };
        break;
      case ItemTypes.CLASSROOM:
        updateData = { classroomId: itemId };
        break;
      default:
        return { success: false, message: "Invalid item type" };
    }
    
    // Update the slot - using either regular API or Firebase API
    let updatedSlot;
    
    if (useFirebase) {
      const response = await firebaseApiRequest(
        'PATCH',
        `slots/${slotId}`,
        updateData
      );
      updatedSlot = await response.json();
      
      // Invalidate Firebase queries
      queryClient.invalidateQueries({ queryKey: ['/firebase-api/slots'] });
      queryClient.invalidateQueries({ queryKey: [`/firebase-api/slots?timetableId=${timetableId}`] });
    } else {
      const response = await fetch(`/api/slots/${slotId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        return { success: false, message: `Failed to update slot: ${errorText}` };
      }
      
      updatedSlot = await response.json();
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['/api/slots'] });
      queryClient.invalidateQueries({ queryKey: [`/api/slots?timetableId=${timetableId}`] });
    }
    
    return { 
      success: true, 
      slot: updatedSlot
    };
  } catch (error) {
    console.error('Error in handleDrop:', error);
    return { 
      success: false, 
      message: `An error occurred while updating the slot: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

// Function to create a new slot
export async function createSlot(
  slotData: any,
  useFirebase: boolean = false
): Promise<{ success: boolean; slot?: Slot; message?: string }> {
  try {
    let newSlot;
    
    if (useFirebase) {
      // Convert numeric IDs to strings for Firebase
      const firebaseSlotData = {
        ...slotData,
        timetableId: slotData.timetableId.toString(),
        subjectId: slotData.subjectId.toString(),
        teacherId: slotData.teacherId.toString(),
        classroomId: slotData.classroomId.toString()
      };
      
      const response = await firebaseApiRequest('POST', 'slots', firebaseSlotData);
      newSlot = await response.json();
      
      // Invalidate Firebase queries
      queryClient.invalidateQueries({ queryKey: ['/firebase-api/slots'] });
      queryClient.invalidateQueries({ queryKey: [`/firebase-api/slots?timetableId=${slotData.timetableId}`] });
    } else {
      const response = await fetch('/api/slots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(slotData),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        return { success: false, message: `Failed to create slot: ${errorText}` };
      }
      
      newSlot = await response.json();
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['/api/slots'] });
      queryClient.invalidateQueries({ queryKey: [`/api/slots?timetableId=${slotData.timetableId}`] });
    }
    
    return { 
      success: true, 
      slot: newSlot
    };
  } catch (error) {
    console.error('Error in createSlot:', error);
    return { 
      success: false, 
      message: `An error occurred while creating the slot: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

// Function to delete a slot
export async function deleteSlot(
  slotId: number,
  timetableId: number,
  useFirebase: boolean = false
): Promise<{ success: boolean; message?: string }> {
  try {
    if (useFirebase) {
      await firebaseApiRequest('DELETE', `slots/${slotId}`, undefined);
      
      // Invalidate Firebase queries
      queryClient.invalidateQueries({ queryKey: ['/firebase-api/slots'] });
      queryClient.invalidateQueries({ queryKey: [`/firebase-api/slots?timetableId=${timetableId}`] });
    } else {
      const response = await fetch(`/api/slots/${slotId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        return { success: false, message: `Failed to delete slot: ${errorText}` };
      }
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['/api/slots'] });
      queryClient.invalidateQueries({ queryKey: [`/api/slots?timetableId=${timetableId}`] });
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error in deleteSlot:', error);
    return { 
      success: false, 
      message: `An error occurred while deleting the slot: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}
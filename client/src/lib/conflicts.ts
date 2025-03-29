import { firebaseApiRequest } from "./queryClient";
import { queryClient } from "./queryClient";
import { Slot, Teacher } from "@shared/schema";

// Function to determine if a teacher can be assigned to a slot
export async function canTeacherBeAssigned(
  slot: Slot, 
  newTeacherId: number,
  existingSlots: Slot[]
): Promise<{ canAssign: boolean; reason?: string }> {
  // Check if the teacher is already assigned to another slot at the same time/day
  const conflictingSlot = existingSlots.find(
    existingSlot => 
      existingSlot.id !== slot.id && 
      existingSlot.teacherId === newTeacherId &&
      existingSlot.day === slot.day &&
      ((existingSlot.startTime <= slot.startTime && existingSlot.endTime > slot.startTime) ||
       (existingSlot.startTime >= slot.startTime && existingSlot.startTime < slot.endTime))
  );
  
  if (conflictingSlot) {
    return { 
      canAssign: false, 
      reason: `Teacher already has a class at this time (${conflictingSlot.day} ${conflictingSlot.startTime} - ${conflictingSlot.endTime})`
    };
  }
  
  return { canAssign: true };
}

// Function to detect conflicts among a set of slots
export function detectSlotConflicts(slots: Slot[]): { teacherConflicts: Slot[][]; classroomConflicts: Slot[][] } {
  const teacherConflicts: Slot[][] = [];
  const classroomConflicts: Slot[][] = [];
  
  // Group slots by day
  const slotsByDay = slots.reduce((acc, slot) => {
    acc[slot.day] = acc[slot.day] || [];
    acc[slot.day].push(slot);
    return acc;
  }, {} as Record<string, Slot[]>);
  
  // Check for conflicts on each day
  Object.values(slotsByDay).forEach(daySlots => {
    // Check teacher conflicts
    const teacherSlotsByDay = daySlots.reduce((acc, slot) => {
      acc[slot.teacherId] = acc[slot.teacherId] || [];
      acc[slot.teacherId].push(slot);
      return acc;
    }, {} as Record<number, Slot[]>);
    
    Object.values(teacherSlotsByDay).forEach(teacherSlots => {
      // Sort by start time
      teacherSlots.sort((a, b) => a.startTime.localeCompare(b.startTime));
      
      // Check for overlaps
      for (let i = 0; i < teacherSlots.length - 1; i++) {
        const currentSlot = teacherSlots[i];
        const nextSlot = teacherSlots[i + 1];
        
        if (currentSlot.endTime > nextSlot.startTime) {
          teacherConflicts.push([currentSlot, nextSlot]);
        }
      }
    });
    
    // Check classroom conflicts
    const classroomSlotsByDay = daySlots.reduce((acc, slot) => {
      acc[slot.classroomId] = acc[slot.classroomId] || [];
      acc[slot.classroomId].push(slot);
      return acc;
    }, {} as Record<number, Slot[]>);
    
    Object.values(classroomSlotsByDay).forEach(classroomSlots => {
      // Sort by start time
      classroomSlots.sort((a, b) => a.startTime.localeCompare(b.startTime));
      
      // Check for overlaps
      for (let i = 0; i < classroomSlots.length - 1; i++) {
        const currentSlot = classroomSlots[i];
        const nextSlot = classroomSlots[i + 1];
        
        if (currentSlot.endTime > nextSlot.startTime) {
          classroomConflicts.push([currentSlot, nextSlot]);
        }
      }
    });
  });
  
  return { teacherConflicts, classroomConflicts };
}

// Find upset teachers based on workload
export async function findUpsetTeachers(teachers: Teacher[], slots: Slot[]): Promise<number[]> {
  const upsetTeacherIds: number[] = [];
  
  // Count the number of slots per teacher
  const slotCountByTeacher = slots.reduce((acc, slot) => {
    acc[slot.teacherId] = (acc[slot.teacherId] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);
  
  // Calculate average workload
  const totalSlots = Object.values(slotCountByTeacher).reduce((sum, count) => sum + count, 0);
  const averageWorkload = totalSlots / Object.keys(slotCountByTeacher).length;
  
  // Consider teachers with >20% more than average workload as potentially upset
  const upsetThreshold = averageWorkload * 1.2;
  
  teachers.forEach(teacher => {
    const teacherSlotCount = slotCountByTeacher[teacher.id] || 0;
    if (teacherSlotCount > upsetThreshold) {
      upsetTeacherIds.push(teacher.id);
      
      // Update the teacher's upset status in Firebase
      updateTeacherUpsetStatus(teacher.id, true).catch(console.error);
    } else if (teacher.isUpset && teacherSlotCount <= upsetThreshold) {
      // Reset upset status if it was previously set but the workload is now acceptable
      updateTeacherUpsetStatus(teacher.id, false).catch(console.error);
    }
  });
  
  return upsetTeacherIds;
}

// Function to update teacher upset status in Firebase
async function updateTeacherUpsetStatus(teacherId: number, isUpset: boolean): Promise<void> {
  try {
    await firebaseApiRequest('PATCH', `teachers/${teacherId}/upset`, { isUpset });
    
    // Invalidate the teacher cache
    queryClient.invalidateQueries({ queryKey: ['/firebase-api/teachers'] });
    queryClient.invalidateQueries({ queryKey: ['/api/teachers'] });
    
    console.log(`Updated teacher ${teacherId} upset status to ${isUpset}`);
  } catch (error) {
    console.error('Failed to update teacher upset status:', error);
  }
}

// Function to find potential substitute teachers for a slot
export async function findSubstituteCandidates(
  slot: Slot,
  allTeachers: Teacher[],
  allSlots: Slot[]
): Promise<Teacher[]> {
  // Start with all teachers
  const candidates: Teacher[] = [];
  
  // Filter out unavailable teachers
  for (const teacher of allTeachers) {
    // Skip the current teacher of the slot
    if (teacher.id === slot.teacherId) {
      continue;
    }
    
    // Check if the teacher is available at this time
    const result = await canTeacherBeAssigned(slot, teacher.id, allSlots);
    if (result.canAssign) {
      candidates.push(teacher);
    }
  }
  
  // Sort candidates - prefer teachers who aren't upset
  candidates.sort((a, b) => {
    // Not upset teachers come first
    if (a.isUpset !== b.isUpset) {
      return a.isUpset ? 1 : -1;
    }
    
    // Otherwise, sort by ID for consistency
    return a.id - b.id;
  });
  
  return candidates;
}
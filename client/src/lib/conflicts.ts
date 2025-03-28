import { SlotType, ConflictType, WeekdayType } from '../types';

// Check if two time periods overlap
function timePeriodsOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  const start1Minutes = timeToMinutes(start1);
  const end1Minutes = timeToMinutes(end1);
  const start2Minutes = timeToMinutes(start2);
  const end2Minutes = timeToMinutes(end2);

  return (
    (start1Minutes < end2Minutes && end1Minutes > start2Minutes) ||
    (start2Minutes < end1Minutes && end2Minutes > start1Minutes)
  );
}

// Convert time string to minutes
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

// Check for teacher clashes
export function detectTeacherClashes(slots: SlotType[]): ConflictType[] {
  const conflicts: ConflictType[] = [];
  
  // Group slots by day
  const slotsByDay = slots.reduce<Record<WeekdayType, SlotType[]>>((acc, slot) => {
    acc[slot.day] = [...(acc[slot.day] || []), slot];
    return acc;
  }, {} as Record<WeekdayType, SlotType[]>);

  // Check each day
  Object.entries(slotsByDay).forEach(([day, daySlots]) => {
    // Compare each slot with others on the same day
    for (let i = 0; i < daySlots.length; i++) {
      const slot1 = daySlots[i];
      
      for (let j = i + 1; j < daySlots.length; j++) {
        const slot2 = daySlots[j];
        
        // Skip if slots have different teachers
        if (slot1.teacherId !== slot2.teacherId) continue;
        
        // Check if time periods overlap
        if (timePeriodsOverlap(slot1.startTime, slot1.endTime, slot2.startTime, slot2.endTime)) {
          conflicts.push({
            id: conflicts.length + 1, // Temporary ID
            type: "TeacherClash",
            description: `Teacher is assigned to multiple classes at the same time`,
            day: day as WeekdayType,
            time: `${slot1.startTime} - ${slot1.endTime}`,
            resolved: false,
            details: {
              teacherId: slot1.teacherId,
              teacherName: slot1.teacher?.user?.name || 'Unknown',
              slots: [slot1, slot2]
            }
          });
        }
      }
    }
  });

  return conflicts;
}

// Check for classroom conflicts
export function detectClassroomConflicts(slots: SlotType[]): ConflictType[] {
  const conflicts: ConflictType[] = [];
  
  // Group slots by day
  const slotsByDay = slots.reduce<Record<WeekdayType, SlotType[]>>((acc, slot) => {
    acc[slot.day] = [...(acc[slot.day] || []), slot];
    return acc;
  }, {} as Record<WeekdayType, SlotType[]>);

  // Check each day
  Object.entries(slotsByDay).forEach(([day, daySlots]) => {
    // Compare each slot with others on the same day
    for (let i = 0; i < daySlots.length; i++) {
      const slot1 = daySlots[i];
      
      for (let j = i + 1; j < daySlots.length; j++) {
        const slot2 = daySlots[j];
        
        // Skip if slots have different classrooms
        if (slot1.classroomId !== slot2.classroomId) continue;
        
        // Check if time periods overlap
        if (timePeriodsOverlap(slot1.startTime, slot1.endTime, slot2.startTime, slot2.endTime)) {
          conflicts.push({
            id: conflicts.length + 1, // Temporary ID
            type: "RoomConflict",
            description: `Classroom is assigned to multiple classes at the same time`,
            day: day as WeekdayType,
            time: `${slot1.startTime} - ${slot1.endTime}`,
            resolved: false,
            details: {
              classroomId: slot1.classroomId,
              classroomName: slot1.classroom?.name || 'Unknown',
              slots: [slot1, slot2]
            }
          });
        }
      }
    }
  });

  return conflicts;
}

// Check for time allocation issues (outside college hours)
export function detectTimeAllocationIssues(
  slots: SlotType[],
  collegeStartTime: string,
  collegeEndTime: string
): ConflictType[] {
  const conflicts: ConflictType[] = [];
  const startMinutes = timeToMinutes(collegeStartTime);
  const endMinutes = timeToMinutes(collegeEndTime);
  
  slots.forEach(slot => {
    const slotStartMinutes = timeToMinutes(slot.startTime);
    const slotEndMinutes = timeToMinutes(slot.endTime);
    
    if (slotStartMinutes < startMinutes || slotEndMinutes > endMinutes) {
      conflicts.push({
        id: conflicts.length + 1, // Temporary ID
        type: "TimeAllocation",
        description: `Class scheduled outside college hours (${collegeStartTime} - ${collegeEndTime})`,
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
  });

  return conflicts;
}

// Combine all conflict detection methods
export function detectAllConflicts(
  slots: SlotType[],
  collegeStartTime: string,
  collegeEndTime: string
): ConflictType[] {
  return [
    ...detectTeacherClashes(slots),
    ...detectClassroomConflicts(slots),
    ...detectTimeAllocationIssues(slots, collegeStartTime, collegeEndTime)
  ];
}

// Find available teachers for substitution
export function findSubstituteCandidates(
  upsetTeacherId: number,
  slot: SlotType,
  allTeachers: any[],
  allSlots: SlotType[]
) {
  // Filter out the upset teacher
  const availableTeachers = allTeachers.filter(teacher => 
    teacher.id !== upsetTeacherId && !teacher.isUpset
  );

  return availableTeachers.map(teacher => {
    // Check if the teacher is busy during this slot
    const isBusy = allSlots.some(otherSlot => 
      otherSlot.teacherId === teacher.id && 
      otherSlot.day === slot.day &&
      timePeriodsOverlap(slot.startTime, slot.endTime, otherSlot.startTime, otherSlot.endTime)
    );
    
    // Check if teacher teaches the same subject
    const teachesSubject = teacher.subjects?.some((subject: any) => 
      subject.id === slot.subjectId
    );
    
    // Calculate compatibility score
    let compatibilityScore = 0;
    if (!isBusy) compatibilityScore += 50;
    if (teachesSubject) compatibilityScore += 50;
    
    return {
      teacher,
      isBusy,
      teachesSubject,
      compatibilityScore
    };
  })
  .filter(candidate => !candidate.isBusy) // Only return available teachers
  .sort((a, b) => b.compatibilityScore - a.compatibilityScore); // Sort by compatibility
}

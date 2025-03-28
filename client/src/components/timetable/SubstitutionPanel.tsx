import { useTimetable } from "@/context/TimetableContext";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { SlotType, TeacherType } from "@/types";
import { GitCompareArrows, UserCheck, CalendarClock, DoorOpen } from "lucide-react";
import { findSubstituteCandidates } from "@/lib/conflicts";

export default function SubstitutionPanel() {
  const { 
    teachers,
    slots,
    markTeacherAsUpset,
    assignSubstitute
  } = useTimetable();
  
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  
  // Find upset teachers
  const upsetTeachers = teachers.filter(teacher => teacher.isUpset);
  
  // Get slots for upset teachers on the selected date
  const getUpsetTeacherSlots = (teacherId: number): SlotType[] => {
    return slots.filter(slot => 
      slot.teacherId === teacherId && 
      // In a real implementation, we would check the date from the day property
      !slot.isSubstitution
    );
  };

  // Get substitute candidates for a specific slot
  const getSubstituteCandidates = (upsetTeacherId: number, slot: SlotType) => {
    return findSubstituteCandidates(upsetTeacherId, slot, teachers, slots);
  };

  // Handle assigning a substitute
  const handleAssignSubstitute = async (slotId: number, newTeacherId: number) => {
    try {
      await assignSubstitute(slotId, newTeacherId);
    } catch (error) {
      console.error("Failed to assign substitute:", error);
    }
  };

  // Handle resetting upset status
  const handleResetUpsetStatus = async (teacherId: number) => {
    try {
      await markTeacherAsUpset(teacherId, false);
    } catch (error) {
      console.error("Failed to reset teacher status:", error);
    }
  };

  return (
    <aside className="bg-white w-80 shadow-md flex-shrink-0 hidden lg:block border-l border-neutral-light overflow-y-auto">
      <div className="p-4 border-b border-neutral-light">
        <h3 className="text-md font-medium text-neutral-dark flex items-center">
          <GitCompareArrows className="mr-2 h-5 w-5 text-secondary" />
          <span>Teacher Substitutions</span>
        </h3>
        <p className="text-xs text-neutral-medium mt-1">Manage teacher absences and replacements</p>
      </div>
      
      <div className="p-4">
        <div className="mb-4">
          <Label className="block text-xs text-neutral-medium mb-1">Date</Label>
          <div className="relative">
            <Input 
              type="date" 
              className="w-full rounded-md border border-neutral-light p-2 pr-8 bg-white focus:outline-none focus:ring-2 focus:ring-primary"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
            <CalendarClock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-medium h-4 w-4" />
          </div>
        </div>
        
        <h4 className="text-sm font-medium text-neutral-dark mb-2">Upset Teachers</h4>
        <div className="bg-neutral-lightest rounded-md p-3 mb-4">
          {upsetTeachers.length === 0 ? (
            <div className="text-center py-3 text-neutral-medium text-sm">
              No upset teachers for today
            </div>
          ) : (
            upsetTeachers.map(teacher => {
              const teacherSlots = getUpsetTeacherSlots(teacher.id);
              return teacherSlots.map(slot => (
                <div key={slot.id} className="bg-white rounded-md p-2 mb-2 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">{teacher.user?.name}</div>
                      <div className="text-xs text-neutral-medium">{slot.subject?.name}</div>
                    </div>
                    <div className="w-3 h-3 rounded-full bg-error" title="Upset"></div>
                  </div>
                  <div className="mt-2 text-xs">
                    <div className="flex justify-between">
                      <span>{slot.day}, {slot.startTime} - {slot.endTime}</span>
                      <span className="text-primary">{slot.classroom?.name}</span>
                    </div>
                  </div>
                  <div className="mt-2 flex justify-between items-center">
                    <span className="text-xs text-neutral-medium">Marked upset by Admin</span>
                    <Button 
                      variant="secondary"
                      size="sm"
                      className="text-xs bg-neutral-light hover:bg-neutral-medium text-neutral-dark hover:text-white px-2 py-1 rounded"
                      onClick={() => handleResetUpsetStatus(teacher.id)}
                    >
                      Reset
                    </Button>
                  </div>
                </div>
              ));
            })
          )}
        </div>
        
        {upsetTeachers.length > 0 && (
          <>
            <h4 className="text-sm font-medium text-neutral-dark mb-2">Suggested Substitutes</h4>
            <div className="bg-neutral-lightest rounded-md p-3">
              <p className="text-xs text-neutral-medium mb-2">Available teachers for substitution</p>
              
              {upsetTeachers.map(upsetTeacher => {
                const teacherSlots = getUpsetTeacherSlots(upsetTeacher.id);
                return teacherSlots.length > 0 && teacherSlots.map(slot => {
                  const candidates = getSubstituteCandidates(upsetTeacher.id, slot);
                  return candidates.length > 0 ? (
                    <div key={`candidates-${slot.id}`}>
                      {candidates.map((candidate, index) => (
                        <div 
                          key={`candidate-${candidate.teacher.id}-${slot.id}`}
                          className={`bg-white rounded-md p-2 mb-2 shadow-sm ${
                            index === 0 ? 'border-l-4 border-success' : ''
                          } cursor-pointer hover:bg-neutral-lightest`}
                        >
                          <div>
                            <div className="text-sm font-medium">{candidate.teacher.user?.name}</div>
                            <div className="text-xs text-neutral-medium">
                              {candidate.teachesSubject 
                                ? "Teaching same subject" 
                                : "Available during this slot"}
                            </div>
                          </div>
                          <div className="mt-2 flex justify-between items-center">
                            <span className={`text-xs ${
                              index === 0 ? 'text-success' : 'text-neutral-medium'
                            }`}>
                              {index === 0 ? 'Best match' : candidate.teachesSubject ? 'Compatible' : 'Available'}
                            </span>
                            <Button
                              className={`text-xs text-white px-2 py-1 rounded ${
                                index === 0 
                                  ? 'bg-success hover:bg-success/80' 
                                  : 'bg-primary hover:bg-primary/80'
                              }`}
                              onClick={() => handleAssignSubstitute(slot.id, candidate.teacher.id)}
                            >
                              Assign
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div key={`no-candidates-${slot.id}`} className="text-center py-2 text-neutral-medium text-sm">
                      No available substitutes for this slot
                    </div>
                  );
                });
              })}
            </div>
          </>
        )}
      </div>
    </aside>
  );
}

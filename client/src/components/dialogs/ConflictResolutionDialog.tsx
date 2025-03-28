import { useState } from "react";
import { ConflictType, SlotType } from "@/types";
import { useTimetable } from "@/context/TimetableContext";
import { findSubstituteCandidates } from "@/lib/conflicts";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { AlertTriangle, X } from "lucide-react";

interface ConflictResolutionDialogProps {
  conflict: ConflictType;
  onClose: () => void;
}

export default function ConflictResolutionDialog({
  conflict,
  onClose,
}: ConflictResolutionDialogProps) {
  const { teachers, resolveConflict, updateSlot, slots } = useTimetable();
  const [selectedOption, setSelectedOption] = useState("reassignTeacher");
  const [selectedTeacherId, setSelectedTeacherId] = useState<number | null>(null);

  // Different resolution options based on conflict type
  const getResolutionOptions = () => {
    if (conflict.type === "TeacherClash") {
      return [
        { id: "reassignTeacher", label: "Assign a different teacher to one of the courses" },
        { id: "rescheduleSlot1", label: `Reassign ${conflict.details?.slots?.[0]?.subject?.name} to a different time slot` },
        { id: "rescheduleSlot2", label: `Reassign ${conflict.details?.slots?.[1]?.subject?.name} to a different time slot` },
      ];
    } else if (conflict.type === "RoomConflict") {
      return [
        { id: "reassignRoom1", label: `Find different room for ${conflict.details?.slots?.[0]?.subject?.name}` },
        { id: "reassignRoom2", label: `Find different room for ${conflict.details?.slots?.[1]?.subject?.name}` },
        { id: "rescheduleSlot1", label: `Reschedule ${conflict.details?.slots?.[0]?.subject?.name} to a different time` },
        { id: "rescheduleSlot2", label: `Reschedule ${conflict.details?.slots?.[1]?.subject?.name} to a different time` },
      ];
    } else {
      // TimeAllocation conflict
      return [
        { id: "adjustSlotTime", label: "Adjust slot time to fit within college hours" },
        { id: "adjustCollegeHours", label: "Extend college hours to accommodate this slot" },
        { id: "rescheduleSlot", label: "Reschedule this class to a different time" },
      ];
    }
  };
  
  // Get available teachers for substitution
  const getAvailableTeachers = () => {
    if (conflict.type !== "TeacherClash" || !conflict.details?.slots) return [];
    
    const slot = conflict.details.slots[0] as SlotType;
    const teacherId = slot.teacherId;
    
    return findSubstituteCandidates(teacherId, slot, teachers, slots)
      .map(candidate => candidate.teacher);
  };

  // Handle applying the resolution
  const handleApplyResolution = async () => {
    try {
      if (conflict.type === "TeacherClash" && selectedOption === "reassignTeacher" && selectedTeacherId) {
        // In a real implementation, you would update the specific slot with the new teacher
        const slotToUpdate = conflict.details?.slots?.[0];
        if (slotToUpdate) {
          await updateSlot(slotToUpdate.id, { teacherId: selectedTeacherId });
        }
      }
      
      // Mark the conflict as resolved
      await resolveConflict(conflict.id);
      onClose();
    } catch (error) {
      console.error("Failed to apply resolution:", error);
    }
  };

  const availableTeachers = getAvailableTeachers();
  const conflictSlots = conflict.details?.slots || [];

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5 text-error" />
            <span>
              {conflict.type === "TeacherClash"
                ? "Resolve Teacher Clash"
                : conflict.type === "RoomConflict"
                ? "Resolve Classroom Conflict"
                : "Resolve Time Allocation Issue"}
            </span>
          </DialogTitle>
          <DialogDescription>
            {conflict.description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="mb-4">
          <p className="text-neutral-dark mb-2">Details:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {conflictSlots.map((slot: SlotType, index) => (
              <div key={index} className="bg-neutral-lightest p-3 rounded-md">
                <div className="text-sm font-medium">{slot.subject?.name}</div>
                <div className="text-xs text-neutral-medium">{slot.day}, {slot.startTime} - {slot.endTime}</div>
                <div className="text-xs text-neutral-medium">{slot.classroom?.name}</div>
                <div className="text-xs text-neutral-medium">Teacher: {slot.teacher?.user?.name}</div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mb-4">
          <h4 className="text-sm font-medium text-neutral-dark mb-2">Resolution Options</h4>
          <RadioGroup value={selectedOption} onValueChange={setSelectedOption} className="space-y-2">
            {getResolutionOptions().map(option => (
              <div key={option.id} className="flex items-center">
                <RadioGroupItem id={option.id} value={option.id} className="mr-2" />
                <Label htmlFor={option.id} className="text-sm">{option.label}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>
        
        {selectedOption === "reassignTeacher" && conflict.type === "TeacherClash" && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-neutral-dark mb-2">Available Teachers</h4>
            <div className="bg-neutral-lightest p-3 rounded-md">
              {availableTeachers.length === 0 ? (
                <div className="text-center py-2 text-neutral-medium">
                  No available teachers found
                </div>
              ) : (
                <div className="space-y-2">
                  {availableTeachers.map(teacher => (
                    <div key={teacher.id} className="flex items-center justify-between bg-white p-2 rounded-md">
                      <div>
                        <div className="text-sm font-medium">{teacher.user?.name}</div>
                        <div className="text-xs text-neutral-medium">Available during this slot</div>
                      </div>
                      <Button 
                        onClick={() => setSelectedTeacherId(teacher.id)}
                        variant={selectedTeacherId === teacher.id ? "default" : "outline"}
                        size="sm"
                      >
                        {selectedTeacherId === teacher.id ? "Selected" : "Assign"}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleApplyResolution}>
            Apply Resolution
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

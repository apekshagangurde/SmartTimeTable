import { useTimetable } from "@/context/TimetableContext";
import { AlertTriangle, User, DoorOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConflictType } from "@/types";

interface ConflictPanelProps {
  onViewOptions: (conflict: ConflictType) => void;
}

export default function ConflictPanel({ onViewOptions }: ConflictPanelProps) {
  const { conflicts, resolveConflict } = useTimetable();

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <h3 className="text-md font-medium text-neutral-dark mb-4 flex items-center">
        <AlertTriangle className="mr-2 h-5 w-5 text-error" />
        <span>Conflicts</span>
        {conflicts.length > 0 && (
          <span className="ml-2 bg-error text-white text-xs px-2 py-0.5 rounded-full">
            {conflicts.length}
          </span>
        )}
      </h3>
      
      {conflicts.length === 0 ? (
        <div className="text-center py-6 text-neutral-medium">
          No conflicts detected
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-light">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-neutral-medium uppercase tracking-wider">Type</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-neutral-medium uppercase tracking-wider">Day & Time</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-neutral-medium uppercase tracking-wider">Description</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-neutral-medium uppercase tracking-wider">Resolution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-light">
              {conflicts.map((conflict) => (
                <tr key={conflict.id}>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center text-xs px-2 py-1 rounded-full ${
                      conflict.type === "TeacherClash" 
                        ? "bg-error/10 text-error" 
                        : conflict.type === "RoomConflict" 
                        ? "bg-warning/10 text-warning" 
                        : "bg-info/10 text-info"
                    }`}>
                      {conflict.type === "TeacherClash" ? (
                        <User className="mr-1 h-3 w-3" />
                      ) : conflict.type === "RoomConflict" ? (
                        <DoorOpen className="mr-1 h-3 w-3" />
                      ) : (
                        <AlertTriangle className="mr-1 h-3 w-3" />
                      )}
                      <span>
                        {conflict.type === "TeacherClash" 
                          ? "Teacher Clash" 
                          : conflict.type === "RoomConflict" 
                          ? "Room Conflict" 
                          : "Time Allocation"}
                      </span>
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">{conflict.day}, {conflict.time}</td>
                  <td className="px-4 py-3 text-sm">{conflict.description}</td>
                  <td className="px-4 py-3">
                    <Button 
                      variant="link" 
                      onClick={() => onViewOptions(conflict)}
                      className="text-primary hover:underline text-sm p-0"
                    >
                      View Options
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

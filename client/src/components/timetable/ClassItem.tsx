import { useDrag } from "react-dnd";
import { ItemTypes } from "@/lib/dnd";
import { SlotType } from "@/types";
import { calculateSlotPosition, timeToMinutes } from "@/lib/dnd";
import { 
  AlertCircle, 
  UserIcon,
  DoorOpenIcon
} from "lucide-react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { cn } from "@/lib/utils";

interface ClassItemProps {
  slot: SlotType;
  hourHeight: number;
  startHour: number;
  onUpdate: (slot: Partial<SlotType>) => void;
  onDelete: () => void;
}

export default function ClassItem({ 
  slot, 
  hourHeight, 
  startHour,
  onUpdate,
  onDelete
}: ClassItemProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.SLOT,
    item: { type: "slot", id: slot.id, data: slot },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  // Calculate position and height
  const gridStartTime = `${startHour}:00`;
  const { top, height } = calculateSlotPosition(
    slot.startTime, 
    slot.endTime, 
    slot.day, 
    gridStartTime, 
    hourHeight
  );

  // Determine background color based on slot type
  const getBgColor = () => {
    if (slot.isSubstitution) {
      return "bg-amber-100 border-l-4 border-amber-500";
    }
    
    if (slot.type === "Lecture") {
      return "bg-rose-100 border-l-4 border-secondary";
    }
    
    if (slot.type === "Lab") {
      return "bg-blue-100 border-l-4 border-primary";
    }
    
    if (slot.type === "Tutorial") {
      return "bg-green-100 border-l-4 border-success";
    }
    
    return "bg-gray-100 border-l-4 border-gray-500";
  };

  // Check if there's a conflict
  const hasConflict = false; // This would be determined by your conflict detection logic

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div
          ref={drag}
          className={cn(
            "absolute left-0 right-0 p-1 cursor-move transition-opacity",
            isDragging ? "opacity-50" : "opacity-100"
          )}
          style={{
            top: `${top}px`,
            height: `${height}px`,
          }}
        >
          <div
            className={cn(
              "rounded-md p-2 h-full shadow-sm hover:shadow",
              getBgColor(),
              hasConflict && "bg-red-100 border-l-4 border-error"
            )}
          >
            <div className="flex justify-between items-start mb-1">
              <span className="text-xs font-medium">{slot.subject?.name || "Unknown Subject"}</span>
              <div className="flex">
                {hasConflict && (
                  <span className="bg-error text-white text-xs px-1 rounded mr-1 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-0.5" />
                    Conflict
                  </span>
                )}
                {slot.isSubstitution && (
                  <span className="bg-amber-500 text-white text-xs px-1 rounded mr-1">
                    Substitute
                  </span>
                )}
                <span
                  className={cn(
                    "text-white text-xs px-1 rounded",
                    slot.type === "Lecture" ? "bg-secondary" :
                    slot.type === "Lab" ? "bg-primary" :
                    "bg-success"
                  )}
                >
                  {slot.type}
                </span>
              </div>
            </div>
            <div className="text-xs text-neutral-medium mb-1">
              {slot.startTime} - {slot.endTime}
            </div>
            <div className="text-xs flex items-center">
              <UserIcon className="h-3 w-3 mr-1 text-neutral-medium" />
              <span>
                {slot.teacher?.user?.name || "Unknown Teacher"}
                {slot.isSubstitution && slot.originalTeacher && ` (Sub for ${slot.originalTeacher.user?.name})`}
              </span>
            </div>
            <div className="text-xs flex items-center">
              <DoorOpenIcon className="h-3 w-3 mr-1 text-neutral-medium" />
              <span>{slot.classroom?.name || "Unknown Room"}</span>
            </div>
          </div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={() => console.log("Edit clicked")}>
          Edit
        </ContextMenuItem>
        <ContextMenuItem onClick={() => console.log("Move clicked")}>
          Move
        </ContextMenuItem>
        <ContextMenuItem 
          className="text-red-500"
          onClick={onDelete}
        >
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

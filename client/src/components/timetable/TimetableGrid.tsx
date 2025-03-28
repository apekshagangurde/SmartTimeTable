import { useState, useMemo } from "react";
import { useDrop } from "react-dnd";
import { ItemTypes } from "../../lib/dnd";
import { SlotType, WeekdayType } from "../../types/timetable";
import ClassItem from "./ClassItem";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

type TimetableGridProps = {
  slots: SlotType[];
  onUpdate: (id: number, updates: Partial<SlotType>) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onCreateEmptySlot: (day: WeekdayType, hour: number) => void;
  readOnly?: boolean;
};

export default function TimetableGrid({ 
  slots, 
  onUpdate, 
  onDelete, 
  onCreateEmptySlot,
  readOnly = false 
}: TimetableGridProps) {
  const [hoveredCell, setHoveredCell] = useState<{ day: string, hour: number } | null>(null);
  
  const days: WeekdayType[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const hours = Array.from({ length: 11 }, (_, i) => i + 8); // 8 AM to 6 PM
  
  // Create a matrix of day x hour to easily look up slots
  const slotMatrix = useMemo(() => {
    const matrix: Record<string, Record<number, SlotType[]>> = {};
    
    // Initialize matrix
    days.forEach(day => {
      matrix[day] = {};
      hours.forEach(hour => {
        matrix[day][hour] = [];
      });
    });
    
    // Populate matrix with slots
    if (slots && slots.length > 0) {
      slots.forEach(slot => {
        const startHour = parseInt(slot.startTime.split(":")[0]);
        const endHour = parseInt(slot.endTime.split(":")[0]);
        
        // Place slot in all hours it spans
        for (let hour = startHour; hour < endHour; hour++) {
          if (matrix[slot.day] && matrix[slot.day][hour]) {
            matrix[slot.day][hour].push(slot);
          }
        }
      });
    }
    
    return matrix;
  }, [slots, days, hours]);
  
  // Handle slot dropping
  const handleDrop = (item: any, day: string, hour: number) => {
    if (item.id && item.type === 'slot') {
      // Update existing slot - cast day to WeekdayType
      onUpdate(item.id, {
        day: day as WeekdayType,
        startTime: String(hour).padStart(2, '0') + ":00",
        endTime: String(hour + 1).padStart(2, '0') + ":00"
      });
    } else {
      // Create new slot with the dragged resource
      onCreateEmptySlot(day as WeekdayType, hour);
    }
  };
  
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="p-2 border bg-muted text-center w-20">Time</th>
            {days.map(day => (
              <th key={day} className="p-2 border bg-muted text-center">{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {hours.map(hour => (
            <tr key={hour}>
              <td className="p-2 border text-center bg-muted font-medium">
                {hour}:00 - {hour + 1}:00
              </td>
              {days.map(day => {
                const currentSlots = slotMatrix[day][hour];
                const isHovered = hoveredCell?.day === day && hoveredCell?.hour === hour;
                
                // Set up drop target for the cell if not in readOnly mode
                const [{ isOver, canDrop }, drop] = useDrop({
                  accept: [ItemTypes.CLASS, ItemTypes.TEACHER, ItemTypes.SUBJECT, ItemTypes.CLASSROOM],
                  drop: (item: any) => !readOnly && handleDrop(item, day, hour),
                  canDrop: () => !readOnly,
                  collect: (monitor) => ({
                    isOver: monitor.isOver(),
                    canDrop: !readOnly && monitor.canDrop(),
                  }),
                });
                
                // Determine cell style based on drop state
                const cellStyle = isOver && canDrop
                  ? "bg-green-50 border-dashed"
                  : isOver && !canDrop
                    ? "bg-red-50 border-dashed"
                    : "";
                
                return (
                  <td
                    key={day + "-" + hour}
                    ref={drop}
                    className={"border p-1 relative min-h-20 h-20 transition-colors " + cellStyle}
                    onMouseEnter={() => setHoveredCell({ day, hour })}
                    onMouseLeave={() => setHoveredCell(null)}
                  >
                    {currentSlots.length > 0 ? (
                      <div className="space-y-1">
                        {currentSlots.map(slot => (
                          <ClassItem 
                            key={slot.id} 
                            slot={slot} 
                            onUpdate={onUpdate}
                            onDelete={onDelete}
                            readOnly={readOnly}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        {isHovered && !readOnly && (
                          <Button
                            variant="ghost"
                            className="h-full w-full rounded-none text-muted-foreground hover:bg-muted/30"
                            onClick={() => onCreateEmptySlot(day as WeekdayType, hour)}
                          >
                            <PlusCircle className="h-5 w-5" />
                          </Button>
                        )}
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
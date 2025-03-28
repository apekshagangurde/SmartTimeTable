import { useTimetable } from "@/context/TimetableContext";
import { useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useDrop } from "react-dnd";
import { ItemTypes } from "@/lib/dnd";
import { Button } from "@/components/ui/button";
import ClassItem from "./ClassItem";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { WeekdayType, SlotType } from "@/types";

interface TimetableGridProps {
  viewMode: "weekly" | "daily";
}

export default function TimetableGrid({ viewMode }: TimetableGridProps) {
  const { 
    slots, 
    currentWeek, 
    setCurrentWeek,
    collegeStartTime,
    collegeEndTime,
    createSlot,
    updateSlot,
    deleteSlot
  } = useTimetable();
  
  const { toast } = useToast();
  const gridRef = useRef<HTMLDivElement>(null);
  const [selectedDay, setSelectedDay] = useState<WeekdayType>("Monday");
  
  const weekdays: WeekdayType[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  
  // Generate time slots based on college hours
  const startHour = parseInt(collegeStartTime.split(":")[0]);
  const endHour = parseInt(collegeEndTime.split(":")[0]);
  const hours = Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i);
  
  // Format time display
  const formatTime = (hour: number) => {
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour > 12 ? hour - 12 : hour;
    return `${displayHour}:00 ${period}`;
  };

  // Handle drag and drop
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: [ItemTypes.TEACHER, ItemTypes.CLASSROOM, ItemTypes.SUBJECT, ItemTypes.SLOT],
    drop: (item: any, monitor) => {
      const dropPosition = monitor.getClientOffset();
      if (!dropPosition || !gridRef.current) return;
      
      // In a real implementation, calculate grid position and create a new slot
      toast({
        title: "Item dropped",
        description: `Dropped ${item.type} at position (${dropPosition.x}, ${dropPosition.y})`,
      });
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  }));

  // Navigate to previous/next week
  const navigateWeek = (direction: 'prev' | 'next') => {
    // In a real implementation, calculate previous/next week
    const newWeek = direction === 'prev' 
      ? "Oct 9 - Oct 15, 2023" 
      : "Oct 23 - Oct 29, 2023";
    setCurrentWeek(newWeek);
  };

  // Go to today's week
  const goToToday = () => {
    // In a real implementation, calculate current week
    setCurrentWeek("Oct 16 - Oct 22, 2023");
  };

  // Filter slots based on view mode
  const visibleSlots = viewMode === "weekly" 
    ? slots 
    : slots.filter(slot => slot.day === selectedDay);
  
  // Days to display based on view mode
  const visibleDays = viewMode === "weekly" ? weekdays : [selectedDay];

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigateWeek('prev')}
            className="p-2 rounded-full hover:bg-neutral-lightest text-neutral-dark"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-lg font-medium">{currentWeek}</h2>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigateWeek('next')}
            className="p-2 rounded-full hover:bg-neutral-lightest text-neutral-dark"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
        
        <Button 
          variant="link" 
          onClick={goToToday}
          className="text-sm text-primary hover:underline"
        >
          Today
        </Button>
      </div>
      
      <div className="overflow-x-auto">
        <div className="min-w-max" ref={drop}>
          <div 
            className="grid gap-1" 
            style={{ 
              gridTemplateColumns: `80px repeat(${visibleDays.length}, 1fr)`,
            }}
            ref={gridRef}
          >
            {/* Time column */}
            <div className="bg-neutral-lightest rounded-md">
              <div className="h-12 p-2 flex items-end justify-center">
                <span className="text-xs font-medium text-neutral-medium">Time</span>
              </div>
              {hours.map((hour) => (
                <div 
                  key={hour} 
                  className="h-20 p-2 flex items-center justify-center border-t border-neutral-light"
                >
                  <span className="text-xs text-neutral-medium">{formatTime(hour)}</span>
                </div>
              ))}
            </div>
            
            {/* Day columns */}
            {visibleDays.map((day) => (
              <div key={day} className="bg-neutral-lightest rounded-md">
                <div className="h-12 p-2 flex flex-col items-center justify-center">
                  <span className="text-xs font-medium text-neutral-dark">
                    {day.substring(0, 3).toUpperCase()}
                  </span>
                  <span className="text-xs text-neutral-medium">
                    {/* Display date based on day */}
                    {day === "Monday" ? "Oct 16" : 
                     day === "Tuesday" ? "Oct 17" : 
                     day === "Wednesday" ? "Oct 18" : 
                     day === "Thursday" ? "Oct 19" : "Oct 20"}
                  </span>
                </div>
                <div className="relative h-[400px] border-t border-neutral-light p-1">
                  {/* Render slots for this day */}
                  {visibleSlots
                    .filter(slot => slot.day === day)
                    .map(slot => (
                      <ClassItem 
                        key={slot.id} 
                        slot={slot} 
                        hourHeight={80} 
                        startHour={startHour}
                        onUpdate={(updatedSlot) => updateSlot(slot.id, updatedSlot)}
                        onDelete={() => deleteSlot(slot.id)}
                      />
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

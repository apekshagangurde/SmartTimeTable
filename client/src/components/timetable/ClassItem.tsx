import React, { useRef, useState } from "react";
import { useDrag } from "react-dnd";
import { ItemTypes } from "../../lib/dnd";
import { SlotType } from "../../types/timetable";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  Trash2, 
  Edit, 
  User,
  BookOpen,
  Home 
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ClassItemProps {
  slot: SlotType;
  onUpdate: (id: number, updates: Partial<SlotType>) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  readOnly?: boolean;
}

export default function ClassItem({ slot, onUpdate, onDelete, readOnly = false }: ClassItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPopover, setShowPopover] = useState(false);
  
  // The slot directly contains IDs, we'll display placeholders for now
  // In a real implementation, these would be populated through proper joins
  
  // Set up drag and drop if not in readOnly mode
  const [{ isDragging }, drag, preview] = useDrag({
    type: ItemTypes.SLOT,
    item: { id: slot.id, type: 'slot' },
    canDrag: () => !readOnly,
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  });
  
  // Determine card color based on subject or type
  const getCardColor = () => {
    const colors = [
      "bg-blue-50 border-blue-200",
      "bg-green-50 border-green-200",
      "bg-purple-50 border-purple-200",
      "bg-amber-50 border-amber-200",
      "bg-pink-50 border-pink-200",
      "bg-cyan-50 border-cyan-200",
    ];
    
    // Use subject id modulo number of colors to get a stable color per subject
    const colorIndex = slot.subjectId % colors.length;
    return colors[colorIndex];
  };
  
  const timeString = `${slot.startTime} - ${slot.endTime}`;
  
  const handleDelete = async () => {
    await onDelete(slot.id);
  };
  
  const handleClickOptions = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowPopover(!showPopover);
  };
  
  return (
    <Card 
      className={`p-2 ${getCardColor()} shadow-sm border ${!readOnly ? 'cursor-move' : 'cursor-default'} ${isDragging ? 'opacity-50' : 'opacity-100'}`}
      ref={drag}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm truncate">
            {slot.subject?.name || `Subject ${slot.subjectId}`}
          </h4>
          <p className="text-xs text-muted-foreground flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            {timeString}
          </p>
        </div>
        
        {!readOnly && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 rounded-full">
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem>
                <Edit className="h-4 w-4 mr-2" />
                <span>Edit</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600" onClick={handleDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      
      {isExpanded && (
        <div className="mt-2 space-y-1 text-xs">
          <div className="flex items-center">
            <User className="h-3 w-3 mr-1" />
            <span className="font-medium mr-1">Teacher:</span>
            <span>{slot.teacher?.name || `Teacher ${slot.teacherId}`}</span>
          </div>
          <div className="flex items-center">
            <BookOpen className="h-3 w-3 mr-1" />
            <span className="font-medium mr-1">Type:</span> 
            <span>{slot.type}</span>
          </div>
          <div className="flex items-center">
            <Home className="h-3 w-3 mr-1" />
            <span className="font-medium mr-1">Room:</span>
            <span>{slot.classroom?.name || `Room ${slot.classroomId}`}</span>
          </div>
        </div>
      )}
    </Card>
  );
}
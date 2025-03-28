import { RefObject } from "react";
import { GridCellPosition, WeekdayType } from "../types";

// DnD item types
export const ItemTypes = {
  TEACHER: "teacher",
  CLASSROOM: "classroom",
  SUBJECT: "subject",
  SLOT: "slot",
};

// Helper to convert time string to minutes since midnight
export const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

// Helper to convert minutes since midnight to time string
export const minutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
};

// Calculate position for a slot in the grid
export const calculateSlotPosition = (
  startTime: string,
  endTime: string,
  day: WeekdayType,
  gridStartTime: string,
  hourHeight: number
): {
  top: number;
  height: number;
  day: WeekdayType;
} => {
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);
  const gridStartMinutes = timeToMinutes(gridStartTime);
  
  const topOffset = (startMinutes - gridStartMinutes) / 60 * hourHeight;
  const heightValue = (endMinutes - startMinutes) / 60 * hourHeight;
  
  return {
    top: topOffset,
    height: heightValue,
    day
  };
};

// Calculate grid cell position from mouse coordinates
export const getGridCellFromPoint = (
  x: number, 
  y: number, 
  gridRef: RefObject<HTMLDivElement>,
  hourHeight: number,
  gridStartTime: string,
  days: WeekdayType[]
): GridCellPosition | null => {
  if (!gridRef.current) return null;
  
  const gridRect = gridRef.current.getBoundingClientRect();
  
  // Check if point is within grid
  if (
    x < gridRect.left || 
    x > gridRect.right || 
    y < gridRect.top || 
    y > gridRect.bottom
  ) {
    return null;
  }
  
  // Calculate relative position
  const relativeX = x - gridRect.left;
  const relativeY = y - gridRect.top - 48; // 48px for header
  
  if (relativeY < 0) return null;
  
  // Calculate day column
  const columnWidth = gridRect.width / (days.length + 1); // +1 for time column
  const columnIndex = Math.floor(relativeX / columnWidth);
  
  // First column is time, not a day
  if (columnIndex === 0) return null;
  if (columnIndex > days.length) return null;
  
  const day = days[columnIndex - 1];
  
  // Calculate time
  const gridStartMinutes = timeToMinutes(gridStartTime);
  const minutes = Math.floor(relativeY / hourHeight * 60) + gridStartMinutes;
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  
  return { day, hour, minute };
};

// Convert grid cell position to time string
export const gridCellToTimeString = (position: GridCellPosition): string => {
  return `${position.hour.toString().padStart(2, "0")}:${position.minute.toString().padStart(2, "0")}`;
};

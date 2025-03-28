import { GridCellPosition, WeekdayType } from "../types/timetable";

// Define the types for draggable items
export const ItemTypes = {
  TEACHER: 'teacher',
  CLASSROOM: 'classroom',
  SUBJECT: 'subject',
  SLOT: 'slot',
  CLASS: 'class'
};

// Convert time string to minutes for calculations
export const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

// Convert minutes back to time string
export const minutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
};

// Calculate the position for a slot based on the day and times
export const calculateSlotPosition = (
  day: WeekdayType,
  startTime: string,
  endTime: string,
  cellHeight: number = 60,
  cellWidth: number = 100
): { top: number; height: number; left: number; width: number } => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayIndex = days.indexOf(day);
  
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);
  
  // 8:00 AM (480 minutes) is the start of our grid
  const startOfDay = 8 * 60; 
  
  const top = ((startMinutes - startOfDay) / 60) * cellHeight;
  const height = ((endMinutes - startMinutes) / 60) * cellHeight;
  const left = dayIndex * cellWidth;
  
  return { top, height, left, width: cellWidth };
};

// Get grid cell from mouse position
export const getGridCellFromPoint = (
  x: number,
  y: number,
  gridRef: React.RefObject<HTMLDivElement>,
  cellWidth: number = 100,
  cellHeight: number = 60
): GridCellPosition | null => {
  if (!gridRef.current) return null;
  
  const rect = gridRef.current.getBoundingClientRect();
  const relX = x - rect.left;
  const relY = y - rect.top;
  
  // Out of bounds
  if (relX < 0 || relY < 0 || relX > rect.width || relY > rect.height) {
    return null;
  }
  
  // Adjust for the first column (times)
  const adjustedX = relX - 80; // 80px for the time column
  if (adjustedX < 0) return null;
  
  const dayIndex = Math.floor(adjustedX / cellWidth);
  const hour = Math.floor(relY / cellHeight) + 8; // 8 AM start
  
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  if (dayIndex < 0 || dayIndex >= days.length || hour < 8 || hour > 18) {
    return null;
  }
  
  return {
    day: days[dayIndex] as WeekdayType,
    hour
  };
};

// Convert grid cell to time string
export const gridCellToTimeString = (position: GridCellPosition): string => {
  return `${String(position.hour).padStart(2, '0')}:00`;
};
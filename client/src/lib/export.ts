import { Slot, Teacher, Subject, Classroom, Timetable, Division } from "@shared/schema";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export interface ExportOptions {
  title?: string;
  subtitle?: string;
  includeFooter?: boolean;
  footerText?: string;
  pageSize?: "a4" | "letter";
  orientation?: "portrait" | "landscape";
  includeTeacherInfo?: boolean;
  includeClassroomInfo?: boolean;
}

export async function exportTimetableToPdf(
  timetable: Timetable,
  slots: Slot[],
  division: Division,
  teachers: Teacher[],
  subjects: Subject[],
  classrooms: Classroom[],
  options: ExportOptions = {}
) {
  const now = new Date();
  const dateString = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;
  
  // Default options
  const {
    title = "Class Timetable",
    subtitle = `${division.name} - Generated on ${dateString}`,
    includeFooter = true,
    footerText = "Generated by Smart Timetable Management System",
    pageSize = "a4",
    orientation = "landscape",
    includeTeacherInfo = true,
    includeClassroomInfo = true,
  } = options;
  
  // Create a container element for the timetable
  const container = document.createElement("div");
  container.style.width = orientation === "landscape" ? "1100px" : "800px";
  container.style.padding = "20px";
  container.style.backgroundColor = "white";
  container.style.fontFamily = "Arial, sans-serif";
  
  // Add title and subtitle
  const titleElement = document.createElement("h1");
  titleElement.textContent = title;
  titleElement.style.textAlign = "center";
  titleElement.style.marginBottom = "5px";
  titleElement.style.color = "#333";
  
  const subtitleElement = document.createElement("h3");
  subtitleElement.textContent = subtitle;
  subtitleElement.style.textAlign = "center";
  subtitleElement.style.marginTop = "0";
  subtitleElement.style.marginBottom = "20px";
  subtitleElement.style.color = "#666";
  
  container.appendChild(titleElement);
  container.appendChild(subtitleElement);
  
  // Create timetable grid
  const timetableElement = document.createElement("table");
  timetableElement.style.width = "100%";
  timetableElement.style.borderCollapse = "collapse";
  
  // Group slots by day and sort by start time
  const slotsByDay: Record<string, Slot[]> = {};
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  
  days.forEach(day => {
    slotsByDay[day] = slots
      .filter(slot => slot.day === day)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  });
  
  // Create header row with days
  const headerRow = document.createElement("tr");
  
  // Add empty cell for time column
  const timeHeader = document.createElement("th");
  timeHeader.textContent = "Time";
  timeHeader.style.padding = "10px";
  timeHeader.style.backgroundColor = "#f2f2f2";
  timeHeader.style.border = "1px solid #ddd";
  headerRow.appendChild(timeHeader);
  
  // Add day headers
  days.forEach(day => {
    const dayHeader = document.createElement("th");
    dayHeader.textContent = day;
    dayHeader.style.padding = "10px";
    dayHeader.style.backgroundColor = "#f2f2f2";
    dayHeader.style.border = "1px solid #ddd";
    headerRow.appendChild(dayHeader);
  });
  
  timetableElement.appendChild(headerRow);
  
  // Find all unique time slots
  const allTimeSlots = slots.reduce((acc, slot) => {
    const timeSlot = `${slot.startTime}-${slot.endTime}`;
    if (!acc.includes(timeSlot)) {
      acc.push(timeSlot);
    }
    return acc;
  }, [] as string[]);
  
  // Sort time slots
  allTimeSlots.sort((a, b) => {
    const aStart = a.split("-")[0];
    const bStart = b.split("-")[0];
    return aStart.localeCompare(bStart);
  });
  
  // Create rows for each time slot
  allTimeSlots.forEach(timeSlot => {
    const [startTime, endTime] = timeSlot.split("-");
    
    const row = document.createElement("tr");
    
    // Add time cell
    const timeCell = document.createElement("td");
    timeCell.textContent = `${startTime} - ${endTime}`;
    timeCell.style.padding = "8px";
    timeCell.style.border = "1px solid #ddd";
    timeCell.style.fontWeight = "bold";
    row.appendChild(timeCell);
    
    // Add slots for each day
    days.forEach(day => {
      const cell = document.createElement("td");
      cell.style.padding = "8px";
      cell.style.border = "1px solid #ddd";
      cell.style.verticalAlign = "top";
      
      // Find slots for this day and time
      const daySlots = slotsByDay[day].filter(
        slot => slot.startTime === startTime && slot.endTime === endTime
      );
      
      // If no slots, leave empty
      if (daySlots.length === 0) {
        cell.textContent = "-";
        cell.style.textAlign = "center";
        cell.style.color = "#999";
      } else {
        // Create content for each slot
        daySlots.forEach(slot => {
          const subject = subjects.find(s => s.id === slot.subjectId);
          const teacher = teachers.find(t => t.id === slot.teacherId);
          const classroom = classrooms.find(c => c.id === slot.classroomId);
          
          const slotDiv = document.createElement("div");
          slotDiv.style.marginBottom = daySlots.length > 1 ? "10px" : "0";
          
          // Subject name
          const subjectElement = document.createElement("div");
          subjectElement.textContent = subject ? subject.name : "Unknown Subject";
          subjectElement.style.fontWeight = "bold";
          subjectElement.style.color = "#0066cc";
          slotDiv.appendChild(subjectElement);
          
          // Teacher ID (since teacher doesn't have name in the schema)
          if (includeTeacherInfo && teacher) {
            const teacherElement = document.createElement("div");
            teacherElement.textContent = `Teacher ID: ${teacher.id}`;
            teacherElement.style.fontSize = "0.9em";
            teacherElement.style.color = slot.isSubstitution ? "#c00" : "#333";
            slotDiv.appendChild(teacherElement);
          }
          
          // Classroom
          if (includeClassroomInfo && classroom) {
            const classroomElement = document.createElement("div");
            classroomElement.textContent = `Room: ${classroom.name}`;
            classroomElement.style.fontSize = "0.9em";
            classroomElement.style.color = "#666";
            slotDiv.appendChild(classroomElement);
          }
          
          cell.appendChild(slotDiv);
        });
      }
      
      row.appendChild(cell);
    });
    
    timetableElement.appendChild(row);
  });
  
  container.appendChild(timetableElement);
  
  // Add footer if needed
  if (includeFooter) {
    const footerElement = document.createElement("div");
    footerElement.textContent = footerText;
    footerElement.style.marginTop = "20px";
    footerElement.style.textAlign = "center";
    footerElement.style.fontSize = "0.8em";
    footerElement.style.color = "#999";
    container.appendChild(footerElement);
  }
  
  // Append to document temporarily
  document.body.appendChild(container);
  
  try {
    // Convert to PDF
    const canvas = await html2canvas(container, { 
      scale: 1.2, 
      useCORS: true,
      logging: false
    });
    
    // Create PDF
    const pdf = new jsPDF({
      orientation,
      unit: "mm",
      format: pageSize
    });
    
    const imgData = canvas.toDataURL("image/png");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const ratio = canvas.width / canvas.height;
    
    let imgWidth, imgHeight;
    
    if (orientation === "landscape") {
      imgWidth = pdfWidth - 20; // 10mm margin on each side
      imgHeight = imgWidth / ratio;
    } else {
      imgHeight = pdfHeight - 20; // 10mm margin on each side
      imgWidth = imgHeight * ratio;
    }
    
    pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
    
    // Download the PDF
    pdf.save(`timetable_${division.name.replace(/\s+/g, "_")}.pdf`);
  } finally {
    // Clean up
    document.body.removeChild(container);
  }
  
  return true;
}

// CSV export function
export function exportTimetableToCSV(
  timetable: Timetable,
  slots: Slot[],
  division: Division,
  teachers: Teacher[],
  subjects: Subject[],
  classrooms: Classroom[]
): string {
  // Create CSV header
  const csvRows = [];
  csvRows.push(["Timetable", timetable.id.toString(), timetable.divisionId.toString(), division.name]);
  csvRows.push([]);
  csvRows.push(["Day", "Start Time", "End Time", "Subject", "Teacher", "Classroom", "Substitution"]);
  
  // Sort slots by day and start time
  const sortedSlots = [...slots].sort((a, b) => {
    const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const dayComparison = dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
    
    if (dayComparison !== 0) {
      return dayComparison;
    }
    
    return a.startTime.localeCompare(b.startTime);
  });
  
  // Add data rows
  sortedSlots.forEach(slot => {
    const subject = subjects.find(s => s.id === slot.subjectId);
    const teacher = teachers.find(t => t.id === slot.teacherId);
    const classroom = classrooms.find(c => c.id === slot.classroomId);
    
    // Use teacher ID
    const teacherText = teacher ? `Teacher ID: ${teacher.id}` : "Unknown Teacher";
    
    csvRows.push([
      slot.day,
      slot.startTime,
      slot.endTime,
      subject ? subject.name : "Unknown Subject",
      teacherText,
      classroom ? classroom.name : "Unknown Classroom",
      slot.isSubstitution ? "Yes" : "No"
    ]);
  });
  
  // Convert to CSV string
  return csvRows.map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");
}

// Function to download CSV
export function downloadCSV(csvString: string, filename: string): void {
  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  
  if (link.download !== undefined) {
    // Browser supports HTML5 download attribute
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } else {
    // Fallback for older browsers
    alert("Your browser does not support the download functionality. Please try a modern browser like Chrome, Firefox, or Edge.");
  }
}

// Wrapper function for timetable downloads
export async function downloadTimetable(
  timetableId: number,
  divisionId: number,
  format: 'pdf' | 'csv' = 'pdf',
  options: {
    title?: string;
    subtitle?: string;
    includeFooter?: boolean;
    footerText?: string;
    pageSize?: "a4" | "letter";
    orientation?: "portrait" | "landscape";
    includeTeacherInfo?: boolean;
    includeClassroomInfo?: boolean;
  } = {}
): Promise<boolean> {
  try {
    // Fetch the necessary data
    const timetableResponse = await fetch(`/firebase-api/timetables/${timetableId}`);
    const timetable = await timetableResponse.json();
    
    const divisionResponse = await fetch(`/firebase-api/divisions/${divisionId}`);
    const division = await divisionResponse.json();
    
    const slotsResponse = await fetch(`/firebase-api/slots?timetableId=${timetableId}`);
    const slots = await slotsResponse.json();
    
    const teachersResponse = await fetch(`/firebase-api/teachers`);
    const teachers = await teachersResponse.json();
    
    const subjectsResponse = await fetch(`/firebase-api/subjects`);
    const subjects = await subjectsResponse.json();
    
    const classroomsResponse = await fetch(`/firebase-api/classrooms`);
    const classrooms = await classroomsResponse.json();
    
    if (format === 'pdf') {
      // Export to PDF
      return await exportTimetableToPdf(
        timetable,
        slots,
        division,
        teachers,
        subjects,
        classrooms,
        options
      );
    } else {
      // Export to CSV
      const csvString = exportTimetableToCSV(
        timetable,
        slots,
        division,
        teachers,
        subjects,
        classrooms
      );
      
      // Download the CSV file
      downloadCSV(csvString, `timetable_${division.name.replace(/\s+/g, "_")}.csv`);
      return true;
    }
  } catch (error) {
    console.error('Error downloading timetable:', error);
    return false;
  }
}
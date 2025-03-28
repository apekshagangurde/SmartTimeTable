import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export const exportTimetableAsImage = async (
  timetableRef: React.RefObject<HTMLElement>,
  format: 'png' | 'jpg' = 'png'
): Promise<void> => {
  if (!timetableRef.current) {
    throw new Error('Timetable element not found');
  }

  try {
    const canvas = await html2canvas(timetableRef.current, {
      scale: 2, // Higher scale for better quality
      logging: false,
      useCORS: true,
      allowTaint: true,
    });

    const dataUrl = canvas.toDataURL(`image/${format}`);
    
    // Create download link
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `timetable.${format}`;
    link.click();
  } catch (error) {
    console.error('Error exporting timetable as image:', error);
    throw error;
  }
};

export const exportTimetableAsPDF = async (
  timetableRef: React.RefObject<HTMLElement>
): Promise<void> => {
  if (!timetableRef.current) {
    throw new Error('Timetable element not found');
  }

  try {
    const canvas = await html2canvas(timetableRef.current, {
      scale: 2,
      logging: false,
      useCORS: true,
      allowTaint: true,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
    });

    // Calculate dimensions
    const imgWidth = 280; // A4 landscape width (less margins)
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
    pdf.save('timetable.pdf');
  } catch (error) {
    console.error('Error exporting timetable as PDF:', error);
    throw error;
  }
};

export const downloadTimetable = async (
  timetableRef: React.RefObject<HTMLElement>,
  format: 'png' | 'jpg' | 'pdf'
): Promise<void> => {
  try {
    if (format === 'pdf') {
      await exportTimetableAsPDF(timetableRef);
    } else {
      await exportTimetableAsImage(timetableRef, format);
    }
  } catch (error) {
    console.error(`Error downloading timetable as ${format}:`, error);
    throw error;
  }
};

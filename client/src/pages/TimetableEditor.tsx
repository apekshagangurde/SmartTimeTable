import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useTimetable } from "@/context/TimetableContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import TimetableGrid from "@/components/timetable/TimetableGrid";
import ResourcePanel from "@/components/timetable/ResourcePanel";
import ConflictPanel from "@/components/timetable/ConflictPanel";
import { SlotType, WeekdayType } from "@/types/timetable";
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import {
  Download,
  Share2,
  Save,
  Printer,
  FileImage,
  File as FileIcon,
  AlertCircle
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface TimetableEditorProps {
  id: string;
  readOnly?: boolean;
}

export default function TimetableEditor({ id, readOnly = false }: TimetableEditorProps) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [shareLink, setShareLink] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  
  const {
    departments,
    divisions,
    teachers,
    classrooms,
    subjects,
    slots,
    conflicts,
    selectedDepartment,
    selectedDivision,
    setSelectedDepartment,
    setSelectedDivision,
    isLoading,
    createSlot,
    updateSlot,
    deleteSlot,
    resolveConflict
  } = useTimetable();
  
  // Helper method to get the day name from number
  const getDayName = (dayNumber: number): WeekdayType => {
    const days: WeekdayType[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return days[dayNumber] || "Monday";
  };
  
  // Helper method to format time
  const formatTime = (hour: number) => {
    return String(hour).padStart(2, '0') + ":00";
  };
  
  // Create an empty slot for drag and drop
  const createEmptySlot = (day: WeekdayType, hour: number) => {
    if (!selectedDivision) {
      toast({
        title: "Error",
        description: "Please select a division first",
        variant: "destructive"
      });
      return;
    }
    
    const newSlot = {
      day: day,
      startTime: formatTime(hour),
      endTime: formatTime(hour + 1),
      timetableId: parseInt(id),
      teacherId: teachers[0]?.id || 1,
      subjectId: subjects[0]?.id || 1,
      classroomId: classrooms[0]?.id || 1,
      type: "Lecture" as "Lecture" | "Lab" | "Tutorial"
    };
    
    createSlot(newSlot);
  };
  
  const exportAsPng = async () => {
    try {
      setIsExporting(true);
      const element = document.getElementById('timetable-container');
      if (!element) {
        throw new Error("Timetable element not found");
      }
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });
      
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = "timetable-" + (selectedDivision?.name || 'division') + ".png";
      link.click();
      
      toast({
        title: "Success",
        description: "Timetable exported as PNG successfully"
      });
    } catch (error) {
      console.error("Error downloading timetable as png:", error);
      toast({
        title: "Error",
        description: "Failed to export timetable as PNG",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };
  
  const exportAsPdf = async () => {
    try {
      setIsExporting(true);
      const element = document.getElementById('timetable-container');
      if (!element) {
        throw new Error("Timetable element not found");
      }
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
      });
      
      // A4 dimensions
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Calculate aspect ratio to fit the image within the PDF
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 20; // margin from top
      
      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save("timetable-" + (selectedDivision?.name || 'division') + ".pdf");
      
      toast({
        title: "Success",
        description: "Timetable exported as PDF successfully"
      });
    } catch (error) {
      console.error("Error downloading timetable as pdf:", error);
      toast({
        title: "Error",
        description: "Failed to export timetable as PDF",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };
  
  const printTimetable = () => {
    window.print();
  };
  
  const handleShare = () => {
    // Generate a shareable link
    const shareableLink = window.location.origin + "/timetable/view/" + id;
    setShareLink(shareableLink);
    setShowShareDialog(true);
  };
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink).then(() => {
      toast({
        title: "Success",
        description: "Link copied to clipboard"
      });
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          {selectedDivision ? 
            "Timetable for " + (selectedDepartment?.name || "") + " - " + (selectedDivision?.name || "") : 
            readOnly ? "View Timetable" : "Timetable Editor"}
        </h1>
        
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleShare}>
            <Share2 className="mr-2 h-4 w-4" /> Share
          </Button>
          <Button variant="outline" onClick={() => setIsExporting(true)}>
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
          {!readOnly && (
            <Button>
              <Save className="mr-2 h-4 w-4" /> Save Changes
            </Button>
          )}
        </div>
      </div>
      
      {conflicts.length > 0 && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-red-600 mb-4">
              <AlertCircle className="h-5 w-5" />
              <h3 className="font-medium">Found {conflicts.length} conflicts in this timetable</h3>
            </div>
            <ConflictPanel conflicts={conflicts} onResolve={resolveConflict} />
          </CardContent>
        </Card>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Timetable</CardTitle>
            </CardHeader>
            <CardContent>
              <div id="timetable-container" className="print-container">
                <TimetableGrid 
                  slots={slots} 
                  onUpdate={updateSlot}
                  onDelete={deleteSlot}
                  onCreateEmptySlot={createEmptySlot}
                  readOnly={readOnly}
                />
              </div>
            </CardContent>
          </Card>
        </div>
        
        {!readOnly && (
          <div className="lg:col-span-1">
            <Tabs defaultValue="resources">
              <TabsList className="w-full">
                <TabsTrigger value="resources" className="flex-1">Resources</TabsTrigger>
                <TabsTrigger value="conflicts" className="flex-1">Conflicts</TabsTrigger>
              </TabsList>
              
              <TabsContent value="resources" className="mt-4">
                <ResourcePanel 
                  teachers={teachers}
                  subjects={subjects}
                  classrooms={classrooms}
                />
              </TabsContent>
              
              <TabsContent value="conflicts" className="mt-4">
                {conflicts.length === 0 ? (
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-center text-muted-foreground">
                        No conflicts detected
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <ConflictPanel conflicts={conflicts} onResolve={resolveConflict} />
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
      
      {/* Export Dialog */}
      <Dialog open={isExporting} onOpenChange={setIsExporting}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Timetable</DialogTitle>
            <DialogDescription>
              Choose how you want to export your timetable
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
            <Button variant="outline" className="flex flex-col items-center p-6" onClick={exportAsPng}>
              <FileImage className="h-12 w-12 mb-2" />
              <span>PNG Image</span>
            </Button>
            
            <Button variant="outline" className="flex flex-col items-center p-6" onClick={exportAsPdf}>
              <FileIcon className="h-12 w-12 mb-2" />
              <span>PDF Document</span>
            </Button>
            
            <Button variant="outline" className="flex flex-col items-center p-6" onClick={printTimetable}>
              <Printer className="h-12 w-12 mb-2" />
              <span>Print</span>
            </Button>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsExporting(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Timetable</DialogTitle>
            <DialogDescription>
              Share this link with students or colleagues to view the timetable
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex items-center space-x-2">
            <div className="grid flex-1 gap-2">
              <Label htmlFor="shareLink">Link</Label>
              <Input
                id="shareLink"
                value={shareLink}
                readOnly
                className="w-full"
              />
            </div>
            <Button className="mt-6" onClick={copyToClipboard}>Copy</Button>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowShareDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
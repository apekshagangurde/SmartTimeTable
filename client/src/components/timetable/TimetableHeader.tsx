import { useState } from "react";
import { useTimetable } from "@/context/TimetableContext";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Download, Plus, ChevronDown } from "lucide-react";
import { downloadTimetable } from "@/lib/export";
import { useRef } from "react";
import { useToast } from "@/hooks/use-toast";

export default function TimetableHeader() {
  const {
    departments,
    divisions,
    selectedDepartment,
    setSelectedDepartment,
    selectedDivision,
    setSelectedDivision,
    collegeStartTime,
    setCollegeStartTime,
    collegeEndTime,
    setCollegeEndTime,
  } = useTimetable();
  
  const timetableRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [isExportOpen, setIsExportOpen] = useState(false);

  const handleExport = async (format: 'png' | 'jpg' | 'pdf') => {
    try {
      await downloadTimetable(timetableRef, format);
      toast({
        title: "Export successful",
        description: `Timetable exported as ${format.toUpperCase()}`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Export failed",
        description: "There was an error exporting the timetable.",
      });
    } finally {
      setIsExportOpen(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
          <div className="w-full md:w-48">
            <Label className="block text-xs text-neutral-medium mb-1">Department</Label>
            <Select 
              value={selectedDepartment?.id.toString()} 
              onValueChange={(value) => {
                const dept = departments.find(d => d.id.toString() === value);
                if (dept) setSelectedDepartment(dept);
              }}
            >
              <SelectTrigger className="w-full rounded-md border border-neutral-light p-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary">
                <SelectValue placeholder="Select Department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id.toString()}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="w-full md:w-36">
            <Label className="block text-xs text-neutral-medium mb-1">Division</Label>
            <Select 
              value={selectedDivision?.id.toString()} 
              onValueChange={(value) => {
                const div = divisions.find(d => d.id.toString() === value);
                if (div) setSelectedDivision(div);
              }}
            >
              <SelectTrigger className="w-full rounded-md border border-neutral-light p-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary">
                <SelectValue placeholder="Select Division" />
              </SelectTrigger>
              <SelectContent>
                {divisions.map((div) => (
                  <SelectItem key={div.id} value={div.id.toString()}>
                    Division {div.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="w-full md:w-48">
            <Label className="block text-xs text-neutral-medium mb-1">College Hours</Label>
            <div className="flex items-center space-x-2">
              <Select 
                value={collegeStartTime}

                onValueChange={setCollegeStartTime}
              >
                <SelectTrigger className="rounded-md border border-neutral-light p-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary">
                  <SelectValue placeholder="Start Time" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => i + 8).map((hour) => (
                    <SelectItem key={hour} value={`${hour}:00`}>
                      {hour > 12 ? `${hour - 12}:00 PM` : `${hour}:00 AM`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span>to</span>
              <Select 
                value={collegeEndTime}
                onValueChange={setCollegeEndTime}
              >
                <SelectTrigger className="rounded-md border border-neutral-light p-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary">
                  <SelectValue placeholder="End Time" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 9 }, (_, i) => i + 13).map((hour) => (
                    <SelectItem key={hour} value={`${hour}:00`}>
                      {hour > 12 ? `${hour - 12}:00 PM` : `${hour}:00 AM`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <Button className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md flex items-center">
            <Plus className="mr-2 h-4 w-4" />
            <span>New Timetable</span>
          </Button>
          
          <Popover open={isExportOpen} onOpenChange={setIsExportOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="bg-white border border-neutral-light hover:bg-neutral-lightest px-4 py-2 rounded-md flex items-center">
                <Download className="mr-2 h-4 w-4" />
                <span>Export</span>
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-40 p-0">
              <Button 
                variant="ghost" 
                className="flex w-full justify-start px-4 py-2 text-sm"
                onClick={() => handleExport('pdf')}
              >
                <i className="far fa-file-pdf mr-2 text-red-500"></i>PDF
              </Button>
              <Button 
                variant="ghost" 
                className="flex w-full justify-start px-4 py-2 text-sm"
                onClick={() => handleExport('png')}
              >
                <i className="far fa-file-image mr-2 text-green-500"></i>PNG
              </Button>
              <Button 
                variant="ghost" 
                className="flex w-full justify-start px-4 py-2 text-sm"
                onClick={() => handleExport('jpg')}
              >
                <i className="far fa-file-image mr-2 text-blue-500"></i>JPG
              </Button>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { ConflictType } from "../../types/timetable";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  AlertTriangle,
  Clock,
  CheckCircle2,
  X,
  ChevronRight,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ConflictPanelProps {
  conflicts: ConflictType[];
  onResolve: (id: number) => Promise<void>;
}

// Helper function to get a human-readable message for each conflict type
const getConflictMessage = (conflict: ConflictType) => {
  switch (conflict.type) {
    case "teacher_clash":
      return `Teacher ${conflict.description} is assigned to multiple classes at the same time`;
    case "room_conflict":
      return `Room ${conflict.description} is double-booked`;
    case "time_allocation":
      return `Time allocation issue: ${conflict.description}`;
    default:
      return conflict.description;
  }
};

// Helper function to get the severity icon
const getSeverityIcon = (severity: string) => {
  switch (severity) {
    case "high":
      return <AlertCircle className="h-5 w-5 text-red-500" />;
    case "medium":
      return <AlertTriangle className="h-5 w-5 text-amber-500" />;
    default:
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
  }
};

// Helper to determine the badge color based on severity
const getSeverityColor = (severity: string) => {
  switch (severity) {
    case "high":
      return "bg-red-100 text-red-800 border-red-200";
    case "medium":
      return "bg-amber-100 text-amber-800 border-amber-200";
    default:
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
  }
};

export default function ConflictPanel({ conflicts, onResolve }: ConflictPanelProps) {
  const [resolving, setResolving] = useState<number | null>(null);
  
  const handleResolve = async (id: number) => {
    setResolving(id);
    try {
      await onResolve(id);
    } finally {
      setResolving(null);
    }
  };
  
  return (
    <ScrollArea className="h-[500px] pr-4">
      <Accordion type="single" collapsible className="w-full">
        {conflicts.map((conflict) => (
          <AccordionItem key={conflict.id} value={conflict.id.toString()}>
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center text-left">
                {getSeverityIcon(conflict.severity)}
                <div className="ml-2">
                  <p className="text-sm font-medium">{getConflictMessage(conflict)}</p>
                  <div className="flex items-center mt-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>
                      {conflict.day} at {conflict.time}
                    </span>
                  </div>
                </div>
              </div>
            </AccordionTrigger>
            
            <AccordionContent>
              <div className="py-2">
                <div className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${getSeverityColor(conflict.severity)}`}>
                  Severity: {conflict.severity}
                </div>
                
                <p className="mt-2 text-sm">{conflict.details}</p>
                
                <Separator className="my-3" />
                
                <div className="flex items-start space-x-2">
                  <div className="bg-muted rounded-full p-1 h-6 w-6 flex items-center justify-center">
                    <span className="text-xs">1</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Automated suggestion</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {conflict.resolution || "Move the class to an available time slot"}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
                
                <div className="mt-4 flex justify-end">
                  {conflict.resolved ? (
                    <div className="flex items-center text-green-600 text-sm">
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Resolved
                    </div>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleResolve(conflict.id)}
                      disabled={resolving === conflict.id}
                    >
                      {resolving === conflict.id ? (
                        <>Resolving...</>
                      ) : (
                        <>Mark as Resolved</>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </ScrollArea>
  );
}
import { useTimetable } from "@/context/TimetableContext";
import TimetableHeader from "@/components/timetable/TimetableHeader";
import TimetableGrid from "@/components/timetable/TimetableGrid";
import ResourcePanel from "@/components/timetable/ResourcePanel";
import ConflictPanel from "@/components/timetable/ConflictPanel";
import SubstitutionPanel from "@/components/timetable/SubstitutionPanel";
import { useRef, useState } from "react";
import ConflictResolutionDialog from "@/components/dialogs/ConflictResolutionDialog";
import { ConflictType } from "@/types";

export default function Dashboard() {
  const { isLoading } = useTimetable();
  const [viewMode, setViewMode] = useState<"weekly" | "daily">("weekly");
  const [showSubstitutionPanel, setShowSubstitutionPanel] = useState(true);
  const [selectedConflict, setSelectedConflict] = useState<ConflictType | null>(null);
  const timetableRef = useRef<HTMLDivElement>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-neutral-medium">Loading timetable data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row">
      <div className="flex-1">
        <TimetableHeader />
        
        <div className="bg-white rounded-lg shadow-md mb-4 overflow-hidden">
          <div className="border-b border-neutral-light">
            <div className="flex">
              <button 
                className={`px-4 py-3 font-medium focus:outline-none ${
                  viewMode === "weekly" 
                    ? "text-primary border-b-2 border-primary" 
                    : "text-neutral-medium hover:text-neutral-dark"
                }`}
                onClick={() => setViewMode("weekly")}
              >
                Weekly View
              </button>
              <button 
                className={`px-4 py-3 font-medium focus:outline-none ${
                  viewMode === "daily" 
                    ? "text-primary border-b-2 border-primary" 
                    : "text-neutral-medium hover:text-neutral-dark"
                }`}
                onClick={() => setViewMode("daily")}
              >
                Daily View
              </button>
            </div>
          </div>
          
          <div ref={timetableRef}>
            <TimetableGrid viewMode={viewMode} />
          </div>
        </div>
        
        <ResourcePanel />
        
        <ConflictPanel onViewOptions={(conflict) => setSelectedConflict(conflict)} />
      </div>
      
      {showSubstitutionPanel && (
        <SubstitutionPanel />
      )}

      {selectedConflict && (
        <ConflictResolutionDialog 
          conflict={selectedConflict} 
          onClose={() => setSelectedConflict(null)} 
        />
      )}
    </div>
  );
}

import { useTimetable } from "@/context/TimetableContext";
import { useDrag } from "react-dnd";
import { ItemTypes } from "@/lib/dnd";
import { Card, CardContent } from "@/components/ui/card";
import { UserIcon, DoorOpen, BookOpen } from "lucide-react";

export default function ResourcePanel() {
  const { teachers, classrooms, subjects } = useTimetable();

  return (
    <Card className="bg-white rounded-lg shadow-md p-4 mb-4">
      <h3 className="text-md font-medium text-neutral-dark mb-4">Resources</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <TeachersList teachers={teachers} />
        <ClassroomsList classrooms={classrooms} />
        <SubjectsList subjects={subjects} />
      </div>
    </Card>
  );
}

function TeachersList({ teachers }: { teachers: any[] }) {
  return (
    <div>
      <h4 className="text-sm font-medium text-neutral-dark mb-2 flex items-center">
        <UserIcon className="mr-2 h-4 w-4 text-primary" />
        <span>Teachers</span>
      </h4>
      <div className="bg-neutral-lightest p-3 rounded-md h-48 overflow-y-auto">
        <p className="text-xs text-neutral-medium mb-2">Drag teachers to the timetable</p>
        
        {teachers.length === 0 ? (
          <div className="text-center py-4 text-neutral-medium text-sm">
            No teachers available
          </div>
        ) : (
          teachers.map((teacher) => (
            <DraggableTeacherItem key={teacher.id} teacher={teacher} />
          ))
        )}
      </div>
    </div>
  );
}

function ClassroomsList({ classrooms }: { classrooms: any[] }) {
  return (
    <div>
      <h4 className="text-sm font-medium text-neutral-dark mb-2 flex items-center">
        <DoorOpen className="mr-2 h-4 w-4 text-primary" />
        <span>Classrooms</span>
      </h4>
      <div className="bg-neutral-lightest p-3 rounded-md h-48 overflow-y-auto">
        <p className="text-xs text-neutral-medium mb-2">Drag classrooms to the timetable</p>
        
        {classrooms.length === 0 ? (
          <div className="text-center py-4 text-neutral-medium text-sm">
            No classrooms available
          </div>
        ) : (
          classrooms.map((classroom) => (
            <DraggableClassroomItem key={classroom.id} classroom={classroom} />
          ))
        )}
      </div>
    </div>
  );
}

function SubjectsList({ subjects }: { subjects: any[] }) {
  return (
    <div>
      <h4 className="text-sm font-medium text-neutral-dark mb-2 flex items-center">
        <BookOpen className="mr-2 h-4 w-4 text-primary" />
        <span>Subjects</span>
      </h4>
      <div className="bg-neutral-lightest p-3 rounded-md h-48 overflow-y-auto">
        <p className="text-xs text-neutral-medium mb-2">Drag subjects to the timetable</p>
        
        {subjects.length === 0 ? (
          <div className="text-center py-4 text-neutral-medium text-sm">
            No subjects available
          </div>
        ) : (
          subjects.map((subject) => (
            <DraggableSubjectItem key={subject.id} subject={subject} />
          ))
        )}
      </div>
    </div>
  );
}

function DraggableTeacherItem({ teacher }: { teacher: any }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.TEACHER,
    item: { type: "teacher", id: teacher.id, data: teacher },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className="bg-white rounded-md p-2 mb-2 shadow-sm cursor-move"
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium">{teacher.user?.name || "Unknown Teacher"}</div>
          <div className="text-xs text-neutral-medium">
            {teacher.subjects?.map((subject: any) => subject.name).join(", ") || "No subjects assigned"}
          </div>
        </div>
        <div 
          className={`w-3 h-3 rounded-full ${teacher.isUpset ? "bg-error" : "bg-success"}`} 
          title={teacher.isUpset ? "Upset" : "Available"}
        ></div>
      </div>
    </div>
  );
}

function DraggableClassroomItem({ classroom }: { classroom: any }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.CLASSROOM,
    item: { type: "classroom", id: classroom.id, data: classroom },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className="bg-white rounded-md p-2 mb-2 shadow-sm cursor-move"
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium">{classroom.name}</div>
          <div className="text-xs text-neutral-medium">
            {classroom.department?.name || "Unknown Department"}
          </div>
        </div>
        <div className="flex items-center">
          <span className="text-xs bg-neutral-light px-1 rounded">Cap: {classroom.capacity}</span>
        </div>
      </div>
    </div>
  );
}

function DraggableSubjectItem({ subject }: { subject: any }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.SUBJECT,
    item: { type: "subject", id: subject.id, data: subject },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className="bg-white rounded-md p-2 mb-2 shadow-sm cursor-move"
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <div className="text-sm font-medium">{subject.name}</div>
      <div className="flex justify-between text-xs text-neutral-medium">
        <span>{subject.department?.shortName || "Unknown"} - Semester {subject.semester}</span>
        <span>Credits: {subject.credits}</span>
      </div>
    </div>
  );
}

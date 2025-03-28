import { useState } from "react";
import { useDrag } from "react-dnd";
import { ItemTypes } from "../../lib/dnd";
import { TeacherType, SubjectType, ClassroomType } from "../../types/timetable";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Search, UserCircle2, BookOpen, Home } from "lucide-react";

type ResourcePanelProps = {
  teachers: TeacherType[];
  subjects: SubjectType[];
  classrooms: ClassroomType[];
};

// Component for a draggable teacher item
function TeacherItem({ teacher }: { teacher: TeacherType }) {
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.TEACHER,
    item: { 
      id: teacher.id, 
      type: 'teacher', 
      name: `Teacher ${teacher.id}`  // We don't have user object linked directly
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  });
  
  const isUpset = teacher.isUpset;
  
  return (
    <div
      ref={drag}
      className={`flex items-center p-2 rounded-md mb-2 border cursor-move hover:bg-gray-100 ${
        isDragging ? "opacity-50" : "opacity-100"
      } ${isUpset ? "border-amber-300 bg-amber-50" : "border-gray-200"}`}
    >
      <UserCircle2 className={`h-5 w-5 mr-2 ${isUpset ? "text-amber-500" : "text-blue-500"}`} />
      <div className="flex-1">
        <div className="font-medium text-sm">{`Teacher ${teacher.id}`}</div>
        {isUpset && (
          <Badge variant="outline" className="text-xs bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200">
            Upset
          </Badge>
        )}
      </div>
    </div>
  );
}

// Component for a draggable subject item
function SubjectItem({ subject }: { subject: SubjectType }) {
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.SUBJECT,
    item: { 
      id: subject.id, 
      type: 'subject', 
      name: subject.name || `Subject ${subject.id}`
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  });
  
  return (
    <div
      ref={drag}
      className={`flex items-center p-2 rounded-md mb-2 border cursor-move hover:bg-gray-100 ${
        isDragging ? "opacity-50" : "opacity-100"
      } border-gray-200`}
    >
      <BookOpen className="h-5 w-5 mr-2 text-purple-500" />
      <div className="flex-1">
        <div className="font-medium text-sm">{subject.name}</div>
        <div className="text-xs text-muted-foreground">{subject.shortName} - {subject.credits} Credits</div>
      </div>
    </div>
  );
}

// Component for a draggable classroom item
function ClassroomItem({ classroom }: { classroom: ClassroomType }) {
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.CLASSROOM,
    item: { 
      id: classroom.id, 
      type: 'classroom', 
      name: classroom.name || `Room ${classroom.id}` 
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  });
  
  return (
    <div
      ref={drag}
      className={`flex items-center p-2 rounded-md mb-2 border cursor-move hover:bg-gray-100 ${
        isDragging ? "opacity-50" : "opacity-100"
      } border-gray-200`}
    >
      <Home className="h-5 w-5 mr-2 text-green-500" />
      <div className="flex-1">
        <div className="font-medium text-sm">{classroom.name}</div>
        <div className="text-xs text-muted-foreground">Capacity: {classroom.capacity}</div>
      </div>
    </div>
  );
}

export default function ResourcePanel({ teachers, subjects, classrooms }: ResourcePanelProps) {
  const [teacherSearch, setTeacherSearch] = useState("");
  const [subjectSearch, setSubjectSearch] = useState("");
  const [classroomSearch, setClassroomSearch] = useState("");
  
  // Filter resources based on search terms - check for null/undefined
  const filteredTeachers = teachers?.filter(teacher => 
    // Search by teacher ID since we don't have user property directly
    `Teacher ${teacher.id}`.toLowerCase().includes(teacherSearch.toLowerCase())
  ) || [];
  
  const filteredSubjects = subjects?.filter(subject => 
    subject.name?.toLowerCase().includes(subjectSearch.toLowerCase()) ||
    subject.shortName?.toLowerCase().includes(subjectSearch.toLowerCase())
  ) || [];
  
  const filteredClassrooms = classrooms?.filter(classroom => 
    classroom.name?.toLowerCase().includes(classroomSearch.toLowerCase())
  ) || [];
  
  return (
    <Card>
      <Tabs defaultValue="teachers">
        <TabsList className="w-full">
          <TabsTrigger value="teachers" className="flex-1">Teachers</TabsTrigger>
          <TabsTrigger value="subjects" className="flex-1">Subjects</TabsTrigger>
          <TabsTrigger value="classrooms" className="flex-1">Rooms</TabsTrigger>
        </TabsList>
        
        <CardContent className="pt-4">
          <TabsContent value="teachers" className="mt-0">
            <div className="relative mb-4">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search teachers..."
                className="pl-8"
                value={teacherSearch}
                onChange={(e) => setTeacherSearch(e.target.value)}
              />
            </div>
            <div className="max-h-[400px] overflow-y-auto pr-1">
              {filteredTeachers.length === 0 ? (
                <p className="text-center text-muted-foreground text-sm py-4">No teachers found</p>
              ) : (
                filteredTeachers.map((teacher) => (
                  <TeacherItem key={teacher.id} teacher={teacher} />
                ))
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="subjects" className="mt-0">
            <div className="relative mb-4">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search subjects..."
                className="pl-8"
                value={subjectSearch}
                onChange={(e) => setSubjectSearch(e.target.value)}
              />
            </div>
            <div className="max-h-[400px] overflow-y-auto pr-1">
              {filteredSubjects.length === 0 ? (
                <p className="text-center text-muted-foreground text-sm py-4">No subjects found</p>
              ) : (
                filteredSubjects.map((subject) => (
                  <SubjectItem key={subject.id} subject={subject} />
                ))
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="classrooms" className="mt-0">
            <div className="relative mb-4">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search classrooms..."
                className="pl-8"
                value={classroomSearch}
                onChange={(e) => setClassroomSearch(e.target.value)}
              />
            </div>
            <div className="max-h-[400px] overflow-y-auto pr-1">
              {filteredClassrooms.length === 0 ? (
                <p className="text-center text-muted-foreground text-sm py-4">No classrooms found</p>
              ) : (
                filteredClassrooms.map((classroom) => (
                  <ClassroomItem key={classroom.id} classroom={classroom} />
                ))
              )}
            </div>
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  );
}
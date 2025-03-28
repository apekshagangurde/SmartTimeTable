import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Timetables from "@/pages/Timetables";
import Teachers from "@/pages/Teachers";
import Classrooms from "@/pages/Classrooms";
import Departments from "@/pages/Departments";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { useState } from "react";
import { TimetableProvider } from "@/context/TimetableContext";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/timetables" component={Timetables} />
      <Route path="/teachers" component={Teachers} />
      <Route path="/classrooms" component={Classrooms} />
      <Route path="/departments" component={Departments} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="font-sans bg-gray-100 text-neutral-dark h-screen flex flex-col">
      <Header toggleSidebar={toggleSidebar} />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar isOpen={isSidebarOpen} />
        <main className="flex-1 overflow-y-auto bg-gray-100 p-4">
          <div className="container mx-auto">
            <TimetableProvider>
              <Router />
            </TimetableProvider>
          </div>
        </main>
      </div>
      <Toaster />
    </div>
  );
}

export default App;

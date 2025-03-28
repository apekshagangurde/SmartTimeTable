import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { useLocation, Link } from "wouter";

export default function NotFound() {
  const [location] = useLocation();
  
  // Check if this is a page that exists in our sidebar but is not yet implemented
  const isPlanned = [
    "/substitutions",
    "/history",
    "/notifications",
    "/analytics",
    "/workload",
    "/utilization"
  ].includes(location);

  return (
    <div className="flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center mb-4">
            <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-4">
              <AlertTriangle className="h-8 w-8 text-amber-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isPlanned ? "Coming Soon" : "404 Page Not Found"}
            </h1>
            <p className="mt-2 text-gray-600">
              {isPlanned 
                ? "This feature is planned for a future update and is currently under development."
                : "The page you are looking for does not exist or has been moved."}
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center gap-4">
          <Button asChild variant="outline">
            <Link href="/">Go to Dashboard</Link>
          </Button>
          <Button asChild>
            <Link href="/timetables">View Timetables</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

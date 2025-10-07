import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex items-center justify-center p-4">
      <div className="text-center space-y-6">
        <h1 className="font-luckiest text-8xl text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
          404
        </h1>
        <p className="font-fredoka text-2xl text-foreground">
          Oops! This pup got lost! 🐕
        </p>
        <p className="font-fredoka text-muted-foreground">
          The page you're looking for doesn't exist.
        </p>
        <Button 
          variant="hero"
          onClick={() => window.location.href = "/"}
        >
          <Home className="mr-2 h-5 w-5" />
          Back to Home
        </Button>
      </div>
    </div>
  );
};

export default NotFound;

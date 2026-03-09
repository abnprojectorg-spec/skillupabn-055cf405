import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }} className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
            <SearchX className="h-10 w-10 text-primary" />
          </div>
        </div>
        <h1 className="font-display text-6xl font-bold mb-3">404</h1>
        <p className="text-xl text-muted-foreground mb-2">Oops! This page does not exist.</p>
        <p className="text-sm text-muted-foreground mb-8">The page you're looking for might have been moved or doesn't exist anymore.</p>
        <Link to="/">
          <Button variant="hero" size="lg">
            <Home className="h-4 w-4 mr-2" /> Return to Homepage
          </Button>
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFound;

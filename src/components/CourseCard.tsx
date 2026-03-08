import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Users, Clock } from "lucide-react";
import type { Course } from "@/data/mockData";

interface CourseCardProps {
  course: Course;
  isUnlocked?: boolean;
}

const CourseCard = ({ course, isUnlocked }: CourseCardProps) => {
  return (
    <div className="group overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all duration-500 hover:shadow-glow hover:border-accent/30 hover:-translate-y-2">
      <div className="relative aspect-video overflow-hidden">
        <img
          src={course.thumbnail || "/placeholder.svg"}
          alt={course.title}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <Badge className="absolute top-3 left-3 bg-primary/90 text-primary-foreground text-xs backdrop-blur-sm">
          {course.category}
        </Badge>
      </div>
      <div className="p-5">
        <h3 className="font-display font-semibold line-clamp-2 mb-1 group-hover:text-accent transition-colors duration-300">
          {course.title}
        </h3>
        <p className="text-sm text-muted-foreground mb-3">{course.instructor}</p>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{course.shortDescription}</p>
        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
          <span className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-warning text-warning" />
            {course.rating}
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {course.students}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {course.duration}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-display text-lg font-bold text-gradient-glow">{course.price} ETB</span>
          <Link to={isUnlocked ? `/learn/${course.id}` : `/course/${course.id}`}>
            <Button size="sm" variant={isUnlocked ? "secondary" : "hero"} className={isUnlocked ? "" : "shadow-glow"}>
              {isUnlocked ? "Continue" : "View Course"}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;

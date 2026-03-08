import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCourse, isEnrolled } from "@/hooks/useFirestore";
import { useAuth } from "@/contexts/AuthContext";
import { Star, Users, Clock, BookOpen, ArrowLeft, CheckCircle, Loader2 } from "lucide-react";

const CourseDetailPage = () => {
  const { id } = useParams();
  const { course, loading } = useCourse(id);
  const { user } = useAuth();
  const [enrolled, setEnrolled] = useState(false);

  useEffect(() => {
    if (user && id) {
      isEnrolled(user.uid, id).then(setEnrolled);
    }
  }, [user, id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex min-h-screen items-center justify-center pt-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex min-h-screen items-center justify-center pt-16">
          <div className="text-center">
            <h1 className="font-display text-2xl font-bold mb-2">Course Not Found</h1>
            <Link to="/marketplace"><Button variant="outline">Back to Courses</Button></Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link to="/marketplace" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-accent transition-colors mb-6">
            <ArrowLeft className="h-4 w-4" /> Back to Courses
          </Link>

          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Badge className="mb-4 bg-accent/10 text-accent border-accent/20">{course.category}</Badge>
              <h1 className="font-display text-3xl font-bold mb-3">{course.title}</h1>
              <p className="text-muted-foreground mb-4">by <span className="text-foreground font-medium">{course.instructor}</span></p>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
                <span className="flex items-center gap-1"><Star className="h-4 w-4 fill-warning text-warning" /> {course.rating}</span>
                <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {course.students} students</span>
                <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {course.duration}</span>
                <span className="flex items-center gap-1"><BookOpen className="h-4 w-4" /> {course.lessons} lessons</span>
              </div>

              <div className="aspect-video overflow-hidden rounded-xl bg-card border border-border mb-8">
                <img src={course.thumbnail} alt={course.title} className="h-full w-full object-cover" />
              </div>

              <h2 className="font-display text-xl font-semibold mb-3">About This Course</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">{course.description}</p>

              <h2 className="font-display text-xl font-semibold mb-3">What You'll Learn</h2>
              <div className="grid gap-2 sm:grid-cols-2 mb-6">
                {["Core fundamentals and theory", "Hands-on projects", "Real-world applications", "Career preparation", "Community access", "Certificate of completion"].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-accent shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-24 rounded-2xl border border-border bg-card p-6">
                <div className="text-center mb-6">
                  <p className="font-display text-3xl font-bold text-gradient-glow">{course.price} ETB</p>
                  <p className="text-sm text-muted-foreground mt-1">One-time payment</p>
                </div>
                {enrolled ? (
                  <Button variant="hero" size="lg" className="w-full mb-3 shadow-glow">
                    <CheckCircle className="h-4 w-4 mr-1" /> Start Learning
                  </Button>
                ) : (
                  <Button variant="hero" size="lg" className="w-full mb-3 shadow-glow">
                    Unlock with Telebirr
                  </Button>
                )}
                <p className="text-xs text-center text-muted-foreground">Secure payment via Telebirr</p>
                <hr className="my-5 border-border" />
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2"><Clock className="h-4 w-4" /> {course.duration} of content</li>
                  <li className="flex items-center gap-2"><BookOpen className="h-4 w-4" /> {course.lessons} lessons</li>
                  <li className="flex items-center gap-2"><Star className="h-4 w-4" /> Certificate of completion</li>
                  <li className="flex items-center gap-2"><Users className="h-4 w-4" /> Community access</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CourseDetailPage;

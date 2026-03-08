import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { useCourse } from "@/hooks/useFirestore";
import { ArrowLeft, Loader2, Play } from "lucide-react";

const getYouTubeEmbedUrl = (url: string): string => {
  if (!url) return "";
  const iframeSrcMatch = url.match(/src=["']([^"']+)["']/);
  if (iframeSrcMatch) return iframeSrcMatch[1];
  if (url.includes("/embed/")) return url;
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`;
  const longMatch = url.match(/[?&]v=([a-zA-Z0-9_-]+)/);
  if (longMatch) return `https://www.youtube.com/embed/${longMatch[1]}`;
  return url;
};

const CourseLearningPage = () => {
  const { id } = useParams();
  const { course, loading } = useCourse(id);

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
            <Link to="/dashboard"><Button variant="outline">Back to Dashboard</Button></Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-16">
        {/* Top bar */}
        <div className="border-b border-border bg-card/60 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3">
            <Link
              to={`/course/${id}`}
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Course
            </Link>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          {/* Course Title */}
          <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight mb-6 sm:mb-8">
            {course.title}
          </h1>

          {/* Video Player */}
          {course.videoUrl ? (
            <div className="aspect-video rounded-xl overflow-hidden bg-card border border-border shadow-lg mb-8 sm:mb-12">
              <iframe
                src={getYouTubeEmbedUrl(course.videoUrl)}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                allowFullScreen
                title={course.title}
              />
            </div>
          ) : (
            <div className="aspect-video rounded-xl bg-card border border-border flex items-center justify-center mb-8 sm:mb-12">
              <div className="text-center text-muted-foreground">
                <Play className="h-16 w-16 mx-auto mb-3 opacity-20" />
                <p className="text-sm">No video available for this course</p>
              </div>
            </div>
          )}

          {/* Course Notes / Description */}
          <div className="space-y-6">
            <h2 className="font-display text-xl sm:text-2xl font-bold">
              Course Notes
            </h2>

            <div className="prose prose-invert max-w-none text-muted-foreground leading-relaxed text-[15px] sm:text-base whitespace-pre-wrap">
              {course.description || "No notes available for this course."}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseLearningPage;

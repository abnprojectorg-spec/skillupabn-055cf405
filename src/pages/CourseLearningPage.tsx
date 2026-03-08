import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Navbar from "@/components/Navbar";
import { useCourse, useLessons, useLessonProgress, useCourseProject, markLessonComplete } from "@/hooks/useFirestore";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft, CheckCircle, Loader2, Play, Lock,
  ChevronLeft, ChevronRight, FileText, Award,
} from "lucide-react";

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
  const { course, loading: courseLoading } = useCourse(id);
  const { lessons, loading: lessonsLoading } = useLessons(id);
  const { user } = useAuth();
  const { completedLessonIds, loading: progressLoading } = useLessonProgress(user?.uid, id);
  const { project, loading: projectLoading } = useCourseProject(id);
  const { toast } = useToast();

  const [activeLessonIndex, setActiveLessonIndex] = useState(0);
  const [marking, setMarking] = useState(false);

  const sortedLessons = [...lessons].sort((a, b) => a.order - b.order);
  const activeLesson = sortedLessons[activeLessonIndex] || null;

  const completedCount = sortedLessons.filter((l) => completedLessonIds.has(l.id)).length;
  const totalLessons = sortedLessons.length;
  const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
  const allCompleted = totalLessons > 0 && completedCount === totalLessons;

  const isLessonAccessible = (index: number) => {
    if (index === 0) return true;
    const prevLesson = sortedLessons[index - 1];
    return prevLesson ? completedLessonIds.has(prevLesson.id) : false;
  };

  const handleMarkComplete = async () => {
    if (!user || !activeLesson || !id) return;
    setMarking(true);
    try {
      await markLessonComplete(user.uid, id, activeLesson.id);
      toast({ title: "Lesson completed! 🎉" });
      if (activeLessonIndex < sortedLessons.length - 1) {
        setActiveLessonIndex(activeLessonIndex + 1);
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setMarking(false);
    }
  };

  const goToPrevious = () => {
    if (activeLessonIndex > 0) setActiveLessonIndex(activeLessonIndex - 1);
  };

  const goToNext = () => {
    const nextIndex = activeLessonIndex + 1;
    if (nextIndex < totalLessons && isLessonAccessible(nextIndex)) {
      setActiveLessonIndex(nextIndex);
    }
  };

  const loading = courseLoading || lessonsLoading || progressLoading;

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
        {/* Top bar: back link + progress */}
        <div className="border-b border-border bg-card/60 backdrop-blur-sm">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
            <Link
              to={`/course/${id}`}
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">{course.title}</span>
              <span className="sm:hidden">Back</span>
            </Link>
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {completedCount}/{totalLessons} lessons
              </span>
              <Progress value={progressPercent} className="h-2 w-24 sm:w-32" />
              <span className="text-xs font-semibold text-accent">{progressPercent}%</span>
            </div>
          </div>
        </div>

        {activeLesson ? (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
            {/* Video Player */}
            <div className="w-full">
              {activeLesson.videoUrl ? (
                <div className="aspect-video rounded-xl overflow-hidden bg-card border border-border shadow-lg">
                  <iframe
                    src={getYouTubeEmbedUrl(activeLesson.videoUrl)}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                    allowFullScreen
                    title={activeLesson.title}
                  />
                </div>
              ) : (
                <div className="aspect-video rounded-xl bg-card border border-border flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <Play className="h-16 w-16 mx-auto mb-3 opacity-20" />
                    <p className="text-sm">No video available for this lesson</p>
                  </div>
                </div>
              )}
            </div>

            {/* Lesson Title + Mark Complete */}
            <div className="mt-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs text-accent font-semibold uppercase tracking-wider mb-1">
                  Lesson {activeLessonIndex + 1} of {totalLessons}
                </p>
                <h1 className="font-display text-xl sm:text-2xl lg:text-3xl font-bold leading-tight">
                  {activeLesson.title}
                </h1>
              </div>

              <div className="shrink-0">
                {completedLessonIds.has(activeLesson.id) ? (
                  <div className="inline-flex items-center gap-2 rounded-lg bg-accent/10 border border-accent/20 px-4 py-2.5">
                    <CheckCircle className="h-5 w-5 text-accent" />
                    <span className="text-sm font-semibold text-accent">Completed</span>
                  </div>
                ) : (
                  <Button
                    variant="hero"
                    onClick={handleMarkComplete}
                    disabled={marking}
                    className="shadow-glow hover:scale-105 transition-transform"
                  >
                    {marking ? (
                      <><Loader2 className="h-4 w-4 animate-spin mr-1.5" /> Saving...</>
                    ) : (
                      <><CheckCircle className="h-4 w-4 mr-1.5" /> Mark Complete</>
                    )}
                  </Button>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-border my-6 sm:my-8" />

            {/* Lesson Notes */}
            {activeLesson.notes ? (
              <div className="mb-8">
                <div className="flex items-center gap-2.5 mb-5">
                  <FileText className="h-5 w-5 text-accent" />
                  <h2 className="font-display text-lg font-semibold">Lesson Notes</h2>
                </div>
                <div className="prose prose-invert max-w-none text-muted-foreground leading-relaxed whitespace-pre-wrap text-[15px]">
                  {activeLesson.notes}
                </div>
              </div>
            ) : (
              <div className="mb-8 rounded-xl border border-border bg-card/50 p-8 text-center">
                <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">No notes available for this lesson.</p>
              </div>
            )}

            {/* Previous / Next Navigation */}
            <div className="flex items-center justify-between gap-4 py-6 border-t border-border">
              <Button
                variant="outline"
                onClick={goToPrevious}
                disabled={activeLessonIndex === 0}
                className="gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Previous Lesson</span>
                <span className="sm:hidden">Previous</span>
              </Button>

              <span className="text-xs text-muted-foreground">
                {activeLessonIndex + 1} / {totalLessons}
              </span>

              <Button
                variant="outline"
                onClick={goToNext}
                disabled={activeLessonIndex >= totalLessons - 1 || !isLessonAccessible(activeLessonIndex + 1)}
                className="gap-2"
              >
                <span className="hidden sm:inline">Next Lesson</span>
                <span className="sm:hidden">Next</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Course Complete Section */}
            {allCompleted && !projectLoading && project && (
              <div className="rounded-xl border-2 border-accent/30 bg-accent/5 p-6 mt-4 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/20">
                    <Award className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <h2 className="font-display text-xl font-bold">🎉 Course Complete!</h2>
                    <p className="text-xs text-muted-foreground">Here's your final project assignment</p>
                  </div>
                </div>
                <div className="rounded-lg border border-border bg-card p-5 mt-4">
                  <h3 className="font-display text-lg font-semibold mb-2">{project.projectTitle}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {project.projectDescription}
                  </p>
                </div>
              </div>
            )}

            {allCompleted && !projectLoading && !project && (
              <div className="rounded-xl border-2 border-accent/30 bg-accent/5 p-6 text-center mt-4">
                <Award className="h-10 w-10 mx-auto mb-3 text-accent" />
                <h2 className="font-display text-xl font-bold mb-1">🎉 Congratulations!</h2>
                <p className="text-sm text-muted-foreground">You've completed all lessons in this course!</p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <Play className="h-16 w-16 mx-auto mb-4 text-muted-foreground/20" />
              <h2 className="font-display text-xl font-bold mb-2">No lessons yet</h2>
              <p className="text-sm text-muted-foreground">Lessons will appear here once the instructor adds them.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseLearningPage;

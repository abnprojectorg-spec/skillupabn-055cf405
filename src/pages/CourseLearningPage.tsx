import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Navbar from "@/components/Navbar";
import { useCourse, useLessons, useLessonProgress, useCourseProject, markLessonComplete } from "@/hooks/useFirestore";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft, CheckCircle, Loader2, Play, Lock, BookOpen,
  ChevronRight, FileText, Award,
} from "lucide-react";

const getYouTubeEmbedUrl = (url: string): string => {
  if (!url) return "";
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
    // Previous lesson must be completed
    const prevLesson = sortedLessons[index - 1];
    return prevLesson ? completedLessonIds.has(prevLesson.id) : false;
  };

  const handleMarkComplete = async () => {
    if (!user || !activeLesson || !id) return;
    setMarking(true);
    try {
      await markLessonComplete(user.uid, id, activeLesson.id);
      toast({ title: "Lesson completed! 🎉" });
      // Auto-advance to next lesson
      if (activeLessonIndex < sortedLessons.length - 1) {
        setActiveLessonIndex(activeLessonIndex + 1);
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setMarking(false);
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
      <div className="pt-16 flex flex-col lg:flex-row">
        {/* Sidebar - Lesson List */}
        <aside className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-border bg-card lg:min-h-[calc(100vh-4rem)] lg:sticky lg:top-16 overflow-y-auto">
          <div className="p-4 border-b border-border">
            <Link to={`/course/${id}`} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-accent transition-colors mb-3">
              <ArrowLeft className="h-3 w-3" /> Back to Course
            </Link>
            <h2 className="font-display text-sm font-bold line-clamp-2">{course.title}</h2>
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                <span>Course Progress</span>
                <span className="font-medium text-accent">{progressPercent}%</span>
              </div>
              <Progress value={progressPercent} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">{completedCount} / {totalLessons} lessons</p>
            </div>
          </div>

          <div className="p-2">
            {sortedLessons.length === 0 ? (
              <p className="text-sm text-muted-foreground p-4 text-center">No lessons available yet.</p>
            ) : (
              sortedLessons.map((lesson, index) => {
                const isCompleted = completedLessonIds.has(lesson.id);
                const isAccessible = isLessonAccessible(index);
                const isActive = index === activeLessonIndex;

                return (
                  <button
                    key={lesson.id}
                    onClick={() => isAccessible && setActiveLessonIndex(index)}
                    disabled={!isAccessible}
                    className={`w-full flex items-center gap-3 rounded-lg px-3 py-3 text-left text-sm transition-all duration-200 mb-1 group ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-glow"
                        : isAccessible
                        ? "text-foreground hover:bg-secondary"
                        : "text-muted-foreground/50 cursor-not-allowed"
                    }`}
                  >
                    <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                      isCompleted
                        ? "bg-accent text-accent-foreground"
                        : isActive
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-secondary text-muted-foreground"
                    }`}>
                      {isCompleted ? <CheckCircle className="h-4 w-4" /> : isAccessible ? index + 1 : <Lock className="h-3 w-3" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{lesson.title}</p>
                    </div>
                    {isAccessible && !isActive && <ChevronRight className="h-4 w-4 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />}
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {activeLesson ? (
            <div className="max-w-4xl mx-auto">
              {/* Lesson Header */}
              <div className="mb-6">
                <p className="text-xs text-accent font-medium uppercase tracking-wider mb-1">
                  Lesson {activeLessonIndex + 1} of {totalLessons}
                </p>
                <h1 className="font-display text-2xl sm:text-3xl font-bold">{activeLesson.title}</h1>
              </div>

              {/* Video Player */}
              {activeLesson.videoUrl ? (
                <div className="aspect-video rounded-xl overflow-hidden bg-card border border-border mb-8 shadow-lg">
                  <iframe
                    src={getYouTubeEmbedUrl(activeLesson.videoUrl)}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                    allowFullScreen
                    title={activeLesson.title}
                  />
                </div>
              ) : (
                <div className="aspect-video rounded-xl bg-card border border-border mb-8 flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <Play className="h-12 w-12 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No video available for this lesson</p>
                  </div>
                </div>
              )}

              {/* Lesson Notes */}
              {activeLesson.notes && (
                <div className="rounded-xl border border-border bg-card p-6 mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="h-5 w-5 text-accent" />
                    <h2 className="font-display text-lg font-semibold">Lesson Notes</h2>
                  </div>
                  <div className="prose prose-invert max-w-none text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {activeLesson.notes}
                  </div>
                </div>
              )}

              {/* Mark Complete Button */}
              <div className="flex items-center justify-between rounded-xl border border-border bg-card p-5 mb-8">
                <div>
                  <p className="font-display font-semibold text-sm">
                    {completedLessonIds.has(activeLesson.id) ? "✅ Lesson Completed" : "Ready to move on?"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {completedLessonIds.has(activeLesson.id)
                      ? "You've completed this lesson"
                      : "Mark this lesson as complete to unlock the next one"}
                  </p>
                </div>
                {!completedLessonIds.has(activeLesson.id) && (
                  <Button
                    variant="hero"
                    onClick={handleMarkComplete}
                    disabled={marking}
                    className="shadow-glow hover:scale-105 transition-transform shrink-0"
                  >
                    {marking ? (
                      <><Loader2 className="h-4 w-4 animate-spin mr-1" /> Saving...</>
                    ) : (
                      <><CheckCircle className="h-4 w-4 mr-1" /> Mark Complete</>
                    )}
                  </Button>
                )}
              </div>

              {/* Project Assignment — only after all lessons are completed */}
              {allCompleted && !projectLoading && project && (
                <div className="rounded-xl border-2 border-accent/30 bg-accent/5 p-6 animate-in fade-in slide-in-from-bottom-4">
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
                  <p className="text-xs text-muted-foreground mt-4 italic">
                    Project submission feature coming soon.
                  </p>
                </div>
              )}

              {allCompleted && !projectLoading && !project && (
                <div className="rounded-xl border-2 border-accent/30 bg-accent/5 p-6 text-center">
                  <Award className="h-10 w-10 mx-auto mb-3 text-accent" />
                  <h2 className="font-display text-xl font-bold mb-1">🎉 Congratulations!</h2>
                  <p className="text-sm text-muted-foreground">You've completed all lessons in this course!</p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center min-h-[50vh]">
              <div className="text-center">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                <h2 className="font-display text-xl font-bold mb-2">No lessons yet</h2>
                <p className="text-sm text-muted-foreground">Lessons will appear here once the instructor adds them.</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default CourseLearningPage;

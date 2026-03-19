import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { useCourse, useCourseProject, useUserCompletionRequest, useAdminSettings, submitCompletionRequest } from "@/hooks/useFirestore";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, Play, CheckCircle, Award, MessageCircle, Send, ExternalLink } from "lucide-react";
import { useState } from "react";

const CourseLearningPage = () => {
  const { id } = useParams();
  const { user, profile } = useAuth();
  const { course, loading } = useCourse(id);
  const { project } = useCourseProject(id);
  const { request: completionRequest, loading: completionLoading } = useUserCompletionRequest(user?.uid, id);
  const { settings } = useAdminSettings();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const handleFinishCourse = async () => {
    if (!user || !course) return;
    setSubmitting(true);
    try {
      await submitCompletionRequest({
        userId: user.uid,
        userEmail: user.email || "",
        userName: profile?.full_name || user.displayName || "Student",
        courseId: course.id,
        courseTitle: course.title,
      });
      toast({ title: "Request sent!", description: "The admin has been notified. You'll be assigned a project soon." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setSubmitting(false);
  };

  const adminTelegramUrl = settings.adminTelegram
    ? `https://t.me/${settings.adminTelegram.replace("@", "")}`
    : null;

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
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <Link
              to={`/course/${id}`}
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Course
            </Link>
            {adminTelegramUrl && (
              <a
                href={adminTelegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                Ask Admin
              </a>
            )}
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          {/* Course Title */}
          <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight mb-6 sm:mb-8">
            {course.title}
          </h1>

          {/* Course Thumbnail & Start Learning */}
          <div className="mb-8 sm:mb-12">
            <div className="aspect-video rounded-xl bg-card border border-border overflow-hidden mb-4">
              <img
                src={course.thumbnail || "/placeholder.svg"}
                alt={course.title}
                className="h-full w-full object-cover"
              />
            </div>

            {course.previewLink ? (
              <Button asChild variant="hero" size="lg" className="w-full sm:w-auto">
                <a href={course.previewLink} target="_blank" rel="noopener noreferrer">
                  <Play className="h-5 w-5 fill-current" />
                  ▶ Start Learning
                </a>
              </Button>
            ) : (
              <div className="rounded-lg border border-border bg-card/60 p-4 text-center">
                <p className="text-sm text-muted-foreground">Course not available yet</p>
              </div>
            )}
          </div>

          {/* Finish Course Button */}
          {user && (
            <div className="rounded-xl border border-border bg-card p-6 mb-8 sm:mb-12">
              {!completionRequest ? (
                <div className="text-center">
                  <CheckCircle className="h-10 w-10 mx-auto mb-3 text-accent" />
                  <h2 className="font-display text-lg font-semibold mb-2">Done watching?</h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    Click below to notify the admin. You'll be assigned a final project for certification.
                  </p>
                  <Button variant="hero" onClick={handleFinishCourse} disabled={submitting}>
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Award className="h-4 w-4 mr-2" />}
                    I Finished the Course
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium mb-3
                    bg-accent/10 text-accent border border-accent/20">
                    <CheckCircle className="h-4 w-4" />
                    {completionRequest.status === "pending" && "Completion request sent — awaiting project assignment"}
                    {completionRequest.status === "project_assigned" && "Project assigned — complete it and send to admin"}
                    {completionRequest.status === "certified" && "🎉 You are certified!"}
                  </div>
                  {completionRequest.status === "project_assigned" && adminTelegramUrl && (
                    <p className="text-sm text-muted-foreground mt-2">
                      After completing the project, send it to the admin on{" "}
                      <a href={adminTelegramUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        Telegram
                      </a>{" "}
                      with your <strong>full name</strong>.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Project Assignment */}
          {project && (completionRequest?.status === "project_assigned" || completionRequest?.status === "certified") && (
            <div className="rounded-xl border border-accent/30 bg-card p-6 mb-8 sm:mb-12">
              <div className="flex items-center gap-2 mb-4">
                <Award className="h-5 w-5 text-accent" />
                <h2 className="font-display text-xl font-bold">Final Project</h2>
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">{project.projectTitle}</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap mb-4">{project.projectDescription}</p>
              {adminTelegramUrl && completionRequest?.status === "project_assigned" && (
                <a href={adminTelegramUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="hero" size="sm">
                    <Send className="h-4 w-4 mr-2" />
                    Submit via Telegram
                  </Button>
                </a>
              )}
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

          {/* Contact Admin */}
          {adminTelegramUrl && (
            <div className="mt-12 rounded-xl border border-border bg-card/60 p-6 text-center">
              <MessageCircle className="h-8 w-8 mx-auto mb-3 text-primary" />
              <h3 className="font-display font-semibold mb-1">Have a question?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Reach out to the admin directly on Telegram for any help.
              </p>
              <a href={adminTelegramUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="heroOutline" size="sm">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Contact Admin on Telegram
                </Button>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseLearningPage;

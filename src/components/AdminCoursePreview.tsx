import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, ExternalLink, MonitorPlay, Shield, Sparkles } from "lucide-react";

const PREVIEWER_REPO_URL = "https://github.com/abnanatomix-create/skillup-playhub.git";

const AdminCoursePreview = () => {
  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-4">
            <Badge className="bg-primary/10 text-primary border-primary/20 w-fit">
              Preview Integration
            </Badge>
            <div className="space-y-2">
              <h1 className="font-display text-2xl font-bold">Course Preview</h1>
              <p className="max-w-2xl text-sm text-muted-foreground">
                This admin tab is ready for the fullscreen previewer integration. The UI is intentionally isolated first so we can plug in the previewer without disturbing the current dashboard styles or flows.
              </p>
            </div>
          </div>

          <Button asChild variant="outline" className="w-full sm:w-auto">
            <a href={PREVIEWER_REPO_URL} target="_blank" rel="noreferrer">
              Open GitHub Repo
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <article className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
            <MonitorPlay className="h-5 w-5" />
          </div>
          <h2 className="font-display text-lg font-semibold">Fullscreen host</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            The previewer will open in a dedicated fullscreen modal to keep its scripts and layout isolated from the admin panel.
          </p>
        </article>

        <article className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
            <BookOpen className="h-5 w-5" />
          </div>
          <h2 className="font-display text-lg font-semibold">Course-aware payload</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Next step is mapping each course into a preview payload with title, media, progress, and learning metadata.
          </p>
        </article>

        <article className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
            <Shield className="h-5 w-5" />
          </div>
          <h2 className="font-display text-lg font-semibold">Style isolation</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            We’ll keep previewer CSS and JS sandboxed so existing dashboard components stay stable while the new viewer is integrated.
          </p>
        </article>
      </div>

      <div className="rounded-2xl border border-dashed border-border bg-card p-6">
        <div className="flex items-start gap-3">
          <Sparkles className="mt-0.5 h-5 w-5 text-primary" />
          <div className="space-y-2">
            <h2 className="font-display text-lg font-semibold">Integration status</h2>
            <p className="text-sm text-muted-foreground">
              Repo link received. Admin tab added first as requested. Once you want the next step, I can wire the actual fullscreen modal host and connect it to course records.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdminCoursePreview;

import { useParams } from "react-router-dom";
import { useCourses } from "@/hooks/useFirestore";
import EmbedVideoPlayer from "@/components/EmbedVideoPlayer";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Loader2 } from "lucide-react";

const CourseEmbedPreviewPage = () => {
  const { id } = useParams<{ id: string }>();
  const { courses, loading } = useCourses();
  const course = courses.find((c) => c.id === id);

  if (loading) return <Loader className="mt-32" />;
  if (!course) return <div className="mt-32 text-center">Course not found.</div>;
  if (!course.embedCode) return <div className="mt-32 text-center">No embed code set for this course.</div>;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-3xl mx-auto py-16 px-4">
        <h1 className="font-display text-2xl font-bold mb-6 text-center">{course.title} — Live Preview</h1>
        <div className="rounded-xl border border-border bg-card p-4 shadow-glow">
          <EmbedVideoPlayer embedCode={course.embedCode} sourceType="custom" title={course.title} className="w-full aspect-video" />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CourseEmbedPreviewPage;

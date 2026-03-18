import { ExternalLink } from "lucide-react";
import EmbedVideoPlayer from "@/components/EmbedVideoPlayer";
import { Button } from "@/components/ui/button";
import { normalizeGoogleDrivePreviewLink } from "@/lib/video";

interface CourseVideoEmbedProps {
  videoUrl?: string;
  title: string;
  className?: string;
  showFullscreenButton?: boolean;
}

const CourseVideoEmbed = ({
  videoUrl,
  title,
  className = "",
  showFullscreenButton = true,
}: CourseVideoEmbedProps) => {
  const normalizedVideoUrl = normalizeGoogleDrivePreviewLink(videoUrl);

  if (!normalizedVideoUrl) return null;

  return (
    <div className={className}>
      <div className="w-full overflow-hidden rounded-xl border border-border bg-card shadow-lg" style={{ aspectRatio: "16 / 9" }}>
        <EmbedVideoPlayer embedCode={normalizedVideoUrl} sourceType="custom" title={title} />
      </div>

      {showFullscreenButton && (
        <Button asChild variant="heroOutline" className="mt-3 w-full sm:w-auto">
          <a href={normalizedVideoUrl} target="_blank" rel="noopener noreferrer" aria-label={`Open ${title} in fullscreen player`}>
            <ExternalLink className="h-4 w-4" />
            Open Fullscreen Player
          </a>
        </Button>
      )}
    </div>
  );
};

export default CourseVideoEmbed;

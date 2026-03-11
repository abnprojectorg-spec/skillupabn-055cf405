import { useMemo } from "react";

interface EmbedVideoPlayerProps {
  embedCode: string;
  sourceType?: "youtube" | "custom";
  title?: string;
  className?: string;
}

/**
 * Sanitizes an embed string to extract only safe iframe src URLs.
 * Blocks scripts and non-iframe HTML.
 */
const extractIframeSrc = (raw: string): string | null => {
  // If it's already a plain URL (not HTML), return it
  if (/^https?:\/\//.test(raw.trim()) && !raw.includes("<")) {
    return raw.trim();
  }

  // Extract src from iframe tag
  const match = raw.match(/<iframe[^>]+src=["']([^"']+)["']/i);
  if (match) return match[1];

  return null;
};

const getYouTubeEmbedUrl = (raw: string): string | null => {
  // From iframe embed code
  const iframeSrc = extractIframeSrc(raw);
  if (iframeSrc && iframeSrc.includes("youtube.com/embed")) return iframeSrc;

  // Plain URL conversions
  const url = raw.trim();
  if (url.includes("/embed/")) return url;
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`;
  const longMatch = url.match(/[?&]v=([a-zA-Z0-9_-]+)/);
  if (longMatch) return `https://www.youtube.com/embed/${longMatch[1]}`;
  
  return iframeSrc;
};

const EmbedVideoPlayer = ({
  embedCode,
  sourceType = "youtube",
  title = "Video",
  className = "",
}: EmbedVideoPlayerProps) => {
  const iframeSrc = useMemo(() => {
    if (!embedCode) return null;
    if (sourceType === "youtube") {
      return getYouTubeEmbedUrl(embedCode);
    }
    // Custom embed — extract iframe src for security
    return extractIframeSrc(embedCode);
  }, [embedCode, sourceType]);

  if (!iframeSrc) return null;

  return (
    <iframe
      src={iframeSrc}
      className={`w-full h-full ${className}`}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
      allowFullScreen
      title={title}
      sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
      referrerPolicy="no-referrer"
    />
  );
};

export default EmbedVideoPlayer;

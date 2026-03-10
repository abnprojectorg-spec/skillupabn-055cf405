interface SmartVideoPlayerProps {
  url: string;
  title?: string;
  className?: string;
}

const getYouTubeEmbedUrl = (url: string): string => {
  const iframeSrcMatch = url.match(/src=["']([^"']+)["']/);
  if (iframeSrcMatch) return iframeSrcMatch[1];
  if (url.includes("/embed/")) return url;
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`;
  const longMatch = url.match(/[?&]v=([a-zA-Z0-9_-]+)/);
  if (longMatch) return `https://www.youtube.com/embed/${longMatch[1]}`;
  return null;
};

const getVimeoEmbedUrl = (url: string): string | null => {
  const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (match) return `https://player.vimeo.com/video/${match[1]}`;
  if (url.includes("player.vimeo.com")) return url;
  return null;
};

const isDirectVideo = (url: string): boolean => {
  return /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url);
};

const SmartVideoPlayer = ({ url, title = "Video", className = "" }: SmartVideoPlayerProps) => {
  if (!url) return null;

  const youtubeUrl = getYouTubeEmbedUrl(url);
  if (youtubeUrl) {
    return (
      <iframe
        src={youtubeUrl}
        className={`w-full h-full ${className}`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen
        title={title}
      />
    );
  }

  const vimeoUrl = getVimeoEmbedUrl(url);
  if (vimeoUrl) {
    return (
      <iframe
        src={vimeoUrl}
        className={`w-full h-full ${className}`}
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        title={title}
      />
    );
  }

  if (isDirectVideo(url)) {
    return (
      <video
        src={url}
        className={`w-full h-full object-contain ${className}`}
        controls
        controlsList="nodownload"
        playsInline
        title={title}
      />
    );
  }

  // Fallback: try iframe embed
  return (
    <iframe
      src={url}
      className={`w-full h-full ${className}`}
      allow="autoplay; fullscreen; picture-in-picture"
      allowFullScreen
      title={title}
    />
  );
};

export default SmartVideoPlayer;

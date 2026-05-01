import { useEffect, useRef, useState } from "react";
import { usePromoAds, trackPromoImpression, trackPromoClick, type PromoAd } from "@/hooks/usePromoAds";
import { Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";

const ROTATE_MS = 6000;

function aspectRatioStyle(ar: string): React.CSSProperties {
  // "1:1" -> "1 / 1"
  const [w, h] = ar.split(":").map((n) => parseFloat(n) || 1);
  return { aspectRatio: `${w} / ${h}` };
}

function PromoMedia({ ad }: { ad: PromoAd }) {
  if (ad.mediaType === "video") {
    return (
      <video
        src={ad.mediaUrl}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        className="absolute inset-0 w-full h-full object-cover"
      />
    );
  }
  return (
    <img
      src={ad.mediaUrl}
      alt={ad.title}
      loading="lazy"
      className="absolute inset-0 w-full h-full object-cover"
    />
  );
}

export default function PromoCarousel() {
  const { ads, loading } = usePromoAds();
  const visible = ads.filter((a) => a.active);
  const [index, setIndex] = useState(0);
  const trackedRef = useRef<Set<string>>(new Set());

  // Auto-rotate
  useEffect(() => {
    if (visible.length <= 1) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % visible.length), ROTATE_MS);
    return () => clearInterval(t);
  }, [visible.length]);

  // Track impression once per ad per session
  useEffect(() => {
    const ad = visible[index];
    if (!ad) return;
    if (trackedRef.current.has(ad.id)) return;
    trackedRef.current.add(ad.id);
    trackPromoImpression(ad.id);
  }, [index, visible]);

  if (loading || visible.length === 0) return null;

  const ad = visible[index];

  const handleClick = () => {
    trackPromoClick(ad.id);
    if (ad.ctaUrl) {
      window.open(ad.ctaUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <section className="mb-8" aria-label="Promotions">
      <div className="flex items-center gap-2 mb-3">
        <Megaphone className="h-4 w-4 text-accent" />
        <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">Featured</h2>
      </div>

      <div
        className="relative w-full max-w-2xl mx-auto overflow-hidden rounded-2xl border border-border bg-card shadow-md"
        style={aspectRatioStyle(ad.aspectRatio || "1:1")}
      >
        <PromoMedia ad={ad} />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        {/* Content */}
        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6 text-white">
          <h3 className="font-display text-lg sm:text-xl font-bold">{ad.title}</h3>
          {ad.description && <p className="mt-1 text-sm text-white/85 line-clamp-2">{ad.description}</p>}
          {ad.ctaText && (
            <Button
              variant="hero"
              size="sm"
              className="mt-3"
              onClick={handleClick}
            >
              {ad.ctaText}
            </Button>
          )}
        </div>
        {/* Click overlay if no CTA button */}
        {!ad.ctaText && ad.ctaUrl && (
          <button
            type="button"
            onClick={handleClick}
            aria-label={ad.title}
            className="absolute inset-0 cursor-pointer"
          />
        )}
        {/* Pagination dots */}
        {visible.length > 1 && (
          <div className="absolute top-3 right-3 flex gap-1.5">
            {visible.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to promo ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`h-1.5 rounded-full transition-all ${i === index ? "w-6 bg-white" : "w-1.5 bg-white/50"}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

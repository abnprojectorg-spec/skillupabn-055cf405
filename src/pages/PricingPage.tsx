import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles } from "lucide-react";
import { usePricingPage } from "@/hooks/usePricingPage";

const PricingPage = () => {
  const { pricing, loading } = usePricingPage();
  const [iframeLoading, setIframeLoading] = useState(true);

  useEffect(() => {
    document.title = "Pricing — SkillUp";
  }, []);

  const hasEmbed = pricing.published && pricing.embedCode.trim().length > 0;

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-x-hidden">
      <Navbar />

      {/* Glossy ambient background */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 -left-24 h-[420px] w-[420px] rounded-full bg-primary/20 blur-[120px] animate-pulse" />
        <div className="absolute top-1/3 -right-24 h-[480px] w-[480px] rounded-full bg-accent/20 blur-[140px] animate-pulse" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,hsl(var(--primary)/0.08),transparent_60%)]" />
      </div>

      <main className="flex-1 pt-16 animate-in fade-in duration-500 w-full">
        {loading ? (
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-4">
            <Skeleton className="h-12 w-1/3" />
            <Skeleton className="h-[600px] w-full rounded-2xl" />
          </div>
        ) : hasEmbed ? (
          <PricingEmbed pricing={pricing} onLoad={() => setIframeLoading(false)} iframeLoading={iframeLoading} />
        ) : (
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
            <div className="relative overflow-hidden rounded-3xl border border-border bg-card/40 backdrop-blur-xl p-12 sm:p-20 text-center">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
              <div className="relative">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/30">
                  <Sparkles className="h-7 w-7 text-primary" />
                </div>
                <h1 className="font-display text-3xl sm:text-5xl font-bold mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Pricing page not published yet
                </h1>
                <p className="text-muted-foreground max-w-xl mx-auto">
                  Our creator pricing is being finalized. Please check back soon — premium plans are on the way.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

function PricingEmbed({
  pricing,
  onLoad,
  iframeLoading,
}: {
  pricing: ReturnType<typeof usePricingPage>["pricing"];
  onLoad: () => void;
  iframeLoading: boolean;
}) {
  const code = pricing.embedCode.trim();

  // External URL → render full-bleed iframe
  if (pricing.embedType === "url") {
    return (
      <div className="relative w-full">
        {iframeLoading && <Skeleton className="absolute inset-0" />}
        <iframe
          src={code}
          title="Pricing"
          onLoad={onLoad}
          className="block w-full min-h-[calc(100vh-4rem)] border-0 bg-transparent"
        />
      </div>
    );
  }

  // Raw HTML / iframe markup — render full width, no boxed container
  return (
    <div
      className="pricing-embed w-full min-h-[calc(100vh-4rem)] animate-in fade-in duration-700 [&_iframe]:w-full [&_iframe]:min-h-[calc(100vh-4rem)] [&_iframe]:border-0 [&_iframe]:block"
      dangerouslySetInnerHTML={{ __html: code }}
    />
  );
}

export default PricingPage;

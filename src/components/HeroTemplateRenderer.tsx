import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import TechParticlesBackground from "@/components/TechParticlesBackground";
import type { HeroTemplate, HeroTemplateTheme } from "@/hooks/useHeroTemplates";
import {
  ChevronRight, Zap, Shield, Award, Calendar, MapPin, Clock, Star,
  Mic, CalendarDays,
} from "lucide-react";
import { useEffect, useState } from "react";

interface Props {
  template: HeroTemplate;
}

/* ───────────────────────────────────────────────────────────
 * Background Layer — Video / Image / CSS / None
 * Uses theme.backgroundType + theme.backgroundValue + fallback
 * Re-renders instantly when template changes (key on template id+version).
 * ───────────────────────────────────────────────────────────*/
function HeroBackgroundLayer({ theme }: { theme: HeroTemplateTheme }) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const type = theme.backgroundType;
  const value = theme.backgroundValue?.trim();
  if (!type || type === "none" || !value) return null;

  // Mobile fallback for video
  if (type === "video") {
    if (isMobile && theme.backgroundFallbackImage) {
      return (
        <img
          src={theme.backgroundFallbackImage}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover pointer-events-none -z-10"
        />
      );
    }
    return (
      <video
        key={value}
        src={value}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover pointer-events-none -z-10"
      />
    );
  }

  if (type === "image") {
    return (
      <img
        src={value}
        alt=""
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover pointer-events-none -z-10"
      />
    );
  }

  if (type === "css") {
    // value is raw CSS for background property
    return (
      <div
        className="absolute inset-0 pointer-events-none -z-10"
        style={{ background: value } as React.CSSProperties}
      />
    );
  }

  return null;
}

export default function HeroTemplateRenderer({ template }: Props) {
  const { content, type, theme } = template;
  const hasCustomBg = theme.backgroundType && theme.backgroundType !== "none" && !!theme.backgroundValue;

  // Force re-mount when template id or version changes (kills caching of <video>)
  const renderKey = `${template.id}-${template.version}`;

  const inner = (() => {
    switch (type) {
      case "event-light":
        return <EventLightHero key={renderKey} content={content} suppressDecor={hasCustomBg} />;
      case "dark-tech":
        return <DarkTechHero key={renderKey} content={content} suppressDecor={hasCustomBg} />;
      case "creative-artistic":
        return <CreativeArtisticHero key={renderKey} content={content} suppressDecor={hasCustomBg} />;
      case "holiday":
        return <HolidayHero key={renderKey} content={content} suppressDecor={hasCustomBg} />;
      case "modern-bold":
        return <ModernBoldHero key={renderKey} content={content} suppressDecor={hasCustomBg} />;
      default:
        return <DefaultHero key={renderKey} content={content} suppressDecor={hasCustomBg} />;
    }
  })();

  if (!hasCustomBg) return inner;

  // Wrap inner section with background layer
  return (
    <div className="relative">
      <HeroBackgroundLayer theme={theme} />
      {/* dark overlay for legibility over media */}
      <div className="absolute inset-0 bg-background/40 -z-10" />
      {inner}
    </div>
  );
}

type SectionProps = { content: HeroTemplate["content"]; suppressDecor?: boolean };

// Shared mobile-first hero shell helpers
const heroShell =
  "relative overflow-hidden pt-24 pb-12 sm:pt-28 sm:pb-16 lg:pt-44 lg:pb-32";

// ─── Default Clean SaaS ──────────────────────────────────────

function DefaultHero({ content, suppressDecor }: SectionProps) {
  return (
    <section className={heroShell}>
      {!suppressDecor && <TechParticlesBackground />}
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="max-w-3xl text-center lg:text-left mx-auto lg:mx-0">
          <Badge className="mb-6 gradient-primary border-0 text-primary-foreground px-4 py-1.5 text-sm">🚀 The Future of Learning</Badge>
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-5xl lg:text-7xl break-words">{content.headingTitle}</h1>
          <p className="mt-5 text-base sm:text-lg text-muted-foreground sm:max-w-xl leading-relaxed">{content.subtitle}</p>
          {content.description && <p className="mt-3 text-sm sm:text-base text-muted-foreground sm:max-w-lg">{content.description}</p>}
          <div className="mt-8 flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 justify-center lg:justify-start">
            <Link to="/signup" className="w-full sm:w-auto"><Button variant="hero" size="lg" className="w-full sm:w-auto text-base px-8 py-6 shadow-glow">{content.primaryButtonText}<ChevronRight className="h-5 w-5" /></Button></Link>
            {content.secondaryButtonText && <Link to="/marketplace" className="w-full sm:w-auto"><Button variant="heroOutline" size="lg" className="w-full sm:w-auto text-base px-8 py-6">{content.secondaryButtonText}</Button></Link>}
          </div>
          <div className="mt-10 flex flex-wrap justify-center lg:justify-start gap-4 sm:gap-8 text-xs sm:text-sm text-muted-foreground">
            <span className="flex items-center gap-2"><Zap className="h-4 w-4 text-warning" /> Instant Access</span>
            <span className="flex items-center gap-2"><Shield className="h-4 w-4 text-accent" /> Secure Payments</span>
            <span className="flex items-center gap-2"><Award className="h-4 w-4 text-warning" /> Certificates</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Event / Conference (Light) ──────────────────────────────

function EventLightHero({ content, suppressDecor }: SectionProps) {
  return (
    <section
      className={heroShell}
      style={
        suppressDecor
          ? undefined
          : { background: "linear-gradient(180deg, hsl(var(--secondary)/0.3) 0%, hsl(var(--background)) 100%)" }
      }
    >
      {!suppressDecor && (
        <div className="absolute bottom-0 left-0 right-0 h-24 overflow-hidden">
          <svg viewBox="0 0 1440 120" className="w-full h-full" preserveAspectRatio="none">
            <path d="M0,40 C360,120 1080,0 1440,80 L1440,120 L0,120 Z" fill="hsl(var(--primary)/0.08)" />
          </svg>
        </div>
      )}
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="text-center lg:text-left">
            <h1 className="font-display text-3xl font-bold sm:text-5xl lg:text-6xl text-foreground break-words">{content.headingTitle}</h1>
            <p className="mt-3 text-base sm:text-xl text-muted-foreground">{content.subtitle}</p>
            {(content.eventDate || content.eventLocation || content.eventTime) && (
              <div className="mt-6 flex flex-wrap justify-center lg:justify-start items-center gap-x-4 gap-y-2 text-xs sm:text-sm text-muted-foreground">
                {content.eventDate && <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" />{content.eventDate}</span>}
                {content.eventLocation && <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" />{content.eventLocation}</span>}
                {content.eventTime && <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" />{content.eventTime}</span>}
              </div>
            )}
            <div className="mt-8 flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 justify-center lg:justify-start">
              <Link to="/signup" className="w-full sm:w-auto"><Button variant="hero" size="lg" className="w-full sm:w-auto text-base px-8 py-5">{content.primaryButtonText}</Button></Link>
              {content.secondaryButtonText && <Link to="/marketplace" className="w-full sm:w-auto"><Button variant="heroOutline" size="lg" className="w-full sm:w-auto text-base px-8 py-5">{content.secondaryButtonText}</Button></Link>}
            </div>
            {content.countdownDays && (
              <div className="mt-6 flex justify-center lg:justify-start">
                <Badge variant="outline" className="px-4 py-2 text-sm">{content.countdownDays} Days Left</Badge>
              </div>
            )}
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }} className="relative">
            {content.heroImageUrl ? (
              <img src={content.heroImageUrl} alt="Hero" className="w-full max-w-md mx-auto lg:max-w-none rounded-2xl shadow-2xl object-cover" />
            ) : (
              <div className="w-full aspect-[4/3] rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <p className="text-primary/50 text-sm sm:text-lg font-medium">Upload Image Here</p>
              </div>
            )}
          </motion.div>
        </div>
        {content.keyLabels.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-12 lg:mt-16 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4"
          >
            {content.keyLabels.map((label, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl border border-border bg-card/80 backdrop-blur-sm p-4">
                {i === 0 ? <CalendarDays className="h-5 w-5 text-primary shrink-0" /> : i === 1 ? <Mic className="h-5 w-5 text-primary shrink-0" /> : <Star className="h-5 w-5 text-primary shrink-0" />}
                <span className="text-sm font-medium">{label}</span>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}

// ─── Dark Tech / Futuristic ──────────────────────────────────

function DarkTechHero({ content, suppressDecor }: SectionProps) {
  return (
    <section
      className={`${heroShell} ${suppressDecor ? "" : "bg-gradient-to-br from-[hsl(var(--secondary))] via-background to-background"}`}
    >
      {!suppressDecor && (
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
      )}
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="text-center lg:text-left">
            <h1 className="font-display text-3xl font-bold sm:text-5xl lg:text-6xl break-words">
              <span className="text-primary">[</span>{content.headingTitle}<span className="text-primary">]</span>
            </h1>
            <p className="mt-4 text-base sm:text-xl text-primary/80">{content.subtitle}</p>
            <p className="mt-4 text-sm sm:text-base text-muted-foreground sm:max-w-lg mx-auto lg:mx-0">{content.description}</p>
            <div className="mt-8 flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 justify-center lg:justify-start">
              <Link to="/signup" className="w-full sm:w-auto"><Button variant="hero" size="lg" className="w-full sm:w-auto text-base px-8 py-5 uppercase tracking-wider">{content.primaryButtonText}</Button></Link>
              {content.secondaryButtonText && <Link to="/marketplace" className="w-full sm:w-auto"><Button variant="heroOutline" size="lg" className="w-full sm:w-auto text-base px-8 py-5 uppercase tracking-wider">{content.secondaryButtonText}</Button></Link>}
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.2 }} className="relative">
            {content.heroImageUrl ? (
              <img src={content.heroImageUrl} alt="Hero" className="w-full max-w-md mx-auto lg:max-w-none rounded-xl border border-primary/20 shadow-2xl shadow-primary/10 object-cover" />
            ) : (
              <div className="w-full aspect-[4/3] rounded-xl border border-primary/30 bg-primary/5 flex items-center justify-center backdrop-blur-sm">
                <p className="text-primary/40 text-sm sm:text-lg">[Upload Image Here]</p>
              </div>
            )}
          </motion.div>
        </div>
        {content.keyLabels.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mt-12 lg:mt-16 grid sm:grid-cols-2 gap-4 sm:gap-6">
            {content.keyLabels.map((label, i) => (
              <div key={i} className="p-5 sm:p-6 rounded-xl border border-primary/20 bg-card/50 backdrop-blur-sm">
                <h3 className="font-display font-bold text-sm uppercase tracking-wider">{label}</h3>
                <p className="text-xs text-muted-foreground mt-1">Brief details or context goes here</p>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}

// ─── Creative / Artistic ─────────────────────────────────────

function CreativeArtisticHero({ content, suppressDecor }: SectionProps) {
  return (
    <section className={heroShell}>
      {!suppressDecor && <div className="absolute inset-0 bg-gradient-to-b from-secondary/20 to-background opacity-50" />}
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center lg:text-left">
            <h1 className="font-display text-3xl font-black sm:text-5xl lg:text-6xl uppercase tracking-tight break-words">[{content.headingTitle}]</h1>
            <p className="mt-4 text-base sm:text-lg text-muted-foreground">{content.subtitle}</p>
            <div className="mt-8 flex justify-center lg:justify-start">
              <Link to="/signup" className="w-full sm:w-auto"><Button variant="hero" size="lg" className="w-full sm:w-auto text-base px-8 py-5 border-2 border-foreground">{content.primaryButtonText}</Button></Link>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }} className="relative">
            {content.heroImageUrl ? (
              <img src={content.heroImageUrl} alt="Hero" className="w-full max-w-md mx-auto lg:max-w-none rounded-2xl shadow-xl object-cover" />
            ) : (
              <div className="w-full aspect-[4/3] rounded-2xl bg-muted/30 border-2 border-dashed border-muted-foreground/20 flex items-center justify-center">
                <p className="text-muted-foreground text-sm sm:text-base">Upload Image Here</p>
              </div>
            )}
          </motion.div>
        </div>
        {content.partnerLogos.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="mt-16 lg:mt-20 text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-6">Trusted by</p>
            <div className="flex flex-wrap justify-center gap-6 sm:gap-8 items-center">
              {content.partnerLogos.map((logo, i) => (
                <img key={i} src={logo} alt={`Partner ${i+1}`} className="h-6 sm:h-8 opacity-60 hover:opacity-100 transition-opacity" />
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}

// ─── Holiday / Campaign ──────────────────────────────────────

function HolidayHero({ content, suppressDecor }: SectionProps) {
  return (
    <section className={heroShell}>
      {!suppressDecor && (
        <>
          <div className="absolute inset-0 animate-pulse" style={{ background: "radial-gradient(ellipse at 30% 50%, hsl(var(--primary)/0.15) 0%, transparent 70%), radial-gradient(ellipse at 70% 50%, hsl(var(--accent)/0.15) 0%, transparent 70%)" }} />
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div key={i}
                className="absolute w-1 h-1 rounded-full bg-accent"
                style={{ left: `${Math.random()*100}%`, top: `${Math.random()*100}%` }}
                animate={{ opacity: [0.2, 1, 0.2], scale: [0.5, 1.5, 0.5] }}
                transition={{ duration: 2 + Math.random()*3, repeat: Infinity, delay: Math.random()*2 }}
              />
            ))}
          </div>
        </>
      )}
      <div className="relative mx-auto max-w-4xl px-4 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }}>
          <h1 className="font-display text-4xl font-bold sm:text-6xl lg:text-7xl break-words">{content.headingTitle}</h1>
          <p className="mt-4 sm:mt-6 text-base sm:text-xl text-muted-foreground">{content.subtitle}</p>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">{content.description}</p>
          {content.countdownDays && (
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: "spring" }} className="mt-6 sm:mt-8">
              <Badge className="gradient-primary border-0 text-primary-foreground px-5 py-2.5 sm:px-6 sm:py-3 text-base sm:text-lg font-bold">
                ⏰ {content.countdownDays} Days Left!
              </Badge>
            </motion.div>
          )}
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
            <Link to="/signup" className="w-full sm:w-auto"><Button variant="hero" size="lg" className="w-full sm:w-auto text-base px-10 py-6 shadow-glow">{content.primaryButtonText}</Button></Link>
            {content.secondaryButtonText && <Link to="/marketplace" className="w-full sm:w-auto"><Button variant="heroOutline" size="lg" className="w-full sm:w-auto text-base px-8 py-6">{content.secondaryButtonText}</Button></Link>}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Modern / Bold Startup ───────────────────────────────────

function ModernBoldHero({ content, suppressDecor }: SectionProps) {
  return (
    <section className={heroShell}>
      {!suppressDecor && <TechParticlesBackground />}
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="text-center lg:text-left">
            <Badge className="mb-6 bg-accent/10 text-accent border-accent/20 px-4 py-1.5">✨ Next Generation Platform</Badge>
            <h1 className="font-display text-3xl font-extrabold sm:text-5xl lg:text-6xl leading-[1.1] break-words">{content.headingTitle}</h1>
            <p className="mt-5 sm:mt-6 text-lg sm:text-xl text-primary/70 font-medium">{content.subtitle}</p>
            <p className="mt-3 text-sm sm:text-base text-muted-foreground sm:max-w-lg mx-auto lg:mx-0">{content.description}</p>
            <div className="mt-8 flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 justify-center lg:justify-start">
              <Link to="/signup" className="w-full sm:w-auto"><Button variant="hero" size="lg" className="w-full sm:w-auto text-base px-10 py-6 shadow-glow">{content.primaryButtonText}<ChevronRight className="h-5 w-5" /></Button></Link>
              {content.secondaryButtonText && <Link to="/marketplace" className="w-full sm:w-auto"><Button variant="heroOutline" size="lg" className="w-full sm:w-auto text-base px-8 py-6">{content.secondaryButtonText}</Button></Link>}
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }} className="relative">
            {content.heroImageUrl ? (
              <img src={content.heroImageUrl} alt="Hero" className="w-full max-w-md mx-auto lg:max-w-none rounded-3xl shadow-2xl border border-accent/20 object-cover" />
            ) : (
              <div className="w-full aspect-square max-w-md mx-auto rounded-3xl bg-gradient-to-br from-primary/10 to-accent/10 border border-accent/20 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-2xl gradient-primary flex items-center justify-center">
                    <Zap className="h-8 w-8 sm:h-10 sm:w-10 text-primary-foreground" />
                  </div>
                  <p className="text-muted-foreground text-sm sm:text-base">Upload Image Here</p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

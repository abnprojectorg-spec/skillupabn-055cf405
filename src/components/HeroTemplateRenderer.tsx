import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import TechParticlesBackground from "@/components/TechParticlesBackground";
import type { HeroTemplate } from "@/hooks/useHeroTemplates";
import {
  ChevronRight, Zap, Shield, Award, Calendar, MapPin, Clock, Star,
  Mic, CalendarDays,
} from "lucide-react";

interface Props {
  template: HeroTemplate;
}

export default function HeroTemplateRenderer({ template }: Props) {
  const { content, type } = template;

  switch (type) {
    case "event-light":
      return <EventLightHero content={content} />;
    case "dark-tech":
      return <DarkTechHero content={content} />;
    case "creative-artistic":
      return <CreativeArtisticHero content={content} />;
    case "holiday":
      return <HolidayHero content={content} />;
    case "modern-bold":
      return <ModernBoldHero content={content} />;
    default:
      return <DefaultHero content={content} />;
  }
}

// ─── Default Clean SaaS ──────────────────────────────────────

function DefaultHero({ content }: { content: HeroTemplate["content"] }) {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 lg:pt-44 lg:pb-32">
      <TechParticlesBackground />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="max-w-3xl">
          <Badge className="mb-6 gradient-primary border-0 text-primary-foreground px-4 py-1.5 text-sm">🚀 The Future of Learning</Badge>
          <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl lg:text-7xl">{content.headingTitle}</h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed">{content.subtitle}</p>
          {content.description && <p className="mt-3 text-muted-foreground max-w-lg">{content.description}</p>}
          <div className="mt-10 flex flex-wrap gap-4">
            <Link to="/signup"><Button variant="hero" size="lg" className="text-base px-8 py-6 shadow-glow">{content.primaryButtonText}<ChevronRight className="h-5 w-5" /></Button></Link>
            {content.secondaryButtonText && <Link to="/marketplace"><Button variant="heroOutline" size="lg" className="text-base px-8 py-6">{content.secondaryButtonText}</Button></Link>}
          </div>
          <div className="mt-12 flex items-center gap-8 text-sm text-muted-foreground">
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

function EventLightHero({ content }: { content: HeroTemplate["content"] }) {
  return (
    <section className="relative overflow-hidden pt-28 pb-16 lg:pt-40 lg:pb-28" style={{ background: "linear-gradient(180deg, hsl(var(--secondary)/0.3) 0%, hsl(var(--background)) 100%)" }}>
      {/* Decorative wave */}
      <div className="absolute bottom-0 left-0 right-0 h-24 overflow-hidden">
        <svg viewBox="0 0 1440 120" className="w-full h-full" preserveAspectRatio="none">
          <path d="M0,40 C360,120 1080,0 1440,80 L1440,120 L0,120 Z" fill="hsl(var(--primary)/0.08)" />
        </svg>
      </div>
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
            <h1 className="font-display text-4xl font-bold sm:text-5xl lg:text-6xl text-foreground">{content.headingTitle}</h1>
            <p className="mt-3 text-xl text-muted-foreground">{content.subtitle}</p>
            {(content.eventDate || content.eventLocation || content.eventTime) && (
              <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                {content.eventDate && <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" />{content.eventDate}</span>}
                {content.eventLocation && <><span>|</span><span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" />{content.eventLocation}</span></>}
                {content.eventTime && <><span>|</span><span className="flex items-center gap-1.5"><Clock className="h-4 w-4" />{content.eventTime}</span></>}
              </div>
            )}
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/signup"><Button variant="hero" size="lg" className="text-base px-8 py-5">{content.primaryButtonText}</Button></Link>
              {content.secondaryButtonText && <Link to="/marketplace"><Button variant="heroOutline" size="lg" className="text-base px-8 py-5">{content.secondaryButtonText}</Button></Link>}
            </div>
            {content.countdownDays && (
              <div className="mt-6">
                <Badge variant="outline" className="px-4 py-2 text-sm">{content.countdownDays} Days Left</Badge>
              </div>
            )}
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            {content.heroImageUrl ? (
              <img src={content.heroImageUrl} alt="Hero" className="w-full rounded-2xl shadow-2xl" />
            ) : (
              <div className="w-full aspect-[4/3] rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <p className="text-primary/50 text-lg font-medium">Upload Image Here</p>
              </div>
            )}
          </motion.div>
        </div>
        {/* Key highlights */}
        {content.keyLabels.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4"
          >
            {content.keyLabels.map((label, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl border border-border bg-card/80 backdrop-blur-sm p-4">
                {i === 0 ? <CalendarDays className="h-5 w-5 text-primary" /> : i === 1 ? <Mic className="h-5 w-5 text-primary" /> : <Star className="h-5 w-5 text-primary" />}
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

function DarkTechHero({ content }: { content: HeroTemplate["content"] }) {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 lg:pt-44 lg:pb-32 bg-gradient-to-br from-[hsl(var(--secondary))] via-background to-background">
      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <h1 className="font-display text-4xl font-bold sm:text-5xl lg:text-6xl">
              <span className="text-primary">[</span>{content.headingTitle}<span className="text-primary">]</span>
            </h1>
            <p className="mt-4 text-xl text-primary/80">{content.subtitle}</p>
            <p className="mt-4 text-muted-foreground max-w-lg">{content.description}</p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link to="/signup"><Button variant="hero" size="lg" className="text-base px-8 py-5 uppercase tracking-wider">{content.primaryButtonText}</Button></Link>
              {content.secondaryButtonText && <Link to="/marketplace"><Button variant="heroOutline" size="lg" className="text-base px-8 py-5 uppercase tracking-wider">{content.secondaryButtonText}</Button></Link>}
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            {content.heroImageUrl ? (
              <img src={content.heroImageUrl} alt="Hero" className="w-full rounded-xl border border-primary/20 shadow-2xl shadow-primary/10" />
            ) : (
              <div className="w-full aspect-[4/3] rounded-xl border border-primary/30 bg-primary/5 flex items-center justify-center backdrop-blur-sm">
                <p className="text-primary/40 text-lg">[Upload Image Here]</p>
              </div>
            )}
          </motion.div>
        </div>
        {content.keyLabels.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mt-16 grid sm:grid-cols-2 gap-6">
            {content.keyLabels.map((label, i) => (
              <div key={i} className="p-6 rounded-xl border border-primary/20 bg-card/50 backdrop-blur-sm">
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

function CreativeArtisticHero({ content }: { content: HeroTemplate["content"] }) {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 lg:pt-44 lg:pb-32">
      {/* Textured background */}
      <div className="absolute inset-0 bg-gradient-to-b from-secondary/20 to-background opacity-50" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
            <h1 className="font-display text-4xl font-black sm:text-5xl lg:text-6xl uppercase tracking-tight">[{content.headingTitle}]</h1>
            <p className="mt-4 text-lg text-muted-foreground">{content.subtitle}</p>
            <div className="mt-10">
              <Link to="/signup"><Button variant="hero" size="lg" className="text-base px-8 py-5 border-2 border-foreground">{content.primaryButtonText}</Button></Link>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.3 }}
            className="relative hidden lg:block"
          >
            {content.heroImageUrl ? (
              <img src={content.heroImageUrl} alt="Hero" className="w-full rounded-2xl shadow-xl" />
            ) : (
              <div className="w-full aspect-[4/3] rounded-2xl bg-muted/30 border-2 border-dashed border-muted-foreground/20 flex items-center justify-center">
                <p className="text-muted-foreground">Upload Image Here</p>
              </div>
            )}
          </motion.div>
        </div>
        {content.partnerLogos.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="mt-20 text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-6">Trusted by</p>
            <div className="flex flex-wrap justify-center gap-8 items-center">
              {content.partnerLogos.map((logo, i) => (
                <img key={i} src={logo} alt={`Partner ${i+1}`} className="h-8 opacity-60 hover:opacity-100 transition-opacity" />
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}

// ─── Holiday / Campaign ──────────────────────────────────────

function HolidayHero({ content }: { content: HeroTemplate["content"] }) {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 lg:pt-44 lg:pb-32">
      {/* Animated gradient */}
      <div className="absolute inset-0 animate-pulse" style={{ background: "radial-gradient(ellipse at 30% 50%, hsl(var(--primary)/0.15) 0%, transparent 70%), radial-gradient(ellipse at 70% 50%, hsl(var(--accent)/0.15) 0%, transparent 70%)" }} />
      {/* Sparkles */}
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
      <div className="relative mx-auto max-w-4xl px-4 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }}>
          <h1 className="font-display text-5xl font-bold sm:text-6xl lg:text-7xl">{content.headingTitle}</h1>
          <p className="mt-6 text-xl text-muted-foreground">{content.subtitle}</p>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">{content.description}</p>
          {content.countdownDays && (
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: "spring" }} className="mt-8">
              <Badge className="gradient-primary border-0 text-primary-foreground px-6 py-3 text-lg font-bold">
                ⏰ {content.countdownDays} Days Left!
              </Badge>
            </motion.div>
          )}
          <div className="mt-10 flex justify-center gap-4 flex-wrap">
            <Link to="/signup"><Button variant="hero" size="lg" className="text-base px-10 py-6 shadow-glow">{content.primaryButtonText}</Button></Link>
            {content.secondaryButtonText && <Link to="/marketplace"><Button variant="heroOutline" size="lg" className="text-base px-8 py-6">{content.secondaryButtonText}</Button></Link>}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Modern / Bold Startup ───────────────────────────────────

function ModernBoldHero({ content }: { content: HeroTemplate["content"] }) {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 lg:pt-44 lg:pb-32">
      <TechParticlesBackground />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <Badge className="mb-6 bg-accent/10 text-accent border-accent/20 px-4 py-1.5">✨ Next Generation Platform</Badge>
            <h1 className="font-display text-4xl font-extrabold sm:text-5xl lg:text-6xl leading-[1.1]">{content.headingTitle}</h1>
            <p className="mt-6 text-xl text-primary/70 font-medium">{content.subtitle}</p>
            <p className="mt-3 text-muted-foreground max-w-lg">{content.description}</p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link to="/signup"><Button variant="hero" size="lg" className="text-base px-10 py-6 shadow-glow">{content.primaryButtonText}<ChevronRight className="h-5 w-5" /></Button></Link>
              {content.secondaryButtonText && <Link to="/marketplace"><Button variant="heroOutline" size="lg" className="text-base px-8 py-6">{content.secondaryButtonText}</Button></Link>}
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            {content.heroImageUrl ? (
              <img src={content.heroImageUrl} alt="Hero" className="w-full rounded-3xl shadow-2xl border border-accent/20" />
            ) : (
              <div className="w-full aspect-square rounded-3xl bg-gradient-to-br from-primary/10 to-accent/10 border border-accent/20 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-2xl gradient-primary flex items-center justify-center">
                    <Zap className="h-10 w-10 text-primary-foreground" />
                  </div>
                  <p className="text-muted-foreground">Upload Image Here</p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

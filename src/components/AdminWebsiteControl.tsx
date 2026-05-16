import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  useSiteSettings,
  saveSiteHomepage,
  saveSiteDesign,
  saveSiteFooter,
  DEFAULT_HERO,
  DEFAULT_SECTIONS,
  DEFAULT_DESIGN,
  DEFAULT_FOOTER,
  type HeroContent,
  type SectionConfig,
  type DesignSettings,
  type FooterContent,
} from "@/hooks/useSiteSettings";
import { usePricingPage, savePricingPage, DEFAULT_PRICING, type PricingPageSettings, type PricingEmbedType } from "@/hooks/usePricingPage";
import {
  useHeroTemplates,
  publishHeroTemplate,
  updateHeroTemplateContent,
  duplicateHeroTemplate,
  rollbackHeroTemplate,
  THEME_PRESETS,
  type HeroTemplate,
  type HeroTemplateContent,
  type HeroTemplateTheme,
  type ThemePreset,
} from "@/hooks/useHeroTemplates";
import {
  Loader2, Save, Layout, Paintbrush, FileText, Globe, GripVertical,
  Eye, EyeOff, Plus, Trash2, ChevronDown, ChevronUp, Copy, Pencil, Rocket, X,
  RotateCcw, Palette, Type, MousePointer, Sun, Moon, Video, Code,
} from "lucide-react";

type SubTab = "homepage" | "design" | "background" | "templates" | "themes" | "pricing" | "footer";

const SUB_TABS: { id: SubTab; label: string; icon: React.ReactNode }[] = [
  { id: "homepage", label: "Homepage", icon: <Layout className="h-4 w-4" /> },
  { id: "design", label: "Design", icon: <Paintbrush className="h-4 w-4" /> },
  { id: "background", label: "Background", icon: <Video className="h-4 w-4" /> },
  { id: "templates", label: "Templates", icon: <FileText className="h-4 w-4" /> },
  { id: "themes", label: "Themes", icon: <Palette className="h-4 w-4" /> },
  { id: "pricing", label: "Pricing Page", icon: <Rocket className="h-4 w-4" /> },
  { id: "footer", label: "Footer", icon: <Globe className="h-4 w-4" /> },
];

// Predefined CSS visual background templates (modern aesthetics)
const BG_CSS_PRESETS: { id: string; label: string; description: string; css: string }[] = [
  {
    id: "glassy",
    label: "Glassy / Glossy",
    description: "Soft frosted gradient with light blur",
    css: "radial-gradient(circle at 20% 20%, hsl(var(--primary) / 0.35), transparent 40%), radial-gradient(circle at 80% 60%, hsl(var(--accent) / 0.3), transparent 45%), linear-gradient(135deg, hsl(var(--background)), hsl(var(--secondary)))",
  },
  {
    id: "animated-gradient",
    label: "Animated Gradient",
    description: "Smooth shifting multi-color gradient",
    css: "linear-gradient(270deg, hsl(var(--primary)), hsl(var(--accent)), hsl(var(--secondary))) 0% 0% / 600% 600%",
  },
  {
    id: "blur-neon",
    label: "Blur + Neon",
    description: "Bold neon glows on dark base",
    css: "radial-gradient(circle at 30% 30%, #00f5ff55, transparent 30%), radial-gradient(circle at 70% 70%, #ff00d955, transparent 30%), #0a0a14",
  },
  {
    id: "dark-tech",
    label: "Dark Modern Tech",
    description: "Subtle grid + dark gradient",
    css: "linear-gradient(180deg, #07070d, #11111a), repeating-linear-gradient(0deg, transparent 0 39px, rgba(255,255,255,0.04) 39px 40px), repeating-linear-gradient(90deg, transparent 0 39px, rgba(255,255,255,0.04) 39px 40px)",
  },
];

const TEMPLATE_TYPE_COLORS: Record<string, string> = {
  "default": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "event-light": "bg-purple-500/10 text-purple-400 border-purple-500/20",
  "dark-tech": "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  "creative-artistic": "bg-gray-500/10 text-gray-400 border-gray-500/20",
  "holiday": "bg-red-500/10 text-red-400 border-red-500/20",
  "modern-bold": "bg-violet-500/10 text-violet-400 border-violet-500/20",
};

const TEMPLATE_TYPE_LABELS: Record<string, string> = {
  "default": "SaaS",
  "event-light": "Event",
  "dark-tech": "Dark Tech",
  "creative-artistic": "Artistic",
  "holiday": "Holiday",
  "modern-bold": "Modern",
};

// Editable fields per template type
const TEMPLATE_FIELDS: Record<string, (keyof HeroTemplateContent)[]> = {
  "default": ["headingTitle", "subtitle", "description", "primaryButtonText", "secondaryButtonText", "heroImageUrl"],
  "event-light": ["headingTitle", "subtitle", "description", "primaryButtonText", "secondaryButtonText", "heroImageUrl", "eventDate", "eventLocation", "eventTime", "countdownDays", "keyLabels"],
  "dark-tech": ["headingTitle", "subtitle", "description", "primaryButtonText", "secondaryButtonText", "heroImageUrl", "keyLabels"],
  "creative-artistic": ["headingTitle", "subtitle", "primaryButtonText", "heroImageUrl", "partnerLogos"],
  "holiday": ["headingTitle", "subtitle", "description", "primaryButtonText", "secondaryButtonText", "countdownDays"],
  "modern-bold": ["headingTitle", "subtitle", "description", "primaryButtonText", "secondaryButtonText", "heroImageUrl"],
};

const FIELD_LABELS: Record<string, string> = {
  headingTitle: "[HEADING TITLE]",
  subtitle: "[SUBTITLE HERE]",
  description: "[DESCRIPTION TEXT]",
  primaryButtonText: "[BUTTON PRIMARY TEXT]",
  secondaryButtonText: "[BUTTON SECONDARY TEXT]",
  heroImageUrl: "[UPLOAD IMAGE HERE]",
  eventDate: "[EVENT DATE]",
  eventLocation: "[LOCATION]",
  eventTime: "[TIME]",
  countdownDays: "[COUNTDOWN: XX DAYS LEFT]",
  keyLabels: "[KEY LABELS]",
  partnerLogos: "[PARTNER LOGOS]",
};

export default function AdminWebsiteControl({ toast }: { toast: any }) {
  const { settings, loading } = useSiteSettings();
  const { state: heroState, loading: heroLoading } = useHeroTemplates();
  const { pricing: pricingRemote, loading: pricingLoading } = usePricingPage();
  const [subTab, setSubTab] = useState<SubTab>("homepage");
  const [saving, setSaving] = useState(false);

  // Local state
  const [hero, setHero] = useState<HeroContent>(DEFAULT_HERO);
  const [sections, setSections] = useState<SectionConfig[]>(DEFAULT_SECTIONS);
  const [design, setDesign] = useState<DesignSettings>(DEFAULT_DESIGN);
  const [footer, setFooter] = useState<FooterContent>(DEFAULT_FOOTER);

  // Template editor
  const [editingTemplate, setEditingTemplate] = useState<HeroTemplate | null>(null);
  const [editContent, setEditContent] = useState<HeroTemplateContent | null>(null);
  const [editTheme, setEditTheme] = useState<HeroTemplateTheme | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<HeroTemplate | null>(null);
  const [templateSaving, setTemplateSaving] = useState(false);

  // Pricing page manager
  const [pricing, setPricing] = useState<PricingPageSettings>(DEFAULT_PRICING);
  const [pricingPreview, setPricingPreview] = useState(false);
  const [pricingSaving, setPricingSaving] = useState(false);

  useEffect(() => {
    if (!loading) {
      setHero(settings.homepage.hero);
      setSections(settings.homepage.sections);
      setDesign(settings.design);
      setFooter(settings.footer);
    }
  }, [loading, settings]);

  useEffect(() => {
    if (!pricingLoading) setPricing(pricingRemote);
  }, [pricingLoading, pricingRemote]);

  const handleSave = async () => {
    setSaving(true);
    try {
      switch (subTab) {
        case "homepage":
          await saveSiteHomepage({ hero, sections });
          break;
        case "design":
          await saveSiteDesign(design);
          break;
        case "footer":
          await saveSiteFooter(footer);
          break;
      }
      toast({ title: "Saved!", description: `${subTab} settings updated successfully.` });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setSaving(false);
  };

  const moveSection = (index: number, direction: "up" | "down") => {
    const newSections = [...sections];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newSections.length) return;
    [newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]];
    newSections.forEach((s, i) => (s.order = i));
    setSections(newSections);
  };

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Website Control</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your homepage content, design, and footer.</p>
        </div>
        {subTab !== "templates" && subTab !== "themes" && subTab !== "background" && subTab !== "pricing" && (
          <Button variant="hero" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Save Changes
          </Button>
        )}
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-2 flex-wrap">
        {SUB_TABS.map((tab) => (
          <Button key={tab.id} variant={subTab === tab.id ? "default" : "outline"} size="sm" onClick={() => setSubTab(tab.id)} className="gap-1.5">
            {tab.icon}{tab.label}
          </Button>
        ))}
      </div>

      {/* Homepage Content */}
      {subTab === "homepage" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2"><Badge variant="secondary">Hero</Badge> Hero Section</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><Label>Logo Text (Site Name)</Label><Input value={hero.logoText || "SkillUp"} onChange={(e) => setHero({ ...hero, logoText: e.target.value })} className="mt-1" placeholder="SkillUp" /></div>
              <div><Label>Logo Image URL (optional)</Label><Input value={hero.logoUrl || ""} onChange={(e) => setHero({ ...hero, logoUrl: e.target.value })} className="mt-1" placeholder="https://..." /></div>
              <div className="sm:col-span-2"><Label>Title</Label><Input value={hero.title} onChange={(e) => setHero({ ...hero, title: e.target.value })} className="mt-1" /></div>
              <div className="sm:col-span-2"><Label>Subtitle</Label><Textarea value={hero.subtitle} onChange={(e) => setHero({ ...hero, subtitle: e.target.value })} className="mt-1" rows={2} /></div>
              <div><Label>CTA Button Text</Label><Input value={hero.ctaText} onChange={(e) => setHero({ ...hero, ctaText: e.target.value })} className="mt-1" /></div>
              <div>
                <Label>Background Type</Label>
                <select value={hero.backgroundType} onChange={(e) => setHero({ ...hero, backgroundType: e.target.value as any })} className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                  <option value="particles">Animated Particles</option>
                  <option value="image">Static Image URL</option>
                  <option value="gradient">CSS Gradient</option>
                  <option value="video">Video URL</option>
                  <option value="css">Custom CSS Motion</option>
                  <option value="embed">Embed HTML Code</option>
                </select>
              </div>
              {hero.backgroundType !== "particles" && (
                <div className="sm:col-span-2">
                  <Label>{hero.backgroundType === "gradient" ? "Gradient CSS" : hero.backgroundType === "css" ? "CSS Code" : hero.backgroundType === "embed" ? "Embed HTML" : hero.backgroundType === "video" ? "Video URL" : "Image URL"}</Label>
                  {hero.backgroundType === "css" || hero.backgroundType === "embed" ? (
                    <Textarea value={hero.backgroundUrl} onChange={(e) => setHero({ ...hero, backgroundUrl: e.target.value })} className="mt-1 font-mono text-xs" rows={4} />
                  ) : (
                    <Input value={hero.backgroundUrl} onChange={(e) => setHero({ ...hero, backgroundUrl: e.target.value })} className="mt-1" />
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2"><Badge variant="secondary">Sections</Badge> Section Visibility & Order</h2>
            <div className="space-y-3">
              {sections.sort((a, b) => a.order - b.order).map((section, index) => (
                <div key={section.id} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-secondary/20">
                  <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0"><Input value={section.title} onChange={(e) => { const u = [...sections]; u[index] = { ...u[index], title: e.target.value }; setSections(u); }} className="h-8 text-sm" /></div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveSection(index, "up")} disabled={index === 0}><ChevronUp className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveSection(index, "down")} disabled={index === sections.length - 1}><ChevronDown className="h-3.5 w-3.5" /></Button>
                    <Switch checked={section.visible} onCheckedChange={(checked) => { const u = [...sections]; u[index] = { ...u[index], visible: checked }; setSections(u); }} />
                    {section.visible ? <Eye className="h-4 w-4 text-accent" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Design & Style */}
      {subTab === "design" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-display text-lg font-semibold mb-4">Theme Colors (HSL)</h2>
            <p className="text-xs text-muted-foreground mb-4">Changes apply globally. Templates override these when published.</p>
            <div className="grid gap-4 sm:grid-cols-3">
              {([["Primary Color", "primaryColor"], ["Secondary Color", "secondaryColor"], ["Accent Color", "accentColor"]] as const).map(([label, key]) => (
                <div key={key}>
                  <Label>{label}</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="h-8 w-8 rounded-md border border-border shrink-0" style={{ background: `hsl(${design[key]})` }} />
                    <Input value={design[key]} onChange={(e) => setDesign({ ...design, [key]: e.target.value })} className="flex-1" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-display text-lg font-semibold mb-4">Typography</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><Label>Body Font</Label><select value={design.fontFamily} onChange={(e) => setDesign({ ...design, fontFamily: e.target.value as any })} className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 text-sm"><option value="inter">Inter</option><option value="space-grotesk">Space Grotesk</option><option value="poppins">Poppins</option><option value="raleway">Raleway</option><option value="playfair">Playfair Display</option><option value="roboto">Roboto</option><option value="dm-sans">DM Sans</option></select></div>
              <div><Label>Heading Font</Label><select value={design.headingFont} onChange={(e) => setDesign({ ...design, headingFont: e.target.value as any })} className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 text-sm"><option value="space-grotesk">Space Grotesk</option><option value="inter">Inter</option><option value="poppins">Poppins</option><option value="raleway">Raleway</option><option value="playfair">Playfair Display</option><option value="roboto">Roboto</option><option value="dm-sans">DM Sans</option></select></div>
              <div><Label>Font Scale</Label><select value={design.fontScale} onChange={(e) => setDesign({ ...design, fontScale: e.target.value as any })} className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 text-sm"><option value="small">Small</option><option value="normal">Normal</option><option value="large">Large</option></select></div>
              <div><Label>Heading Style</Label><select value={design.headingStyle} onChange={(e) => setDesign({ ...design, headingStyle: e.target.value as any })} className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 text-sm"><option value="bold">Bold</option><option value="light">Light</option><option value="italic">Italic</option><option value="uppercase">Uppercase</option><option value="normal">Normal</option></select></div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-display text-lg font-semibold mb-4">Button & Hover Styles</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><Label>Button Style</Label><select value={design.buttonStyle} onChange={(e) => setDesign({ ...design, buttonStyle: e.target.value as any })} className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 text-sm"><option value="rounded">Rounded</option><option value="square">Square</option><option value="pill">Pill</option></select></div>
              <div><Label>Hover Effect</Label><select value={design.hoverEffect} onChange={(e) => setDesign({ ...design, hoverEffect: e.target.value as any })} className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 text-sm"><option value="scale">Scale Up</option><option value="glow">Glow</option><option value="lift">Lift</option><option value="slide-up">Slide Up</option></select></div>
            </div>
            <div className="mt-4 flex gap-3 flex-wrap">
              {["rounded", "square", "pill"].map((style) => (
                <button key={style} className="px-4 py-2 text-sm font-medium text-primary-foreground transition-all" style={{ background: `hsl(${design.primaryColor})`, borderRadius: style === "pill" ? "9999px" : style === "square" ? "0" : "0.5rem" }}>
                  {style.charAt(0).toUpperCase() + style.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-display text-lg font-semibold mb-4">Global Background</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><Label>Background Type</Label><select value={design.backgroundType} onChange={(e) => setDesign({ ...design, backgroundType: e.target.value as any })} className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 text-sm"><option value="static">Static</option><option value="gradient">Gradient</option><option value="image">Image</option><option value="video">Video</option><option value="css">Custom CSS</option></select></div>
              {design.backgroundType !== "static" && (
                <div>
                  <Label>{design.backgroundType === "css" ? "CSS Code" : design.backgroundType === "gradient" ? "Gradient CSS" : "URL"}</Label>
                  {design.backgroundType === "css" ? (
                    <Textarea value={design.backgroundValue} onChange={(e) => setDesign({ ...design, backgroundValue: e.target.value })} className="mt-1 font-mono text-xs" rows={3} />
                  ) : (
                    <Input value={design.backgroundValue} onChange={(e) => setDesign({ ...design, backgroundValue: e.target.value })} className="mt-1" />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══ BACKGROUND TAB ═══ */}
      {subTab === "background" && (
        <div className="space-y-6">
          <div>
            <h2 className="font-display text-lg font-semibold">Hero Background</h2>
            <p className="text-sm text-muted-foreground">Choose what powers the homepage hero background. Applies instantly site-wide on save.</p>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <div>
              <Label>Background Type</Label>
              <select
                value={hero.backgroundType}
                onChange={(e) => setHero({ ...hero, backgroundType: e.target.value as any })}
                className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="particles">Animated Particles (default)</option>
                <option value="video">Video Background (URL)</option>
                <option value="image">Image Background (URL)</option>
                <option value="css">CSS Visual Template</option>
                <option value="gradient">Gradient CSS</option>
                <option value="embed">Embed HTML</option>
              </select>
            </div>

            {hero.backgroundType === "video" && (
              <div>
                <Label>Video URL (mp4 / webm / YouTube embed)</Label>
                <Input value={hero.backgroundUrl} onChange={(e) => setHero({ ...hero, backgroundUrl: e.target.value })} className="mt-1" placeholder="https://cdn.../bg.mp4" />
              </div>
            )}

            {hero.backgroundType === "image" && (
              <div>
                <Label>Image URL</Label>
                <Input value={hero.backgroundUrl} onChange={(e) => setHero({ ...hero, backgroundUrl: e.target.value })} className="mt-1" placeholder="https://.../hero.jpg" />
                {hero.backgroundUrl && (
                  <img src={hero.backgroundUrl} loading="lazy" alt="Background preview" className="mt-3 w-full max-h-48 object-cover rounded-md border border-border" />
                )}
              </div>
            )}

            {hero.backgroundType === "css" && (
              <div className="space-y-3">
                <Label>CSS Visual Templates</Label>
                <div className="grid gap-3 sm:grid-cols-2">
                  {BG_CSS_PRESETS.map((p) => {
                    const isActive = hero.backgroundUrl === p.css;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setHero({ ...hero, backgroundUrl: p.css })}
                        className={`text-left rounded-lg border-2 overflow-hidden transition-all ${isActive ? "border-accent shadow-lg shadow-accent/10" : "border-border hover:border-primary/40"}`}
                      >
                        <div className="h-20" style={{ background: p.css, backgroundSize: p.id === "animated-gradient" ? "600% 600%" : undefined }} />
                        <div className="p-3 bg-card">
                          <p className="text-sm font-semibold">{p.label}</p>
                          <p className="text-xs text-muted-foreground">{p.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <div>
                  <Label className="text-xs">Custom CSS (overrides preset)</Label>
                  <Textarea value={hero.backgroundUrl} onChange={(e) => setHero({ ...hero, backgroundUrl: e.target.value })} className="mt-1 font-mono text-xs" rows={3} placeholder="linear-gradient(...)" />
                </div>
              </div>
            )}

            {hero.backgroundType === "gradient" && (
              <div>
                <Label>Gradient CSS</Label>
                <Textarea value={hero.backgroundUrl} onChange={(e) => setHero({ ...hero, backgroundUrl: e.target.value })} className="mt-1 font-mono text-xs" rows={3} placeholder="linear-gradient(135deg, #4f46e5, #06b6d4)" />
              </div>
            )}

            {hero.backgroundType === "embed" && (
              <div>
                <Label>Embed HTML</Label>
                <Textarea value={hero.backgroundUrl} onChange={(e) => setHero({ ...hero, backgroundUrl: e.target.value })} className="mt-1 font-mono text-xs" rows={4} />
              </div>
            )}
          </div>

          {/* Live Preview */}
          {hero.backgroundType !== "particles" && hero.backgroundUrl && (
            <div className="rounded-xl border border-border overflow-hidden">
              <div className="px-4 py-2 bg-secondary text-xs font-medium text-muted-foreground flex items-center gap-2">
                <Eye className="h-3.5 w-3.5" /> Preview
              </div>
              {hero.backgroundType === "video" ? (
                <video src={hero.backgroundUrl} autoPlay muted loop playsInline className="w-full max-h-64 object-cover" />
              ) : hero.backgroundType === "image" ? (
                <img src={hero.backgroundUrl} alt="Preview" className="w-full max-h-64 object-cover" />
              ) : (
                <div className="w-full h-64" style={{ background: hero.backgroundUrl }} />
              )}
            </div>
          )}

          <div className="flex justify-end">
            <Button variant="hero" onClick={async () => { setSaving(true); try { await saveSiteHomepage({ hero, sections }); toast({ title: "Background published!", description: "Live across the homepage." }); } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); } setSaving(false); }} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Rocket className="h-4 w-4 mr-2" />}
              Publish Background
            </Button>
          </div>
        </div>
      )}

      {subTab === "templates" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="font-display text-lg font-semibold">Hero Templates</h2>
              <p className="text-sm text-muted-foreground">Select, customize, and publish hero designs. The active template controls the site-wide theme.</p>
            </div>
            {heroState.previousActiveId && (
              <Button variant="outline" size="sm" onClick={async () => {
                await rollbackHeroTemplate(heroState);
                toast({ title: "Rolled Back!", description: "Reverted to previous template." });
              }}>
                <RotateCcw className="h-3.5 w-3.5 mr-1" /> Rollback
              </Button>
            )}
          </div>

          {heroLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {heroState.templates.map((tmpl) => {
                const isActive = tmpl.id === heroState.activeTemplateId;
                return (
                  <div key={tmpl.id} className={`rounded-xl border-2 transition-all overflow-hidden ${isActive ? "border-accent shadow-lg shadow-accent/10" : "border-border hover:border-primary/30"}`}>
                    {/* Template preview card */}
                    <div className="h-32 relative overflow-hidden" style={{ background: `linear-gradient(135deg, hsl(${tmpl.theme.primaryColor}), hsl(${tmpl.theme.secondaryColor}))` }}>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center px-4">
                          <p className="text-white/90 font-bold text-sm truncate">{tmpl.content.headingTitle}</p>
                          <p className="text-white/60 text-xs mt-1 truncate">{tmpl.content.subtitle}</p>
                        </div>
                      </div>
                      {isActive && (
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-accent text-accent-foreground text-xs">🟢 Live</Badge>
                        </div>
                      )}
                      <div className="absolute top-2 left-2">
                        <Badge className={`text-xs ${TEMPLATE_TYPE_COLORS[tmpl.type] || ""}`}>
                          {TEMPLATE_TYPE_LABELS[tmpl.type] || tmpl.type}
                        </Badge>
                      </div>
                    </div>
                    <div className="p-4 bg-card">
                      <h3 className="font-semibold text-sm truncate">{tmpl.name}</h3>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1"><Palette className="h-3 w-3" /><span style={{ color: `hsl(${tmpl.theme.primaryColor})` }}>●</span></div>
                        <div className="flex items-center gap-1"><Type className="h-3 w-3" />{tmpl.theme.fontFamily}</div>
                        <div className="flex items-center gap-1"><MousePointer className="h-3 w-3" />{tmpl.theme.buttonStyle}</div>
                      </div>
                      <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setPreviewTemplate(tmpl)}><Eye className="h-3 w-3 mr-1" />Preview</Button>
                        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => {
                          setEditingTemplate(tmpl);
                          setEditContent({ ...tmpl.content });
                          setEditTheme({ ...tmpl.theme });
                        }}><Pencil className="h-3 w-3 mr-1" />Edit</Button>
                        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={async () => {
                          await duplicateHeroTemplate(tmpl.id, heroState);
                          toast({ title: "Duplicated!", description: `"${tmpl.name} (Copy)" created.` });
                        }}><Copy className="h-3 w-3 mr-1" />Duplicate</Button>
                        <Button
                          variant={isActive ? "outline" : "hero"}
                          size="sm"
                          className="h-7 text-xs ml-auto"
                          disabled={isActive}
                          onClick={async () => {
                            await publishHeroTemplate(tmpl.id, heroState);
                            // Also update site design to match template theme
                            await saveSiteDesign({
                              ...design,
                              primaryColor: tmpl.theme.primaryColor,
                              secondaryColor: tmpl.theme.secondaryColor,
                              accentColor: tmpl.theme.accentColor,
                              fontFamily: tmpl.theme.fontFamily as any,
                              headingFont: tmpl.theme.headingFont as any,
                              buttonStyle: tmpl.theme.buttonStyle,
                              hoverEffect: tmpl.theme.hoverEffect,
                            });
                            toast({ title: "🚀 Published!", description: `"${tmpl.name}" is now live. Theme applied site-wide.` });
                          }}
                        >
                          <Rocket className="h-3 w-3 mr-1" />
                          {isActive ? "Current" : "Publish Live"}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Site Config Backup */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-display text-lg font-semibold mb-4">Site Configuration</h2>
            <Textarea readOnly value={JSON.stringify({ homepage: { hero, sections }, design, footer, heroTemplates: heroState }, null, 2)} className="font-mono text-xs h-48" />
            <Button variant="outline" size="sm" className="mt-3" onClick={() => {
              navigator.clipboard.writeText(JSON.stringify({ homepage: { hero, sections }, design, footer, heroTemplates: heroState }, null, 2));
              toast({ title: "Copied!" });
            }}>Copy to Clipboard</Button>
          </div>

          {/* ═══ Edit Template Modal ═══ */}
          <Dialog open={!!editingTemplate} onOpenChange={(open) => { if (!open) { setEditingTemplate(null); setEditContent(null); setEditTheme(null); } }}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Template: {editingTemplate?.name}</DialogTitle>
                <DialogDescription>Customize hero content and theme. Navigation is locked and not editable.</DialogDescription>
              </DialogHeader>
              {editContent && editTheme && editingTemplate && (
                <div className="space-y-6 py-2">
                  {/* Content Fields */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-sm flex items-center gap-2"><FileText className="h-4 w-4" /> Hero Placeholders</h3>
                    <p className="text-xs text-muted-foreground">🔒 [NAV LINKS] — Navigation is locked and not editable.</p>
                    {(TEMPLATE_FIELDS[editingTemplate.type] || TEMPLATE_FIELDS["default"]).map((field) => {
                      if (field === "keyLabels") {
                        return (
                          <div key={field}>
                            <Label>{FIELD_LABELS[field]}</Label>
                            {(editContent.keyLabels || []).map((kl, i) => (
                              <div key={i} className="flex items-center gap-2 mt-1">
                                <Input value={kl} onChange={(e) => { const u = [...(editContent.keyLabels || [])]; u[i] = e.target.value; setEditContent({ ...editContent, keyLabels: u }); }} className="flex-1" />
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditContent({ ...editContent, keyLabels: editContent.keyLabels.filter((_, j) => j !== i) }); }}><Trash2 className="h-3.5 w-3.5" /></Button>
                              </div>
                            ))}
                            <Button variant="outline" size="sm" className="mt-2" onClick={() => setEditContent({ ...editContent, keyLabels: [...(editContent.keyLabels || []), ""] })}><Plus className="h-3.5 w-3.5 mr-1" /> Add Label</Button>
                          </div>
                        );
                      }
                      if (field === "partnerLogos") {
                        return (
                          <div key={field}>
                            <Label>{FIELD_LABELS[field]}</Label>
                            {(editContent.partnerLogos || []).map((logo, i) => (
                              <div key={i} className="flex items-center gap-2 mt-1">
                                <Input value={logo} onChange={(e) => { const u = [...(editContent.partnerLogos || [])]; u[i] = e.target.value; setEditContent({ ...editContent, partnerLogos: u }); }} className="flex-1" placeholder="https://logo-url..." />
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditContent({ ...editContent, partnerLogos: editContent.partnerLogos.filter((_, j) => j !== i) }); }}><Trash2 className="h-3.5 w-3.5" /></Button>
                              </div>
                            ))}
                            <Button variant="outline" size="sm" className="mt-2" onClick={() => setEditContent({ ...editContent, partnerLogos: [...(editContent.partnerLogos || []), ""] })}><Plus className="h-3.5 w-3.5 mr-1" /> Add Logo URL</Button>
                          </div>
                        );
                      }
                      const isTextarea = field === "description";
                      return (
                        <div key={field}>
                          <Label>{FIELD_LABELS[field] || field}</Label>
                          {isTextarea ? (
                            <Textarea value={(editContent as any)[field] || ""} onChange={(e) => setEditContent({ ...editContent, [field]: e.target.value })} className="mt-1" rows={3} />
                          ) : (
                            <Input value={(editContent as any)[field] || ""} onChange={(e) => setEditContent({ ...editContent, [field]: e.target.value })} className="mt-1" />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Theme Settings */}
                  <div className="space-y-4 border-t border-border pt-4">
                    <h3 className="font-semibold text-sm flex items-center gap-2"><Palette className="h-4 w-4" /> Template Theme (applies site-wide on publish)</h3>
                    <div className="grid gap-4 sm:grid-cols-3">
                      {([["Primary", "primaryColor"], ["Secondary", "secondaryColor"], ["Accent", "accentColor"]] as const).map(([label, key]) => (
                        <div key={key}>
                          <Label>{label}</Label>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="h-6 w-6 rounded border border-border shrink-0" style={{ background: `hsl(${(editTheme as any)[key]})` }} />
                            <Input value={(editTheme as any)[key]} onChange={(e) => setEditTheme({ ...editTheme, [key]: e.target.value })} className="flex-1 text-xs" />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div><Label>Body Font</Label><select value={editTheme.fontFamily} onChange={(e) => setEditTheme({ ...editTheme, fontFamily: e.target.value })} className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 text-sm"><option value="inter">Inter</option><option value="space-grotesk">Space Grotesk</option><option value="poppins">Poppins</option><option value="raleway">Raleway</option><option value="playfair">Playfair Display</option><option value="roboto">Roboto</option><option value="dm-sans">DM Sans</option></select></div>
                      <div><Label>Heading Font</Label><select value={editTheme.headingFont} onChange={(e) => setEditTheme({ ...editTheme, headingFont: e.target.value })} className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 text-sm"><option value="space-grotesk">Space Grotesk</option><option value="inter">Inter</option><option value="poppins">Poppins</option><option value="raleway">Raleway</option><option value="playfair">Playfair Display</option><option value="roboto">Roboto</option><option value="dm-sans">DM Sans</option></select></div>
                      <div><Label>Button Style</Label><select value={editTheme.buttonStyle} onChange={(e) => setEditTheme({ ...editTheme, buttonStyle: e.target.value as any })} className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 text-sm"><option value="rounded">Rounded</option><option value="square">Square</option><option value="pill">Pill</option></select></div>
                      <div><Label>Hover Effect</Label><select value={editTheme.hoverEffect} onChange={(e) => setEditTheme({ ...editTheme, hoverEffect: e.target.value as any })} className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 text-sm"><option value="scale">Scale</option><option value="glow">Glow</option><option value="lift">Lift</option><option value="slide-up">Slide Up</option></select></div>
                    </div>

                    {/* Template Background */}
                    <div className="space-y-4 border-t border-border pt-4">
                      <h3 className="font-semibold text-sm flex items-center gap-2"><Video className="h-4 w-4" /> Template Background</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <Label>Background Type</Label>
                          <select value={editTheme.backgroundType || "none"} onChange={(e) => setEditTheme({ ...editTheme, backgroundType: e.target.value as any })} className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                            <option value="none">None (Gradient)</option>
                            <option value="video">Video URL (mp4)</option>
                            <option value="css">Animated CSS</option>
                            <option value="image">Static Image</option>
                          </select>
                        </div>
                        {editTheme.backgroundType && editTheme.backgroundType !== "none" && (
                          <div>
                            <Label>{editTheme.backgroundType === "video" ? "Video URL" : editTheme.backgroundType === "css" ? "CSS Code" : "Image URL"}</Label>
                            {editTheme.backgroundType === "css" ? (
                              <Textarea value={editTheme.backgroundValue || ""} onChange={(e) => setEditTheme({ ...editTheme, backgroundValue: e.target.value })} className="mt-1 font-mono text-xs" rows={3} placeholder="@keyframes bg { ... }" />
                            ) : (
                              <Input value={editTheme.backgroundValue || ""} onChange={(e) => setEditTheme({ ...editTheme, backgroundValue: e.target.value })} className="mt-1" placeholder="https://..." />
                            )}
                          </div>
                        )}
                        <div>
                          <Label>Mobile Fallback Image URL</Label>
                          <Input value={editTheme.backgroundFallbackImage || ""} onChange={(e) => setEditTheme({ ...editTheme, backgroundFallbackImage: e.target.value })} className="mt-1" placeholder="https://fallback-image.jpg" />
                          <p className="text-xs text-muted-foreground mt-1">Shown on mobile instead of video/CSS</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => { setEditingTemplate(null); setEditContent(null); setEditTheme(null); }}>Cancel</Button>
                <Button variant="hero" disabled={templateSaving} onClick={async () => {
                  if (!editingTemplate || !editContent || !editTheme) return;
                  setTemplateSaving(true);
                  try {
                    await updateHeroTemplateContent(editingTemplate.id, editContent, editTheme, heroState);
                    toast({ title: "Updated!", description: `Template "${editingTemplate.name}" saved.` });
                    setEditingTemplate(null);
                    setEditContent(null);
                    setEditTheme(null);
                  } catch (err: any) {
                    toast({ title: "Error", description: err.message, variant: "destructive" });
                  }
                  setTemplateSaving(false);
                }}>
                  {templateSaving && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
                  Save Changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Preview Modal */}
          <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh]">
              <DialogHeader>
                <DialogTitle>Preview: {previewTemplate?.name}</DialogTitle>
                <DialogDescription>This is how the hero section will look.</DialogDescription>
              </DialogHeader>
              {previewTemplate && (
                <div className="border border-border rounded-lg overflow-hidden" style={{ background: `linear-gradient(135deg, hsl(${previewTemplate.theme.primaryColor}/0.1), hsl(${previewTemplate.theme.secondaryColor}))` }}>
                  <div className="p-8 text-center">
                    <Badge className="mb-4 text-xs" style={{ background: `hsl(${previewTemplate.theme.primaryColor})`, color: "white" }}>
                      {TEMPLATE_TYPE_LABELS[previewTemplate.type]}
                    </Badge>
                    <h2 className="text-2xl font-bold text-foreground">{previewTemplate.content.headingTitle}</h2>
                    <p className="mt-2 text-muted-foreground">{previewTemplate.content.subtitle}</p>
                    {previewTemplate.content.description && <p className="mt-2 text-sm text-muted-foreground">{previewTemplate.content.description}</p>}
                    <div className="mt-6 flex justify-center gap-3">
                      <button className="px-6 py-2 text-sm font-medium text-white" style={{ background: `hsl(${previewTemplate.theme.primaryColor})`, borderRadius: previewTemplate.theme.buttonStyle === "pill" ? "9999px" : previewTemplate.theme.buttonStyle === "square" ? "0" : "0.5rem" }}>
                        {previewTemplate.content.primaryButtonText}
                      </button>
                      {previewTemplate.content.secondaryButtonText && (
                        <button className="px-6 py-2 text-sm font-medium border" style={{ borderColor: `hsl(${previewTemplate.theme.primaryColor})`, color: `hsl(${previewTemplate.theme.primaryColor})`, borderRadius: previewTemplate.theme.buttonStyle === "pill" ? "9999px" : previewTemplate.theme.buttonStyle === "square" ? "0" : "0.5rem" }}>
                          {previewTemplate.content.secondaryButtonText}
                        </button>
                      )}
                    </div>
                    {/* Theme info */}
                    <div className="mt-8 flex justify-center gap-4 text-xs text-muted-foreground">
                      <span>Font: {previewTemplate.theme.fontFamily}</span>
                      <span>Button: {previewTemplate.theme.buttonStyle}</span>
                      <span>Hover: {previewTemplate.theme.hoverEffect}</span>
                    </div>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* ═══ THEMES TAB ═══ */}
      {subTab === "themes" && (
        <div className="space-y-6">
          <div>
            <h2 className="font-display text-lg font-semibold">Theme Presets</h2>
            <p className="text-sm text-muted-foreground">Select a predefined theme to apply site-wide. Changes take effect immediately.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {THEME_PRESETS.map((preset) => (
              <div key={preset.id} className="rounded-xl border-2 border-border overflow-hidden hover:border-primary/30 transition-all">
                <div className="h-24 relative" style={{ background: `linear-gradient(135deg, hsl(${preset.primaryColor}), hsl(${preset.secondaryColor}))` }}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold" style={{ color: `hsl(${preset.textColor})` }}>{preset.name}</span>
                  </div>
                  <div className="absolute top-2 right-2">
                    {preset.mode === "dark" ? <Moon className="h-3.5 w-3.5 text-white/60" /> : <Sun className="h-3.5 w-3.5 text-black/60" />}
                  </div>
                </div>
                <div className="p-4 bg-card">
                  <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground">
                    <div className="flex gap-1">
                      <div className="h-3 w-3 rounded-full border border-border" style={{ background: `hsl(${preset.primaryColor})` }} />
                      <div className="h-3 w-3 rounded-full border border-border" style={{ background: `hsl(${preset.accentColor})` }} />
                      <div className="h-3 w-3 rounded-full border border-border" style={{ background: `hsl(${preset.secondaryColor})` }} />
                    </div>
                    <span>{preset.buttonStyle}</span>
                  </div>
                  <Button
                    variant="hero"
                    size="sm"
                    className="w-full text-xs"
                    onClick={async () => {
                      setSaving(true);
                      try {
                        await saveSiteDesign({
                          ...design,
                          primaryColor: preset.primaryColor,
                          secondaryColor: preset.secondaryColor,
                          accentColor: preset.accentColor,
                          buttonStyle: preset.buttonStyle,
                        });
                        setDesign({
                          ...design,
                          primaryColor: preset.primaryColor,
                          secondaryColor: preset.secondaryColor,
                          accentColor: preset.accentColor,
                          buttonStyle: preset.buttonStyle,
                        });
                        toast({ title: "🎨 Theme Applied!", description: `"${preset.name}" is now active site-wide.` });
                      } catch (err: any) {
                        toast({ title: "Error", description: err.message, variant: "destructive" });
                      }
                      setSaving(false);
                    }}
                  >
                    <Palette className="h-3 w-3 mr-1" /> Apply Theme
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pricing Page Manager */}
      {subTab === "pricing" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h2 className="font-display text-lg font-semibold flex items-center gap-2"><Rocket className="h-5 w-5 text-primary" /> Pricing Page Manager</h2>
                <p className="text-sm text-muted-foreground mt-1">Control the embedded creator pricing landing page shown at <code className="text-xs bg-muted px-1.5 py-0.5 rounded">/pricing</code>. Updates apply globally in real-time.</p>
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-sm">Published</Label>
                <Switch checked={pricing.published} onCheckedChange={(v) => setPricing({ ...pricing, published: v })} />
              </div>
            </div>

            <div>
              <Label>Embed Type</Label>
              <select
                value={pricing.embedType}
                onChange={(e) => setPricing({ ...pricing, embedType: e.target.value as PricingEmbedType })}
                className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="html">Full HTML / Landing Page Code</option>
                <option value="iframe">iframe Embed Code</option>
                <option value="url">Hosted External Page URL</option>
              </select>
              <p className="text-xs text-muted-foreground mt-1">
                {pricing.embedType === "url" && "Paste a full URL (https://...). It will be loaded inside an iframe."}
                {pricing.embedType === "iframe" && "Paste raw <iframe ...></iframe> code from your hosted pricing page."}
                {pricing.embedType === "html" && "Paste a complete HTML block (cards, styles, scripts). It will be injected as-is."}
              </p>
            </div>

            <div>
              <Label>{pricing.embedType === "url" ? "Page URL" : "Embed Code"}</Label>
              {pricing.embedType === "url" ? (
                <Input
                  value={pricing.embedCode}
                  onChange={(e) => setPricing({ ...pricing, embedCode: e.target.value })}
                  placeholder="https://your-pricing-page.com"
                  className="mt-1"
                />
              ) : (
                <Textarea
                  value={pricing.embedCode}
                  onChange={(e) => setPricing({ ...pricing, embedCode: e.target.value })}
                  placeholder={pricing.embedType === "iframe" ? '<iframe src="..." width="100%" height="800"></iframe>' : "<section>...your full pricing HTML...</section>"}
                  className="mt-1 font-mono text-xs min-h-[260px]"
                />
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="hero"
                onClick={async () => {
                  setPricingSaving(true);
                  try {
                    await savePricingPage(pricing);
                    toast({ title: "Pricing page saved!", description: "Live globally on /pricing." });
                  } catch (e: any) {
                    toast({ title: "Error", description: e.message, variant: "destructive" });
                  }
                  setPricingSaving(false);
                }}
                disabled={pricingSaving}
              >
                {pricingSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Save & Publish
              </Button>
              <Button variant="outline" onClick={() => setPricingPreview(true)} disabled={!pricing.embedCode.trim()}>
                <Eye className="h-4 w-4 mr-2" /> Preview
              </Button>
              <Button variant="ghost" onClick={() => setPricing(DEFAULT_PRICING)}>
                <RotateCcw className="h-4 w-4 mr-2" /> Reset
              </Button>
            </div>
          </div>

          <Dialog open={pricingPreview} onOpenChange={setPricingPreview}>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Pricing Page Preview</DialogTitle>
                <DialogDescription>This is exactly how the /pricing page will appear to users.</DialogDescription>
              </DialogHeader>
              <div className="rounded-lg border border-border overflow-hidden bg-background">
                {pricing.embedType === "url" ? (
                  <iframe src={pricing.embedCode} className="w-full min-h-[70vh]" title="Pricing preview" />
                ) : (
                  <div dangerouslySetInnerHTML={{ __html: pricing.embedCode }} />
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* Footer */}
      {subTab === "footer" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-display text-lg font-semibold mb-4">Contact Information</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><Label>Email</Label><Input value={footer.contactEmail} onChange={(e) => setFooter({ ...footer, contactEmail: e.target.value })} className="mt-1" /></div>
              <div><Label>Phone</Label><Input value={footer.contactPhone} onChange={(e) => setFooter({ ...footer, contactPhone: e.target.value })} className="mt-1" /></div>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-display text-lg font-semibold mb-4">Social Media</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><Label>Telegram</Label><Input value={footer.socialTelegram} onChange={(e) => setFooter({ ...footer, socialTelegram: e.target.value })} className="mt-1" /></div>
              <div><Label>Twitter / X</Label><Input value={footer.socialTwitter} onChange={(e) => setFooter({ ...footer, socialTwitter: e.target.value })} className="mt-1" /></div>
              <div><Label>Instagram</Label><Input value={footer.socialInstagram} onChange={(e) => setFooter({ ...footer, socialInstagram: e.target.value })} className="mt-1" /></div>
              <div><Label>YouTube</Label><Input value={footer.socialYoutube} onChange={(e) => setFooter({ ...footer, socialYoutube: e.target.value })} className="mt-1" /></div>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-display text-lg font-semibold mb-4">Copyright</h2>
            <Input value={footer.copyrightText} onChange={(e) => setFooter({ ...footer, copyrightText: e.target.value })} className="mt-1" />
          </div>
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-display text-lg font-semibold mb-4">Custom Links</h2>
            <div className="space-y-3">
              {footer.customLinks.map((link, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input value={link.label} onChange={(e) => { const u = [...footer.customLinks]; u[i] = { ...u[i], label: e.target.value }; setFooter({ ...footer, customLinks: u }); }} placeholder="Label" className="flex-1" />
                  <Input value={link.url} onChange={(e) => { const u = [...footer.customLinks]; u[i] = { ...u[i], url: e.target.value }; setFooter({ ...footer, customLinks: u }); }} placeholder="URL" className="flex-1" />
                  <Button variant="ghost" size="icon" className="shrink-0" onClick={() => setFooter({ ...footer, customLinks: footer.customLinks.filter((_, j) => j !== i) })}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={() => setFooter({ ...footer, customLinks: [...footer.customLinks, { label: "", url: "" }] })}><Plus className="h-3.5 w-3.5 mr-1" /> Add Link</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

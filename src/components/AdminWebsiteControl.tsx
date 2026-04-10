import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  useSiteSettings,
  saveSiteHomepage,
  saveSiteDesign,
  saveSiteFooter,
  saveSiteTemplates,
  DEFAULT_HERO,
  DEFAULT_SECTIONS,
  DEFAULT_DESIGN,
  DEFAULT_FOOTER,
  DEFAULT_TEMPLATES,
  type HeroContent,
  type SectionConfig,
  type DesignSettings,
  type FooterContent,
  type TemplateConfig,
} from "@/hooks/useSiteSettings";
import {
  Loader2, Save, Layout, Paintbrush, FileText, Globe, GripVertical,
  Eye, EyeOff, Plus, Trash2, ChevronDown, ChevronUp,
} from "lucide-react";

type SubTab = "homepage" | "design" | "templates" | "footer";

const SUB_TABS: { id: SubTab; label: string; icon: React.ReactNode }[] = [
  { id: "homepage", label: "Homepage", icon: <Layout className="h-4 w-4" /> },
  { id: "design", label: "Design", icon: <Paintbrush className="h-4 w-4" /> },
  { id: "templates", label: "Templates", icon: <FileText className="h-4 w-4" /> },
  { id: "footer", label: "Footer", icon: <Globe className="h-4 w-4" /> },
];

export default function AdminWebsiteControl({ toast }: { toast: any }) {
  const { settings, loading } = useSiteSettings();
  const [subTab, setSubTab] = useState<SubTab>("homepage");
  const [saving, setSaving] = useState(false);

  // Local state for each section
  const [hero, setHero] = useState<HeroContent>(DEFAULT_HERO);
  const [sections, setSections] = useState<SectionConfig[]>(DEFAULT_SECTIONS);
  const [design, setDesign] = useState<DesignSettings>(DEFAULT_DESIGN);
  const [footer, setFooter] = useState<FooterContent>(DEFAULT_FOOTER);
  const [templates, setTemplates] = useState<TemplateConfig[]>(DEFAULT_TEMPLATES);

  useEffect(() => {
    if (!loading) {
      setHero(settings.homepage.hero);
      setSections(settings.homepage.sections);
      setDesign(settings.design);
      setFooter(settings.footer);
      setTemplates(settings.templates);
    }
  }, [loading, settings]);

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
        case "templates":
          await saveSiteTemplates(templates);
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
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Website Control</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your homepage content, design, and footer.</p>
        </div>
        <Button variant="hero" onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          Save Changes
        </Button>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-2 flex-wrap">
        {SUB_TABS.map((tab) => (
          <Button
            key={tab.id}
            variant={subTab === tab.id ? "default" : "outline"}
            size="sm"
            onClick={() => setSubTab(tab.id)}
            className="gap-1.5"
          >
            {tab.icon}
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Homepage Content */}
      {subTab === "homepage" && (
        <div className="space-y-6">
          {/* Hero Section */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
              <Badge variant="secondary">Hero</Badge> Hero Section
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Logo controls */}
              <div>
                <Label>Logo Text (Site Name)</Label>
                <Input value={hero.logoText || "SkillUp"} onChange={(e) => setHero({ ...hero, logoText: e.target.value })} className="mt-1" placeholder="SkillUp" />
              </div>
              <div>
                <Label>Logo Image URL (optional)</Label>
                <Input value={hero.logoUrl || ""} onChange={(e) => setHero({ ...hero, logoUrl: e.target.value })} className="mt-1" placeholder="https://... leave empty for text logo" />
              </div>
              <div className="sm:col-span-2">
                <Label>Title</Label>
                <Input value={hero.title} onChange={(e) => setHero({ ...hero, title: e.target.value })} className="mt-1" />
              </div>
              <div className="sm:col-span-2">
                <Label>Subtitle</Label>
                <Textarea value={hero.subtitle} onChange={(e) => setHero({ ...hero, subtitle: e.target.value })} className="mt-1" rows={2} />
              </div>
              <div>
                <Label>CTA Button Text</Label>
                <Input value={hero.ctaText} onChange={(e) => setHero({ ...hero, ctaText: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label>Background Type</Label>
                <select
                  value={hero.backgroundType}
                  onChange={(e) => setHero({ ...hero, backgroundType: e.target.value as any })}
                  className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
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
                  <Label>
                    {hero.backgroundType === "gradient" ? "Gradient CSS" :
                     hero.backgroundType === "css" ? "CSS Code (use .hero-css-bg class)" :
                     hero.backgroundType === "embed" ? "Embed HTML (iframe)" :
                     hero.backgroundType === "video" ? "Video URL" : "Image URL"}
                  </Label>
                  {hero.backgroundType === "css" || hero.backgroundType === "embed" ? (
                    <Textarea
                      value={hero.backgroundUrl}
                      onChange={(e) => setHero({ ...hero, backgroundUrl: e.target.value })}
                      className="mt-1 font-mono text-xs"
                      rows={4}
                      placeholder={hero.backgroundType === "css" ? ".hero-css-bg { background: ...; animation: ...; }" : "<iframe src='...'></iframe>"}
                    />
                  ) : (
                    <Input
                      value={hero.backgroundUrl}
                      onChange={(e) => setHero({ ...hero, backgroundUrl: e.target.value })}
                      placeholder={hero.backgroundType === "gradient" ? "e.g. linear-gradient(135deg, #020617, #0f172a)" : "https://..."}
                      className="mt-1"
                    />
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sections Management */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
              <Badge variant="secondary">Sections</Badge> Section Visibility & Order
            </h2>
            <div className="space-y-3">
              {sections
                .sort((a, b) => a.order - b.order)
                .map((section, index) => (
                  <div
                    key={section.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border bg-secondary/20"
                  >
                    <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <Input
                        value={section.title}
                        onChange={(e) => {
                          const updated = [...sections];
                          updated[index] = { ...updated[index], title: e.target.value };
                          setSections(updated);
                        }}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => moveSection(index, "up")}
                        disabled={index === 0}
                      >
                        <ChevronUp className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => moveSection(index, "down")}
                        disabled={index === sections.length - 1}
                      >
                        <ChevronDown className="h-3.5 w-3.5" />
                      </Button>
                      <Switch
                        checked={section.visible}
                        onCheckedChange={(checked) => {
                          const updated = [...sections];
                          updated[index] = { ...updated[index], visible: checked };
                          setSections(updated);
                        }}
                      />
                      {section.visible ? (
                        <Eye className="h-4 w-4 text-accent" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      )}
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
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <Label>Primary Color</Label>
                <div className="flex items-center gap-2 mt-1">
                  <div className="h-8 w-8 rounded-md border border-border" style={{ background: `hsl(${design.primaryColor})` }} />
                  <Input value={design.primaryColor} onChange={(e) => setDesign({ ...design, primaryColor: e.target.value })} className="flex-1" />
                </div>
              </div>
              <div>
                <Label>Secondary Color</Label>
                <div className="flex items-center gap-2 mt-1">
                  <div className="h-8 w-8 rounded-md border border-border" style={{ background: `hsl(${design.secondaryColor})` }} />
                  <Input value={design.secondaryColor} onChange={(e) => setDesign({ ...design, secondaryColor: e.target.value })} className="flex-1" />
                </div>
              </div>
              <div>
                <Label>Accent Color</Label>
                <div className="flex items-center gap-2 mt-1">
                  <div className="h-8 w-8 rounded-md border border-border" style={{ background: `hsl(${design.accentColor})` }} />
                  <Input value={design.accentColor} onChange={(e) => setDesign({ ...design, accentColor: e.target.value })} className="flex-1" />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-display text-lg font-semibold mb-4">Button & Hover Styles</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Button Style</Label>
                <select
                  value={design.buttonStyle}
                  onChange={(e) => setDesign({ ...design, buttonStyle: e.target.value as any })}
                  className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="rounded">Rounded</option>
                  <option value="square">Square</option>
                  <option value="pill">Pill</option>
                </select>
              </div>
              <div>
                <Label>Hover Effect</Label>
                <select
                  value={design.hoverEffect}
                  onChange={(e) => setDesign({ ...design, hoverEffect: e.target.value as any })}
                  className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="scale">Scale Up</option>
                  <option value="glow">Glow</option>
                  <option value="lift">Lift</option>
                  <option value="none">None</option>
                </select>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-display text-lg font-semibold mb-4">Typography</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Font Scale</Label>
                <select
                  value={design.fontScale}
                  onChange={(e) => setDesign({ ...design, fontScale: e.target.value as any })}
                  className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="small">Small</option>
                  <option value="normal">Normal</option>
                  <option value="large">Large</option>
                </select>
              </div>
              <div>
                <Label>Heading Style</Label>
                <select
                  value={design.headingStyle}
                  onChange={(e) => setDesign({ ...design, headingStyle: e.target.value as any })}
                  className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="bold">Bold</option>
                  <option value="light">Light</option>
                  <option value="italic">Italic</option>
                </select>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-display text-lg font-semibold mb-4">Background</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Background Type</Label>
                <select
                  value={design.backgroundType}
                  onChange={(e) => setDesign({ ...design, backgroundType: e.target.value as any })}
                  className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="static">Static (Default)</option>
                  <option value="gradient">Gradient</option>
                  <option value="video">Video Background</option>
                </select>
              </div>
              {design.backgroundType !== "static" && (
                <div>
                  <Label>{design.backgroundType === "gradient" ? "Gradient CSS" : "Video URL"}</Label>
                  <Input
                    value={design.backgroundValue}
                    onChange={(e) => setDesign({ ...design, backgroundValue: e.target.value })}
                    placeholder={design.backgroundType === "gradient" ? "linear-gradient(...)" : "https://..."}
                    className="mt-1"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Templates */}
      {subTab === "templates" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-display text-lg font-semibold mb-4">Homepage Templates</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Switch between templates. Click "Publish Live" to apply site-wide.
            </p>
            <div className="space-y-3">
              {templates.map((tmpl) => (
                <div
                  key={tmpl.id}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    tmpl.active ? "border-accent/50 bg-accent/5" : "border-border bg-secondary/20"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-3 w-3 rounded-full ${tmpl.active ? "bg-accent" : "bg-muted-foreground/30"}`} />
                    <span className="font-medium">{tmpl.name}</span>
                    {tmpl.active && <Badge className="bg-accent/10 text-accent border-accent/20 text-xs">Live</Badge>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setTemplates(templates.filter((t) => t.id !== tmpl.id));
                      }}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant={tmpl.active ? "outline" : "hero"}
                      size="sm"
                      onClick={() => {
                        setTemplates(templates.map((t) => ({ ...t, active: t.id === tmpl.id })));
                      }}
                      disabled={tmpl.active}
                    >
                      {tmpl.active ? "Current" : "Publish Live"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <Input
                placeholder="New template name..."
                id="new-template-name"
                className="flex-1"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const input = document.getElementById("new-template-name") as HTMLInputElement;
                  const name = input?.value?.trim();
                  if (!name) return;
                  setTemplates([...templates, { id: name.toLowerCase().replace(/\s+/g, "-"), name, active: false }]);
                  input.value = "";
                }}
              >
                <Plus className="h-3.5 w-3.5 mr-1" /> Add Template
              </Button>
            </div>
          </div>

          {/* Preview Code */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-display text-lg font-semibold mb-4">Preview Code</h2>
            <p className="text-sm text-muted-foreground mb-3">
              Current site configuration as JSON. Copy this to back up or transfer settings.
            </p>
            <Textarea
              readOnly
              value={JSON.stringify({ homepage: { hero, sections }, design, footer, templates }, null, 2)}
              className="font-mono text-xs h-48"
            />
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => {
                navigator.clipboard.writeText(JSON.stringify({ homepage: { hero, sections }, design, footer, templates }, null, 2));
                toast({ title: "Copied!", description: "Configuration JSON copied to clipboard." });
              }}
            >
              Copy to Clipboard
            </Button>
          </div>
        </div>
      )}

      {/* Footer */}
      {subTab === "footer" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-display text-lg font-semibold mb-4">Contact Information</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Email</Label>
                <Input value={footer.contactEmail} onChange={(e) => setFooter({ ...footer, contactEmail: e.target.value })} className="mt-1" placeholder="admin@skillup.com" />
              </div>
              <div>
                <Label>Phone</Label>
                <Input value={footer.contactPhone} onChange={(e) => setFooter({ ...footer, contactPhone: e.target.value })} className="mt-1" placeholder="+251..." />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-display text-lg font-semibold mb-4">Social Media</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Telegram</Label>
                <Input value={footer.socialTelegram} onChange={(e) => setFooter({ ...footer, socialTelegram: e.target.value })} className="mt-1" placeholder="@channel" />
              </div>
              <div>
                <Label>Twitter / X</Label>
                <Input value={footer.socialTwitter} onChange={(e) => setFooter({ ...footer, socialTwitter: e.target.value })} className="mt-1" placeholder="@handle" />
              </div>
              <div>
                <Label>Instagram</Label>
                <Input value={footer.socialInstagram} onChange={(e) => setFooter({ ...footer, socialInstagram: e.target.value })} className="mt-1" placeholder="@handle" />
              </div>
              <div>
                <Label>YouTube</Label>
                <Input value={footer.socialYoutube} onChange={(e) => setFooter({ ...footer, socialYoutube: e.target.value })} className="mt-1" placeholder="channel URL" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-display text-lg font-semibold mb-4">Copyright</h2>
            <Input
              value={footer.copyrightText}
              onChange={(e) => setFooter({ ...footer, copyrightText: e.target.value })}
              className="mt-1"
            />
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-display text-lg font-semibold mb-4">Custom Links</h2>
            <div className="space-y-3">
              {footer.customLinks.map((link, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    value={link.label}
                    onChange={(e) => {
                      const updated = [...footer.customLinks];
                      updated[i] = { ...updated[i], label: e.target.value };
                      setFooter({ ...footer, customLinks: updated });
                    }}
                    placeholder="Label"
                    className="flex-1"
                  />
                  <Input
                    value={link.url}
                    onChange={(e) => {
                      const updated = [...footer.customLinks];
                      updated[i] = { ...updated[i], url: e.target.value };
                      setFooter({ ...footer, customLinks: updated });
                    }}
                    placeholder="URL"
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0"
                    onClick={() => {
                      setFooter({ ...footer, customLinks: footer.customLinks.filter((_, idx) => idx !== i) });
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFooter({ ...footer, customLinks: [...footer.customLinks, { label: "", url: "" }] })}
              >
                <Plus className="h-3.5 w-3.5 mr-1" /> Add Link
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

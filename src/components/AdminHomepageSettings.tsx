import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useAdminSettings, saveAdminSettings } from "@/hooks/useFirestore";
import type { AdminSettings } from "@/hooks/useFirestore";
import { Loader2, Home, Eye, Image, Type, Footprints, Save } from "lucide-react";

const SECTIONS = [
  { key: "showHero" as const, label: "Hero + CTA" },
  { key: "showStats" as const, label: "Stats Bar" },
  { key: "showHowItWorks" as const, label: "How It Works" },
  { key: "showCategories" as const, label: "Categories" },
  { key: "showFeatured" as const, label: "Featured Courses" },
  { key: "showFeatures" as const, label: "Why SkillUp" },
  { key: "showCollaborations" as const, label: "Collaborations" },
  { key: "showCta" as const, label: "Final CTA" },
];

export default function AdminHomepageSettings({ toast }: { toast: any }) {
  const { settings, loading } = useAdminSettings();
  const [form, setForm] = useState<Partial<AdminSettings>>({});
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<"content" | "background" | "visibility" | "footer">("content");

  useEffect(() => {
    if (!loading) setForm({ ...settings });
  }, [loading, settings]);

  const update = (key: keyof AdminSettings, value: any) => setForm((f) => ({ ...f, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveAdminSettings(form);
      toast({ title: "Homepage settings saved!" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  const tabs = [
    { id: "content" as const, label: "Content", icon: Type },
    { id: "background" as const, label: "Background", icon: Image },
    { id: "visibility" as const, label: "Visibility", icon: Eye },
    { id: "footer" as const, label: "Footer", icon: Footprints },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Home className="h-6 w-6 text-accent" />
        <h2 className="text-xl font-display font-bold">Homepage Settings</h2>
      </div>

      <div className="flex gap-2 flex-wrap">
        {tabs.map((t) => (
          <Button
            key={t.id}
            variant={activeSection === t.id ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveSection(t.id)}
            className="gap-1.5"
          >
            <t.icon className="h-3.5 w-3.5" />
            {t.label}
          </Button>
        ))}
      </div>

      {activeSection === "content" && (
        <div className="space-y-4 max-w-xl">
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <h3 className="font-semibold">Hero Section</h3>
            <div>
              <Label>Badge Text</Label>
              <Input value={form.heroBadgeText || ""} onChange={(e) => update("heroBadgeText", e.target.value)} className="mt-1" placeholder="🚀 The Future of Learning" />
            </div>
            <div>
              <Label>Main Title</Label>
              <Input value={form.heroTitle || ""} onChange={(e) => update("heroTitle", e.target.value)} className="mt-1" placeholder="Learn Real Skills." />
            </div>
            <div>
              <Label>Highlighted Text (gradient)</Label>
              <Input value={form.heroHighlight || ""} onChange={(e) => update("heroHighlight", e.target.value)} className="mt-1" placeholder="Build Real Income." />
            </div>
            <div>
              <Label>Subtitle</Label>
              <Textarea value={form.heroSubtitle || ""} onChange={(e) => update("heroSubtitle", e.target.value)} className="mt-1" rows={3} />
            </div>
            <div className="grid gap-4 grid-cols-2">
              <div>
                <Label>Primary Button Text</Label>
                <Input value={form.heroCtaPrimaryText || ""} onChange={(e) => update("heroCtaPrimaryText", e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>Secondary Button Text</Label>
                <Input value={form.heroCtaSecondaryText || ""} onChange={(e) => update("heroCtaSecondaryText", e.target.value)} className="mt-1" />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSection === "background" && (
        <div className="space-y-4 max-w-xl">
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <h3 className="font-semibold">Hero Background</h3>
            <div className="flex items-center gap-4">
              <Button
                variant={form.backgroundType === "particles" ? "default" : "outline"}
                size="sm"
                onClick={() => update("backgroundType", "particles")}
              >
                Motion Particles
              </Button>
              <Button
                variant={form.backgroundType === "image" ? "default" : "outline"}
                size="sm"
                onClick={() => update("backgroundType", "image")}
              >
                Custom Image
              </Button>
            </div>
            {form.backgroundType === "image" && (
              <div>
                <Label>Background Image URL</Label>
                <Input value={form.backgroundImageUrl || ""} onChange={(e) => update("backgroundImageUrl", e.target.value)} className="mt-1" placeholder="https://..." />
                {form.backgroundImageUrl && (
                  <div className="mt-3 aspect-video rounded-lg overflow-hidden border border-border">
                    <img src={form.backgroundImageUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {activeSection === "visibility" && (
        <div className="space-y-4 max-w-xl">
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <h3 className="font-semibold">Show/Hide Sections</h3>
            <p className="text-sm text-muted-foreground">Toggle which sections appear on the homepage.</p>
            {SECTIONS.map((s) => (
              <div key={s.key} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <span className="text-sm font-medium">{s.label}</span>
                <Switch
                  checked={form[s.key] !== false}
                  onCheckedChange={(v) => update(s.key, v)}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSection === "footer" && (
        <div className="space-y-4 max-w-xl">
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <h3 className="font-semibold">Footer Content</h3>
            <div>
              <Label>Footer Description</Label>
              <Textarea value={form.footerDescription || ""} onChange={(e) => update("footerDescription", e.target.value)} className="mt-1" rows={2} />
            </div>
            <div>
              <Label>Copyright Text</Label>
              <Input value={form.footerCopyright || ""} onChange={(e) => update("footerCopyright", e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>Contact Email</Label>
              <Input value={form.footerContactEmail || ""} onChange={(e) => update("footerContactEmail", e.target.value)} className="mt-1" type="email" />
            </div>
          </div>
        </div>
      )}

      <Button variant="hero" onClick={handleSave} disabled={saving} className="gap-2">
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        Save Homepage Settings
      </Button>
    </div>
  );
}
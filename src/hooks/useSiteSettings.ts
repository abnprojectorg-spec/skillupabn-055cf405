import { useState, useEffect } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

// ─── Interfaces ──────────────────────────────────────────────

export interface HeroContent {
  title: string;
  subtitle: string;
  ctaText: string;
  backgroundUrl: string;
  backgroundType: "particles" | "image" | "gradient" | "video" | "css" | "embed";
  logoUrl: string;
  logoText: string;
}

export interface SectionConfig {
  id: string;
  title: string;
  subtitle: string;
  visible: boolean;
  order: number;
}

export interface HomepageContent {
  hero: HeroContent;
  sections: SectionConfig[];
}

export interface DesignSettings {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  buttonStyle: "rounded" | "square" | "pill";
  hoverEffect: "scale" | "glow" | "lift" | "none";
  backgroundType: "static" | "gradient" | "video";
  backgroundValue: string;
  fontScale: "small" | "normal" | "large";
  headingStyle: "bold" | "light" | "italic";
}

export interface FooterContent {
  contactEmail: string;
  contactPhone: string;
  socialTelegram: string;
  socialTwitter: string;
  socialInstagram: string;
  socialYoutube: string;
  copyrightText: string;
  customLinks: Array<{ label: string; url: string }>;
}

export interface TemplateConfig {
  id: string;
  name: string;
  active: boolean;
}

export interface SiteSettings {
  homepage: HomepageContent;
  design: DesignSettings;
  footer: FooterContent;
  templates: TemplateConfig[];
}

// ─── Defaults ────────────────────────────────────────────────

export const DEFAULT_HERO: HeroContent = {
  title: "Learn Real Skills. Build Real Income.",
  subtitle: "Master in-demand skills from expert instructors. Join a growing community of learners transforming their careers.",
  ctaText: "Get Started Free",
  backgroundUrl: "",
  backgroundType: "particles",
  logoUrl: "",
  logoText: "SkillUp",
};

export const DEFAULT_SECTIONS: SectionConfig[] = [
  { id: "stats", title: "Platform Stats", subtitle: "", visible: true, order: 0 },
  { id: "how-it-works", title: "Start Learning in Minutes", subtitle: "Three simple steps to unlock your potential", visible: true, order: 1 },
  { id: "categories", title: "Explore 10 Skill Paths", subtitle: "", visible: true, order: 2 },
  { id: "featured", title: "Popular Courses", subtitle: "Top picks from our growing catalog", visible: true, order: 3 },
  { id: "why-skillup", title: "Built for Real Learning", subtitle: "", visible: true, order: 4 },
  { id: "collaborations", title: "Our Collaborations", subtitle: "Trusted by creators, influencers, and companies", visible: true, order: 5 },
  { id: "cta", title: "Ready to Transform Your Career?", subtitle: "Join our growing community of learners building real skills.", visible: true, order: 6 },
];

export const DEFAULT_DESIGN: DesignSettings = {
  primaryColor: "222 80% 45%",
  secondaryColor: "222 30% 14%",
  accentColor: "142 70% 45%",
  buttonStyle: "rounded",
  hoverEffect: "glow",
  backgroundType: "static",
  backgroundValue: "",
  fontScale: "normal",
  headingStyle: "bold",
};

export const DEFAULT_FOOTER: FooterContent = {
  contactEmail: "",
  contactPhone: "",
  socialTelegram: "",
  socialTwitter: "",
  socialInstagram: "",
  socialYoutube: "",
  copyrightText: "© 2026 ABN by Abenezar Mitiku. All rights reserved.",
  customLinks: [],
};

export const DEFAULT_TEMPLATES: TemplateConfig[] = [
  { id: "default", name: "Default", active: true },
  { id: "holiday", name: "Holiday", active: false },
];

const DEFAULT_SITE_SETTINGS: SiteSettings = {
  homepage: { hero: DEFAULT_HERO, sections: DEFAULT_SECTIONS },
  design: DEFAULT_DESIGN,
  footer: DEFAULT_FOOTER,
  templates: DEFAULT_TEMPLATES,
};

// ─── Hooks ───────────────────────────────────────────────────

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, "site_settings", "config"),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setSettings({
            homepage: {
              hero: { ...DEFAULT_HERO, ...data.homepage?.hero },
              sections: data.homepage?.sections?.length ? data.homepage.sections : DEFAULT_SECTIONS,
            },
            design: { ...DEFAULT_DESIGN, ...data.design },
            footer: { ...DEFAULT_FOOTER, ...data.footer },
            templates: data.templates?.length ? data.templates : DEFAULT_TEMPLATES,
          });
        }
        setLoading(false);
      },
      (error) => {
        console.error("Site settings error:", error);
        setLoading(false);
      }
    );
    return unsub;
  }, []);

  return { settings, loading };
}

export async function saveSiteHomepage(data: HomepageContent) {
  return setDoc(doc(db, "site_settings", "config"), { homepage: data }, { merge: true });
}

export async function saveSiteDesign(data: DesignSettings) {
  return setDoc(doc(db, "site_settings", "config"), { design: data }, { merge: true });
}

export async function saveSiteFooter(data: FooterContent) {
  return setDoc(doc(db, "site_settings", "config"), { footer: data }, { merge: true });
}

export async function saveSiteTemplates(data: TemplateConfig[]) {
  return setDoc(doc(db, "site_settings", "config"), { templates: data }, { merge: true });
}

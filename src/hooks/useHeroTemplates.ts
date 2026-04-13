import { useState, useEffect } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

// ─── Hero Template Types ─────────────────────────────────────

export interface HeroTemplateTheme {
  primaryColor: string;      // HSL
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  headingFont: string;
  buttonStyle: "rounded" | "square" | "pill";
  hoverEffect: "scale" | "glow" | "lift" | "slide-up";
  backgroundType?: "none" | "video" | "css" | "image";
  backgroundValue?: string;  // URL for video/image, CSS code for css
  backgroundFallbackImage?: string;  // mobile fallback image
}

export type ThemePreset = "default" | "dark-pro" | "blue-tech" | "green-fresh" | "premium-gold";

export interface ThemePresetConfig {
  id: ThemePreset;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  buttonStyle: "rounded" | "square" | "pill";
  mode: "light" | "dark";
}

export const THEME_PRESETS: ThemePresetConfig[] = [
  { id: "default", name: "Default", primaryColor: "222 80% 45%", secondaryColor: "222 30% 14%", accentColor: "142 70% 45%", backgroundColor: "222 47% 4%", textColor: "0 0% 95%", buttonStyle: "rounded", mode: "dark" },
  { id: "dark-pro", name: "Dark Pro", primaryColor: "0 0% 90%", secondaryColor: "0 0% 10%", accentColor: "0 0% 70%", backgroundColor: "0 0% 5%", textColor: "0 0% 95%", buttonStyle: "square", mode: "dark" },
  { id: "blue-tech", name: "Blue Tech", primaryColor: "210 90% 55%", secondaryColor: "210 30% 12%", accentColor: "200 80% 50%", backgroundColor: "210 40% 6%", textColor: "0 0% 95%", buttonStyle: "rounded", mode: "dark" },
  { id: "green-fresh", name: "Green Fresh", primaryColor: "142 70% 40%", secondaryColor: "142 20% 15%", accentColor: "142 60% 50%", backgroundColor: "142 30% 6%", textColor: "0 0% 95%", buttonStyle: "pill", mode: "dark" },
  { id: "premium-gold", name: "Premium Gold", primaryColor: "45 90% 50%", secondaryColor: "45 20% 10%", accentColor: "45 80% 55%", backgroundColor: "30 20% 5%", textColor: "0 0% 95%", buttonStyle: "pill", mode: "dark" },
];

export interface HeroTemplateContent {
  headingTitle: string;
  subtitle: string;
  description: string;
  primaryButtonText: string;
  secondaryButtonText: string;
  heroImageUrl: string;
  eventDate: string;
  eventLocation: string;
  eventTime: string;
  countdownDays: string;
  keyLabels: string[];
  partnerLogos: string[];
}

export interface HeroTemplate {
  id: string;
  name: string;
  type: "default" | "event-light" | "dark-tech" | "creative-artistic" | "holiday" | "modern-bold";
  layoutHtml: string;  // React component key, not raw HTML
  theme: HeroTemplateTheme;
  content: HeroTemplateContent;
  active: boolean;
  version: number;
  createdAt: string;
}

export interface HeroTemplateState {
  templates: HeroTemplate[];
  activeTemplateId: string;
  previousActiveId: string; // for rollback
  version: number;
}

// ─── Default Content ─────────────────────────────────────────

const DEFAULT_CONTENT: HeroTemplateContent = {
  headingTitle: "Learn Real Skills. Build Real Income.",
  subtitle: "Master in-demand skills from expert instructors.",
  description: "Join a growing community of learners transforming their careers with practical, hands-on courses.",
  primaryButtonText: "Get Started Free",
  secondaryButtonText: "Browse Courses",
  heroImageUrl: "",
  eventDate: "",
  eventLocation: "",
  eventTime: "",
  countdownDays: "",
  keyLabels: [],
  partnerLogos: [],
};

// ─── Predefined Templates ────────────────────────────────────

export const PREDEFINED_TEMPLATES: HeroTemplate[] = [
  {
    id: "default",
    name: "Default Clean SaaS",
    type: "default",
    layoutHtml: "default",
    theme: {
      primaryColor: "222 80% 45%",
      secondaryColor: "222 30% 14%",
      accentColor: "142 70% 45%",
      fontFamily: "inter",
      headingFont: "space-grotesk",
      buttonStyle: "rounded",
      hoverEffect: "glow",
    },
    content: { ...DEFAULT_CONTENT },
    active: true,
    version: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: "event-light",
    name: "Event / Conference",
    type: "event-light",
    layoutHtml: "event-light",
    theme: {
      primaryColor: "230 70% 55%",
      secondaryColor: "230 25% 92%",
      accentColor: "230 60% 65%",
      fontFamily: "poppins",
      headingFont: "playfair",
      buttonStyle: "rounded",
      hoverEffect: "lift",
    },
    content: {
      ...DEFAULT_CONTENT,
      headingTitle: "Event Name Here",
      subtitle: "Event Subtitle Here",
      description: "Join us for an unforgettable experience with world-class speakers and networking opportunities.",
      primaryButtonText: "Get Tickets",
      secondaryButtonText: "Learn More",
      eventDate: "Month XX, 20XX",
      eventLocation: "Location Here",
      eventTime: "Time Here",
      countdownDays: "30",
      keyLabels: ["Key Event Highlight", "Key Event Highlight", "Key Event Highlight"],
    },
    active: false,
    version: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: "dark-tech",
    name: "Dark Tech / Futuristic",
    type: "dark-tech",
    layoutHtml: "dark-tech",
    theme: {
      primaryColor: "230 80% 60%",
      secondaryColor: "230 40% 8%",
      accentColor: "230 70% 55%",
      fontFamily: "space-grotesk",
      headingFont: "space-grotesk",
      buttonStyle: "square",
      hoverEffect: "glow",
    },
    content: {
      ...DEFAULT_CONTENT,
      headingTitle: "Heading Title",
      subtitle: "Subtitle Here",
      description: "Start and engaging description goes here. Invite users to explore further into a bit of detail.",
      primaryButtonText: "Button Text",
      secondaryButtonText: "Button Text",
      keyLabels: ["Key Label", "Key Label"],
    },
    active: false,
    version: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: "creative-artistic",
    name: "Creative / Artistic",
    type: "creative-artistic",
    layoutHtml: "creative-artistic",
    theme: {
      primaryColor: "0 0% 15%",
      secondaryColor: "0 0% 95%",
      accentColor: "0 0% 40%",
      fontFamily: "raleway",
      headingFont: "playfair",
      buttonStyle: "square",
      hoverEffect: "scale",
    },
    content: {
      ...DEFAULT_CONTENT,
      headingTitle: "Title Goes Here",
      subtitle: "Subtitle or description text goes here",
      primaryButtonText: "Button Text",
      secondaryButtonText: "",
      partnerLogos: [],
    },
    active: false,
    version: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: "holiday",
    name: "Holiday / Campaign",
    type: "holiday",
    layoutHtml: "holiday",
    theme: {
      primaryColor: "350 80% 50%",
      secondaryColor: "350 30% 12%",
      accentColor: "45 90% 55%",
      fontFamily: "poppins",
      headingFont: "playfair",
      buttonStyle: "pill",
      hoverEffect: "scale",
    },
    content: {
      ...DEFAULT_CONTENT,
      headingTitle: "🎉 Special Holiday Offer!",
      subtitle: "Celebrate with exclusive deals",
      description: "Limited time holiday discounts on all courses. Don't miss out on this festive season special!",
      primaryButtonText: "Grab the Deal",
      secondaryButtonText: "View All Offers",
      countdownDays: "7",
    },
    active: false,
    version: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: "modern-bold",
    name: "Modern / Bold Startup",
    type: "modern-bold",
    layoutHtml: "modern-bold",
    theme: {
      primaryColor: "265 80% 55%",
      secondaryColor: "265 30% 10%",
      accentColor: "175 70% 45%",
      fontFamily: "dm-sans",
      headingFont: "space-grotesk",
      buttonStyle: "pill",
      hoverEffect: "slide-up",
    },
    content: {
      ...DEFAULT_CONTENT,
      headingTitle: "Build Something Extraordinary",
      subtitle: "The platform for ambitious learners",
      description: "Transform your skills with cutting-edge courses designed for the modern professional.",
      primaryButtonText: "Start Building",
      secondaryButtonText: "Explore Platform",
    },
    active: false,
    version: 1,
    createdAt: new Date().toISOString(),
  },
];

// ─── Default State ───────────────────────────────────────────

const DEFAULT_STATE: HeroTemplateState = {
  templates: PREDEFINED_TEMPLATES,
  activeTemplateId: "default",
  previousActiveId: "",
  version: 1,
};

const DOC_PATH = "site_settings";
const DOC_ID = "hero_templates";

// ─── Hook ────────────────────────────────────────────────────

export function useHeroTemplates() {
  const [state, setState] = useState<HeroTemplateState>(DEFAULT_STATE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, DOC_PATH, DOC_ID),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as Partial<HeroTemplateState>;
          // Merge predefined with stored (stored overrides)
          const storedMap = new Map((data.templates || []).map(t => [t.id, t]));
          const merged = PREDEFINED_TEMPLATES.map(pt => {
            const stored = storedMap.get(pt.id);
            return stored ? { ...pt, ...stored } : pt;
          });
          // Add any duplicated templates (custom copies)
          (data.templates || []).forEach(t => {
            if (!PREDEFINED_TEMPLATES.find(p => p.id === t.id)) {
              merged.push(t);
            }
          });
          setState({
            templates: merged,
            activeTemplateId: data.activeTemplateId || "default",
            previousActiveId: data.previousActiveId || "",
            version: data.version || 1,
          });
        }
        setLoading(false);
      },
      (err) => {
        console.error("Hero templates error:", err);
        setLoading(false);
      }
    );
    return unsub;
  }, []);

  const getActiveTemplate = () => state.templates.find(t => t.id === state.activeTemplateId) || state.templates[0];

  return { state, loading, getActiveTemplate };
}

// ─── Mutations ───────────────────────────────────────────────

export async function saveHeroTemplateState(newState: HeroTemplateState) {
  await setDoc(doc(db, DOC_PATH, DOC_ID), newState);
}

export async function publishHeroTemplate(templateId: string, currentState: HeroTemplateState) {
  const updated: HeroTemplateState = {
    ...currentState,
    previousActiveId: currentState.activeTemplateId,
    activeTemplateId: templateId,
    templates: currentState.templates.map(t => ({
      ...t,
      active: t.id === templateId,
    })),
    version: currentState.version + 1,
  };
  await saveHeroTemplateState(updated);
}

export async function rollbackHeroTemplate(currentState: HeroTemplateState) {
  if (!currentState.previousActiveId) return;
  await publishHeroTemplate(currentState.previousActiveId, currentState);
}

export async function updateHeroTemplateContent(
  templateId: string,
  content: Partial<HeroTemplateContent>,
  theme: Partial<HeroTemplateTheme>,
  currentState: HeroTemplateState
) {
  const updated: HeroTemplateState = {
    ...currentState,
    templates: currentState.templates.map(t =>
      t.id === templateId
        ? { ...t, content: { ...t.content, ...content }, theme: { ...t.theme, ...theme }, version: t.version + 1 }
        : t
    ),
  };
  await saveHeroTemplateState(updated);
}

export async function duplicateHeroTemplate(templateId: string, currentState: HeroTemplateState) {
  const source = currentState.templates.find(t => t.id === templateId);
  if (!source) return;
  const newId = `${source.id}-copy-${Date.now()}`;
  const copy: HeroTemplate = {
    ...source,
    id: newId,
    name: `${source.name} (Copy)`,
    active: false,
    createdAt: new Date().toISOString(),
  };
  const updated: HeroTemplateState = {
    ...currentState,
    templates: [...currentState.templates, copy],
  };
  await saveHeroTemplateState(updated);
}

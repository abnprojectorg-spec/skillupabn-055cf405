import { useEffect } from "react";
import { useSiteSettings, type DesignSettings, type FontFamily } from "@/hooks/useSiteSettings";
import { useHeroTemplates, THEME_PRESETS } from "@/hooks/useHeroTemplates";

const FONT_MAP: Record<string, { name: string; import: string }> = {
  "inter": { name: "'Inter', sans-serif", import: "Inter:wght@300;400;500;600;700;800;900" },
  "space-grotesk": { name: "'Space Grotesk', sans-serif", import: "Space+Grotesk:wght@400;500;600;700" },
  "poppins": { name: "'Poppins', sans-serif", import: "Poppins:wght@300;400;500;600;700;800" },
  "raleway": { name: "'Raleway', sans-serif", import: "Raleway:wght@300;400;500;600;700;800" },
  "playfair": { name: "'Playfair Display', serif", import: "Playfair+Display:wght@400;500;600;700;800" },
  "roboto": { name: "'Roboto', sans-serif", import: "Roboto:wght@300;400;500;700;900" },
  "dm-sans": { name: "'DM Sans', sans-serif", import: "DM+Sans:wght@400;500;600;700" },
};

const FONT_SCALE_MAP = { small: "14px", normal: "16px", large: "18px" };

interface FullDesign extends DesignSettings {
  // resolved values, never undefined here
}

function applyDesign(design: FullDesign) {
  const root = document.documentElement;

  // Core color tokens
  root.style.setProperty("--primary", design.primaryColor);
  root.style.setProperty("--secondary", design.secondaryColor);
  root.style.setProperty("--accent", design.accentColor);
  root.style.setProperty("--ring", design.primaryColor);

  // Full-theme tokens (background / foreground / card / border) — applied site-wide
  if (design.backgroundColor) {
    root.style.setProperty("--background", design.backgroundColor);
  }
  if (design.textColor) {
    root.style.setProperty("--foreground", design.textColor);
    root.style.setProperty("--card-foreground", design.textColor);
    root.style.setProperty("--popover-foreground", design.textColor);
    root.style.setProperty("--secondary-foreground", design.textColor);
  }
  if (design.cardColor) {
    root.style.setProperty("--card", design.cardColor);
    root.style.setProperty("--popover", design.cardColor);
  }
  if (design.borderColor) {
    root.style.setProperty("--border", design.borderColor);
    root.style.setProperty("--input", design.borderColor);
  }

  // Muted should follow secondary for visual consistency
  root.style.setProperty("--muted", design.secondaryColor);

  // Typography
  const bodyFont = FONT_MAP[design.fontFamily] || FONT_MAP["inter"];
  const headFont = FONT_MAP[design.headingFont] || FONT_MAP["space-grotesk"];
  root.style.setProperty("--font-body", bodyFont.name);
  root.style.setProperty("--font-display", headFont.name);
  root.style.fontSize = FONT_SCALE_MAP[design.fontScale] || "16px";

  const fontsToLoad = new Set([bodyFont.import, headFont.import]);
  fontsToLoad.forEach((fontImport) => {
    const id = `gfont-${fontImport.replace(/[^a-z]/gi, "")}`;
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href = `https://fonts.googleapis.com/css2?family=${fontImport}&display=swap`;
      document.head.appendChild(link);
    }
  });

  // Data attributes for global behavior
  root.dataset.headingStyle = design.headingStyle;
  root.dataset.buttonStyle = design.buttonStyle;
  root.dataset.hoverEffect = design.hoverEffect;
  if (design.themeMode) {
    root.dataset.themeMode = design.themeMode;
    if (design.themeMode === "light") root.classList.add("theme-light");
    else root.classList.remove("theme-light");
  }
}

export default function GlobalDesignProvider({ children }: { children: React.ReactNode }) {
  const { settings, loading } = useSiteSettings();
  const { getActiveTemplate, loading: heroLoading, state: heroState } = useHeroTemplates();

  useEffect(() => {
    if (loading || heroLoading) return;

    const activeTemplate = getActiveTemplate();

    // Resolve preset (single source of truth for full theme)
    const preset = THEME_PRESETS.find((p) => p.id === settings.design.themePresetId);

    // Hero template overrides primary/font; preset (if set) provides full theme palette
    const merged: FullDesign = {
      ...settings.design,
      primaryColor: activeTemplate.theme.primaryColor || settings.design.primaryColor,
      secondaryColor: activeTemplate.theme.secondaryColor || settings.design.secondaryColor,
      accentColor: activeTemplate.theme.accentColor || settings.design.accentColor,
      fontFamily: (activeTemplate.theme.fontFamily as FontFamily) || settings.design.fontFamily,
      headingFont: (activeTemplate.theme.headingFont as FontFamily) || settings.design.headingFont,
      buttonStyle: activeTemplate.theme.buttonStyle || settings.design.buttonStyle,
      hoverEffect: activeTemplate.theme.hoverEffect || settings.design.hoverEffect,
      // Preset wins for full-page palette unless DesignSettings provides explicit overrides
      backgroundColor: settings.design.backgroundColor || preset?.backgroundColor,
      textColor: settings.design.textColor || preset?.textColor,
      cardColor: settings.design.cardColor,
      borderColor: settings.design.borderColor,
      themeMode: settings.design.themeMode || preset?.mode,
    };

    applyDesign(merged);
  }, [
    loading,
    heroLoading,
    settings.design,
    heroState.activeTemplateId,
    heroState.version,
    getActiveTemplate,
  ]);

  return <>{children}</>;
}

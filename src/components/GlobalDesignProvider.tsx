import { useEffect } from "react";
import { useSiteSettings, type DesignSettings, type FontFamily } from "@/hooks/useSiteSettings";

const FONT_MAP: Record<FontFamily, { name: string; import: string }> = {
  "inter": { name: "'Inter', sans-serif", import: "Inter:wght@300;400;500;600;700;800;900" },
  "space-grotesk": { name: "'Space Grotesk', sans-serif", import: "Space+Grotesk:wght@400;500;600;700" },
  "poppins": { name: "'Poppins', sans-serif", import: "Poppins:wght@300;400;500;600;700;800" },
  "raleway": { name: "'Raleway', sans-serif", import: "Raleway:wght@300;400;500;600;700;800" },
  "playfair": { name: "'Playfair Display', serif", import: "Playfair+Display:wght@400;500;600;700;800" },
  "roboto": { name: "'Roboto', sans-serif", import: "Roboto:wght@300;400;500;700;900" },
  "dm-sans": { name: "'DM Sans', sans-serif", import: "DM+Sans:wght@400;500;600;700" },
};

const FONT_SCALE_MAP = { small: "14px", normal: "16px", large: "18px" };

function applyDesign(design: DesignSettings) {
  const root = document.documentElement;

  // Colors
  root.style.setProperty("--primary", design.primaryColor);
  root.style.setProperty("--secondary", design.secondaryColor);
  root.style.setProperty("--muted", design.secondaryColor);
  root.style.setProperty("--accent", design.accentColor);
  root.style.setProperty("--ring", design.primaryColor);

  // Fonts
  const bodyFont = FONT_MAP[design.fontFamily] || FONT_MAP["inter"];
  const headFont = FONT_MAP[design.headingFont] || FONT_MAP["space-grotesk"];
  root.style.setProperty("--font-body", bodyFont.name);
  root.style.setProperty("--font-display", headFont.name);
  root.style.fontSize = FONT_SCALE_MAP[design.fontScale] || "16px";

  // Load Google Fonts dynamically
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

  // Heading style
  root.dataset.headingStyle = design.headingStyle;
  // Button style
  root.dataset.buttonStyle = design.buttonStyle;
  // Hover effect
  root.dataset.hoverEffect = design.hoverEffect;
}

export default function GlobalDesignProvider({ children }: { children: React.ReactNode }) {
  const { settings, loading } = useSiteSettings();

  useEffect(() => {
    if (!loading) {
      applyDesign(settings.design);
    }
  }, [loading, settings.design]);

  return <>{children}</>;
}

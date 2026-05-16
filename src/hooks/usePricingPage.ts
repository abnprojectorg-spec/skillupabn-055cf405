import { useEffect, useState } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export type PricingEmbedType = "iframe" | "html" | "url";

export interface PricingPageSettings {
  embedType: PricingEmbedType;
  embedCode: string; // iframe html, raw html, or external URL
  published: boolean;
  updatedAt?: number;
}

export const DEFAULT_PRICING: PricingPageSettings = {
  embedType: "html",
  embedCode: "",
  published: false,
};

export function usePricingPage() {
  const [pricing, setPricing] = useState<PricingPageSettings>(DEFAULT_PRICING);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, "site_settings", "pricing_page"),
      (snap) => {
        if (snap.exists()) {
          setPricing({ ...DEFAULT_PRICING, ...(snap.data() as any) });
        }
        setLoading(false);
      },
      (err) => {
        console.error("Pricing page snapshot error:", err);
        setLoading(false);
      }
    );
    return unsub;
  }, []);

  return { pricing, loading };
}

export async function savePricingPage(data: PricingPageSettings) {
  return setDoc(
    doc(db, "site_settings", "pricing_page"),
    { ...data, updatedAt: Date.now() },
    { merge: true }
  );
}

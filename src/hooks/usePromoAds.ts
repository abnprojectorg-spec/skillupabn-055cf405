import { useEffect, useState } from "react";
import {
  collection,
  doc,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  increment,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { detectDevice } from "@/lib/deviceInfo";

export interface PromoAd {
  id: string;
  title: string;
  description: string;
  mediaUrl: string;
  mediaType: "image" | "video";
  aspectRatio: string; // e.g. "1:1", "16:9", "4:5"
  ctaText?: string;
  ctaUrl?: string;
  active: boolean;
  order: number;
  createdAt?: unknown;
  // Stats (denormalized counters)
  impressions?: number;
  clicks?: number;
  impressions_mobile?: number;
  impressions_tablet?: number;
  impressions_desktop?: number;
  clicks_mobile?: number;
  clicks_tablet?: number;
  clicks_desktop?: number;
}

const COL = "promo_ads";

export function usePromoAds() {
  const [ads, setAds] = useState<PromoAd[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, COL), orderBy("order", "asc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setAds(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<PromoAd, "id">) })));
        setLoading(false);
      },
      (err) => {
        console.error("Promo ads error:", err);
        setLoading(false);
      }
    );
    return unsub;
  }, []);

  return { ads, loading };
}

export async function createPromoAd(data: Omit<PromoAd, "id" | "createdAt">) {
  return addDoc(collection(db, COL), {
    ...data,
    impressions: 0,
    clicks: 0,
    createdAt: serverTimestamp(),
  });
}

export async function updatePromoAd(id: string, data: Partial<PromoAd>) {
  return updateDoc(doc(db, COL, id), data);
}

export async function deletePromoAd(id: string) {
  return deleteDoc(doc(db, COL, id));
}

// Tracking
export async function trackPromoImpression(adId: string) {
  try {
    const dev = await detectDevice();
    const field = `impressions_${dev.type}`;
    await updateDoc(doc(db, COL, adId), {
      impressions: increment(1),
      [field]: increment(1),
    });
  } catch (err) {
    /* silent */
  }
}

export async function trackPromoClick(adId: string) {
  try {
    const dev = await detectDevice();
    const field = `clicks_${dev.type}`;
    await updateDoc(doc(db, COL, adId), {
      clicks: increment(1),
      [field]: increment(1),
    });
  } catch (err) {
    /* silent */
  }
}

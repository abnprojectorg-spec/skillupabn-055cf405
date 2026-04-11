import { useState, useEffect } from "react";
import {
  collection, doc, onSnapshot, setDoc, deleteDoc, updateDoc, writeBatch, Timestamp, query, orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface Template {
  id: string;
  name: string;
  htmlCode: string;
  active: boolean;
  startDate?: string; // ISO string
  endDate?: string;
  createdAt: string;
}

const COLL = "templates";

export function useTemplates() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, COLL), orderBy("createdAt", "desc")),
      (snap) => {
        const list: Template[] = snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            name: data.name ?? "",
            htmlCode: data.htmlCode ?? "",
            active: data.active ?? false,
            startDate: data.startDate ?? undefined,
            endDate: data.endDate ?? undefined,
            createdAt: data.createdAt ?? new Date().toISOString(),
          };
        });
        // Auto-scheduling: activate templates within date range
        const now = new Date();
        const scheduled = list.map((t) => {
          if (t.startDate && t.endDate) {
            const inRange = now >= new Date(t.startDate) && now <= new Date(t.endDate);
            if (inRange && !t.active) return { ...t, active: true };
            if (!inRange && t.active) return { ...t, active: false };
          }
          return t;
        });
        setTemplates(scheduled);
        setLoading(false);
      },
      (err) => {
        console.error("Templates listener error:", err);
        setLoading(false);
      }
    );
    return unsub;
  }, []);

  return { templates, loading };
}

export async function saveTemplate(template: Omit<Template, "createdAt"> & { createdAt?: string }) {
  const ref = doc(db, COLL, template.id);
  await setDoc(ref, {
    ...template,
    createdAt: template.createdAt || new Date().toISOString(),
  });
}

export async function deleteTemplate(id: string) {
  await deleteDoc(doc(db, COLL, id));
}

export async function publishTemplate(id: string, allTemplates: Template[]) {
  const batch = writeBatch(db);
  allTemplates.forEach((t) => {
    batch.update(doc(db, COLL, t.id), { active: t.id === id });
  });
  await batch.commit();
}

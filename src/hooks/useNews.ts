import { useState, useEffect } from "react";
import {
  collection, query, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, arrayUnion, arrayRemove,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface NewsComment {
  userId: string;
  userName: string;
  text: string;
  createdAt: number; // timestamp ms
}

export interface NewsPost {
  id: string;
  title: string;
  content: string;
  imageUrl: string;
  likes: string[]; // userIds
  comments: NewsComment[];
  createdAt: unknown;
}

// ─── Hooks ───────────────────────────────────────────────────

export function useNewsPosts() {
  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, "news_posts"), orderBy("createdAt", "desc")),
      (snap) => {
        setPosts(snap.docs.map((d) => ({ id: d.id, likes: [], comments: [], ...d.data() } as NewsPost)));
        setLoading(false);
      },
      (error) => { console.error("News posts error:", error); setLoading(false); }
    );
    return unsub;
  }, []);

  return { posts, loading };
}

// ─── Actions ─────────────────────────────────────────────────

export async function addNewsPost(data: { title: string; content: string; imageUrl: string }) {
  return addDoc(collection(db, "news_posts"), {
    ...data, likes: [], comments: [], createdAt: serverTimestamp(),
  });
}

export async function updateNewsPost(id: string, data: Partial<NewsPost>) {
  return updateDoc(doc(db, "news_posts", id), data);
}

export async function deleteNewsPost(id: string) {
  return deleteDoc(doc(db, "news_posts", id));
}

export async function toggleLike(postId: string, userId: string, isLiked: boolean) {
  const ref = doc(db, "news_posts", postId);
  await updateDoc(ref, {
    likes: isLiked ? arrayRemove(userId) : arrayUnion(userId),
  });
}

export async function addComment(postId: string, comment: NewsComment) {
  const ref = doc(db, "news_posts", postId);
  await updateDoc(ref, {
    comments: arrayUnion(comment),
  });
}

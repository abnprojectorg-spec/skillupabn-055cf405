import { useState, useEffect } from "react";
import {
  collection, query, where, orderBy, onSnapshot, addDoc, updateDoc, doc, serverTimestamp, getDocs, limit,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: "user" | "admin";
  text: string;
  createdAt: unknown;
}

export interface ChatConversation {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  lastMessage: string;
  lastMessageAt: unknown;
  unreadByAdmin: number;
  unreadByUser: number;
}

// ─── Hooks ───────────────────────────────────────────────────

export function useConversations() {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, "chat_conversations"), orderBy("lastMessageAt", "desc")),
      (snap) => {
        setConversations(snap.docs.map((d) => ({ id: d.id, ...d.data() } as ChatConversation)));
        setLoading(false);
      },
      (error) => { console.error("Conversations error:", error); setLoading(false); }
    );
    return unsub;
  }, []);

  return { conversations, loading };
}

export function useUserConversation(userId: string | undefined) {
  const [conversation, setConversation] = useState<ChatConversation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    const q = query(collection(db, "chat_conversations"), where("userId", "==", userId));
    const unsub = onSnapshot(q, (snap) => {
      setConversation(snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() } as ChatConversation);
      setLoading(false);
    }, (error) => { console.error("User conversation error:", error); setLoading(false); });
    return unsub;
  }, [userId]);

  return { conversation, loading };
}

export function useChatMessages(conversationId: string | undefined) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!conversationId) { setLoading(false); return; }
    const q = query(
      collection(db, "chat_messages"),
      where("conversationId", "==", conversationId),
      orderBy("createdAt", "asc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() } as ChatMessage)));
      setLoading(false);
    }, (error) => { console.error("Chat messages error:", error); setLoading(false); });
    return unsub;
  }, [conversationId]);

  return { messages, loading };
}

// ─── Actions ─────────────────────────────────────────────────

export async function getOrCreateConversation(userId: string, userName: string, userEmail: string): Promise<string> {
  const q = query(collection(db, "chat_conversations"), where("userId", "==", userId), limit(1));
  const snap = await getDocs(q);
  if (!snap.empty) return snap.docs[0].id;

  const docRef = await addDoc(collection(db, "chat_conversations"), {
    userId, userName, userEmail,
    lastMessage: "",
    lastMessageAt: serverTimestamp(),
    unreadByAdmin: 0,
    unreadByUser: 0,
  });
  return docRef.id;
}

export async function sendChatMessage(
  conversationId: string,
  senderId: string,
  senderName: string,
  senderRole: "user" | "admin",
  text: string
) {
  await addDoc(collection(db, "chat_messages"), {
    conversationId, senderId, senderName, senderRole, text,
    createdAt: serverTimestamp(),
  });

  const unreadField = senderRole === "user" ? "unreadByAdmin" : "unreadByUser";
  const convRef = doc(db, "chat_conversations", conversationId);
  // Get current unread count
  const convSnap = await getDocs(query(collection(db, "chat_conversations"), where("__name__", "==", conversationId)));
  const current = convSnap.docs[0]?.data()?.[unreadField] || 0;

  await updateDoc(convRef, {
    lastMessage: text.slice(0, 100),
    lastMessageAt: serverTimestamp(),
    [unreadField]: current + 1,
  });
}

export async function markConversationRead(conversationId: string, role: "admin" | "user") {
  const field = role === "admin" ? "unreadByAdmin" : "unreadByUser";
  await updateDoc(doc(db, "chat_conversations", conversationId), { [field]: 0 });
}

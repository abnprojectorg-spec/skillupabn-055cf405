import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import {
  useUserConversation, useChatMessages, getOrCreateConversation,
  sendChatMessage, markConversationRead,
} from "@/hooks/useChat";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [convId, setConvId] = useState<string | null>(null);
  const { user, profile } = useAuth();
  const bottomRef = useRef<HTMLDivElement>(null);

  const displayName = profile?.full_name || user?.displayName || "Student";
  const { conversation } = useUserConversation(user?.uid);
  const activeConvId = convId || conversation?.id;
  const { messages, loading: msgsLoading } = useChatMessages(activeConvId);

  useEffect(() => {
    if (conversation?.id) setConvId(conversation.id);
  }, [conversation?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Mark read when opening
  useEffect(() => {
    if (open && activeConvId) {
      markConversationRead(activeConvId, "user");
    }
  }, [open, activeConvId, messages.length]);

  if (!user) return null;

  const handleSend = async () => {
    if (!message.trim() || sending) return;
    setSending(true);
    try {
      let cid = activeConvId;
      if (!cid) {
        cid = await getOrCreateConversation(user.uid, displayName, user.email || "");
        setConvId(cid);
      }
      await sendChatMessage(cid, user.uid, displayName, "user", message.trim());
      setMessage("");
    } catch (err) {
      console.error("Send error:", err);
    }
    setSending(false);
  };

  const unread = conversation?.unreadByUser || 0;

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:scale-110 transition-transform md:bottom-8 md:right-8"
        aria-label="Chat with Admin"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        {!open && unread > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 rounded-2xl border border-border bg-card shadow-xl md:right-8 flex flex-col" style={{ maxHeight: "70vh" }}>
          {/* Header */}
          <div className="flex items-center gap-2 rounded-t-2xl bg-primary px-4 py-3">
            <MessageCircle className="h-5 w-5 text-primary-foreground" />
            <div>
              <p className="text-sm font-semibold text-primary-foreground">Chat with Admin</p>
              <p className="text-xs text-primary-foreground/70">We usually reply quickly</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2" style={{ minHeight: 200, maxHeight: "50vh" }}>
            {msgsLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
            ) : messages.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-8">No messages yet. Say hi! 👋</p>
            ) : (
              messages.map((m) => (
                <div key={m.id} className={`flex ${m.senderRole === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[75%] rounded-xl px-3 py-2 text-sm ${
                    m.senderRole === "user"
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-secondary text-secondary-foreground rounded-bl-sm"
                  }`}>
                    {m.senderRole === "admin" && (
                      <p className="text-[10px] font-semibold opacity-70 mb-0.5">Admin</p>
                    )}
                    <p className="whitespace-pre-wrap break-words">{m.text}</p>
                  </div>
                </div>
              ))
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-border p-3 flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 text-sm"
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            />
            <Button size="icon" variant="hero" onClick={handleSend} disabled={sending || !message.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

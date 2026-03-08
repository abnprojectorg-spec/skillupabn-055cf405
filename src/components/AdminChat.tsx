import { useState, useRef, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2, MessageCircle, ArrowLeft } from "lucide-react";
import {
  useConversations, useChatMessages, sendChatMessage, markConversationRead,
  type ChatConversation,
} from "@/hooks/useChat";

export default function AdminChat() {
  const { conversations, loading } = useConversations();
  const [selected, setSelected] = useState<ChatConversation | null>(null);

  const totalUnread = conversations.reduce((s, c) => s + (c.unreadByAdmin || 0), 0);

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <h1 className="font-display text-2xl font-bold">Messages</h1>
        {totalUnread > 0 && <Badge className="bg-destructive/10 text-destructive border-destructive/20">{totalUnread} unread</Badge>}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : selected ? (
        <ChatThread conversation={selected} onBack={() => setSelected(null)} />
      ) : conversations.length === 0 ? (
        <div className="text-center py-16">
          <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
          <p className="text-muted-foreground">No conversations yet.</p>
        </div>
      ) : (
        <div className="space-y-2 max-w-2xl">
          {conversations.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelected(c)}
              className="w-full flex items-center gap-3 rounded-xl border border-border bg-card p-4 hover:border-primary/30 transition-colors text-left"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm shrink-0">
                {c.userName?.split(" ").map((n) => n[0]).join("").slice(0, 2) || "?"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold truncate">{c.userName}</p>
                  {(c.unreadByAdmin || 0) > 0 && (
                    <Badge className="bg-destructive text-destructive-foreground text-[10px] px-1.5 ml-2">{c.unreadByAdmin}</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">{c.lastMessage || "No messages"}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ChatThread({ conversation, onBack }: { conversation: ChatConversation; onBack: () => void }) {
  const { messages, loading } = useChatMessages(conversation.id);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    markConversationRead(conversation.id, "admin");
  }, [conversation.id, messages.length]);

  const handleSend = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      await sendChatMessage(conversation.id, "admin", "Admin", "admin", text.trim());
      setText("");
    } catch (err) {
      console.error("Admin send error:", err);
    }
    setSending(false);
  };

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-4">
        <Button size="icon" variant="ghost" onClick={onBack}><ArrowLeft className="h-4 w-4" /></Button>
        <div>
          <p className="font-semibold">{conversation.userName}</p>
          <p className="text-xs text-muted-foreground">{conversation.userEmail}</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="p-4 space-y-2 overflow-y-auto" style={{ maxHeight: "60vh", minHeight: 300 }}>
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
          ) : messages.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No messages in this conversation.</p>
          ) : (
            messages.map((m) => (
              <div key={m.id} className={`flex ${m.senderRole === "admin" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] rounded-xl px-3 py-2 text-sm ${
                  m.senderRole === "admin"
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-secondary text-secondary-foreground rounded-bl-sm"
                }`}>
                  {m.senderRole === "user" && (
                    <p className="text-[10px] font-semibold opacity-70 mb-0.5">{m.senderName}</p>
                  )}
                  <p className="whitespace-pre-wrap break-words">{m.text}</p>
                </div>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>

        <div className="border-t border-border p-3 flex gap-2">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Reply..."
            className="flex-1"
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
          />
          <Button size="icon" variant="hero" onClick={handleSend} disabled={sending || !text.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

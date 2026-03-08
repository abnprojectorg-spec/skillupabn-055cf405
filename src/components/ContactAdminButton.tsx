import { useState } from "react";
import { MessageCircle, X, Send, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAdminSettings } from "@/hooks/useFirestore";
import { useAuth } from "@/contexts/AuthContext";

export default function ContactAdminButton() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const { settings } = useAdminSettings();
  const { user, profile } = useAuth();

  const adminTelegram = settings.adminTelegram?.replace("@", "") || "";
  const displayName = profile?.full_name || user?.displayName || "Student";

  const buildTelegramUrl = (msg?: string) => {
    const base = `https://t.me/${adminTelegram}`;
    if (msg) {
      const text = `Hi, I'm ${displayName} (${user?.email || ""}).\n\n${msg}`;
      return `${base}?text=${encodeURIComponent(text)}`;
    }
    return base;
  };

  if (!adminTelegram || !user) return null;

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:scale-110 transition-transform md:bottom-8 md:right-8"
        aria-label="Contact Admin"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {/* Chat-like popup */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 rounded-2xl border border-border bg-card shadow-xl md:right-8">
          <div className="flex items-center gap-2 rounded-t-2xl bg-primary px-4 py-3">
            <MessageCircle className="h-5 w-5 text-primary-foreground" />
            <div>
              <p className="text-sm font-semibold text-primary-foreground">Contact Admin</p>
              <p className="text-xs text-primary-foreground/70">via Telegram</p>
            </div>
          </div>

          <div className="p-4 space-y-3">
            <p className="text-xs text-muted-foreground">
              Send a message to the admin on Telegram. You can ask questions, report issues, or request help.
            </p>

            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message here..."
              rows={3}
              className="text-sm"
            />

            <div className="flex gap-2">
              <a
                href={buildTelegramUrl(message)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1"
              >
                <Button variant="hero" className="w-full gap-2" size="sm">
                  <Send className="h-3.5 w-3.5" />
                  Send via Telegram
                </Button>
              </a>
            </div>

            <a
              href={buildTelegramUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              <ExternalLink className="h-3 w-3" />
              Open Telegram directly
            </a>
          </div>
        </div>
      )}
    </>
  );
}

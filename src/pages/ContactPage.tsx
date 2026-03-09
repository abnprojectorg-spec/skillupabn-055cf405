import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { Mail, Send as SendIcon, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ContactPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;
    setSending(true);
    // Open mailto link as a simple contact method
    const subject = encodeURIComponent(`Contact from ${name.trim()}`);
    const body = encodeURIComponent(`Name: ${name.trim()}\nEmail: ${email.trim()}\n\n${message.trim()}`);
    window.open(`mailto:abenezarofficial@gmail.com?subject=${subject}&body=${body}`, "_blank");
    toast({ title: "Message prepared!", description: "Your email client should open shortly." });
    setName(""); setEmail(""); setMessage("");
    setSending(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="text-center mb-12">
            <h1 className="font-display text-4xl font-bold mb-4">Contact Us</h1>
            <p className="text-lg text-muted-foreground">Have questions? We'd love to hear from you.</p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-6">
              <h2 className="font-display text-xl font-semibold">Get In Touch</h2>
              <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
                <a href="mailto:abenezarofficial@gmail.com" className="flex items-center gap-4 group">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">abenezarofficial@gmail.com</p>
                  </div>
                </a>
                <a href="https://t.me/abenezar_official" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 group">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                    <MessageCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Telegram</p>
                    <p className="font-medium">@abenezar_official</p>
                  </div>
                </a>
              </div>
            </div>

            <div>
              <h2 className="font-display text-xl font-semibold mb-4">Send a Message</h2>
              <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-card p-6 space-y-4">
                <Input placeholder="Your Name" value={name} onChange={(e) => setName(e.target.value)} maxLength={100} required />
                <Input type="email" placeholder="Your Email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={255} required />
                <Textarea placeholder="Your Message" value={message} onChange={(e) => setMessage(e.target.value)} maxLength={1000} rows={5} required />
                <Button type="submit" variant="hero" className="w-full" disabled={sending}>
                  <SendIcon className="h-4 w-4 mr-2" /> Send Message
                </Button>
              </form>
            </div>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default ContactPage;

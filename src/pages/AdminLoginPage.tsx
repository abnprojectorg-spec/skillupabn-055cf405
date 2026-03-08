import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import { Shield, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

const AdminLoginPage = () => {
  const [segments, setSegments] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleChange = (index: number, value: string) => {
    const clean = value.replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 4);
    const next = [...segments];
    next[index] = clean;
    setSegments(next);

    // Auto-focus next input when 4 chars entered
    if (clean.length === 4 && index < 3) {
      const nextInput = document.getElementById(`admin-code-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && segments[index] === "" && index > 0) {
      const prevInput = document.getElementById(`admin-code-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/[^A-Za-z0-9]/g, "").toUpperCase();
    const chunks = [
      pasted.slice(0, 4),
      pasted.slice(4, 8),
      pasted.slice(8, 12),
      pasted.slice(12, 16),
    ];
    setSegments(chunks);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = segments.join("-");
    if (segments.some((s) => s.length !== 4)) {
      toast({ title: "Invalid code", description: "Please enter all 16 characters.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const q = query(collection(db, "admins"), where("accessCode", "==", code));
      const snap = await getDocs(q);
      if (snap.empty) {
        toast({ title: "Access denied", description: "Invalid admin access code.", variant: "destructive" });
        setLoading(false);
        return;
      }
      // Store admin session
      sessionStorage.setItem("adminAuth", code);
      toast({ title: "Welcome, Admin!" });
      navigate("/admin");
    } catch (err: any) {
      toast({ title: "Login failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex min-h-screen items-center justify-center pt-16 px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl gradient-primary">
              <Shield className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="font-display text-2xl font-bold">Admin Access</h1>
            <p className="mt-2 text-sm text-muted-foreground">Enter your 16-character access code</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-border bg-card p-8">
            <div className="flex items-center justify-center gap-2" onPaste={handlePaste}>
              {segments.map((seg, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    id={`admin-code-${i}`}
                    value={seg}
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    className="w-[72px] text-center font-mono text-lg tracking-widest uppercase"
                    maxLength={4}
                    placeholder="XXXX"
                    autoComplete="off"
                  />
                  {i < 3 && <span className="text-muted-foreground font-bold">-</span>}
                </div>
              ))}
            </div>
            <Button type="submit" variant="hero" className="w-full" size="lg" disabled={loading}>
              {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-1" /> Verifying...</> : "Verify Access Code"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;

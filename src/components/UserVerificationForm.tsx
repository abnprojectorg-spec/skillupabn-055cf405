import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { updateUser } from "@/hooks/useFirestore";
import { useToast } from "@/hooks/use-toast";
import { ShieldCheck, Shield, Building2, Loader2, Send, ExternalLink } from "lucide-react";
import VerificationBadge from "./VerificationBadge";

export default function UserVerificationForm() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: profile?.full_name || "",
    phone: profile?.phone || "",
    dob: profile?.dob || "",
    gender: profile?.gender || "",
    address: profile?.address || "",
    telegram_username: (profile as any)?.telegram_username || "",
  });

  const status = profile?.verification_status || "unverified";
  const isPending = status === "pending";
  const isVerified = status === "verified_person" || status === "verified_business";

  const handleSubmit = async () => {
    if (!user || !form.full_name.trim() || !form.phone.trim()) {
      toast({ title: "Please fill in at least your name and phone number.", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      await updateUser(user.uid, {
        full_name: form.full_name.trim(),
        phone: form.phone.trim(),
        dob: form.dob,
        gender: form.gender,
        address: form.address.trim(),
        telegram_username: form.telegram_username.trim(),
        verification_status: "pending",
        verification_requested: true,
      } as any);
      toast({ title: "Verification request submitted!", description: "Admin will review your information." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setSaving(false);
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6 max-w-lg">
      <div className="flex items-center gap-3 mb-4">
        <ShieldCheck className="h-6 w-6 text-primary" />
        <div>
          <h2 className="font-display text-lg font-semibold">Verify Your Account</h2>
          <p className="text-xs text-muted-foreground">Get a verification badge displayed across the platform</p>
        </div>
      </div>

      {/* Current Status */}
      <div className="flex items-center gap-2 mb-6 p-3 rounded-lg bg-secondary/50">
        <span className="text-sm text-muted-foreground">Current Status:</span>
        <VerificationBadge status={status} size="md" showLabel />
      </div>

      {isVerified ? (
        <div className="text-center py-4">
          <VerificationBadge status={status} size="md" showLabel />
          <p className="text-sm text-muted-foreground mt-2">Your account is verified!</p>
        </div>
      ) : isPending ? (
        <div className="text-center py-4">
          <Loader2 className="h-8 w-8 mx-auto mb-2 text-warning animate-spin" />
          <p className="text-sm font-medium text-warning">Verification Pending</p>
          <p className="text-xs text-muted-foreground mt-1">Admin is reviewing your information.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <Label>Full Name *</Label>
            <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="mt-1" placeholder="Your full name" />
          </div>
          <div>
            <Label>Phone Number *</Label>
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="mt-1" placeholder="+251..." />
          </div>
          <div>
            <Label>Date of Birth</Label>
            <Input type="date" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} className="mt-1" />
          </div>
          <div>
            <Label>Gender</Label>
            <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
              <option value="">Select...</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <Label>Address</Label>
            <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="mt-1" placeholder="City, Country" />
          </div>
          <div>
            <Label>Telegram Username</Label>
            <Input value={form.telegram_username} onChange={(e) => setForm({ ...form, telegram_username: e.target.value })} className="mt-1" placeholder="@yourusername" />
          </div>
          <Button variant="hero" onClick={handleSubmit} disabled={saving} className="w-full">
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ShieldCheck className="h-4 w-4 mr-2" />}
            Submit Verification Request
          </Button>
        </div>
      )}

      {/* Gold Badge Info */}
      <div className="mt-6 p-4 rounded-lg border border-yellow-500/20 bg-yellow-500/5">
        <div className="flex items-center gap-2 mb-2">
          <Building2 className="h-4 w-4 text-yellow-400" />
          <span className="text-sm font-semibold text-yellow-400">Gold Badge (Company/Official)</span>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          For company owners and officials, contact the admin directly to get a Gold verification badge.
        </p>
        <a
          href="https://t.me/abenezar_official"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-accent transition-colors"
        >
          <Send className="h-3.5 w-3.5" /> Contact Admin on Telegram <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
}

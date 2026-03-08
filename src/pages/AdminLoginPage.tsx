import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import { Shield, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { checkIsAdmin } from "@/hooks/useFirestore";
import { useToast } from "@/hooks/use-toast";

const AdminLoginPage = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      const isAdmin = await checkIsAdmin(form.email);
      if (!isAdmin) {
        toast({ title: "Access denied", description: "You are not authorized as an admin.", variant: "destructive" });
        setLoading(false);
        return;
      }
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
            <h1 className="font-display text-2xl font-bold">Admin Login</h1>
            <p className="mt-2 text-sm text-muted-foreground">Secure access for administrators</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-border bg-card p-8">
            <div>
              <Label htmlFor="admin-email">Email</Label>
              <Input
                id="admin-email"
                type="email"
                placeholder="admin@skillup.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="admin-password">Password</Label>
              <Input
                id="admin-password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="mt-1"
              />
            </div>
            <Button type="submit" variant="hero" className="w-full" size="lg" disabled={loading}>
              {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-1" /> Verifying...</> : "Login as Admin"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;

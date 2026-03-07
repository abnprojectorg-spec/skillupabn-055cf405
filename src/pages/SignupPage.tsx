import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import { GraduationCap } from "lucide-react";

const SignupPage = () => {
  const [form, setForm] = useState({ fullName: "", email: "", password: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Firebase auth integration placeholder
    console.log("Signup:", form);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex min-h-screen items-center justify-center pt-16 px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl gradient-primary">
              <GraduationCap className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="font-display text-2xl font-bold">Create your account</h1>
            <p className="mt-2 text-sm text-muted-foreground">Start learning real skills today</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-border bg-card p-8">
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" placeholder="Abebe Kebede" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="mt-1" />
            </div>
            <Button type="submit" variant="hero" className="w-full" size="lg">Create Account</Button>
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
              <div className="relative flex justify-center text-xs"><span className="bg-card px-2 text-muted-foreground">or</span></div>
            </div>
            <Button type="button" variant="outline" className="w-full" size="lg">
              <img src="https://www.google.com/favicon.ico" alt="Google" className="h-4 w-4 mr-2" />
              Continue with Google
            </Button>
            <p className="text-center text-sm text-muted-foreground pt-2">
              Already have an account? <Link to="/login" className="text-primary font-medium hover:underline">Log in</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;

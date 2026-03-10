import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  usePlaylists, useCourses, usePlaylistPaymentRequests,
  addPlaylist, updatePlaylist, deletePlaylist,
  approvePlaylistPayment, rejectPlaylistPayment, deletePlaylistPaymentRequest,
} from "@/hooks/useFirestore";
import type { FirestorePlaylist } from "@/hooks/useFirestore";
import {
  Plus, Trash2, X, Loader2, Edit, CheckCircle, XCircle, Search, ListMusic, CreditCard,
} from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-warning/10 text-warning border-warning/20",
  approved: "bg-accent/10 text-accent border-accent/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
};

export function AdminPlaylistsManager({ toast }: { toast: any }) {
  const { playlists, loading } = usePlaylists();
  const { courses } = useCourses();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<FirestorePlaylist | null>(null);
  const [search, setSearch] = useState("");

  const emptyForm = {
    title: "", description: "", coverImage: "", price: 0, isFree: false, courseIds: [] as string[], qrCodeUrl: "",
  };
  const [form, setForm] = useState(emptyForm);

  const handleSave = async () => {
    if (!form.title) return;
    try {
      if (editing) {
        await updatePlaylist(editing.id, form);
        toast({ title: "Playlist updated!" });
        setEditing(null);
      } else {
        await addPlaylist(form as any);
        toast({ title: "Playlist created!" });
      }
      setShowForm(false);
      setForm(emptyForm);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleEdit = (p: FirestorePlaylist) => {
    setEditing(p);
    setForm({
      title: p.title, description: p.description, coverImage: p.coverImage,
      price: p.price, isFree: p.isFree || false, courseIds: p.courseIds || [], qrCodeUrl: p.qrCodeUrl || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePlaylist(id);
      toast({ title: "Playlist deleted" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const toggleCourse = (courseId: string) => {
    setForm((prev) => ({
      ...prev,
      courseIds: prev.courseIds.includes(courseId)
        ? prev.courseIds.filter((id) => id !== courseId)
        : [...prev.courseIds, courseId],
    }));
  };

  const filtered = playlists.filter((p) =>
    !search || p.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold">Manage Playlists</h1>
        <Button variant="hero" onClick={() => { setEditing(null); setForm(emptyForm); setShowForm(true); }} className="hover:scale-105 transition-transform">
          <Plus className="h-4 w-4 mr-1" /> Add Playlist
        </Button>
      </div>
      <div className="relative max-w-md mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search playlists..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {showForm && (
        <div className="mb-8 rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-semibold">{editing ? "Edit Playlist" : "New Playlist"}</h2>
            <button onClick={() => { setShowForm(false); setEditing(null); }}><X className="h-5 w-5 text-muted-foreground" /></button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Playlist title" className="mt-1" /></div>
            <div><Label>Price (ETB)</Label><Input type="number" value={form.price || ""} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} placeholder="999" className="mt-1" /></div>
            <div><Label>Cover Image URL</Label><Input value={form.coverImage} onChange={(e) => setForm({ ...form, coverImage: e.target.value })} placeholder="https://..." className="mt-1" /></div>
            <div><Label>Telebirr QR Code URL</Label><Input value={form.qrCodeUrl} onChange={(e) => setForm({ ...form, qrCodeUrl: e.target.value })} placeholder="https://...qr-code.png" className="mt-1" /></div>
            <div className="sm:col-span-2"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Playlist description..." className="mt-1" /></div>
            <div className="sm:col-span-2 flex items-center gap-2">
              <Checkbox checked={form.isFree} onCheckedChange={(checked) => setForm({ ...form, isFree: !!checked })} id="playlist-free" />
              <Label htmlFor="playlist-free" className="cursor-pointer">Free Playlist (no payment required)</Label>
            </div>
            <div className="sm:col-span-2">
              <Label className="mb-2 block">Assign Courses</Label>
              <div className="grid gap-2 sm:grid-cols-2 max-h-60 overflow-y-auto rounded-lg border border-border p-3">
                {courses.map((c) => (
                  <div key={c.id} className="flex items-center gap-2">
                    <Checkbox checked={form.courseIds.includes(c.id)} onCheckedChange={() => toggleCourse(c.id)} id={`course-${c.id}`} />
                    <Label htmlFor={`course-${c.id}`} className="cursor-pointer text-sm">{c.title}</Label>
                  </div>
                ))}
                {courses.length === 0 && <p className="text-sm text-muted-foreground">No courses available.</p>}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{form.courseIds.length} course(s) selected</p>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button variant="hero" onClick={handleSave} className="hover:scale-105 transition-transform">
              {editing ? "Update Playlist" : "Save Playlist"}
            </Button>
            <Button variant="outline" onClick={() => { setShowForm(false); setEditing(null); }}>Cancel</Button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary">
              <tr>
                <th className="text-left p-3 font-medium">Title</th>
                <th className="text-left p-3 font-medium">Courses</th>
                <th className="text-left p-3 font-medium">Price</th>
                <th className="text-left p-3 font-medium">Free</th>
                <th className="text-left p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-t border-border hover:bg-secondary/50 transition-colors">
                  <td className="p-3 font-medium">{p.title}</td>
                  <td className="p-3"><Badge variant="secondary">{p.courseIds?.length || 0} courses</Badge></td>
                  <td className="p-3">{p.isFree ? <Badge className="bg-accent/10 text-accent border-accent/20">Free</Badge> : `${p.price} ETB`}</td>
                  <td className="p-3">{p.isFree ? "✅" : "—"}</td>
                  <td className="p-3">
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => handleEdit(p)} className="hover:bg-primary/10 transition-colors">
                        <Edit className="h-4 w-4 text-primary" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDelete(p.id)} className="hover:bg-destructive/10 transition-colors">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No playlists yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function AdminPlaylistPayments({ toast }: { toast: any }) {
  const { requests, loading } = usePlaylistPaymentRequests();
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  const pendingCount = requests.filter((r) => r.status === "pending").length;

  const filtered = requests
    .filter((r) => statusFilter === "all" || r.status === statusFilter)
    .filter((r) => !search || r.transactionId?.toLowerCase().includes(search.toLowerCase()) || r.userName?.toLowerCase().includes(search.toLowerCase()) || r.userEmail?.toLowerCase().includes(search.toLowerCase()));

  const handleApprove = async (req: any) => {
    try {
      await approvePlaylistPayment(req.id, req.userId, req.playlistId);
      toast({ title: "Payment approved! All playlist courses unlocked." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleReject = async (id: string) => {
    try {
      await rejectPlaylistPayment(id);
      toast({ title: "Payment rejected" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleDeletePayment = async (id: string) => {
    try {
      await deletePlaylistPaymentRequest(id);
      toast({ title: "Payment request deleted" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-6">Playlist Payment Requests</h1>
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name, email or transaction ID..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex gap-2">
          {["all", "pending", "approved", "rejected"].map((s) => (
            <Button key={s} size="sm" variant={statusFilter === s ? "default" : "outline"} onClick={() => setStatusFilter(s)} className="capitalize hover:scale-105 transition-transform">
              {s} {s === "pending" && pendingCount > 0 && `(${pendingCount})`}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary">
              <tr>
                <th className="text-left p-3 font-medium">User</th>
                <th className="text-left p-3 font-medium">Playlist</th>
                <th className="text-left p-3 font-medium">Transaction ID</th>
                <th className="text-left p-3 font-medium">Status</th>
                <th className="text-left p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((req) => (
                <tr key={req.id} className="border-t border-border hover:bg-secondary/50 transition-colors">
                  <td className="p-3">
                    <p className="font-medium">{req.userName}</p>
                    <p className="text-xs text-muted-foreground">{req.userEmail}</p>
                  </td>
                  <td className="p-3 font-medium">{req.playlistTitle}</td>
                  <td className="p-3"><span className="font-mono tracking-wider text-foreground">{req.transactionId || "—"}</span></td>
                  <td className="p-3"><Badge className={`${STATUS_COLORS[req.status]} capitalize`}>{req.status}</Badge></td>
                  <td className="p-3">
                    <div className="flex gap-1">
                      {req.status === "pending" && (
                        <>
                          <Button size="icon" variant="ghost" onClick={() => handleApprove(req)} title="Approve" className="hover:bg-accent/10 hover:text-accent transition-colors">
                            <CheckCircle className="h-4 w-4 text-accent" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => handleReject(req.id)} title="Reject" className="hover:bg-destructive/10 hover:text-destructive transition-colors">
                            <XCircle className="h-4 w-4 text-destructive" />
                          </Button>
                        </>
                      )}
                      <Button size="icon" variant="ghost" onClick={() => handleDeletePayment(req.id)} title="Delete" className="hover:bg-destructive/10 transition-colors">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No playlist payment requests found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

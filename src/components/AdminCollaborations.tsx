import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  useCollaborations, addCollaboration, updateCollaboration, deleteCollaboration,
  type FirestoreCollaboration,
} from "@/hooks/useFirestore";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Edit, X, Loader2, Search, Handshake } from "lucide-react";

const PLATFORM_TYPES = ["TikToker", "YouTuber", "Company", "Influencer"];

const emptyForm = { name: "", description: "", imageUrl: "", badgeUrl: "", platformType: "Influencer" };

export default function AdminCollaborations() {
  const { collaborations, loading } = useCollaborations();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<FirestoreCollaboration | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);

  const filtered = collaborations.filter((c) =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.platformType.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setForm(emptyForm); setEditing(null); setShowForm(true); };
  const openEdit = (c: FirestoreCollaboration) => {
    setForm({ name: c.name, description: c.description, imageUrl: c.imageUrl, badgeUrl: c.badgeUrl, platformType: c.platformType });
    setEditing(c);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast({ title: "Name required", variant: "destructive" }); return; }
    setSaving(true);
    try {
      if (editing) {
        await updateCollaboration(editing.id, form);
        toast({ title: "Collaboration updated" });
      } else {
        await addCollaboration(form as any);
        toast({ title: "Collaboration added" });
      }
      setShowForm(false);
      setEditing(null);
      setForm(emptyForm);
    } catch { toast({ title: "Error saving", variant: "destructive" }); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this collaboration?")) return;
    await deleteCollaboration(id);
    toast({ title: "Deleted" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Handshake className="h-6 w-6 text-accent" />
          <h2 className="text-xl font-display font-bold">Collaborations</h2>
          <Badge variant="secondary">{collaborations.length}</Badge>
        </div>
        <Button variant="hero" size="sm" onClick={openAdd}><Plus className="h-4 w-4 mr-1" /> Add</Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search collaborations..." className="pl-9" />
      </div>

      {showForm && (
        <div className="border border-border rounded-xl p-6 bg-card space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">{editing ? "Edit" : "Add"} Collaboration</h3>
            <Button variant="ghost" size="icon" onClick={() => setShowForm(false)}><X className="h-4 w-4" /></Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1" /></div>
            <div><Label>Platform Type</Label>
              <select value={form.platformType} onChange={(e) => setForm({ ...form, platformType: e.target.value })} className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                {PLATFORM_TYPES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="md:col-span-2"><Label>Short Description</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1" /></div>
            <div><Label>Profile Image URL</Label><Input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} className="mt-1" placeholder="https://..." /></div>
            <div><Label>Badge / Logo URL</Label><Input value={form.badgeUrl} onChange={(e) => setForm({ ...form, badgeUrl: e.target.value })} className="mt-1" placeholder="https://..." /></div>
          </div>
          <Button variant="hero" onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin mr-1" />} {editing ? "Update" : "Add"}
          </Button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-accent" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">No collaborations yet.</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <div key={c.id} className="border border-border rounded-xl bg-card p-4 flex gap-4 items-start group hover:border-accent/30 transition-all">
              {c.imageUrl && <img src={c.imageUrl} alt={c.name} className="h-14 w-14 rounded-full object-cover border border-border" />}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold truncate">{c.name}</span>
                  <Badge variant="secondary" className="text-[10px]">{c.platformType}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{c.description}</p>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(c)}><Edit className="h-3.5 w-3.5" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(c.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

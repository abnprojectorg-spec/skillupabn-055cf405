import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useNewsPosts, addNewsPost, deleteNewsPost, type NewsPost } from "@/hooks/useNews";
import { Plus, Trash2, X, Loader2, Newspaper, Heart, MessageSquare } from "lucide-react";

export default function AdminNews({ toast }: { toast: any }) {
  const { posts, loading } = useNewsPosts();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", imageUrl: "" });

  const handleSave = async () => {
    if (!form.title.trim()) return;
    try {
      await addNewsPost(form);
      toast({ title: "News published!" });
      setForm({ title: "", content: "", imageUrl: "" });
      setShowAdd(false);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNewsPost(id);
      toast({ title: "Post deleted" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold">News & Updates</h1>
        <Button variant="hero" onClick={() => setShowAdd(true)} className="hover:scale-105 transition-transform">
          <Plus className="h-4 w-4 mr-1" /> Publish News
        </Button>
      </div>

      {showAdd && (
        <div className="mb-8 rounded-2xl border border-border bg-card p-6 max-w-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-semibold">New Post</h2>
            <button onClick={() => setShowAdd(false)}><X className="h-5 w-5 text-muted-foreground" /></button>
          </div>
          <div className="space-y-4">
            <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Post title" className="mt-1" /></div>
            <div><Label>Image URL</Label><Input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://...image.jpg" className="mt-1" /></div>
            <div><Label>Content</Label><Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Write your news content..." rows={6} className="mt-1" /></div>
            <div className="flex gap-2">
              <Button variant="hero" onClick={handleSave}>Publish</Button>
              <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16">
          <Newspaper className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
          <p className="text-muted-foreground">No news posts yet. Publish your first update!</p>
        </div>
      ) : (
        <div className="space-y-4 max-w-2xl">
          {posts.map((post) => (
            <div key={post.id} className="rounded-xl border border-border bg-card overflow-hidden">
              {post.imageUrl && (
                <img src={post.imageUrl} alt={post.title} className="w-full h-40 object-cover" />
              )}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-display font-semibold">{post.title}</h3>
                  <Button size="icon" variant="ghost" onClick={() => handleDelete(post.id)} className="hover:bg-destructive/10 shrink-0">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{post.content}</p>
                <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Heart className="h-3 w-3" /> {post.likes?.length || 0} likes</span>
                  <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" /> {post.comments?.length || 0} comments</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

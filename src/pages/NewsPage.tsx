import { useState } from "react";
import Navbar from "@/components/Navbar";
import { useNewsPosts, toggleLike, addComment, type NewsComment } from "@/hooks/useNews";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageSquare, Loader2, Newspaper, Send } from "lucide-react";
import ContactAdminButton from "@/components/ContactAdminButton";

export default function NewsPage() {
  const { posts, loading } = useNewsPosts();
  const { user, profile } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-12 px-4 max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Newspaper className="h-7 w-7 text-primary" />
          <h1 className="font-display text-3xl font-bold">News & Updates</h1>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16">
            <Newspaper className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
            <p className="text-muted-foreground">No news yet. Check back soon!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <NewsCard key={post.id} post={post} userId={user?.uid} userName={profile?.full_name || user?.displayName || "User"} />
            ))}
          </div>
        )}
      </div>
      <ContactAdminButton />
    </div>
  );
}

function NewsCard({ post, userId, userName }: { post: ReturnType<typeof useNewsPosts>["posts"][0]; userId?: string; userName: string }) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [sending, setSending] = useState(false);

  const isLiked = userId ? post.likes?.includes(userId) : false;
  const likeCount = post.likes?.length || 0;
  const commentCount = post.comments?.length || 0;

  const handleLike = async () => {
    if (!userId) return;
    await toggleLike(post.id, userId, isLiked);
  };

  const handleComment = async () => {
    if (!userId || !commentText.trim() || sending) return;
    setSending(true);
    const comment: NewsComment = {
      userId,
      userName,
      text: commentText.trim(),
      createdAt: Date.now(),
    };
    await addComment(post.id, comment);
    setCommentText("");
    setSending(false);
  };

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/20 transition-colors">
      {post.imageUrl && (
        <img src={post.imageUrl} alt={post.title} className="w-full h-56 object-cover" />
      )}
      <div className="p-5">
        <h2 className="font-display text-lg font-bold mb-2">{post.title}</h2>
        <p className="text-sm text-muted-foreground whitespace-pre-wrap mb-4">{post.content}</p>

        {/* Actions */}
        <div className="flex items-center gap-4 border-t border-border pt-3">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 text-sm transition-colors ${
              isLiked ? "text-destructive" : "text-muted-foreground hover:text-destructive"
            }`}
            disabled={!userId}
          >
            <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
            {likeCount}
          </button>
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <MessageSquare className="h-4 w-4" />
            {commentCount}
          </button>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-4 space-y-3">
            {post.comments?.length > 0 ? (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {post.comments.map((c, i) => (
                  <div key={i} className="rounded-lg bg-secondary/50 p-3">
                    <p className="text-xs font-semibold text-foreground">{c.userName}</p>
                    <p className="text-sm text-muted-foreground">{c.text}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">No comments yet.</p>
            )}

            {userId && (
              <div className="flex gap-2">
                <Input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1 text-sm"
                  onKeyDown={(e) => e.key === "Enter" && handleComment()}
                />
                <Button size="icon" variant="hero" onClick={handleComment} disabled={sending || !commentText.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

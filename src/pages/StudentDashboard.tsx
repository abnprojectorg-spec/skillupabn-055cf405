import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import CourseCard from "@/components/CourseCard";
import { useAuth } from "@/contexts/AuthContext";
import { useCourses, useEnrollments, useCommunityLinks, useEbooks, useDigitalFiles, useUserEbookPurchases, useUserFilePurchases } from "@/hooks/useFirestore";
import { useNewsPosts, toggleLike, addComment, type NewsComment } from "@/hooks/useNews";
import { COMMUNITY_LINKS } from "@/data/mockData";
import {
  Home, BookOpen, FolderOpen, Users, User, Award, ExternalLink, GraduationCap, Loader2, Newspaper, Heart, MessageSquare, Send, BookMarked, Download,
} from "lucide-react";
import ContactAdminButton from "@/components/ContactAdminButton";
import NotificationBell from "@/components/NotificationBell";
const TABS = [
  { id: "home", label: "Home", icon: Home },
  { id: "courses", label: "My Courses", icon: BookOpen },
  { id: "ebooks", label: "My Ebooks", icon: BookMarked },
  { id: "files", label: "My Files", icon: FolderOpen },
  { id: "news", label: "News", icon: Newspaper },
  { id: "community", label: "Community", icon: Users },
  { id: "profile", label: "Profile", icon: User },
];

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState("home");
  const { user, profile, loading: authLoading } = useAuth();
  const { courses, loading: coursesLoading } = useCourses();
  const { enrollments, loading: enrollLoading } = useEnrollments(user?.uid);
  const { links: communityLinks, loading: linksLoading } = useCommunityLinks();
  const { posts: newsPosts, loading: newsLoading } = useNewsPosts();
  const { ebooks, loading: ebooksLoading } = useEbooks();
  const { files: digitalFiles, loading: filesLoading } = useDigitalFiles();
  const { purchases: ebookPurchases, loading: ebookPurchLoading } = useUserEbookPurchases(user?.uid);
  const { purchases: filePurchases, loading: filePurchLoading } = useUserFilePurchases(user?.uid);
  const navigate = useNavigate();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <GraduationCap className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
            <h1 className="font-display text-2xl font-bold mb-2">Sign in to access your dashboard</h1>
            <Link to="/login"><Button variant="hero">Log In</Button></Link>
          </div>
        </div>
      </div>
    );
  }

  const enrolledCourseIds = new Set(enrollments.map((e) => e.courseId));
  const enrolledCourses = courses.filter((c) => enrolledCourseIds.has(c.id));
  const purchasedEbookIds = new Set(ebookPurchases.map((p) => p.ebookId));
  const purchasedEbooks = ebooks.filter((e) => purchasedEbookIds.has(e.id));
  const purchasedFileIds = new Set(filePurchases.map((p) => p.fileId));
  const purchasedFiles = digitalFiles.filter((f) => purchasedFileIds.has(f.id));
  const displayName = profile?.full_name || user.displayName || "Student";
  const initials = displayName.split(" ").map((n) => n[0]).join("").slice(0, 2);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden md:flex w-64 flex-col border-r border-border bg-card min-h-screen p-4 sticky top-0">
          <div className="flex items-center justify-between p-3 mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full gradient-primary text-sm font-bold text-primary-foreground">
                {initials}
              </div>
              <div>
                <p className="text-sm font-semibold">{displayName}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <NotificationBell userId={user.uid} />
          </div>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200 mb-1 ${
                activeTab === tab.id ? "bg-primary text-primary-foreground shadow-glow" : "text-muted-foreground hover:bg-secondary"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </aside>

        {/* Mobile tabs */}
        <div className="fixed bottom-0 left-0 right-0 z-50 flex border-t border-border bg-card md:hidden">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-1 flex-col items-center gap-1 py-3 text-xs transition-colors ${
                activeTab === tab.id ? "text-accent" : "text-muted-foreground"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <main className="flex-1 p-6 pb-24 md:pb-6">
          {activeTab === "home" && (
            <div>
              <h1 className="font-display text-2xl font-bold mb-1">Welcome back, {displayName.split(" ")[0]}!</h1>
              <p className="text-muted-foreground mb-8">Continue your learning journey</p>
              <div className="grid gap-4 sm:grid-cols-3 mb-8">
                <div className="rounded-xl border border-border bg-card p-5 hover:border-primary/30 transition-colors">
                  <BookOpen className="h-5 w-5 text-primary mb-2" />
                  <p className="font-display text-2xl font-bold">{enrolledCourses.length}</p>
                  <p className="text-sm text-muted-foreground">Enrolled Courses</p>
                </div>
                <div className="rounded-xl border border-border bg-card p-5 hover:border-accent/30 transition-colors">
                  <Award className="h-5 w-5 text-accent mb-2" />
                  <p className="font-display text-2xl font-bold">{enrolledCourses.length}</p>
                  <p className="text-sm text-muted-foreground">Certificates</p>
                </div>
                <div className="rounded-xl border border-border bg-card p-5 hover:border-warning/30 transition-colors">
                  <GraduationCap className="h-5 w-5 text-warning mb-2" />
                  <p className="font-display text-2xl font-bold">{courses.length}</p>
                  <p className="text-sm text-muted-foreground">Available Courses</p>
                </div>
              </div>
              <h2 className="font-display text-lg font-semibold mb-4">Browse All Courses</h2>
              {coursesLoading ? (
                <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
              ) : courses.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {courses.slice(0, 6).map((c) => (
                    <CourseCard key={c.id} course={c} isUnlocked={enrolledCourseIds.has(c.id)} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No courses available yet. Check back soon!</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "courses" && (
            <div>
              <h1 className="font-display text-2xl font-bold mb-6">My Courses</h1>
              {enrollLoading ? (
                <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
              ) : enrolledCourses.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {enrolledCourses.map((c) => <CourseCard key={c.id} course={c} isUnlocked />)}
                </div>
              ) : (
                <div className="py-16 text-center">
                  <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground mb-4">You haven't enrolled in any courses yet.</p>
                  <Link to="/marketplace"><Button variant="hero">Browse Courses</Button></Link>
                </div>
              )}
            </div>
          )}

          {activeTab === "ebooks" && (
            <div>
              <h1 className="font-display text-2xl font-bold mb-6">My Ebooks</h1>
              {ebookPurchLoading || ebooksLoading ? (
                <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
              ) : purchasedEbooks.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {purchasedEbooks.map((ebook) => (
                    <Link key={ebook.id} to={`/ebook/${ebook.id}`} className="group">
                      <div className="rounded-xl border border-border bg-card overflow-hidden hover:border-primary/30 hover:shadow-glow transition-all duration-300">
                        <div className="aspect-[3/4] overflow-hidden bg-secondary">
                          <img src={ebook.coverImage || "/placeholder.svg"} alt={ebook.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        </div>
                        <div className="p-4">
                          <h3 className="font-display font-semibold text-sm mb-1 line-clamp-2 group-hover:text-accent transition-colors">{ebook.title}</h3>
                          <p className="text-xs text-muted-foreground mb-2">by {ebook.author}</p>
                          <Badge variant="secondary" className="text-xs">{ebook.pages} pages</Badge>
                          <div className="mt-3">
                            <Button size="sm" variant="secondary" className="w-full text-xs">
                              <BookMarked className="h-3 w-3 mr-1" /> Read Now
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="py-16 text-center">
                  <BookMarked className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground mb-4">No ebooks purchased yet.</p>
                  <Link to="/ebooks"><Button variant="hero">Browse Ebooks</Button></Link>
                </div>
              )}
            </div>
          )}

          {activeTab === "files" && (
            <div>
              <h1 className="font-display text-2xl font-bold mb-6">My Files</h1>
              {filePurchLoading || filesLoading ? (
                <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
              ) : purchasedFiles.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {purchasedFiles.map((file) => (
                    <Link key={file.id} to={`/file/${file.id}`} className="group">
                      <div className="rounded-xl border border-border bg-card overflow-hidden hover:border-primary/30 hover:shadow-glow transition-all duration-300">
                        <div className="aspect-video overflow-hidden bg-secondary">
                          <img src={file.coverImage || "/placeholder.svg"} alt={file.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        </div>
                        <div className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary" className="text-xs">{file.category}</Badge>
                            <Badge variant="outline" className="text-xs">{file.fileType}</Badge>
                          </div>
                          <h3 className="font-display font-semibold text-sm mb-1 line-clamp-2 group-hover:text-accent transition-colors">{file.title}</h3>
                          <p className="text-xs text-muted-foreground mb-3">by {file.developer}</p>
                          <Button size="sm" variant="secondary" className="w-full text-xs">
                            <Download className="h-3 w-3 mr-1" /> Access File
                          </Button>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="py-16 text-center">
                  <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground mb-4">No files purchased yet.</p>
                  <Link to="/files"><Button variant="hero">Browse Files</Button></Link>
                </div>
              )}
            </div>
          )}

          {activeTab === "news" && (
            <div>
              <h1 className="font-display text-2xl font-bold mb-6">News & Updates</h1>
              {newsLoading ? (
                <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
              ) : newsPosts.length === 0 ? (
                <div className="text-center py-16">
                  <Newspaper className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                  <p className="text-muted-foreground">No news yet. Check back soon!</p>
                </div>
              ) : (
                <div className="space-y-6 max-w-2xl">
                  {newsPosts.map((post) => (
                    <DashboardNewsCard key={post.id} post={post} userId={user?.uid} userName={displayName} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "community" && (
            <div>
              <h1 className="font-display text-2xl font-bold mb-2">Community</h1>
              <p className="text-muted-foreground mb-6">Join Telegram groups for each category</p>
              {linksLoading ? (
                <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {/* Show Firestore links first, fall back to hardcoded */}
                  {(communityLinks.length > 0 ? communityLinks : COMMUNITY_LINKS).map((c) => (
                    <a key={c.category} href={c.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between rounded-xl border border-border bg-card p-4 hover:border-accent/30 hover:shadow-glow transition-all duration-300">
                      <span className="text-sm font-medium">{c.category}</span>
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "profile" && (
            <div>
              <h1 className="font-display text-2xl font-bold mb-6">Profile</h1>
              <div className="rounded-2xl border border-border bg-card p-8 max-w-lg">
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full gradient-primary text-xl font-bold text-primary-foreground">
                    {initials}
                  </div>
                  <div>
                    <h2 className="font-display text-lg font-semibold">{displayName}</h2>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Courses enrolled</span>
                    <span>{enrolledCourses.length}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Certificates</span>
                    <Badge variant="secondary">{enrolledCourses.length}</Badge>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
      <Footer />
      <ContactAdminButton />
    </div>
  );
};

function DashboardNewsCard({ post, userId, userName }: { post: ReturnType<typeof useNewsPosts>["posts"][0]; userId?: string; userName: string }) {
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
    const comment: NewsComment = { userId, userName, text: commentText.trim(), createdAt: Date.now() };
    await addComment(post.id, comment);
    setCommentText("");
    setSending(false);
  };

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/20 transition-colors">
      {post.imageUrl && <img src={post.imageUrl} alt={post.title} className="w-full h-56 object-cover" />}
      <div className="p-5">
        <h2 className="font-display text-lg font-bold mb-2">{post.title}</h2>
        <p className="text-sm text-muted-foreground whitespace-pre-wrap mb-4">{post.content}</p>
        <div className="flex items-center gap-4 border-t border-border pt-3">
          <button onClick={handleLike} className={`flex items-center gap-1.5 text-sm transition-colors ${isLiked ? "text-destructive" : "text-muted-foreground hover:text-destructive"}`} disabled={!userId}>
            <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} /> {likeCount}
          </button>
          <button onClick={() => setShowComments(!showComments)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
            <MessageSquare className="h-4 w-4" /> {commentCount}
          </button>
        </div>
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
                <Input value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Write a comment..." className="flex-1 text-sm" onKeyDown={(e) => e.key === "Enter" && handleComment()} />
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

export default StudentDashboard;

import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  usePlaylist, useCourses, useEnrollments, useAdminSettings,
  useUserPlaylistPayments, submitPlaylistPaymentRequest, enrollFreePlaylist,
} from "@/hooks/useFirestore";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft, CheckCircle, Loader2, Download, Play, X, HelpCircle,
  BookOpen, ListMusic,
} from "lucide-react";

const TRANSACTION_ID_REGEX = /^[A-Za-z0-9]+$/;

const getYouTubeEmbedUrl = (url: string): string => {
  if (!url) return "";
  const iframeSrcMatch = url.match(/src=["']([^"']+)["']/);
  if (iframeSrcMatch) return iframeSrcMatch[1];
  if (url.includes("/embed/")) return url;
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`;
  const longMatch = url.match(/[?&]v=([a-zA-Z0-9_-]+)/);
  if (longMatch) return `https://www.youtube.com/embed/${longMatch[1]}`;
  return url;
};

const PlaylistDetailPage = () => {
  const { id } = useParams();
  const { playlist, loading } = usePlaylist(id);
  const { courses } = useCourses();
  const { user, profile } = useAuth();
  const { enrollments } = useEnrollments(user?.uid);
  const { settings } = useAdminSettings();
  const { payments } = useUserPlaylistPayments(user?.uid);
  const { toast } = useToast();

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [transactionId, setTransactionId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [txError, setTxError] = useState("");

  const playlistCourses = courses.filter((c) => playlist?.courseIds?.includes(c.id));
  const enrolledCourseIds = new Set(enrollments.map((e) => e.courseId));
  const allEnrolled = playlistCourses.length > 0 && playlistCourses.every((c) => enrolledCourseIds.has(c.id));
  const enrolledCount = playlistCourses.filter((c) => enrolledCourseIds.has(c.id)).length;

  const existingPayment = payments.find(
    (p) => p.playlistId === id && (p.status === "pending" || p.status === "approved")
  );

  const handleEnrollFree = async () => {
    if (!user || !id) {
      toast({ title: "Please log in first", variant: "destructive" });
      return;
    }
    try {
      await enrollFreePlaylist(user.uid, id);
      toast({ title: "All courses unlocked! 🎉" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleTransactionIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleaned = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    setTransactionId(cleaned);
    setTxError("");
  };

  const handleSubmitPayment = async () => {
    if (!transactionId.trim()) { setTxError("Transaction ID is required."); return; }
    if (!TRANSACTION_ID_REGEX.test(transactionId.trim())) { setTxError("Only letters and numbers allowed."); return; }
    if (transactionId.trim().length < 4) { setTxError("Transaction ID is too short."); return; }
    if (!user || !playlist || !id) { toast({ title: "Please log in first", variant: "destructive" }); return; }

    setSubmitting(true);
    try {
      await submitPlaylistPaymentRequest({
        userId: user.uid, userEmail: user.email || "",
        userName: profile?.full_name || user.displayName || "",
        playlistId: id, playlistTitle: playlist.title, transactionId: transactionId.trim(),
      });
      setSubmitted(true);
      toast({ title: "Transaction ID submitted!" });
    } catch (err: any) {
      toast({ title: "Error submitting", description: err?.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const resetModal = () => { setShowPaymentModal(false); setSubmitted(false); setTransactionId(""); setTxError(""); };

  const handleDownloadQR = () => {
    if (!playlist?.qrCodeUrl) return;
    const link = document.createElement("a");
    link.href = playlist.qrCodeUrl;
    link.download = `${playlist.title}-qr.png`;
    link.target = "_blank";
    link.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex min-h-screen items-center justify-center pt-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex min-h-screen items-center justify-center pt-16">
          <div className="text-center">
            <h1 className="font-display text-2xl font-bold mb-2">Playlist Not Found</h1>
            <Link to="/marketplace"><Button variant="outline">Back to Courses</Button></Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link to="/marketplace" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-accent transition-colors mb-6">
            <ArrowLeft className="h-4 w-4" /> Back to Courses
          </Link>

          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 flex items-center gap-1 w-fit">
                <ListMusic className="h-3 w-3" /> Playlist
              </Badge>
              <h1 className="font-display text-3xl font-bold mb-3">{playlist.title}</h1>
              <p className="text-muted-foreground mb-6 leading-relaxed">{playlist.description}</p>

              {playlist.coverImage && (
                <div className="aspect-video overflow-hidden rounded-xl bg-card border border-border mb-8">
                  <img src={playlist.coverImage} alt={playlist.title} className="h-full w-full object-cover" />
                </div>
              )}

              <h2 className="font-display text-xl font-semibold mb-4">
                Courses in this Playlist ({playlistCourses.length})
              </h2>
              <div className="space-y-3">
                {playlistCourses.map((c) => {
                  const isUnlocked = enrolledCourseIds.has(c.id);
                  return (
                    <Link key={c.id} to={isUnlocked ? `/learn/${c.id}` : `/course/${c.id}`}
                      className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 hover:border-accent/30 hover:shadow-glow transition-all"
                    >
                      <div className="h-16 w-24 rounded-lg overflow-hidden bg-secondary shrink-0">
                        <img src={c.thumbnail || "/placeholder.svg"} alt={c.title} className="h-full w-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display font-semibold text-sm line-clamp-1">{c.title}</h3>
                        <p className="text-xs text-muted-foreground">{c.instructor} · {c.lessons} lessons</p>
                      </div>
                      {isUnlocked ? (
                        <Badge className="bg-accent/10 text-accent border-accent/20 shrink-0"><CheckCircle className="h-3 w-3 mr-1" /> Unlocked</Badge>
                      ) : (
                        <Badge variant="secondary" className="shrink-0">Locked</Badge>
                      )}
                    </Link>
                  );
                })}
                {playlistCourses.length === 0 && (
                  <p className="text-muted-foreground text-sm">No courses assigned to this playlist yet.</p>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 rounded-2xl border border-border bg-card p-6">
                <div className="text-center mb-4">
                  {playlist.isFree ? (
                    <p className="font-display text-3xl font-bold text-accent">FREE</p>
                  ) : (
                    <>
                      <p className="font-display text-3xl font-bold text-gradient-glow">{playlist.price} ETB</p>
                      <p className="text-sm text-muted-foreground mt-1">Unlock all {playlistCourses.length} courses</p>
                    </>
                  )}
                </div>

                {/* Progress */}
                {playlistCourses.length > 0 && (
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Progress</span>
                      <span>{enrolledCount}/{playlistCourses.length} unlocked</span>
                    </div>
                    <div className="h-2 rounded-full bg-secondary overflow-hidden">
                      <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${(enrolledCount / playlistCourses.length) * 100}%` }} />
                    </div>
                  </div>
                )}

                {allEnrolled ? (
                  <div className="mb-3 rounded-lg border border-accent/30 bg-accent/5 p-4 text-center">
                    <CheckCircle className="h-6 w-6 mx-auto mb-2 text-accent" />
                    <p className="text-sm font-medium text-accent">All Courses Unlocked!</p>
                  </div>
                ) : playlist.isFree ? (
                  <Button variant="hero" size="lg" className="w-full mb-3 shadow-glow hover:scale-105 transition-transform" onClick={handleEnrollFree}>
                    <CheckCircle className="h-4 w-4 mr-1" /> Enroll for Free
                  </Button>
                ) : existingPayment?.status === "pending" ? (
                  <div className="mb-3 rounded-lg border border-warning/30 bg-warning/5 p-4 text-center">
                    <p className="text-sm font-medium text-warning">⏳ Payment Under Review</p>
                    <p className="text-xs text-muted-foreground mt-1">Verification may take up to 5 hours.</p>
                  </div>
                ) : (
                  <Button variant="hero" size="lg" className="w-full mb-3 shadow-glow hover:scale-105 transition-transform"
                    onClick={() => {
                      if (!user) { toast({ title: "Please log in first", variant: "destructive" }); return; }
                      setShowPaymentModal(true);
                    }}
                  >
                    Pay with Telebirr
                  </Button>
                )}

                {settings.howToPayVideoUrl && !allEnrolled && !playlist.isFree && (
                  <Button variant="outline" size="sm" className="w-full mb-3 hover:border-accent/50 transition-colors" onClick={() => setShowVideoModal(true)}>
                    <HelpCircle className="h-4 w-4 mr-1" /> How to Pay
                  </Button>
                )}

                {playlist.qrCodeUrl && !allEnrolled && !playlist.isFree && (
                  <div className="mt-4 rounded-xl border border-border bg-secondary/30 p-4">
                    <p className="text-xs font-medium text-center mb-3">Scan QR to pay via Telebirr</p>
                    <div className="flex justify-center mb-3">
                      <img src={playlist.qrCodeUrl} alt="QR Code" className="w-48 h-48 rounded-lg border border-border object-contain bg-foreground/5" />
                    </div>
                    <Button variant="outline" size="sm" className="w-full hover:border-accent/50 transition-colors" onClick={handleDownloadQR}>
                      <Download className="h-4 w-4 mr-1" /> Download QR Code
                    </Button>
                  </div>
                )}

                <hr className="my-5 border-border" />
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2"><BookOpen className="h-4 w-4" /> {playlistCourses.length} courses included</li>
                  <li className="flex items-center gap-2"><ListMusic className="h-4 w-4" /> One payment, full access</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-lg animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-bold">Enter Transaction ID</h2>
              <button onClick={resetModal}><X className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" /></button>
            </div>
            {submitted ? (
              <div className="text-center py-8">
                <CheckCircle className="h-16 w-16 mx-auto mb-4 text-accent" />
                <h3 className="font-display text-lg font-semibold mb-2">Transaction ID Submitted!</h3>
                <p className="text-sm text-muted-foreground">Verification may take up to 5 hours. All courses will unlock once approved.</p>
                <Button variant="hero" className="mt-6" onClick={resetModal}>Done</Button>
              </div>
            ) : (
              <div className="space-y-5">
                {playlist.qrCodeUrl && (
                  <div className="text-center">
                    <p className="text-sm font-medium mb-1">Step 1: Scan QR & Pay {playlist.price} ETB</p>
                    <img src={playlist.qrCodeUrl} alt="QR Code" className="w-40 h-40 mx-auto rounded-lg border border-border object-contain" />
                    <Button variant="ghost" size="sm" className="mt-2" onClick={handleDownloadQR}><Download className="h-3 w-3 mr-1" /> Download QR</Button>
                  </div>
                )}
                <hr className="border-border" />
                <div>
                  <Label className="text-sm font-medium">Step 2: Enter your Transaction ID *</Label>
                  <p className="text-xs text-muted-foreground mt-1 mb-2">Find this in your Telebirr payment confirmation</p>
                  <Input value={transactionId} onChange={handleTransactionIdChange} placeholder="e.g. DC76ILX5RC" maxLength={20} className={`mt-1 font-mono tracking-wider uppercase ${txError ? "border-destructive" : ""}`} />
                  {txError && <p className="text-xs text-destructive mt-1">{txError}</p>}
                </div>
                <div className="rounded-lg border border-warning/30 bg-warning/5 p-3">
                  <p className="text-xs text-warning font-medium">⚠️ Important</p>
                  <p className="text-xs text-muted-foreground mt-1">Invalid or fake transaction IDs will be rejected.</p>
                </div>
                <Button variant="hero" size="lg" className="w-full shadow-glow" disabled={!transactionId.trim() || submitting} onClick={handleSubmitPayment}>
                  {submitting ? <><Loader2 className="h-4 w-4 animate-spin mr-1" /> Submitting...</> : "Submit Transaction ID"}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* How to Pay Video Modal */}
      {showVideoModal && settings.howToPayVideoUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-lg animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-bold flex items-center gap-2"><Play className="h-5 w-5 text-accent" /> How to Pay</h2>
              <button onClick={() => setShowVideoModal(false)}><X className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" /></button>
            </div>
            <div className="aspect-video rounded-xl overflow-hidden bg-secondary">
              <iframe src={getYouTubeEmbedUrl(settings.howToPayVideoUrl)} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title="How to Pay Tutorial" />
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default PlaylistDetailPage;

import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCourse, isEnrolled, enrollUser, submitPaymentRequest, useUserPayments, useAdminSettings } from "@/hooks/useFirestore";
import type { ReferralCode } from "@/hooks/useFirestore";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  Star, Users, Clock, BookOpen, ArrowLeft, CheckCircle, Loader2,
  Download, Play, X, HelpCircle,
} from "lucide-react";
import EmbedVideoPlayer from "@/components/EmbedVideoPlayer";
import ReferralCodeInput from "@/components/ReferralCodeInput";

const TRANSACTION_ID_REGEX = /^[A-Za-z0-9]+$/;

const CourseDetailPage = () => {
  const { id } = useParams();
  const { course, loading } = useCourse(id);
  const { user, profile } = useAuth();
  const { settings } = useAdminSettings();
  const [enrolled, setEnrolled] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [transactionId, setTransactionId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [txError, setTxError] = useState("");
  const [enrollingFree, setEnrollingFree] = useState(false);
  const { toast } = useToast();
  const { payments } = useUserPayments(user?.uid);

  useEffect(() => {
    if (user && id) {
      isEnrolled(user.uid, id).then(setEnrolled);
    }
  }, [user, id]);

  const existingPayment = payments.find(
    (p) => p.courseId === id && (p.status === "pending" || p.status === "approved")
  );

  // Use global howToPayVideoUrl from settings, fallback to per-course
  const howToPayVideoUrl = settings.howToPayVideoUrl || course?.howToPayVideoUrl || "";

  const handleEnrollFree = async () => {
    if (!user || !id) {
      toast({ title: "Please log in first", variant: "destructive" });
      return;
    }
    setEnrollingFree(true);
    try {
      await enrollUser(user.uid, id);
      setEnrolled(true);
      toast({ title: "Course unlocked! 🎉" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setEnrollingFree(false);
    }
  };

  const handleTransactionIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleaned = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    setTransactionId(cleaned);
    setTxError("");
  };

  const handleSubmitPayment = async () => {
    if (!transactionId.trim()) { setTxError("Transaction ID is required."); return; }
    if (!TRANSACTION_ID_REGEX.test(transactionId.trim())) { setTxError("Only letters (A-Z) and numbers (0-9) allowed."); return; }
    if (transactionId.trim().length < 4) { setTxError("Transaction ID is too short."); return; }
    if (!user || !course || !id) { toast({ title: "Please log in first", variant: "destructive" }); return; }

    setSubmitting(true);
    try {
      await submitPaymentRequest({
        userId: user.uid, userEmail: user.email || "",
        userName: profile?.full_name || user.displayName || "",
        courseId: id, courseTitle: course.title, transactionId: transactionId.trim(),
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
    if (!course?.qrCodeUrl) return;
    const link = document.createElement("a");
    link.href = course.qrCodeUrl;
    link.download = `${course.title}-telebirr-qr.png`;
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

  if (!course) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex min-h-screen items-center justify-center pt-16">
          <div className="text-center">
            <h1 className="font-display text-2xl font-bold mb-2">Course Not Found</h1>
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
              <div className="flex items-center gap-2 mb-4">
                <Badge className="bg-accent/10 text-accent border-accent/20">{course.category}</Badge>
                {course.isFree && <Badge className="bg-accent/90 text-accent-foreground">FREE</Badge>}
              </div>
              <h1 className="font-display text-3xl font-bold mb-3">{course.title}</h1>
              <p className="text-muted-foreground mb-4">by <span className="text-foreground font-medium">{course.instructor}</span></p>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
                <span className="flex items-center gap-1"><Star className="h-4 w-4 fill-warning text-warning" /> {course.rating}</span>
                <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {course.students} students</span>
                <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {course.duration}</span>
                <span className="flex items-center gap-1"><BookOpen className="h-4 w-4" /> {course.lessons} lessons</span>
              </div>

              {course.videoUrl ? (
                <div className="aspect-video overflow-hidden rounded-xl bg-card border border-border mb-8 shadow-lg">
                  <EmbedVideoPlayer embedCode={course.videoUrl} sourceType={course.videoSourceType || "youtube"} title={`${course.title} Preview`} />
                </div>
              ) : (
                <div className="aspect-video overflow-hidden rounded-xl bg-card border border-border mb-8">
                  <img src={course.thumbnail || "/placeholder.svg"} alt={course.title} className="h-full w-full object-cover" />
                </div>
              )}

              <h2 className="font-display text-xl font-semibold mb-3">About This Course</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">{course.description}</p>

              <h2 className="font-display text-xl font-semibold mb-3">What You'll Learn</h2>
              <div className="grid gap-2 sm:grid-cols-2 mb-6">
                {["Core fundamentals and theory", "Hands-on projects", "Real-world applications", "Career preparation", "Community access", "Certificate of completion"].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-accent shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 rounded-2xl border border-border bg-card p-6">
                <div className="text-center mb-6">
                  {course.isFree ? (
                    <p className="font-display text-3xl font-bold text-accent">FREE</p>
                  ) : (
                    <>
                      <p className="font-display text-3xl font-bold text-gradient-glow">{course.price} ETB</p>
                      <p className="text-sm text-muted-foreground mt-1">One-time payment</p>
                    </>
                  )}
                </div>

                {enrolled ? (
                  <Link to={`/learn/${id}`}>
                    <Button variant="hero" size="lg" className="w-full mb-3 shadow-glow">
                      <CheckCircle className="h-4 w-4 mr-1" /> Start Learning
                    </Button>
                  </Link>
                ) : course.isFree ? (
                  <Button
                    variant="hero" size="lg"
                    className="w-full mb-3 shadow-glow hover:scale-105 transition-transform"
                    onClick={handleEnrollFree}
                    disabled={enrollingFree}
                  >
                    {enrollingFree ? <><Loader2 className="h-4 w-4 animate-spin mr-1" /> Enrolling...</> : <><CheckCircle className="h-4 w-4 mr-1" /> Enroll for Free</>}
                  </Button>
                ) : existingPayment?.status === "pending" ? (
                  <div className="mb-3 rounded-lg border border-warning/30 bg-warning/5 p-4 text-center">
                    <p className="text-sm font-medium text-warning">⏳ Payment Under Review</p>
                    <p className="text-xs text-muted-foreground mt-1">Verification may take up to 5 hours.</p>
                  </div>
                ) : (
                  <Button
                    variant="hero" size="lg"
                    className="w-full mb-3 shadow-glow hover:scale-105 transition-transform"
                    onClick={() => {
                      if (!user) { toast({ title: "Please log in first", variant: "destructive" }); return; }
                      setShowPaymentModal(true);
                    }}
                  >
                    Pay with Telebirr
                  </Button>
                )}

                {howToPayVideoUrl && !enrolled && !course.isFree && (
                  <Button variant="outline" size="sm" className="w-full mb-3 hover:border-accent/50 transition-colors" onClick={() => setShowVideoModal(true)}>
                    <HelpCircle className="h-4 w-4 mr-1" /> How to Pay
                  </Button>
                )}

                {course.qrCodeUrl && !enrolled && !course.isFree && (
                  <div className="mt-4 rounded-xl border border-border bg-secondary/30 p-4">
                    <p className="text-xs font-medium text-center mb-3">Scan QR to pay via Telebirr</p>
                    <div className="flex justify-center mb-3">
                      <img src={course.qrCodeUrl} alt="Telebirr QR Code" className="w-48 h-48 rounded-lg border border-border object-contain bg-foreground/5" />
                    </div>
                    <Button variant="outline" size="sm" className="w-full hover:border-accent/50 transition-colors" onClick={handleDownloadQR}>
                      <Download className="h-4 w-4 mr-1" /> Download QR Code
                    </Button>
                  </div>
                )}

                {!course.isFree && <p className="text-xs text-center text-muted-foreground mt-3">Secure payment via Telebirr</p>}
                <hr className="my-5 border-border" />
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2"><Clock className="h-4 w-4" /> {course.duration} of content</li>
                  <li className="flex items-center gap-2"><BookOpen className="h-4 w-4" /> {course.lessons} lessons</li>
                  <li className="flex items-center gap-2"><Star className="h-4 w-4" /> Certificate of completion</li>
                  <li className="flex items-center gap-2"><Users className="h-4 w-4" /> Community access</li>
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
                <p className="text-sm text-muted-foreground leading-relaxed">Verification may take up to 5 hours. Your course will unlock automatically once approved.</p>
                <Button variant="hero" className="mt-6" onClick={resetModal}>Done</Button>
              </div>
            ) : (
              <div className="space-y-5">
                {course.qrCodeUrl && (
                  <div className="text-center">
                    <p className="text-sm font-medium mb-1">Step 1: Scan QR & Pay {course.price} ETB</p>
                    <p className="text-xs text-muted-foreground mb-3">Use Telebirr to scan and complete payment</p>
                    <img src={course.qrCodeUrl} alt="QR Code" className="w-40 h-40 mx-auto rounded-lg border border-border object-contain" />
                    <Button variant="ghost" size="sm" className="mt-2" onClick={handleDownloadQR}><Download className="h-3 w-3 mr-1" /> Download QR</Button>
                  </div>
                )}
                <hr className="border-border" />
                <div>
                  <Label className="text-sm font-medium">Step 2: Enter your Transaction ID *</Label>
                  <p className="text-xs text-muted-foreground mt-1 mb-2">Find this in your Telebirr payment confirmation (e.g. DC76ILX5RC)</p>
                  <Input value={transactionId} onChange={handleTransactionIdChange} placeholder="e.g. DC76ILX5RC" maxLength={20} className={`mt-1 font-mono tracking-wider uppercase ${txError ? "border-destructive" : ""}`} />
                  {txError && <p className="text-xs text-destructive mt-1">{txError}</p>}
                  <p className="text-xs text-muted-foreground mt-1">Only letters and numbers allowed. No spaces or symbols.</p>
                </div>
                <div className="rounded-lg border border-warning/30 bg-warning/5 p-3">
                  <p className="text-xs text-warning font-medium">⚠️ Important</p>
                  <p className="text-xs text-muted-foreground mt-1">Invalid, fake, or missing transaction IDs will be rejected.</p>
                </div>
                <Button variant="hero" size="lg" className="w-full shadow-glow hover:scale-105 transition-transform" disabled={!transactionId.trim() || submitting} onClick={handleSubmitPayment}>
                  {submitting ? <><Loader2 className="h-4 w-4 animate-spin mr-1" /> Submitting...</> : "Submit Transaction ID"}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* How to Pay Video Modal */}
      {showVideoModal && howToPayVideoUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-lg animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-bold flex items-center gap-2"><Play className="h-5 w-5 text-accent" /> How to Pay</h2>
              <button onClick={() => setShowVideoModal(false)}><X className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" /></button>
            </div>
            <div className="aspect-video rounded-xl overflow-hidden bg-secondary">
              <EmbedVideoPlayer embedCode={howToPayVideoUrl} sourceType="youtube" title="How to Pay Tutorial" />
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default CourseDetailPage;

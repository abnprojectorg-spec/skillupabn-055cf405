import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCourse, isEnrolled, uploadPaymentScreenshot, submitPaymentRequest, useUserPayments } from "@/hooks/useFirestore";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  Star, Users, Clock, BookOpen, ArrowLeft, CheckCircle, Loader2,
  Download, Upload, Play, X, FileImage, HelpCircle,
} from "lucide-react";

const CourseDetailPage = () => {
  const { id } = useParams();
  const { course, loading } = useCourse(id);
  const { user, profile } = useAuth();
  const [enrolled, setEnrolled] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [transactionId, setTransactionId] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();
  const { payments } = useUserPayments(user?.uid);

  useEffect(() => {
    if (user && id) {
      isEnrolled(user.uid, id).then(setEnrolled);
    }
  }, [user, id]);

  // Check if there's already a pending payment for this course
  const existingPayment = payments.find(
    (p) => p.courseId === id && (p.status === "pending" || p.status === "approved")
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({ title: "File too large", description: "Maximum 10MB", variant: "destructive" });
        return;
      }
      setScreenshotFile(file);
    }
  };

  const handleSubmitPayment = async () => {
    if (!screenshotFile || !user || !course || !id) return;
    setUploading(true);
    setUploadProgress(20);
    try {
      setUploadProgress(40);
      const screenshotURL = await uploadPaymentScreenshot(screenshotFile, user.uid);
      setUploadProgress(70);
      await submitPaymentRequest({
        userId: user.uid,
        userEmail: user.email || "",
        userName: profile?.full_name || user.displayName || "",
        courseId: id,
        courseTitle: course.title,
        screenshotURL,
        transactionId: transactionId.trim(),
      });
      setUploadProgress(100);
      setSubmitted(true);
      toast({ title: "Payment submitted!" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

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
              <Badge className="mb-4 bg-accent/10 text-accent border-accent/20">{course.category}</Badge>
              <h1 className="font-display text-3xl font-bold mb-3">{course.title}</h1>
              <p className="text-muted-foreground mb-4">by <span className="text-foreground font-medium">{course.instructor}</span></p>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
                <span className="flex items-center gap-1"><Star className="h-4 w-4 fill-warning text-warning" /> {course.rating}</span>
                <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {course.students} students</span>
                <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {course.duration}</span>
                <span className="flex items-center gap-1"><BookOpen className="h-4 w-4" /> {course.lessons} lessons</span>
              </div>

              <div className="aspect-video overflow-hidden rounded-xl bg-card border border-border mb-8">
                <img src={course.thumbnail} alt={course.title} className="h-full w-full object-cover" />
              </div>

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
                  <p className="font-display text-3xl font-bold text-gradient-glow">{course.price} ETB</p>
                  <p className="text-sm text-muted-foreground mt-1">One-time payment</p>
                </div>

                {enrolled ? (
                  <Button variant="hero" size="lg" className="w-full mb-3 shadow-glow">
                    <CheckCircle className="h-4 w-4 mr-1" /> Start Learning
                  </Button>
                ) : existingPayment?.status === "pending" ? (
                  <div className="mb-3 rounded-lg border border-warning/30 bg-warning/5 p-4 text-center">
                    <p className="text-sm font-medium text-warning">⏳ Payment Under Review</p>
                    <p className="text-xs text-muted-foreground mt-1">Verification may take up to 5 hours.</p>
                  </div>
                ) : (
                  <Button
                    variant="hero"
                    size="lg"
                    className="w-full mb-3 shadow-glow hover:scale-105 transition-transform"
                    onClick={() => {
                      if (!user) {
                        toast({ title: "Please log in first", variant: "destructive" });
                        return;
                      }
                      setShowPaymentModal(true);
                    }}
                  >
                    <Upload className="h-4 w-4 mr-1" /> Pay with Telebirr
                  </Button>
                )}

                {/* How to Pay button */}
                {course.howToPayVideoUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mb-3 hover:border-accent/50 transition-colors"
                    onClick={() => setShowVideoModal(true)}
                  >
                    <HelpCircle className="h-4 w-4 mr-1" /> How to Pay
                  </Button>
                )}

                {/* QR Code section */}
                {course.qrCodeUrl && !enrolled && (
                  <div className="mt-4 rounded-xl border border-border bg-secondary/30 p-4">
                    <p className="text-xs font-medium text-center mb-3">Scan QR to pay via Telebirr</p>
                    <div className="flex justify-center mb-3">
                      <img
                        src={course.qrCodeUrl}
                        alt="Telebirr QR Code"
                        className="w-48 h-48 rounded-lg border border-border object-contain bg-foreground/5"
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full hover:border-accent/50 transition-colors"
                      onClick={handleDownloadQR}
                    >
                      <Download className="h-4 w-4 mr-1" /> Download QR Code
                    </Button>
                  </div>
                )}

                <p className="text-xs text-center text-muted-foreground mt-3">Secure payment via Telebirr</p>
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
              <h2 className="font-display text-xl font-bold">Submit Payment Proof</h2>
              <button onClick={() => { setShowPaymentModal(false); setSubmitted(false); setScreenshotFile(null); setTransactionId(""); setUploadProgress(0); }}>
                <X className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
              </button>
            </div>

            {submitted ? (
              <div className="text-center py-8">
                <CheckCircle className="h-16 w-16 mx-auto mb-4 text-accent" />
                <h3 className="font-display text-lg font-semibold mb-2">Payment Submitted Successfully!</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Verification may take up to 5 hours. Your course will unlock automatically once approved.
                </p>
                <Button
                  variant="hero"
                  className="mt-6"
                  onClick={() => { setShowPaymentModal(false); setSubmitted(false); setScreenshotFile(null); setTransactionId(""); setUploadProgress(0); }}
                >
                  Done
                </Button>
              </div>
            ) : (
              <div className="space-y-5">
                {/* QR Code in modal */}
                {course.qrCodeUrl && (
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">Step 1: Scan or download the QR code and pay {course.price} ETB</p>
                    <img src={course.qrCodeUrl} alt="QR Code" className="w-36 h-36 mx-auto rounded-lg border border-border object-contain" />
                    <Button variant="ghost" size="sm" className="mt-2" onClick={handleDownloadQR}>
                      <Download className="h-3 w-3 mr-1" /> Download QR
                    </Button>
                  </div>
                )}

                <hr className="border-border" />

                <div>
                  <Label className="text-sm">Step 2: Upload payment screenshot *</Label>
                  <div className="mt-2">
                    <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-secondary/20 p-6 transition-colors hover:border-accent/50 hover:bg-secondary/40">
                      <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                      {screenshotFile ? (
                        <div className="flex items-center gap-2 text-sm">
                          <FileImage className="h-5 w-5 text-accent" />
                          <span className="text-foreground font-medium">{screenshotFile.name}</span>
                        </div>
                      ) : (
                        <div className="text-center">
                          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">Click to upload screenshot</p>
                          <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 10MB</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                <div>
                  <Label className="text-sm">Transaction ID (optional)</Label>
                  <Input
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="Enter Telebirr transaction ID"
                    className="mt-1"
                  />
                </div>

                {uploading && (
                  <div className="space-y-2">
                    <Progress value={uploadProgress} className="h-2" />
                    <p className="text-xs text-center text-muted-foreground">Uploading... {uploadProgress}%</p>
                  </div>
                )}

                <Button
                  variant="hero"
                  size="lg"
                  className="w-full shadow-glow hover:scale-105 transition-transform"
                  disabled={!screenshotFile || uploading}
                  onClick={handleSubmitPayment}
                >
                  {uploading ? (
                    <><Loader2 className="h-4 w-4 animate-spin mr-1" /> Submitting...</>
                  ) : (
                    "Submit Payment"
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* How to Pay Video Modal */}
      {showVideoModal && course.howToPayVideoUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-lg animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-bold flex items-center gap-2">
                <Play className="h-5 w-5 text-accent" /> How to Pay
              </h2>
              <button onClick={() => setShowVideoModal(false)}>
                <X className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
              </button>
            </div>
            <div className="aspect-video rounded-xl overflow-hidden bg-secondary">
              <iframe
                src={course.howToPayVideoUrl}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="How to Pay Tutorial"
              />
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default CourseDetailPage;

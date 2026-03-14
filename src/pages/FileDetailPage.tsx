import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useDigitalFile, hasFileAccess, submitFilePaymentRequest, useUserFilePayments } from "@/hooks/useFirestore";
import type { ReferralCode } from "@/hooks/useFirestore";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft, CheckCircle, Loader2, Download, X, FolderOpen, User, HardDrive, FileCode,
} from "lucide-react";
import ReferralCodeInput from "@/components/ReferralCodeInput";

const TRANSACTION_ID_REGEX = /^[A-Za-z0-9]+$/;

const FileDetailPage = () => {
  const { id } = useParams();
  const { file, loading } = useDigitalFile(id);
  const { user, profile } = useAuth();
  const [purchased, setPurchased] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [transactionId, setTransactionId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [txError, setTxError] = useState("");
  const [appliedReferral, setAppliedReferral] = useState<ReferralCode | null>(null);
  const { toast } = useToast();
  const { payments } = useUserFilePayments(user?.uid);

  useEffect(() => {
    if (user && id) {
      hasFileAccess(user.uid, id).then(setPurchased);
    }
  }, [user, id]);

  const existingPayment = payments.find(
    (p) => p.fileId === id && (p.status === "pending" || p.status === "approved")
  );

  const handleTransactionIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleaned = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    setTransactionId(cleaned);
    setTxError("");
  };

  const handleSubmitPayment = async () => {
    if (!transactionId.trim()) { setTxError("Transaction ID is required."); return; }
    if (!TRANSACTION_ID_REGEX.test(transactionId.trim())) { setTxError("Only letters (A-Z) and numbers (0-9) allowed."); return; }
    if (transactionId.trim().length < 4) { setTxError("Transaction ID is too short."); return; }
    if (!user || !file || !id) { toast({ title: "Please log in first", variant: "destructive" }); return; }

    setSubmitting(true);
    try {
      await submitFilePaymentRequest({
        userId: user.uid,
        userEmail: user.email || "",
        userName: profile?.full_name || user.displayName || "",
        fileId: id,
        fileTitle: file.title,
        transactionId: transactionId.trim(),
      });
      setSubmitted(true);
      toast({ title: "Transaction ID submitted!" });
    } catch (err: any) {
      toast({ title: "Error submitting", description: err?.message || "Something went wrong", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const resetModal = () => {
    setShowPaymentModal(false);
    setSubmitted(false);
    setTransactionId("");
    setTxError("");
  };

  const handleDownloadQR = () => {
    if (!file?.qrCodeUrl) return;
    const link = document.createElement("a");
    link.href = file.qrCodeUrl;
    link.download = `${file.title}-telebirr-qr.png`;
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

  if (!file) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex min-h-screen items-center justify-center pt-16">
          <div className="text-center">
            <h1 className="font-display text-2xl font-bold mb-2">File Not Found</h1>
            <Link to="/files"><Button variant="outline">Back to Files</Button></Link>
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
          <Link to="/files" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-accent transition-colors mb-6">
            <ArrowLeft className="h-4 w-4" /> Back to Files
          </Link>

          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <h1 className="font-display text-3xl font-bold mb-3">{file.title}</h1>
              <p className="text-muted-foreground mb-4">by <span className="text-foreground font-medium">{file.developer}</span></p>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
                <span className="flex items-center gap-1"><FileCode className="h-4 w-4" /> {file.fileType}</span>
                <span className="flex items-center gap-1"><HardDrive className="h-4 w-4" /> {file.fileSize}</span>
                <span className="flex items-center gap-1"><User className="h-4 w-4" /> {file.developer}</span>
              </div>

              <div className="aspect-video max-w-2xl overflow-hidden rounded-xl bg-card border border-border mb-8">
                <img src={file.coverImage || "/placeholder.svg"} alt={file.title} className="h-full w-full object-cover" />
              </div>

              <h2 className="font-display text-xl font-semibold mb-3">About This File</h2>
              <p className="text-muted-foreground leading-relaxed mb-6 whitespace-pre-wrap">{file.description}</p>

              {file.whatYouWillGet && (
                <>
                  <h2 className="font-display text-xl font-semibold mb-3">What You'll Get</h2>
                  <div className="space-y-2 mb-6">
                    {file.whatYouWillGet.split("\n").filter(Boolean).map((item, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 rounded-2xl border border-border bg-card p-6">
                <div className="text-center mb-6">
                  <p className="font-display text-3xl font-bold text-gradient-glow">{file.price} ETB</p>
                  <p className="text-sm text-muted-foreground mt-1">One-time purchase</p>
                </div>

                {purchased ? (
                  <Link to={`/download-file/${id}`}>
                    <Button variant="hero" size="lg" className="w-full mb-3 shadow-glow">
                      <Download className="h-4 w-4 mr-1" /> Download File
                    </Button>
                  </Link>
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
                      if (!user) { toast({ title: "Please log in first", variant: "destructive" }); return; }
                      setShowPaymentModal(true);
                    }}
                  >
                    Buy Now
                  </Button>
                )}

                {file.qrCodeUrl && !purchased && (
                  <div className="mt-4 rounded-xl border border-border bg-secondary/30 p-4">
                    <p className="text-xs font-medium text-center mb-3">Scan QR to pay via Telebirr</p>
                    <div className="flex justify-center mb-3">
                      <img src={file.qrCodeUrl} alt="Telebirr QR Code" className="w-48 h-48 rounded-lg border border-border object-contain bg-foreground/5" />
                    </div>
                    <Button variant="outline" size="sm" className="w-full hover:border-accent/50 transition-colors" onClick={handleDownloadQR}>
                      <Download className="h-4 w-4 mr-1" /> Download QR Code
                    </Button>
                  </div>
                )}

                <p className="text-xs text-center text-muted-foreground mt-3">Secure payment via Telebirr</p>
                <hr className="my-5 border-border" />
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2"><FileCode className="h-4 w-4" /> {file.fileType}</li>
                  <li className="flex items-center gap-2"><HardDrive className="h-4 w-4" /> {file.fileSize}</li>
                  <li className="flex items-center gap-2"><Download className="h-4 w-4" /> Instant download after approval</li>
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
                <h3 className="font-display text-lg font-semibold mb-2">Payment Submitted!</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Payment submitted successfully. Verification may take up to 5 hours. Your file will unlock once approved.
                </p>
                <Button variant="hero" className="mt-6" onClick={resetModal}>Done</Button>
              </div>
            ) : (
              <div className="space-y-5">
                {file.qrCodeUrl && (
                  <div className="text-center">
                    <p className="text-sm font-medium mb-1">Step 1: Scan QR & Pay {file.price} ETB</p>
                    <p className="text-xs text-muted-foreground mb-3">Use Telebirr to scan and complete payment</p>
                    <img src={file.qrCodeUrl} alt="QR Code" className="w-40 h-40 mx-auto rounded-lg border border-border object-contain" />
                    <Button variant="ghost" size="sm" className="mt-2" onClick={handleDownloadQR}>
                      <Download className="h-3 w-3 mr-1" /> Download QR
                    </Button>
                  </div>
                )}
                <hr className="border-border" />
                <div>
                  <Label className="text-sm font-medium">Step 2: Enter your Transaction ID *</Label>
                  <p className="text-xs text-muted-foreground mt-1 mb-2">Find this in your Telebirr payment confirmation (e.g. DC76ILX5RC)</p>
                  <Input
                    value={transactionId}
                    onChange={handleTransactionIdChange}
                    placeholder="e.g. DC76ILX5RC"
                    maxLength={20}
                    className={`mt-1 font-mono tracking-wider uppercase ${txError ? "border-destructive" : ""}`}
                  />
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

      <Footer />
    </div>
  );
};

export default FileDetailPage;

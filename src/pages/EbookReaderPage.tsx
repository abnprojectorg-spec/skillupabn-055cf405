import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { useEbook, hasEbookAccess } from "@/hooks/useFirestore";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Download, Loader2, Lock } from "lucide-react";

const EbookReaderPage = () => {
  const { id } = useParams();
  const { ebook, loading } = useEbook(id);
  const { user, loading: authLoading } = useAuth();
  const [hasAccess, setHasAccess] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);

  useEffect(() => {
    if (!user || !id) { setCheckingAccess(false); return; }
    hasEbookAccess(user.uid, id).then((result) => {
      setHasAccess(result);
      setCheckingAccess(false);
    });
  }, [user, id]);

  if (loading || authLoading || checkingAccess) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex min-h-screen items-center justify-center pt-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!user || !hasAccess) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex min-h-screen items-center justify-center pt-16">
          <div className="text-center">
            <Lock className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
            <h1 className="font-display text-2xl font-bold mb-2">Access Denied</h1>
            <p className="text-muted-foreground mb-4">You need to purchase this ebook first.</p>
            <Link to={`/ebook/${id}`}><Button variant="hero">View Ebook</Button></Link>
          </div>
        </div>
      </div>
    );
  }

  if (!ebook) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex min-h-screen items-center justify-center pt-16">
          <div className="text-center">
            <h1 className="font-display text-2xl font-bold mb-2">Ebook Not Found</h1>
            <Link to="/ebooks"><Button variant="outline">Back to Ebooks</Button></Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <Link to={`/ebook/${id}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-accent transition-colors">
              <ArrowLeft className="h-4 w-4" /> Back to Details
            </Link>
            {ebook.pdfUrl && (
              <a href={ebook.pdfUrl} target="_blank" rel="noopener noreferrer" download>
                <Button variant="hero" size="sm" className="shadow-glow">
                  <Download className="h-4 w-4 mr-1" /> Download PDF
                </Button>
              </a>
            )}
          </div>

          <h1 className="font-display text-2xl font-bold mb-6">{ebook.title}</h1>

          {ebook.pdfUrl ? (
            <div className="rounded-xl border border-border bg-card overflow-hidden" style={{ height: "80vh" }}>
              <iframe
                src={`${ebook.pdfUrl}#toolbar=1&navpanes=1&scrollbar=1`}
                className="w-full h-full"
                title={ebook.title}
              />
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-card p-12 text-center">
              <p className="text-muted-foreground">No PDF available for this ebook yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EbookReaderPage;

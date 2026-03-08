import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { useDigitalFile, hasFileAccess } from "@/hooks/useFirestore";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Download, Loader2, Lock, FileCode, HardDrive } from "lucide-react";

const FileDownloadPage = () => {
  const { id } = useParams();
  const { file, loading } = useDigitalFile(id);
  const { user, loading: authLoading } = useAuth();
  const [hasAccess, setHasAccess] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);

  useEffect(() => {
    if (!user || !id) { setCheckingAccess(false); return; }
    hasFileAccess(user.uid, id).then((result) => {
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
            <p className="text-muted-foreground mb-4">You need to purchase this file first.</p>
            <Link to={`/file/${id}`}><Button variant="hero">View File</Button></Link>
          </div>
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
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <Link to={`/file/${id}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-accent transition-colors mb-6">
            <ArrowLeft className="h-4 w-4" /> Back to Details
          </Link>

          <div className="rounded-2xl border border-border bg-card p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center">
              <FileCode className="h-10 w-10 text-primary" />
            </div>

            <h1 className="font-display text-2xl font-bold mb-2">{file.title}</h1>
            <p className="text-muted-foreground mb-1">by {file.developer}</p>

            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground my-6">
              <span className="flex items-center gap-1"><FileCode className="h-4 w-4" /> {file.fileType}</span>
              <span className="flex items-center gap-1"><HardDrive className="h-4 w-4" /> {file.fileSize}</span>
            </div>

            {file.fileUrl ? (
              <a href={file.fileUrl} target="_blank" rel="noopener noreferrer" download>
                <Button variant="hero" size="lg" className="shadow-glow hover:scale-105 transition-transform">
                  <Download className="h-5 w-5 mr-2" /> Download File
                </Button>
              </a>
            ) : (
              <div className="rounded-xl border border-border bg-secondary/30 p-6">
                <p className="text-muted-foreground">Download link is not available yet. Please check back later.</p>
              </div>
            )}

            <p className="text-xs text-muted-foreground mt-6">
              You have permanent access to this file. You can download it anytime.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileDownloadPage;

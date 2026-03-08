import { useState } from "react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useDigitalFiles } from "@/hooks/useFirestore";
import { Search, FolderOpen, Loader2 } from "lucide-react";

const FilesPage = () => {
  const [search, setSearch] = useState("");
  const { files, loading } = useDigitalFiles();

  const filtered = files.filter((f) =>
    !search ||
    f.title.toLowerCase().includes(search.toLowerCase()) ||
    f.developer.toLowerCase().includes(search.toLowerCase()) ||
    f.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold">File Store</h1>
            <p className="mt-2 text-muted-foreground">Browse and purchase apps, software, website codes & docs</p>
          </div>

          <div className="mb-8">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search files..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-card border-border"
              />
            </div>
          </div>

          <div className="mb-4">
            <Badge variant="secondary">
              {loading ? "Loading…" : `${filtered.length} file${filtered.length !== 1 ? "s" : ""}`}
            </Badge>
          </div>

          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-xl border border-border bg-card h-80 animate-pulse" />
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((file) => (
                <Link key={file.id} to={`/file/${file.id}`} className="group">
                  <div className="rounded-xl border border-border bg-card overflow-hidden hover:border-primary/30 hover:shadow-glow transition-all duration-300">
                    <div className="aspect-video overflow-hidden bg-secondary">
                      <img
                        src={file.coverImage || "/placeholder.svg"}
                        alt={file.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className="text-xs">{file.category}</Badge>
                        <Badge variant="outline" className="text-xs">{file.fileType}</Badge>
                      </div>
                      <h3 className="font-display font-semibold text-sm mb-1 line-clamp-2 group-hover:text-accent transition-colors">
                        {file.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mb-1">by {file.developer}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{file.shortDescription}</p>
                      <div className="flex items-center justify-between">
                        <span className="font-display font-bold text-accent">{file.price} ETB</span>
                        <Button size="sm" variant="hero" className="text-xs">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center">
              <FolderOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
              <p className="text-muted-foreground">No files found. Try a different search.</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default FilesPage;

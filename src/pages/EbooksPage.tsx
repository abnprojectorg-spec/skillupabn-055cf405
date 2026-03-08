import { useState } from "react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useEbooks } from "@/hooks/useFirestore";
import { Search, BookOpen, Loader2 } from "lucide-react";

const EbooksPage = () => {
  const [search, setSearch] = useState("");
  const { ebooks, loading } = useEbooks();

  const filtered = ebooks.filter((e) =>
    !search ||
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    e.author.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold">Ebook Store</h1>
            <p className="mt-2 text-muted-foreground">Browse and purchase ebooks to expand your knowledge</p>
          </div>

          <div className="mb-8">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search ebooks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-card border-border"
              />
            </div>
          </div>

          <div className="mb-4">
            <Badge variant="secondary">
              {loading ? "Loading…" : `${filtered.length} ebook${filtered.length !== 1 ? "s" : ""}`}
            </Badge>
          </div>

          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-xl border border-border bg-card h-96 animate-pulse" />
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((ebook) => (
                <Link key={ebook.id} to={`/ebook/${ebook.id}`} className="group">
                  <div className="rounded-xl border border-border bg-card overflow-hidden hover:border-primary/30 hover:shadow-glow transition-all duration-300">
                    <div className="aspect-[3/4] overflow-hidden bg-secondary">
                      <img
                        src={ebook.coverImage || "/placeholder.svg"}
                        alt={ebook.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-display font-semibold text-sm mb-1 line-clamp-2 group-hover:text-accent transition-colors">
                        {ebook.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mb-2">by {ebook.author}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{ebook.shortDescription}</p>
                      <div className="flex items-center justify-between">
                        <span className="font-display font-bold text-accent">{ebook.price} ETB</span>
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
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
              <p className="text-muted-foreground">No ebooks found. Try a different search.</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default EbooksPage;

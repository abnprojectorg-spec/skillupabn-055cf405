import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CourseCard from "@/components/CourseCard";
import { useCourses, useEnrollments, usePlaylists } from "@/hooks/useFirestore";
import { useAuth } from "@/contexts/AuthContext";
import { CATEGORIES } from "@/data/mockData";
import { Search, X, GraduationCap, ListMusic, BookOpen } from "lucide-react";

const MarketplacePage = () => {
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") || "";
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const { courses, loading } = useCourses();
  const { playlists, loading: playlistsLoading } = usePlaylists();
  const { user } = useAuth();
  const { enrollments } = useEnrollments(user?.uid);

  const enrolledCourseIds = new Set(enrollments.map((e) => e.courseId));

  const filtered = courses.filter((c) => {
    const matchesSearch = !search || c.title.toLowerCase().includes(search.toLowerCase()) || c.instructor.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !selectedCategory || c.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredPlaylists = playlists.filter((p) =>
    !search || p.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold">Course Marketplace</h1>
            <p className="mt-2 text-muted-foreground">Discover courses to build real skills</p>
          </div>

          <div className="mb-8 space-y-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search courses..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 bg-card border-border" />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant={selectedCategory === "" ? "default" : "outline"} onClick={() => setSelectedCategory("")}>All</Button>
              {CATEGORIES.map((cat) => (
                <Button key={cat} size="sm" variant={selectedCategory === cat ? "default" : "outline"} onClick={() => setSelectedCategory(selectedCategory === cat ? "" : cat)}>
                  {cat}
                  {selectedCategory === cat && <X className="h-3 w-3 ml-1" />}
                </Button>
              ))}
            </div>
          </div>

          {/* Playlists Section */}
          {!selectedCategory && filteredPlaylists.length > 0 && (
            <div className="mb-10">
              <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
                <ListMusic className="h-5 w-5 text-primary" /> Course Playlists
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredPlaylists.map((p) => (
                  <Link key={p.id} to={`/playlist/${p.id}`}
                    className="group rounded-xl border border-border bg-card p-5 hover:shadow-glow hover:border-accent/30 hover:-translate-y-1 transition-all duration-300"
                  >
                    {p.coverImage && (
                      <div className="aspect-video rounded-lg overflow-hidden mb-3">
                        <img src={p.coverImage} alt={p.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      </div>
                    )}
                    <div className="flex items-center gap-2 mb-2">
                      <ListMusic className="h-4 w-4 text-primary" />
                      <h3 className="font-display font-semibold group-hover:text-accent transition-colors">{p.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{p.description}</p>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <BookOpen className="h-3 w-3" /> {p.courseIds?.length || 0} courses
                      </Badge>
                      <span className="font-display font-bold text-gradient-glow">
                        {p.isFree ? "Free" : `${p.price} ETB`}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="mb-4">
            <Badge variant="secondary">{loading ? "Loading…" : `${filtered.length} course${filtered.length !== 1 ? "s" : ""}`}</Badge>
          </div>

          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[1,2,3,4].map((i) => <div key={i} className="rounded-xl border border-border bg-card h-80 animate-pulse" />)}
            </div>
          ) : filtered.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((course) => (
                <CourseCard key={course.id} course={course} isUnlocked={enrolledCourseIds.has(course.id)} />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center">
              <GraduationCap className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
              <p className="text-muted-foreground">No courses found. Try a different search or category.</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default MarketplacePage;

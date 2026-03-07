import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CourseCard from "@/components/CourseCard";
import { COURSES, CATEGORIES, MOCK_USER } from "@/data/mockData";
import { Search, X } from "lucide-react";

const MarketplacePage = () => {
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") || "";
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);

  const filtered = COURSES.filter((c) => {
    const matchesSearch = !search || c.title.toLowerCase().includes(search.toLowerCase()) || c.instructor.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !selectedCategory || c.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold">Course Marketplace</h1>
            <p className="mt-2 text-muted-foreground">Discover courses to build real skills</p>
          </div>

          {/* Search & Filters */}
          <div className="mb-8 space-y-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search courses..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant={selectedCategory === "" ? "default" : "outline"}
                onClick={() => setSelectedCategory("")}
              >
                All
              </Button>
              {CATEGORIES.map((cat) => (
                <Button
                  key={cat}
                  size="sm"
                  variant={selectedCategory === cat ? "default" : "outline"}
                  onClick={() => setSelectedCategory(selectedCategory === cat ? "" : cat)}
                >
                  {cat}
                  {selectedCategory === cat && <X className="h-3 w-3 ml-1" />}
                </Button>
              ))}
            </div>
          </div>

          {/* Results */}
          <div className="mb-4">
            <Badge variant="secondary">{filtered.length} course{filtered.length !== 1 ? "s" : ""}</Badge>
          </div>
          {filtered.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  isUnlocked={MOCK_USER.coursesUnlocked.includes(course.id)}
                />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center">
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

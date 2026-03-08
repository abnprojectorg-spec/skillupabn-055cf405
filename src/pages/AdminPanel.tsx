import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import Navbar from "@/components/Navbar";
import { useCourses, useUsers, addCourse, deleteCourse } from "@/hooks/useFirestore";
import { CATEGORIES } from "@/data/mockData";
import {
  LayoutDashboard, BookOpen, Users, Plus, Trash2, X, Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ADMIN_TABS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "courses", label: "Courses", icon: BookOpen },
  { id: "users", label: "Users", icon: Users },
];

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [showAddCourse, setShowAddCourse] = useState(false);
  const { courses, loading: coursesLoading } = useCourses();
  const { users, loading: usersLoading } = useUsers();
  const { toast } = useToast();

  const [newCourse, setNewCourse] = useState({
    title: "", instructor: "", category: CATEGORIES[0], price: 0,
    description: "", shortDescription: "", thumbnail: "", videoUrl: "",
    rating: 0, students: 0, lessons: 0, duration: "",
  });

  const handleAddCourse = async () => {
    if (!newCourse.title) return;
    try {
      await addCourse(newCourse);
      toast({ title: "Course added!" });
      setShowAddCourse(false);
      setNewCourse({ title: "", instructor: "", category: CATEGORIES[0], price: 0, description: "", shortDescription: "", thumbnail: "", videoUrl: "", rating: 0, students: 0, lessons: 0, duration: "" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCourse(id);
      toast({ title: "Course deleted" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16 flex">
        <aside className="hidden md:flex w-64 flex-col border-r border-border bg-card min-h-[calc(100vh-4rem)] p-4 sticky top-16">
          <div className="p-3 mb-6">
            <p className="font-display text-lg font-bold">Admin Panel</p>
            <p className="text-xs text-muted-foreground">Manage your platform</p>
          </div>
          {ADMIN_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200 mb-1 ${
                activeTab === tab.id ? "bg-primary text-primary-foreground shadow-glow" : "text-muted-foreground hover:bg-secondary"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </aside>

        <main className="flex-1 p-6">
          {activeTab === "overview" && (
            <div>
              <h1 className="font-display text-2xl font-bold mb-6">Dashboard Overview</h1>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
                {[
                  { label: "Total Courses", value: coursesLoading ? "…" : courses.length, color: "text-primary" },
                  { label: "Total Users", value: usersLoading ? "…" : users.length, color: "text-accent" },
                  { label: "Categories", value: CATEGORIES.length, color: "text-warning" },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-xl border border-border bg-card p-5 hover:border-primary/30 transition-colors">
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className={`font-display text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "courses" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h1 className="font-display text-2xl font-bold">Manage Courses</h1>
                <Button variant="hero" onClick={() => setShowAddCourse(true)}>
                  <Plus className="h-4 w-4 mr-1" /> Add Course
                </Button>
              </div>

              {showAddCourse && (
                <div className="mb-8 rounded-2xl border border-border bg-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-display text-lg font-semibold">New Course</h2>
                    <button onClick={() => setShowAddCourse(false)}><X className="h-5 w-5 text-muted-foreground" /></button>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div><Label>Title</Label><Input value={newCourse.title} onChange={(e) => setNewCourse({...newCourse, title: e.target.value})} placeholder="Course title" className="mt-1" /></div>
                    <div><Label>Instructor</Label><Input value={newCourse.instructor} onChange={(e) => setNewCourse({...newCourse, instructor: e.target.value})} placeholder="Instructor name" className="mt-1" /></div>
                    <div><Label>Category</Label>
                      <select value={newCourse.category} onChange={(e) => setNewCourse({...newCourse, category: e.target.value})} className="mt-1 w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground">
                        {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div><Label>Price (ETB)</Label><Input type="number" value={newCourse.price || ""} onChange={(e) => setNewCourse({...newCourse, price: Number(e.target.value)})} placeholder="499" className="mt-1" /></div>
                    <div><Label>Short Description</Label><Input value={newCourse.shortDescription} onChange={(e) => setNewCourse({...newCourse, shortDescription: e.target.value})} placeholder="Brief summary" className="mt-1" /></div>
                    <div><Label>Duration</Label><Input value={newCourse.duration} onChange={(e) => setNewCourse({...newCourse, duration: e.target.value})} placeholder="32 hours" className="mt-1" /></div>
                    <div className="sm:col-span-2"><Label>Description</Label><Textarea value={newCourse.description} onChange={(e) => setNewCourse({...newCourse, description: e.target.value})} placeholder="Full description..." className="mt-1" /></div>
                    <div><Label>Thumbnail URL</Label><Input value={newCourse.thumbnail} onChange={(e) => setNewCourse({...newCourse, thumbnail: e.target.value})} placeholder="https://..." className="mt-1" /></div>
                    <div><Label>Video URL</Label><Input value={newCourse.videoUrl} onChange={(e) => setNewCourse({...newCourse, videoUrl: e.target.value})} placeholder="YouTube embed URL" className="mt-1" /></div>
                    <div><Label>Lessons</Label><Input type="number" value={newCourse.lessons || ""} onChange={(e) => setNewCourse({...newCourse, lessons: Number(e.target.value)})} className="mt-1" /></div>
                    <div><Label>Rating</Label><Input type="number" step="0.1" value={newCourse.rating || ""} onChange={(e) => setNewCourse({...newCourse, rating: Number(e.target.value)})} className="mt-1" /></div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button variant="hero" onClick={handleAddCourse}>Save Course</Button>
                    <Button variant="outline" onClick={() => setShowAddCourse(false)}>Cancel</Button>
                  </div>
                </div>
              )}

              {coursesLoading ? (
                <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
              ) : (
                <div className="rounded-xl border border-border bg-card overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-secondary">
                      <tr>
                        <th className="text-left p-3 font-medium">Title</th>
                        <th className="text-left p-3 font-medium">Category</th>
                        <th className="text-left p-3 font-medium">Price</th>
                        <th className="text-left p-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {courses.map((c) => (
                        <tr key={c.id} className="border-t border-border hover:bg-secondary/50 transition-colors">
                          <td className="p-3 font-medium">{c.title}</td>
                          <td className="p-3"><Badge variant="secondary">{c.category}</Badge></td>
                          <td className="p-3">{c.price} ETB</td>
                          <td className="p-3">
                            <Button size="icon" variant="ghost" onClick={() => handleDelete(c.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                      {courses.length === 0 && (
                        <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No courses yet. Add your first course above.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === "users" && (
            <div>
              <h1 className="font-display text-2xl font-bold mb-6">Users</h1>
              {usersLoading ? (
                <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
              ) : (
                <div className="rounded-xl border border-border bg-card overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-secondary">
                      <tr>
                        <th className="text-left p-3 font-medium">Name</th>
                        <th className="text-left p-3 font-medium">Email</th>
                        <th className="text-left p-3 font-medium">Courses</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.user_id} className="border-t border-border hover:bg-secondary/50 transition-colors">
                          <td className="p-3 font-medium">{u.full_name}</td>
                          <td className="p-3 text-muted-foreground">{u.email}</td>
                          <td className="p-3">{u.courses_unlocked?.length || 0}</td>
                        </tr>
                      ))}
                      {users.length === 0 && (
                        <tr><td colSpan={3} className="p-8 text-center text-muted-foreground">No users yet.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminPanel;

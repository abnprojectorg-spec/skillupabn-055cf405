import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import Navbar from "@/components/Navbar";
import {
  useCourses, useUsers, usePaymentRequests,
  addCourse, updateCourse, deleteCourse,
  approvePayment, rejectPayment, deletePaymentRequest,
  checkIsAdmin,
} from "@/hooks/useFirestore";
import type { FirestoreCourse } from "@/hooks/useFirestore";
import { CATEGORIES } from "@/data/mockData";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  LayoutDashboard, BookOpen, Users, Plus, Trash2, X, Loader2,
  CreditCard, CheckCircle, XCircle, Eye, Edit, Shield,
} from "lucide-react";

const ADMIN_TABS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "payments", label: "Payments", icon: CreditCard },
  { id: "courses", label: "Courses", icon: BookOpen },
  { id: "users", label: "Users", icon: Users },
];

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-warning/10 text-warning border-warning/20",
  approved: "bg-accent/10 text-accent border-accent/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
};

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [editingCourse, setEditingCourse] = useState<FirestoreCourse | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  const { courses, loading: coursesLoading } = useCourses();
  const { users, loading: usersLoading } = useUsers();
  const { requests, loading: paymentsLoading } = usePaymentRequests();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const adminCode = sessionStorage.getItem("adminAuth");
    if (adminCode) {
      // Verified via access code on AdminLoginPage
      setIsAdmin(true);
      return;
    }
    if (user?.email) {
      checkIsAdmin(user.email).then((result) => {
        setIsAdmin(result);
        if (!result) navigate("/admin-login");
      });
    } else {
      setIsAdmin(false);
      navigate("/admin-login");
    }
  }, [user, navigate]);

  const emptyCourse = {
    title: "", instructor: "", category: CATEGORIES[0] as string, price: 0,
    description: "", shortDescription: "", thumbnail: "", videoUrl: "",
    qrCodeUrl: "", howToPayVideoUrl: "",
    rating: 0, students: 0, lessons: 0, duration: "",
  };

  const [courseForm, setCourseForm] = useState(emptyCourse);

  const handleSaveCourse = async () => {
    if (!courseForm.title) return;
    try {
      if (editingCourse) {
        await updateCourse(editingCourse.id, courseForm);
        toast({ title: "Course updated!" });
        setEditingCourse(null);
      } else {
        await addCourse(courseForm as any);
        toast({ title: "Course added!" });
      }
      setShowAddCourse(false);
      setCourseForm(emptyCourse);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleEditCourse = (course: FirestoreCourse) => {
    setEditingCourse(course);
    setCourseForm({
      title: course.title,
      instructor: course.instructor,
      category: course.category,
      price: course.price,
      description: course.description,
      shortDescription: course.shortDescription,
      thumbnail: course.thumbnail,
      videoUrl: course.videoUrl,
      qrCodeUrl: course.qrCodeUrl || "",
      howToPayVideoUrl: course.howToPayVideoUrl || "",
      rating: course.rating,
      students: course.students,
      lessons: course.lessons,
      duration: course.duration,
    });
    setShowAddCourse(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCourse(id);
      toast({ title: "Course deleted" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleApprove = async (req: any) => {
    try {
      await approvePayment(req.id, req.userId, req.courseId);
      toast({ title: "Payment approved! Course unlocked for user." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleReject = async (id: string) => {
    try {
      await rejectPayment(id);
      toast({ title: "Payment rejected" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleDeletePayment = async (id: string) => {
    try {
      await deletePaymentRequest(id);
      toast({ title: "Payment request deleted" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const filteredRequests = statusFilter === "all"
    ? requests
    : requests.filter((r) => r.status === statusFilter);

  const pendingCount = requests.filter((r) => r.status === "pending").length;

  if (isAdmin === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16 flex">
        <aside className="hidden md:flex w-64 flex-col border-r border-border bg-card min-h-[calc(100vh-4rem)] p-4 sticky top-16">
          <div className="p-3 mb-6">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <p className="font-display text-lg font-bold">Admin Panel</p>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Manage your platform</p>
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
              {tab.id === "payments" && pendingCount > 0 && (
                <Badge className="ml-auto bg-warning/20 text-warning text-xs px-1.5">{pendingCount}</Badge>
              )}
            </button>
          ))}
        </aside>

        <main className="flex-1 p-6">
          {/* Overview */}
          {activeTab === "overview" && (
            <div>
              <h1 className="font-display text-2xl font-bold mb-6">Dashboard Overview</h1>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                {[
                  { label: "Total Courses", value: coursesLoading ? "…" : courses.length, color: "text-primary" },
                  { label: "Total Users", value: usersLoading ? "…" : users.length, color: "text-accent" },
                  { label: "Pending Payments", value: paymentsLoading ? "…" : pendingCount, color: "text-warning" },
                  { label: "Categories", value: CATEGORIES.length, color: "text-foreground" },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-xl border border-border bg-card p-5 hover:border-primary/30 transition-colors">
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className={`font-display text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payments */}
          {activeTab === "payments" && (
            <div>
              <h1 className="font-display text-2xl font-bold mb-6">Payment Requests</h1>
              <div className="flex gap-2 mb-6">
                {["all", "pending", "approved", "rejected"].map((s) => (
                  <Button
                    key={s}
                    size="sm"
                    variant={statusFilter === s ? "default" : "outline"}
                    onClick={() => setStatusFilter(s)}
                    className="capitalize hover:scale-105 transition-transform"
                  >
                    {s} {s === "pending" && pendingCount > 0 && `(${pendingCount})`}
                  </Button>
                ))}
              </div>

              {paymentsLoading ? (
                <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
              ) : (
                <div className="rounded-xl border border-border bg-card overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-secondary">
                      <tr>
                        <th className="text-left p-3 font-medium">User</th>
                        <th className="text-left p-3 font-medium">Course</th>
                        <th className="text-left p-3 font-medium">Transaction ID</th>
                        <th className="text-left p-3 font-medium">Status</th>
                        <th className="text-left p-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRequests.map((req) => (
                        <tr key={req.id} className="border-t border-border hover:bg-secondary/50 transition-colors">
                          <td className="p-3">
                            <p className="font-medium">{req.userName}</p>
                            <p className="text-xs text-muted-foreground">{req.userEmail}</p>
                          </td>
                          <td className="p-3 font-medium">{req.courseTitle}</td>
                          <td className="p-3">
                            <span className="font-mono tracking-wider text-foreground">{req.transactionId || "—"}</span>
                          </td>
                          <td className="p-3">
                            <Badge className={`${STATUS_COLORS[req.status]} capitalize`}>{req.status}</Badge>
                          </td>
                          <td className="p-3">
                            <div className="flex gap-1">
                              {req.status === "pending" && (
                                <>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => handleApprove(req)}
                                    title="Approve"
                                    className="hover:bg-accent/10 hover:text-accent transition-colors"
                                  >
                                    <CheckCircle className="h-4 w-4 text-accent" />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => handleReject(req.id)}
                                    title="Reject"
                                    className="hover:bg-destructive/10 hover:text-destructive transition-colors"
                                  >
                                    <XCircle className="h-4 w-4 text-destructive" />
                                  </Button>
                                </>
                              )}
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleDeletePayment(req.id)}
                                title="Delete"
                                className="hover:bg-destructive/10 transition-colors"
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredRequests.length === 0 && (
                        <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No payment requests found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Courses */}
          {activeTab === "courses" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h1 className="font-display text-2xl font-bold">Manage Courses</h1>
                <Button variant="hero" onClick={() => { setEditingCourse(null); setCourseForm(emptyCourse); setShowAddCourse(true); }} className="hover:scale-105 transition-transform">
                  <Plus className="h-4 w-4 mr-1" /> Add Course
                </Button>
              </div>

              {showAddCourse && (
                <div className="mb-8 rounded-2xl border border-border bg-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-display text-lg font-semibold">
                      {editingCourse ? "Edit Course" : "New Course"}
                    </h2>
                    <button onClick={() => { setShowAddCourse(false); setEditingCourse(null); }}>
                      <X className="h-5 w-5 text-muted-foreground" />
                    </button>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div><Label>Title</Label><Input value={courseForm.title} onChange={(e) => setCourseForm({...courseForm, title: e.target.value})} placeholder="Course title" className="mt-1" /></div>
                    <div><Label>Instructor</Label><Input value={courseForm.instructor} onChange={(e) => setCourseForm({...courseForm, instructor: e.target.value})} placeholder="Instructor name" className="mt-1" /></div>
                    <div><Label>Category</Label>
                      <select value={courseForm.category} onChange={(e) => setCourseForm({...courseForm, category: e.target.value})} className="mt-1 w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground">
                        {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div><Label>Price (ETB)</Label><Input type="number" value={courseForm.price || ""} onChange={(e) => setCourseForm({...courseForm, price: Number(e.target.value)})} placeholder="499" className="mt-1" /></div>
                    <div><Label>Short Description</Label><Input value={courseForm.shortDescription} onChange={(e) => setCourseForm({...courseForm, shortDescription: e.target.value})} placeholder="Brief summary" className="mt-1" /></div>
                    <div><Label>Duration</Label><Input value={courseForm.duration} onChange={(e) => setCourseForm({...courseForm, duration: e.target.value})} placeholder="32 hours" className="mt-1" /></div>
                    <div className="sm:col-span-2"><Label>Description</Label><Textarea value={courseForm.description} onChange={(e) => setCourseForm({...courseForm, description: e.target.value})} placeholder="Full description..." className="mt-1" /></div>
                    <div><Label>Thumbnail URL</Label><Input value={courseForm.thumbnail} onChange={(e) => setCourseForm({...courseForm, thumbnail: e.target.value})} placeholder="https://..." className="mt-1" /></div>
                    <div><Label>Preview Video URL (YouTube Embed)</Label><Input value={courseForm.videoUrl} onChange={(e) => setCourseForm({...courseForm, videoUrl: e.target.value})} placeholder="https://youtube.com/embed/..." className="mt-1" /></div>
                    <div><Label>Telebirr QR Code URL</Label><Input value={courseForm.qrCodeUrl} onChange={(e) => setCourseForm({...courseForm, qrCodeUrl: e.target.value})} placeholder="https://...qr-code.png" className="mt-1" /></div>
                    <div><Label>How to Pay Video URL (YouTube Embed)</Label><Input value={courseForm.howToPayVideoUrl} onChange={(e) => setCourseForm({...courseForm, howToPayVideoUrl: e.target.value})} placeholder="https://youtube.com/embed/..." className="mt-1" /></div>
                    <div><Label>Lessons</Label><Input type="number" value={courseForm.lessons || ""} onChange={(e) => setCourseForm({...courseForm, lessons: Number(e.target.value)})} className="mt-1" /></div>
                    <div><Label>Rating</Label><Input type="number" step="0.1" value={courseForm.rating || ""} onChange={(e) => setCourseForm({...courseForm, rating: Number(e.target.value)})} className="mt-1" /></div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button variant="hero" onClick={handleSaveCourse} className="hover:scale-105 transition-transform">
                      {editingCourse ? "Update Course" : "Save Course"}
                    </Button>
                    <Button variant="outline" onClick={() => { setShowAddCourse(false); setEditingCourse(null); }}>Cancel</Button>
                  </div>
                </div>
              )}

              {coursesLoading ? (
                <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
              ) : (
                <div className="rounded-xl border border-border bg-card overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-secondary">
                      <tr>
                        <th className="text-left p-3 font-medium">Title</th>
                        <th className="text-left p-3 font-medium">Category</th>
                        <th className="text-left p-3 font-medium">Price</th>
                        <th className="text-left p-3 font-medium">QR</th>
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
                            {c.qrCodeUrl ? (
                              <Badge className="bg-accent/10 text-accent border-accent/20">Set</Badge>
                            ) : (
                              <Badge variant="secondary">None</Badge>
                            )}
                          </td>
                          <td className="p-3">
                            <div className="flex gap-1">
                              <Button size="icon" variant="ghost" onClick={() => handleEditCourse(c)} className="hover:bg-primary/10 transition-colors">
                                <Edit className="h-4 w-4 text-primary" />
                              </Button>
                              <Button size="icon" variant="ghost" onClick={() => handleDelete(c.id)} className="hover:bg-destructive/10 transition-colors">
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {courses.length === 0 && (
                        <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No courses yet.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Users */}
          {activeTab === "users" && (
            <div>
              <h1 className="font-display text-2xl font-bold mb-6">Users</h1>
              {usersLoading ? (
                <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
              ) : (
                <div className="rounded-xl border border-border bg-card overflow-x-auto">
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

      {/* Screenshot Preview Modal */}
      {screenshotPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4" onClick={() => setScreenshotPreview(null)}>
          <div className="max-w-2xl max-h-[80vh] rounded-2xl border border-border bg-card p-4 overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-semibold">Payment Screenshot</h3>
              <button onClick={() => setScreenshotPreview(null)}>
                <X className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
              </button>
            </div>
            <img src={screenshotPreview} alt="Payment screenshot" className="w-full rounded-lg" />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;

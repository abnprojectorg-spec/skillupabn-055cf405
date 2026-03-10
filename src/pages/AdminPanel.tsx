import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import Navbar from "@/components/Navbar";
import {
  useCourses, useUsers, usePaymentRequests, useCourseProject, useCommunityLinks,
  useEbooks, useEbookPaymentRequests,
  useDigitalFiles, useFilePaymentRequests,
  useCompletionRequests, useAdminSettings,
  addCourse, updateCourse, deleteCourse,
  approvePayment, rejectPayment, deletePaymentRequest,
  saveCourseProject, deleteCourseProject,
  saveCommunityLink, deleteCommunityLink,
  addEbook, updateEbook, deleteEbook,
  approveEbookPayment, rejectEbookPayment, deleteEbookPaymentRequest,
  addDigitalFile, updateDigitalFile, deleteDigitalFile,
  approveFilePayment, rejectFilePayment, deleteFilePaymentRequest,
  checkIsAdmin, updateUser, deleteUser, removeUserCourseAccess, enrollUser,
  updateCompletionStatus, deleteCompletionRequest, saveAdminTelegram, saveAdminSettings,
  usePlaylistPaymentRequests,
} from "@/hooks/useFirestore";
import type { FirestoreCourse, FirestoreEbook, FirestoreDigitalFile, FirestoreUser, CourseCompletionRequest } from "@/hooks/useFirestore";
import { CATEGORIES } from "@/data/mockData";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  LayoutDashboard, BookOpen, Users, Plus, Trash2, X, Loader2,
  CreditCard, CheckCircle, XCircle, Edit, Shield, FileText, Award, Link2, Book, Search, UserX, BookMinus, BookPlus, FolderOpen, MessageCircle, Settings, ListMusic,
} from "lucide-react";
import AdminAnalytics from "@/components/AdminAnalytics";
import AdminChat from "@/components/AdminChat";
import AdminNews from "@/components/AdminNews";
import AdminCollaborations from "@/components/AdminCollaborations";
import { AdminPlaylistsManager, AdminPlaylistPayments } from "@/components/AdminPlaylists";

import { Newspaper, Handshake } from "lucide-react";

const ADMIN_TABS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "messages", label: "Messages", icon: MessageCircle },
  { id: "news", label: "News", icon: Newspaper },
  { id: "payments", label: "Payments", icon: CreditCard },
  { id: "completions", label: "Completions", icon: CheckCircle },
  { id: "courses", label: "Courses", icon: BookOpen },
  { id: "playlists", label: "Playlists", icon: ListMusic },
  { id: "playlist-payments", label: "Playlist Payments", icon: CreditCard },
  { id: "ebooks", label: "Ebooks", icon: Book },
  { id: "ebook-payments", label: "Ebook Payments", icon: CreditCard },
  { id: "files", label: "Files", icon: FolderOpen },
  { id: "file-payments", label: "File Payments", icon: CreditCard },
  { id: "projects", label: "Projects", icon: Award },
  { id: "community", label: "Community Links", icon: Link2 },
  { id: "collaborations", label: "Collaborations", icon: Handshake },
  { id: "users", label: "Users", icon: Users },
  { id: "settings", label: "Settings", icon: Settings },
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
  const [paymentSearch, setPaymentSearch] = useState("");
  const [courseSearch, setCourseSearch] = useState("");
  const [showAddEbook, setShowAddEbook] = useState(false);
  const [editingEbook, setEditingEbook] = useState<FirestoreEbook | null>(null);
  const [ebookStatusFilter, setEbookStatusFilter] = useState<string>("all");
  const [ebookPaymentSearch, setEbookPaymentSearch] = useState("");
  const [ebookSearch, setEbookSearch] = useState("");
  const [showAddFile, setShowAddFile] = useState(false);
  const [editingFile, setEditingFile] = useState<FirestoreDigitalFile | null>(null);
  const [fileStatusFilter, setFileStatusFilter] = useState<string>("all");
  const [filePaymentSearch, setFilePaymentSearch] = useState("");
  const [fileSearch, setFileSearch] = useState("");
  
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  const { courses, loading: coursesLoading } = useCourses();
  const { users, loading: usersLoading } = useUsers();
  const { requests, loading: paymentsLoading } = usePaymentRequests();
  const { ebooks, loading: ebooksLoading } = useEbooks();
  const { requests: ebookRequests, loading: ebookPaymentsLoading } = useEbookPaymentRequests();
  const { files: digitalFiles, loading: filesLoading } = useDigitalFiles();
  const { requests: fileRequests, loading: filePaymentsLoading } = useFilePaymentRequests();
  const { requests: playlistPayRequests } = usePlaylistPaymentRequests();
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

  // ─── Ebook Handlers ────────────────────────────────────────
  const emptyEbook = {
    title: "", author: "", description: "", shortDescription: "",
    price: 0, coverImage: "", pdfUrl: "", qrCodeUrl: "", pages: 0, whatYouWillLearn: "",
  };

  const [ebookForm, setEbookForm] = useState(emptyEbook);

  const handleSaveEbook = async () => {
    if (!ebookForm.title) return;
    try {
      if (editingEbook) {
        await updateEbook(editingEbook.id, ebookForm);
        toast({ title: "Ebook updated!" });
        setEditingEbook(null);
      } else {
        await addEbook(ebookForm as any);
        toast({ title: "Ebook added!" });
      }
      setShowAddEbook(false);
      setEbookForm(emptyEbook);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleEditEbook = (ebook: FirestoreEbook) => {
    setEditingEbook(ebook);
    setEbookForm({
      title: ebook.title, author: ebook.author, description: ebook.description,
      shortDescription: ebook.shortDescription, price: ebook.price,
      coverImage: ebook.coverImage, pdfUrl: ebook.pdfUrl, qrCodeUrl: ebook.qrCodeUrl || "",
      pages: ebook.pages, whatYouWillLearn: ebook.whatYouWillLearn || "",
    });
    setShowAddEbook(true);
  };

  const handleDeleteEbook = async (id: string) => {
    try {
      await deleteEbook(id);
      toast({ title: "Ebook deleted" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleApproveEbookPayment = async (req: any) => {
    try {
      await approveEbookPayment(req.id, req.userId, req.ebookId);
      toast({ title: "Payment approved! Ebook unlocked for user." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleRejectEbookPayment = async (id: string) => {
    try {
      await rejectEbookPayment(id);
      toast({ title: "Payment rejected" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleDeleteEbookPayment = async (id: string) => {
    try {
      await deleteEbookPaymentRequest(id);
      toast({ title: "Ebook payment request deleted" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  // ─── File Handlers ─────────────────────────────────────────
  const emptyFile = {
    title: "", developer: "", category: "Software", description: "", shortDescription: "",
    price: 0, coverImage: "", fileUrl: "", qrCodeUrl: "", fileType: "Application", fileSize: "", whatYouWillGet: "",
  };

  const [fileForm, setFileForm] = useState(emptyFile);

  const handleSaveFile = async () => {
    if (!fileForm.title) return;
    try {
      if (editingFile) {
        await updateDigitalFile(editingFile.id, fileForm);
        toast({ title: "File updated!" });
        setEditingFile(null);
      } else {
        await addDigitalFile(fileForm as any);
        toast({ title: "File added!" });
      }
      setShowAddFile(false);
      setFileForm(emptyFile);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleEditFile = (file: FirestoreDigitalFile) => {
    setEditingFile(file);
    setFileForm({
      title: file.title, developer: file.developer, category: file.category,
      description: file.description, shortDescription: file.shortDescription,
      price: file.price, coverImage: file.coverImage, fileUrl: file.fileUrl,
      qrCodeUrl: file.qrCodeUrl || "", fileType: file.fileType, fileSize: file.fileSize,
      whatYouWillGet: file.whatYouWillGet || "",
    });
    setShowAddFile(true);
  };

  const handleDeleteFile = async (id: string) => {
    try {
      await deleteDigitalFile(id);
      toast({ title: "File deleted" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleApproveFilePayment = async (req: any) => {
    try {
      await approveFilePayment(req.id, req.userId, req.fileId);
      toast({ title: "Payment approved! File unlocked for user." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleRejectFilePayment = async (id: string) => {
    try {
      await rejectFilePayment(id);
      toast({ title: "Payment rejected" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleDeleteFilePayment = async (id: string) => {
    try {
      await deleteFilePaymentRequest(id);
      toast({ title: "File payment request deleted" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const filteredRequests = requests
    .filter((r) => statusFilter === "all" || r.status === statusFilter)
    .filter((r) => !paymentSearch || r.transactionId?.toLowerCase().includes(paymentSearch.toLowerCase()) || r.userName?.toLowerCase().includes(paymentSearch.toLowerCase()) || r.userEmail?.toLowerCase().includes(paymentSearch.toLowerCase()));

  const pendingCount = requests.filter((r) => r.status === "pending").length;

  const filteredEbookRequests = ebookRequests
    .filter((r) => ebookStatusFilter === "all" || r.status === ebookStatusFilter)
    .filter((r) => !ebookPaymentSearch || r.transactionId?.toLowerCase().includes(ebookPaymentSearch.toLowerCase()) || r.userName?.toLowerCase().includes(ebookPaymentSearch.toLowerCase()) || r.userEmail?.toLowerCase().includes(ebookPaymentSearch.toLowerCase()));

  const ebookPendingCount = ebookRequests.filter((r) => r.status === "pending").length;

  const filteredFileRequests = fileRequests
    .filter((r) => fileStatusFilter === "all" || r.status === fileStatusFilter)
    .filter((r) => !filePaymentSearch || r.transactionId?.toLowerCase().includes(filePaymentSearch.toLowerCase()) || r.userName?.toLowerCase().includes(filePaymentSearch.toLowerCase()) || r.userEmail?.toLowerCase().includes(filePaymentSearch.toLowerCase()));

  const filePendingCount = fileRequests.filter((r) => r.status === "pending").length;

  const filteredCourses = courses.filter((c) => !courseSearch || c.title.toLowerCase().includes(courseSearch.toLowerCase()) || c.instructor.toLowerCase().includes(courseSearch.toLowerCase()));

  const filteredEbooks = ebooks.filter((e) => !ebookSearch || e.title.toLowerCase().includes(ebookSearch.toLowerCase()) || e.author.toLowerCase().includes(ebookSearch.toLowerCase()));

  const filteredDigitalFiles = digitalFiles.filter((f) => !fileSearch || f.title.toLowerCase().includes(fileSearch.toLowerCase()) || f.developer.toLowerCase().includes(fileSearch.toLowerCase()));

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
              {tab.id === "ebook-payments" && ebookPendingCount > 0 && (
                <Badge className="ml-auto bg-warning/20 text-warning text-xs px-1.5">{ebookPendingCount}</Badge>
              )}
              {tab.id === "file-payments" && filePendingCount > 0 && (
                <Badge className="ml-auto bg-warning/20 text-warning text-xs px-1.5">{filePendingCount}</Badge>
              )}
            </button>
          ))}
        </aside>

        <main className="flex-1 p-6">
          {/* Messages */}
          {activeTab === "messages" && <AdminChat />}

          {/* News */}
          {activeTab === "news" && <AdminNews toast={toast} />}

          {/* Overview */}
          {activeTab === "overview" && (
            <AdminAnalytics
              courses={courses}
              ebooks={ebooks}
              files={digitalFiles}
              users={users}
              coursePayments={requests}
              ebookPayments={ebookRequests}
              filePayments={fileRequests}
            />
          )}

          {/* Payments */}
          {activeTab === "payments" && (
            <div>
              <h1 className="font-display text-2xl font-bold mb-6">Payment Requests</h1>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search by name, email or transaction ID..." value={paymentSearch} onChange={(e) => setPaymentSearch(e.target.value)} className="pl-9" />
                </div>
                <div className="flex gap-2">
                  {["all", "pending", "approved", "rejected"].map((s) => (
                    <Button key={s} size="sm" variant={statusFilter === s ? "default" : "outline"} onClick={() => setStatusFilter(s)} className="capitalize hover:scale-105 transition-transform">
                      {s} {s === "pending" && pendingCount > 0 && `(${pendingCount})`}
                    </Button>
                  ))}
                </div>
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
              <div className="relative max-w-md mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search courses..." value={courseSearch} onChange={(e) => setCourseSearch(e.target.value)} className="pl-9" />
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
                      {filteredCourses.map((c) => (
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
                      {filteredCourses.length === 0 && (
                        <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No courses yet.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}


          {/* Ebooks Management */}
          {activeTab === "ebooks" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h1 className="font-display text-2xl font-bold">Manage Ebooks</h1>
                <Button variant="hero" onClick={() => { setEditingEbook(null); setEbookForm(emptyEbook); setShowAddEbook(true); }} className="hover:scale-105 transition-transform">
                  <Plus className="h-4 w-4 mr-1" /> Add Ebook
                </Button>
              </div>
              <div className="relative max-w-md mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search ebooks..." value={ebookSearch} onChange={(e) => setEbookSearch(e.target.value)} className="pl-9" />
              </div>

              {showAddEbook && (
                <div className="mb-8 rounded-2xl border border-border bg-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-display text-lg font-semibold">{editingEbook ? "Edit Ebook" : "New Ebook"}</h2>
                    <button onClick={() => { setShowAddEbook(false); setEditingEbook(null); }}><X className="h-5 w-5 text-muted-foreground" /></button>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div><Label>Title</Label><Input value={ebookForm.title} onChange={(e) => setEbookForm({...ebookForm, title: e.target.value})} placeholder="Ebook title" className="mt-1" /></div>
                    <div><Label>Author</Label><Input value={ebookForm.author} onChange={(e) => setEbookForm({...ebookForm, author: e.target.value})} placeholder="Author name" className="mt-1" /></div>
                    <div><Label>Price (ETB)</Label><Input type="number" value={ebookForm.price || ""} onChange={(e) => setEbookForm({...ebookForm, price: Number(e.target.value)})} placeholder="199" className="mt-1" /></div>
                    <div><Label>Pages</Label><Input type="number" value={ebookForm.pages || ""} onChange={(e) => setEbookForm({...ebookForm, pages: Number(e.target.value)})} placeholder="250" className="mt-1" /></div>
                    <div><Label>Short Description</Label><Input value={ebookForm.shortDescription} onChange={(e) => setEbookForm({...ebookForm, shortDescription: e.target.value})} placeholder="Brief summary" className="mt-1" /></div>
                    <div><Label>Cover Image URL</Label><Input value={ebookForm.coverImage} onChange={(e) => setEbookForm({...ebookForm, coverImage: e.target.value})} placeholder="https://..." className="mt-1" /></div>
                    <div><Label>PDF URL</Label><Input value={ebookForm.pdfUrl} onChange={(e) => setEbookForm({...ebookForm, pdfUrl: e.target.value})} placeholder="https://...ebook.pdf" className="mt-1" /></div>
                    <div><Label>Telebirr QR Code URL</Label><Input value={ebookForm.qrCodeUrl} onChange={(e) => setEbookForm({...ebookForm, qrCodeUrl: e.target.value})} placeholder="https://...qr-code.png" className="mt-1" /></div>
                    <div className="sm:col-span-2"><Label>Description</Label><Textarea value={ebookForm.description} onChange={(e) => setEbookForm({...ebookForm, description: e.target.value})} placeholder="Full description..." className="mt-1" /></div>
                    <div className="sm:col-span-2"><Label>What You'll Learn (one item per line)</Label><Textarea value={ebookForm.whatYouWillLearn} onChange={(e) => setEbookForm({...ebookForm, whatYouWillLearn: e.target.value})} placeholder="Core concepts of marketing&#10;How to build a brand&#10;..." rows={5} className="mt-1" /></div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button variant="hero" onClick={handleSaveEbook} className="hover:scale-105 transition-transform">
                      {editingEbook ? "Update Ebook" : "Save Ebook"}
                    </Button>
                    <Button variant="outline" onClick={() => { setShowAddEbook(false); setEditingEbook(null); }}>Cancel</Button>
                  </div>
                </div>
              )}

              {ebooksLoading ? (
                <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
              ) : (
                <div className="rounded-xl border border-border bg-card overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-secondary">
                      <tr>
                        <th className="text-left p-3 font-medium">Title</th>
                        <th className="text-left p-3 font-medium">Author</th>
                        <th className="text-left p-3 font-medium">Price</th>
                        <th className="text-left p-3 font-medium">Pages</th>
                        <th className="text-left p-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEbooks.map((e) => (
                        <tr key={e.id} className="border-t border-border hover:bg-secondary/50 transition-colors">
                          <td className="p-3 font-medium">{e.title}</td>
                          <td className="p-3 text-muted-foreground">{e.author}</td>
                          <td className="p-3">{e.price} ETB</td>
                          <td className="p-3">{e.pages}</td>
                          <td className="p-3">
                            <div className="flex gap-1">
                              <Button size="icon" variant="ghost" onClick={() => handleEditEbook(e)} className="hover:bg-primary/10 transition-colors">
                                <Edit className="h-4 w-4 text-primary" />
                              </Button>
                              <Button size="icon" variant="ghost" onClick={() => handleDeleteEbook(e.id)} className="hover:bg-destructive/10 transition-colors">
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredEbooks.length === 0 && (
                        <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No ebooks yet.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Ebook Payments */}
          {activeTab === "ebook-payments" && (
            <div>
              <h1 className="font-display text-2xl font-bold mb-6">Ebook Payment Requests</h1>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search by name, email or transaction ID..." value={ebookPaymentSearch} onChange={(e) => setEbookPaymentSearch(e.target.value)} className="pl-9" />
                </div>
                <div className="flex gap-2">
                  {["all", "pending", "approved", "rejected"].map((s) => (
                    <Button key={s} size="sm" variant={ebookStatusFilter === s ? "default" : "outline"} onClick={() => setEbookStatusFilter(s)} className="capitalize hover:scale-105 transition-transform">
                      {s} {s === "pending" && ebookPendingCount > 0 && `(${ebookPendingCount})`}
                    </Button>
                  ))}
                </div>
              </div>

              {ebookPaymentsLoading ? (
                <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
              ) : (
                <div className="rounded-xl border border-border bg-card overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-secondary">
                      <tr>
                        <th className="text-left p-3 font-medium">User</th>
                        <th className="text-left p-3 font-medium">Ebook</th>
                        <th className="text-left p-3 font-medium">Transaction ID</th>
                        <th className="text-left p-3 font-medium">Status</th>
                        <th className="text-left p-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEbookRequests.map((req) => (
                        <tr key={req.id} className="border-t border-border hover:bg-secondary/50 transition-colors">
                          <td className="p-3">
                            <p className="font-medium">{req.userName}</p>
                            <p className="text-xs text-muted-foreground">{req.userEmail}</p>
                          </td>
                          <td className="p-3 font-medium">{req.ebookTitle}</td>
                          <td className="p-3"><span className="font-mono tracking-wider text-foreground">{req.transactionId || "—"}</span></td>
                          <td className="p-3"><Badge className={`${STATUS_COLORS[req.status]} capitalize`}>{req.status}</Badge></td>
                          <td className="p-3">
                            <div className="flex gap-1">
                              {req.status === "pending" && (
                                <>
                                  <Button size="icon" variant="ghost" onClick={() => handleApproveEbookPayment(req)} title="Approve" className="hover:bg-accent/10 hover:text-accent transition-colors">
                                    <CheckCircle className="h-4 w-4 text-accent" />
                                  </Button>
                                  <Button size="icon" variant="ghost" onClick={() => handleRejectEbookPayment(req.id)} title="Reject" className="hover:bg-destructive/10 hover:text-destructive transition-colors">
                                    <XCircle className="h-4 w-4 text-destructive" />
                                  </Button>
                                </>
                              )}
                              <Button size="icon" variant="ghost" onClick={() => handleDeleteEbookPayment(req.id)} title="Delete" className="hover:bg-destructive/10 transition-colors">
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredEbookRequests.length === 0 && (
                        <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No ebook payment requests found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Files Management */}
          {activeTab === "files" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h1 className="font-display text-2xl font-bold">Manage Files</h1>
                <Button variant="hero" onClick={() => { setEditingFile(null); setFileForm(emptyFile); setShowAddFile(true); }} className="hover:scale-105 transition-transform">
                  <Plus className="h-4 w-4 mr-1" /> Add File
                </Button>
              </div>
              <div className="relative max-w-md mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search files..." value={fileSearch} onChange={(e) => setFileSearch(e.target.value)} className="pl-9" />
              </div>

              {showAddFile && (
                <div className="mb-8 rounded-2xl border border-border bg-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-display text-lg font-semibold">{editingFile ? "Edit File" : "New File"}</h2>
                    <button onClick={() => { setShowAddFile(false); setEditingFile(null); }}><X className="h-5 w-5 text-muted-foreground" /></button>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div><Label>Title</Label><Input value={fileForm.title} onChange={(e) => setFileForm({...fileForm, title: e.target.value})} placeholder="File title" className="mt-1" /></div>
                    <div><Label>Developer / Author</Label><Input value={fileForm.developer} onChange={(e) => setFileForm({...fileForm, developer: e.target.value})} placeholder="Developer name" className="mt-1" /></div>
                    <div><Label>Category</Label>
                      <select value={fileForm.category} onChange={(e) => setFileForm({...fileForm, category: e.target.value})} className="mt-1 w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground">
                        {["Software", "Application", "Website Code", "Template", "Plugin", "Document", "Other"].map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div><Label>File Type</Label>
                      <select value={fileForm.fileType} onChange={(e) => setFileForm({...fileForm, fileType: e.target.value})} className="mt-1 w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground">
                        {["Application", "ZIP", "Source Code", "PDF", "APK", "EXE", "Other"].map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div><Label>Price (ETB)</Label><Input type="number" value={fileForm.price || ""} onChange={(e) => setFileForm({...fileForm, price: Number(e.target.value)})} placeholder="199" className="mt-1" /></div>
                    <div><Label>File Size</Label><Input value={fileForm.fileSize} onChange={(e) => setFileForm({...fileForm, fileSize: e.target.value})} placeholder="e.g. 25 MB" className="mt-1" /></div>
                    <div><Label>Short Description</Label><Input value={fileForm.shortDescription} onChange={(e) => setFileForm({...fileForm, shortDescription: e.target.value})} placeholder="Brief summary" className="mt-1" /></div>
                    <div><Label>Cover Image URL</Label><Input value={fileForm.coverImage} onChange={(e) => setFileForm({...fileForm, coverImage: e.target.value})} placeholder="https://..." className="mt-1" /></div>
                    <div><Label>File Download URL</Label><Input value={fileForm.fileUrl} onChange={(e) => setFileForm({...fileForm, fileUrl: e.target.value})} placeholder="https://...file.zip" className="mt-1" /></div>
                    <div><Label>Telebirr QR Code URL</Label><Input value={fileForm.qrCodeUrl} onChange={(e) => setFileForm({...fileForm, qrCodeUrl: e.target.value})} placeholder="https://...qr-code.png" className="mt-1" /></div>
                    <div className="sm:col-span-2"><Label>Description</Label><Textarea value={fileForm.description} onChange={(e) => setFileForm({...fileForm, description: e.target.value})} placeholder="Full description..." className="mt-1" /></div>
                    <div className="sm:col-span-2"><Label>What You'll Get (one item per line)</Label><Textarea value={fileForm.whatYouWillGet} onChange={(e) => setFileForm({...fileForm, whatYouWillGet: e.target.value})} placeholder="Full source code&#10;Documentation&#10;Free updates..." rows={5} className="mt-1" /></div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button variant="hero" onClick={handleSaveFile} className="hover:scale-105 transition-transform">
                      {editingFile ? "Update File" : "Save File"}
                    </Button>
                    <Button variant="outline" onClick={() => { setShowAddFile(false); setEditingFile(null); }}>Cancel</Button>
                  </div>
                </div>
              )}

              {filesLoading ? (
                <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
              ) : (
                <div className="rounded-xl border border-border bg-card overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-secondary">
                      <tr>
                        <th className="text-left p-3 font-medium">Title</th>
                        <th className="text-left p-3 font-medium">Category</th>
                        <th className="text-left p-3 font-medium">Type</th>
                        <th className="text-left p-3 font-medium">Price</th>
                        <th className="text-left p-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDigitalFiles.map((f) => (
                        <tr key={f.id} className="border-t border-border hover:bg-secondary/50 transition-colors">
                          <td className="p-3 font-medium">{f.title}</td>
                          <td className="p-3"><Badge variant="secondary">{f.category}</Badge></td>
                          <td className="p-3 text-muted-foreground">{f.fileType}</td>
                          <td className="p-3">{f.price} ETB</td>
                          <td className="p-3">
                            <div className="flex gap-1">
                              <Button size="icon" variant="ghost" onClick={() => handleEditFile(f)} className="hover:bg-primary/10 transition-colors">
                                <Edit className="h-4 w-4 text-primary" />
                              </Button>
                              <Button size="icon" variant="ghost" onClick={() => handleDeleteFile(f.id)} className="hover:bg-destructive/10 transition-colors">
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredDigitalFiles.length === 0 && (
                        <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No files yet.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* File Payments */}
          {activeTab === "file-payments" && (
            <div>
              <h1 className="font-display text-2xl font-bold mb-6">File Payment Requests</h1>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search by name, email or transaction ID..." value={filePaymentSearch} onChange={(e) => setFilePaymentSearch(e.target.value)} className="pl-9" />
                </div>
                <div className="flex gap-2">
                  {["all", "pending", "approved", "rejected"].map((s) => (
                    <Button key={s} size="sm" variant={fileStatusFilter === s ? "default" : "outline"} onClick={() => setFileStatusFilter(s)} className="capitalize hover:scale-105 transition-transform">
                      {s} {s === "pending" && filePendingCount > 0 && `(${filePendingCount})`}
                    </Button>
                  ))}
                </div>
              </div>

              {filePaymentsLoading ? (
                <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
              ) : (
                <div className="rounded-xl border border-border bg-card overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-secondary">
                      <tr>
                        <th className="text-left p-3 font-medium">User</th>
                        <th className="text-left p-3 font-medium">File</th>
                        <th className="text-left p-3 font-medium">Transaction ID</th>
                        <th className="text-left p-3 font-medium">Status</th>
                        <th className="text-left p-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredFileRequests.map((req) => (
                        <tr key={req.id} className="border-t border-border hover:bg-secondary/50 transition-colors">
                          <td className="p-3">
                            <p className="font-medium">{req.userName}</p>
                            <p className="text-xs text-muted-foreground">{req.userEmail}</p>
                          </td>
                          <td className="p-3 font-medium">{req.fileTitle}</td>
                          <td className="p-3"><span className="font-mono tracking-wider text-foreground">{req.transactionId || "—"}</span></td>
                          <td className="p-3"><Badge className={`${STATUS_COLORS[req.status]} capitalize`}>{req.status}</Badge></td>
                          <td className="p-3">
                            <div className="flex gap-1">
                              {req.status === "pending" && (
                                <>
                                  <Button size="icon" variant="ghost" onClick={() => handleApproveFilePayment(req)} title="Approve" className="hover:bg-accent/10 hover:text-accent transition-colors">
                                    <CheckCircle className="h-4 w-4 text-accent" />
                                  </Button>
                                  <Button size="icon" variant="ghost" onClick={() => handleRejectFilePayment(req.id)} title="Reject" className="hover:bg-destructive/10 hover:text-destructive transition-colors">
                                    <XCircle className="h-4 w-4 text-destructive" />
                                  </Button>
                                </>
                              )}
                              <Button size="icon" variant="ghost" onClick={() => handleDeleteFilePayment(req.id)} title="Delete" className="hover:bg-destructive/10 transition-colors">
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredFileRequests.length === 0 && (
                        <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No file payment requests found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Community Links Management */}
          {activeTab === "community" && <CommunityLinksManager toast={toast} />}

          {activeTab === "collaborations" && <AdminCollaborations />}

          {/* Projects Management */}
          {activeTab === "projects" && <ProjectsManager courses={courses} toast={toast} />}

          {/* Completions */}
          {activeTab === "completions" && <CompletionsManager toast={toast} />}

          {/* Settings */}
          {activeTab === "settings" && <AdminSettingsManager toast={toast} />}

          {/* Users */}
          {activeTab === "users" && (
            <UsersManager users={users} courses={courses} loading={usersLoading} toast={toast} />
          )}
        </main>
      </div>
    </div>
  );
};

// ─── Projects Manager Sub-component ─────────────────────────

function ProjectsManager({ courses, toast }: { courses: FirestoreCourse[]; toast: any }) {
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const { project, loading } = useCourseProject(selectedCourseId || undefined);
  const [form, setForm] = useState({ projectTitle: "", projectDescription: "" });
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (project) {
      setForm({ projectTitle: project.projectTitle, projectDescription: project.projectDescription });
    } else {
      setForm({ projectTitle: "", projectDescription: "" });
    }
    setEditing(false);
  }, [project, selectedCourseId]);

  const handleSave = async () => {
    if (!selectedCourseId || !form.projectTitle) return;
    try {
      await saveCourseProject(selectedCourseId, form.projectTitle, form.projectDescription, project?.id);
      toast({ title: project ? "Project updated!" : "Project created!" });
      setEditing(false);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleDeleteProject = async () => {
    if (!project) return;
    try {
      await deleteCourseProject(project.id);
      toast({ title: "Project deleted" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-6">Course Project Assignments</h1>

      <div className="mb-6">
        <Label>Select Course</Label>
        <select
          value={selectedCourseId}
          onChange={(e) => setSelectedCourseId(e.target.value)}
          className="mt-1 w-full max-w-md rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground"
        >
          <option value="">-- Choose a course --</option>
          {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
      </div>

      {selectedCourseId && (
        loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : project && !editing ? (
          <div className="rounded-xl border border-border bg-card p-6 max-w-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-semibold flex items-center gap-2">
                <Award className="h-5 w-5 text-accent" /> Current Project
              </h2>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
                  <Edit className="h-3 w-3 mr-1" /> Edit
                </Button>
                <Button size="sm" variant="ghost" onClick={handleDeleteProject} className="hover:bg-destructive/10">
                  <Trash2 className="h-3 w-3 mr-1 text-destructive" /> Delete
                </Button>
              </div>
            </div>
            <h3 className="font-display font-semibold text-lg mb-2">{project.projectTitle}</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{project.projectDescription}</p>
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card p-6 max-w-2xl">
            <h2 className="font-display text-lg font-semibold mb-4">
              {project ? "Edit Project" : "Create Project Assignment"}
            </h2>
            <div className="space-y-4">
              <div>
                <Label>Project Title</Label>
                <Input value={form.projectTitle} onChange={(e) => setForm({ ...form, projectTitle: e.target.value })} placeholder="Build a Portfolio Website" className="mt-1" />
              </div>
              <div>
                <Label>Project Description</Label>
                <Textarea value={form.projectDescription} onChange={(e) => setForm({ ...form, projectDescription: e.target.value })} placeholder="Describe what the student must build, requirements, deliverables..." rows={8} className="mt-1" />
              </div>
              <div className="flex gap-2">
                <Button variant="hero" onClick={handleSave}>
                  {project ? "Update Project" : "Create Project"}
                </Button>
                {project && <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>}
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}

// ─── Community Links Manager Sub-component ───────────────────

function CommunityLinksManager({ toast }: { toast: any }) {
  const { links, loading } = useCommunityLinks();
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [urlValue, setUrlValue] = useState("");

  const handleSave = async (category: string) => {
    if (!urlValue.trim()) return;
    const existing = links.find((l) => l.category === category);
    try {
      await saveCommunityLink(category, urlValue.trim(), existing?.id);
      toast({ title: `${category} link saved!` });
      setEditingCategory(null);
      setUrlValue("");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCommunityLink(id);
      toast({ title: "Link deleted" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const startEditing = (category: string) => {
    const existing = links.find((l) => l.category === category);
    setEditingCategory(category);
    setUrlValue(existing?.url || "");
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-2">Community Links</h1>
      <p className="text-muted-foreground mb-6">Set Telegram group links for each course category</p>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (
        <div className="space-y-3 max-w-2xl">
          {CATEGORIES.map((category) => {
            const existing = links.find((l) => l.category === category);
            const isEditing = editingCategory === category;

            return (
              <div key={category} className="rounded-xl border border-border bg-card p-4 hover:border-primary/20 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-semibold">{category}</h3>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => startEditing(category)} className="hover:bg-primary/10">
                      <Edit className="h-3 w-3 mr-1 text-primary" /> Edit
                    </Button>
                    {existing && (
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(existing.id)} className="hover:bg-destructive/10">
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    )}
                  </div>
                </div>

                {isEditing ? (
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={urlValue}
                      onChange={(e) => setUrlValue(e.target.value)}
                      placeholder="https://t.me/your_group"
                      className="flex-1"
                    />
                    <Button size="sm" variant="hero" onClick={() => handleSave(category)}>Save</Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingCategory(null)}>Cancel</Button>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground truncate">
                    {existing ? (
                      <a href={existing.url} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">{existing.url}</a>
                    ) : (
                      <span className="italic">No link set</span>
                    )}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Users Manager Sub-component ─────────────────────────────

function UsersManager({ users, courses, loading, toast }: { users: FirestoreUser[]; courses: FirestoreCourse[]; loading: boolean; toast: any }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [editingUser, setEditingUser] = useState<FirestoreUser | null>(null);
  const [editForm, setEditForm] = useState({ full_name: "", email: "" });
  const [selectedUser, setSelectedUser] = useState<FirestoreUser | null>(null);
  const [addCourseId, setAddCourseId] = useState("");

  const filteredUsers = users.filter((u) =>
    u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const startEdit = (user: FirestoreUser) => {
    setEditingUser(user);
    setEditForm({ full_name: user.full_name, email: user.email });
  };

  const handleSaveEdit = async () => {
    if (!editingUser || !editForm.full_name.trim()) return;
    try {
      await updateUser(editingUser.user_id, { full_name: editForm.full_name.trim(), email: editForm.email.trim() });
      toast({ title: "User updated!" });
      setEditingUser(null);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleDeleteUser = async (user: FirestoreUser) => {
    if (!confirm(`Delete user "${user.full_name}"? This will remove all their enrollments and payments.`)) return;
    try {
      await deleteUser(user.user_id);
      toast({ title: "User deleted" });
      if (selectedUser?.user_id === user.user_id) setSelectedUser(null);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleRemoveCourse = async (userId: string, courseId: string) => {
    try {
      await removeUserCourseAccess(userId, courseId);
      toast({ title: "Course access removed" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleAddCourse = async (userId: string) => {
    if (!addCourseId) return;
    try {
      await enrollUser(userId, addCourseId);
      toast({ title: "Course access granted!" });
      setAddCourseId("");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const getCourseName = (courseId: string) => {
    return courses.find((c) => c.id === courseId)?.title || courseId;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold">Users Management</h1>
          <p className="text-muted-foreground text-sm">{users.length} total users</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-background/80 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-semibold">Edit User</h2>
              <Button size="icon" variant="ghost" onClick={() => setEditingUser(null)}><X className="h-4 w-4" /></Button>
            </div>
            <div className="space-y-4">
              <div>
                <Label>Full Name</Label>
                <Input value={editForm.full_name} onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label>Email</Label>
                <Input value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} className="mt-1" />
              </div>
              <div className="flex gap-2">
                <Button variant="hero" onClick={handleSaveEdit}>Save Changes</Button>
                <Button variant="outline" onClick={() => setEditingUser(null)}>Cancel</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Detail Panel */}
      {selectedUser && (
        <div className="rounded-xl border border-border bg-card p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-semibold flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" /> {selectedUser.full_name}
            </h2>
            <Button size="sm" variant="ghost" onClick={() => setSelectedUser(null)}><X className="h-4 w-4" /></Button>
          </div>
          <p className="text-sm text-muted-foreground mb-4">{selectedUser.email}</p>

          {/* Enrolled Courses */}
          <h3 className="text-sm font-semibold mb-2">Enrolled Courses ({selectedUser.courses_unlocked?.length || 0})</h3>
          {selectedUser.courses_unlocked?.length > 0 ? (
            <div className="space-y-2 mb-4">
              {selectedUser.courses_unlocked.map((courseId) => (
                <div key={courseId} className="flex items-center justify-between rounded-lg border border-border bg-secondary/50 p-3">
                  <span className="text-sm font-medium">{getCourseName(courseId)}</span>
                  <Button size="sm" variant="ghost" onClick={() => handleRemoveCourse(selectedUser.user_id, courseId)} className="hover:bg-destructive/10">
                    <BookMinus className="h-3 w-3 mr-1 text-destructive" /> Remove
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground mb-4 italic">No courses enrolled.</p>
          )}

          {/* Grant Course Access */}
          <h3 className="text-sm font-semibold mb-2">Grant Course Access</h3>
          <div className="flex gap-2">
            <select
              value={addCourseId}
              onChange={(e) => setAddCourseId(e.target.value)}
              className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Select a course...</option>
              {courses
                .filter((c) => !selectedUser.courses_unlocked?.includes(c.id))
                .map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
            </select>
            <Button size="sm" variant="hero" onClick={() => handleAddCourse(selectedUser.user_id)}>
              <BookPlus className="h-3 w-3 mr-1" /> Grant
            </Button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary">
              <tr>
                <th className="text-left p-3 font-medium">Name</th>
                <th className="text-left p-3 font-medium">Email</th>
                <th className="text-left p-3 font-medium">Courses</th>
                <th className="text-right p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.user_id} className="border-t border-border hover:bg-secondary/50 transition-colors cursor-pointer" onClick={() => setSelectedUser(u)}>
                  <td className="p-3 font-medium">{u.full_name}</td>
                  <td className="p-3 text-muted-foreground">{u.email}</td>
                  <td className="p-3">
                    <Badge variant="secondary">{u.courses_unlocked?.length || 0} courses</Badge>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex gap-1 justify-end" onClick={(e) => e.stopPropagation()}>
                      <Button size="sm" variant="ghost" onClick={() => startEdit(u)} className="hover:bg-primary/10">
                        <Edit className="h-3 w-3 text-primary" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDeleteUser(u)} className="hover:bg-destructive/10">
                        <UserX className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">
                  {searchQuery ? "No users match your search." : "No users yet."}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Completions Manager Sub-component ──────────────────────

const COMPLETION_STATUS_COLORS: Record<string, string> = {
  pending: "bg-warning/10 text-warning border-warning/20",
  project_assigned: "bg-primary/10 text-primary border-primary/20",
  certified: "bg-accent/10 text-accent border-accent/20",
};

function CompletionsManager({ toast }: { toast: any }) {
  const { requests, loading } = useCompletionRequests();

  const handleStatus = async (id: string, status: CourseCompletionRequest["status"]) => {
    try {
      await updateCompletionStatus(id, status);
      toast({ title: `Status updated to ${status.replace("_", " ")}` });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCompletionRequest(id);
      toast({ title: "Request deleted" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-6">Course Completion Requests</h1>
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-card">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Student</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Course</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id} className="border-b border-border hover:bg-card/50">
                  <td className="px-4 py-3">
                    <p className="font-medium">{r.userName}</p>
                    <p className="text-xs text-muted-foreground">{r.userEmail}</p>
                  </td>
                  <td className="px-4 py-3">{r.courseTitle}</td>
                  <td className="px-4 py-3">
                    <Badge className={COMPLETION_STATUS_COLORS[r.status] || ""} variant="outline">
                      {r.status.replace("_", " ")}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex gap-1 justify-end flex-wrap">
                      {r.status === "pending" && (
                        <Button size="sm" variant="outline" onClick={() => handleStatus(r.id, "project_assigned")}>
                          <Award className="h-3 w-3 mr-1" /> Assign Project
                        </Button>
                      )}
                      {r.status === "project_assigned" && (
                        <Button size="sm" variant="hero" onClick={() => handleStatus(r.id, "certified")}>
                          <CheckCircle className="h-3 w-3 mr-1" /> Certify
                        </Button>
                      )}
                      {r.status === "certified" && (
                        <Badge className="bg-accent/10 text-accent border-accent/20" variant="outline">
                          ✅ Certified
                        </Badge>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(r.id)} className="hover:bg-destructive/10">
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {requests.length === 0 && (
                <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No completion requests yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Admin Settings Manager Sub-component ────────────────────

function AdminSettingsManager({ toast }: { toast: any }) {
  const { settings, loading } = useAdminSettings();
  const [telegram, setTelegram] = useState("");

  useEffect(() => {
    if (settings.adminTelegram) setTelegram(settings.adminTelegram);
  }, [settings.adminTelegram]);

  const handleSave = async () => {
    try {
      await saveAdminTelegram(telegram.trim());
      toast({ title: "Telegram username saved!" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-6">Admin Settings</h1>
      <div className="rounded-xl border border-border bg-card p-6 max-w-lg">
        <div className="flex items-center gap-2 mb-4">
          <MessageCircle className="h-5 w-5 text-primary" />
          <h2 className="font-display text-lg font-semibold">Telegram Contact</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Students will see a "Contact Admin" button linking to this Telegram username. They'll also use it to submit projects.
        </p>
        <div className="space-y-3">
          <div>
            <Label>Telegram Username</Label>
            <Input
              value={telegram}
              onChange={(e) => setTelegram(e.target.value)}
              placeholder="@yourusername"
              className="mt-1"
            />
          </div>
          <Button variant="hero" onClick={handleSave}>Save</Button>
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;

import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import type { FirestoreCourse, FirestoreEbook, FirestoreDigitalFile, FirestoreUser, PaymentRequest, EbookPaymentRequest, FilePaymentRequest } from "@/hooks/useFirestore";
import {
  BookOpen, Users, TrendingUp, DollarSign, BarChart3, ShoppingCart, FileText, FolderOpen,
} from "lucide-react";

interface AnalyticsProps {
  courses: FirestoreCourse[];
  ebooks: FirestoreEbook[];
  files: FirestoreDigitalFile[];
  users: FirestoreUser[];
  coursePayments: PaymentRequest[];
  ebookPayments: EbookPaymentRequest[];
  filePayments: FilePaymentRequest[];
}

export default function AdminAnalytics({
  courses, ebooks, files, users,
  coursePayments, ebookPayments, filePayments,
}: AnalyticsProps) {
  const stats = useMemo(() => {
    const approvedCoursePayments = coursePayments.filter((p) => p.status === "approved");
    const approvedEbookPayments = ebookPayments.filter((p) => p.status === "approved");
    const approvedFilePayments = filePayments.filter((p) => p.status === "approved");

    // Per-course analytics — use paidAmount if available (discount-aware)
    const courseAnalytics = courses.map((course) => {
      const payments = approvedCoursePayments.filter((p) => p.courseId === course.id);
      const enrolledUsers = users.filter((u) => u.courses_unlocked?.includes(course.id));
      const revenue = payments.reduce((sum, p) => sum + ((p as any).paidAmount || course.price), 0);
      return {
        ...course,
        enrolledCount: enrolledUsers.length,
        revenue,
        paymentCount: payments.length,
      };
    });

    // Per-ebook analytics — discount-aware
    const ebookAnalytics = ebooks.map((ebook) => {
      const payments = approvedEbookPayments.filter((p) => p.ebookId === ebook.id);
      const revenue = payments.reduce((sum, p) => sum + ((p as any).paidAmount || ebook.price), 0);
      return {
        ...ebook,
        salesCount: payments.length,
        revenue,
      };
    });

    // Per-file analytics — discount-aware
    const fileAnalytics = files.map((file) => {
      const payments = approvedFilePayments.filter((p) => p.fileId === file.id);
      const revenue = payments.reduce((sum, p) => sum + ((p as any).paidAmount || file.price), 0);
      return {
        ...file,
        salesCount: payments.length,
        revenue,
      };
    });

    const totalCourseRevenue = courseAnalytics.reduce((sum, c) => sum + c.revenue, 0);
    const totalEbookRevenue = ebookAnalytics.reduce((sum, e) => sum + e.revenue, 0);
    const totalFileRevenue = fileAnalytics.reduce((sum, f) => sum + f.revenue, 0);
    const totalRevenue = totalCourseRevenue + totalEbookRevenue + totalFileRevenue;
    const totalEnrollments = approvedCoursePayments.length;
    const totalEbookSales = approvedEbookPayments.length;
    const totalFileSales = approvedFilePayments.length;
    const pendingAll = coursePayments.filter((p) => p.status === "pending").length
      + ebookPayments.filter((p) => p.status === "pending").length
      + filePayments.filter((p) => p.status === "pending").length;

    return {
      courseAnalytics, ebookAnalytics, fileAnalytics,
      totalCourseRevenue, totalEbookRevenue, totalFileRevenue, totalRevenue,
      totalEnrollments, totalEbookSales, totalFileSales, pendingAll,
    };
  }, [courses, ebooks, files, users, coursePayments, ebookPayments, filePayments]);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-6">Dashboard Overview</h1>

      {/* Top-level summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard icon={DollarSign} label="Total Revenue" value={`${stats.totalRevenue.toLocaleString()} ETB`} color="text-accent" />
        <StatCard icon={Users} label="Total Users" value={users.length} color="text-primary" />
        <StatCard icon={ShoppingCart} label="Total Sales" value={stats.totalEnrollments + stats.totalEbookSales + stats.totalFileSales} color="text-primary" />
        <StatCard icon={TrendingUp} label="Pending Payments" value={stats.pendingAll} color="text-warning" />
      </div>

      {/* Revenue breakdown */}
      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Course Revenue</span>
          </div>
          <p className="font-display text-xl font-bold text-primary">{stats.totalCourseRevenue.toLocaleString()} ETB</p>
          <p className="text-xs text-muted-foreground mt-1">{stats.totalEnrollments} enrollments across {courses.length} courses</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-4 w-4 text-accent" />
            <span className="text-sm font-medium">Ebook Revenue</span>
          </div>
          <p className="font-display text-xl font-bold text-accent">{stats.totalEbookRevenue.toLocaleString()} ETB</p>
          <p className="text-xs text-muted-foreground mt-1">{stats.totalEbookSales} sales across {ebooks.length} ebooks</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <FolderOpen className="h-4 w-4 text-warning" />
            <span className="text-sm font-medium">File Revenue</span>
          </div>
          <p className="font-display text-xl font-bold text-warning">{stats.totalFileRevenue.toLocaleString()} ETB</p>
          <p className="text-xs text-muted-foreground mt-1">{stats.totalFileSales} sales across {files.length} files</p>
        </div>
      </div>

      {/* Per-course analytics */}
      <h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-primary" /> Course Analytics
      </h2>
      <div className="rounded-xl border border-border bg-card overflow-x-auto mb-8">
        <table className="w-full text-sm">
          <thead className="bg-secondary">
            <tr>
              <th className="text-left p-3 font-medium">Course</th>
              <th className="text-left p-3 font-medium">Price</th>
              <th className="text-left p-3 font-medium">Enrolled Users</th>
              <th className="text-left p-3 font-medium">Approved Payments</th>
              <th className="text-left p-3 font-medium">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {stats.courseAnalytics.map((c) => (
              <tr key={c.id} className="border-t border-border hover:bg-secondary/50 transition-colors">
                <td className="p-3 font-medium">{c.title}</td>
                <td className="p-3">{c.price} ETB</td>
                <td className="p-3">
                  <Badge variant="secondary" className="gap-1">
                    <Users className="h-3 w-3" /> {c.enrolledCount}
                  </Badge>
                </td>
                <td className="p-3">{c.paymentCount}</td>
                <td className="p-3 font-semibold text-accent">{c.revenue.toLocaleString()} ETB</td>
              </tr>
            ))}
            {stats.courseAnalytics.length === 0 && (
              <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No courses yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Per-ebook analytics */}
      <h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-accent" /> Ebook Analytics
      </h2>
      <div className="rounded-xl border border-border bg-card overflow-x-auto mb-8">
        <table className="w-full text-sm">
          <thead className="bg-secondary">
            <tr>
              <th className="text-left p-3 font-medium">Ebook</th>
              <th className="text-left p-3 font-medium">Price</th>
              <th className="text-left p-3 font-medium">Sales</th>
              <th className="text-left p-3 font-medium">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {stats.ebookAnalytics.map((e) => (
              <tr key={e.id} className="border-t border-border hover:bg-secondary/50 transition-colors">
                <td className="p-3 font-medium">{e.title}</td>
                <td className="p-3">{e.price} ETB</td>
                <td className="p-3">{e.salesCount}</td>
                <td className="p-3 font-semibold text-accent">{e.revenue.toLocaleString()} ETB</td>
              </tr>
            ))}
            {stats.ebookAnalytics.length === 0 && (
              <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No ebooks yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Per-file analytics */}
      <h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-warning" /> File Analytics
      </h2>
      <div className="rounded-xl border border-border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-secondary">
            <tr>
              <th className="text-left p-3 font-medium">File</th>
              <th className="text-left p-3 font-medium">Price</th>
              <th className="text-left p-3 font-medium">Sales</th>
              <th className="text-left p-3 font-medium">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {stats.fileAnalytics.map((f) => (
              <tr key={f.id} className="border-t border-border hover:bg-secondary/50 transition-colors">
                <td className="p-3 font-medium">{f.title}</td>
                <td className="p-3">{f.price} ETB</td>
                <td className="p-3">{f.salesCount}</td>
                <td className="p-3 font-semibold text-accent">{f.revenue.toLocaleString()} ETB</td>
              </tr>
            ))}
            {stats.fileAnalytics.length === 0 && (
              <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No files yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string | number; color: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 hover:border-primary/30 transition-colors">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`h-5 w-5 ${color}`} />
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <p className={`font-display text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

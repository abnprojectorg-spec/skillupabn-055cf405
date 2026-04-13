import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type {
  FirestoreCourse, FirestoreEbook, FirestoreDigitalFile,
  PaymentRequest, EbookPaymentRequest, FilePaymentRequest,
  FirestoreUser, ReferralCode,
} from "@/hooks/useFirestore";
import {
  Search, BookOpen, FileText, FolderOpen, DollarSign, Users,
  ArrowLeft, Calendar, TrendingUp, Percent,
} from "lucide-react";

type ProductType = "courses" | "ebooks" | "files";
type DateFilter = "today" | "yesterday" | "month" | "year" | "all";

interface Props {
  courses: FirestoreCourse[];
  ebooks: FirestoreEbook[];
  files: FirestoreDigitalFile[];
  users: FirestoreUser[];
  coursePayments: PaymentRequest[];
  ebookPayments: EbookPaymentRequest[];
  filePayments: FilePaymentRequest[];
  referralCodes: ReferralCode[];
}

function getDateRange(filter: DateFilter): [Date, Date] {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  switch (filter) {
    case "today": return [startOfDay, now];
    case "yesterday": {
      const y = new Date(startOfDay); y.setDate(y.getDate() - 1);
      return [y, startOfDay];
    }
    case "month": {
      const m = new Date(now.getFullYear(), now.getMonth(), 1);
      return [m, now];
    }
    case "year": {
      const y = new Date(now.getFullYear(), 0, 1);
      return [y, now];
    }
    default: return [new Date(0), now];
  }
}

function filterByDate<T extends { createdAt: unknown }>(items: T[], filter: DateFilter): T[] {
  if (filter === "all") return items;
  const [start, end] = getDateRange(filter);
  return items.filter(item => {
    const ts = item.createdAt;
    if (!ts) return false;
    const d = typeof (ts as any).toDate === "function" ? (ts as any).toDate() : new Date(ts as any);
    return d >= start && d <= end;
  });
}

export default function AdminPaymentsAnalytics({
  courses, ebooks, files, users,
  coursePayments, ebookPayments, filePayments, referralCodes,
}: Props) {
  const [tab, setTab] = useState<ProductType>("courses");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [buyerSearch, setBuyerSearch] = useState("");

  const filteredCoursePayments = useMemo(() => filterByDate(coursePayments.filter(p => p.status === "approved"), dateFilter), [coursePayments, dateFilter]);
  const filteredEbookPayments = useMemo(() => filterByDate(ebookPayments.filter(p => p.status === "approved"), dateFilter), [ebookPayments, dateFilter]);
  const filteredFilePayments = useMemo(() => filterByDate(filePayments.filter(p => p.status === "approved"), dateFilter), [filePayments, dateFilter]);

  // Product lists
  const productList = useMemo(() => {
    if (tab === "courses") {
      return courses.filter(c => !search || c.title.toLowerCase().includes(search.toLowerCase())).map(c => {
        const payments = filteredCoursePayments.filter(p => p.courseId === c.id);
        const withDiscount = payments.filter(p => {
          const code = referralCodes.find(rc => rc.productType === "course" && rc.productId === c.id && rc.active);
          return !!code && (p as any).referralCode;
        });
        const paidAmount = payments.reduce((sum, p) => sum + ((p as any).paidAmount || c.price), 0);
        return { id: c.id, title: c.title, price: c.price, isFree: c.isFree, totalUsers: payments.length, revenue: paidAmount, withDiscountCount: withDiscount.length, payments };
      });
    }
    if (tab === "ebooks") {
      return ebooks.filter(e => !search || e.title.toLowerCase().includes(search.toLowerCase())).map(e => {
        const payments = filteredEbookPayments.filter(p => p.ebookId === e.id);
        const paidAmount = payments.reduce((sum, p) => sum + ((p as any).paidAmount || e.price), 0);
        return { id: e.id, title: e.title, price: e.price, isFree: e.isFree, totalUsers: payments.length, revenue: paidAmount, withDiscountCount: 0, payments };
      });
    }
    return files.filter(f => !search || f.title.toLowerCase().includes(search.toLowerCase())).map(f => {
      const payments = filteredFilePayments.filter(p => p.fileId === f.id);
      const paidAmount = payments.reduce((sum, p) => sum + ((p as any).paidAmount || f.price), 0);
      return { id: f.id, title: f.title, price: f.price, isFree: f.isFree, totalUsers: payments.length, revenue: paidAmount, withDiscountCount: 0, payments };
    });
  }, [tab, search, courses, ebooks, files, filteredCoursePayments, filteredEbookPayments, filteredFilePayments, referralCodes]);

  const selectedProductData = selectedProduct ? productList.find(p => p.id === selectedProduct) : null;

  const tabIcon = tab === "courses" ? BookOpen : tab === "ebooks" ? FileText : FolderOpen;
  const TabIcon = tabIcon;

  // Buyer list for selected product
  const buyers = useMemo(() => {
    if (!selectedProductData) return [];
    return selectedProductData.payments
      .filter(p => !buyerSearch || p.userName?.toLowerCase().includes(buyerSearch.toLowerCase()) || p.userEmail?.toLowerCase().includes(buyerSearch.toLowerCase()))
      .map(p => ({
        name: p.userName,
        email: p.userEmail,
        transactionId: p.transactionId,
        paidAmount: (p as any).paidAmount,
        hasDiscount: !!(p as any).referralCode,
      }));
  }, [selectedProductData, buyerSearch]);

  const DATE_FILTERS: { id: DateFilter; label: string }[] = [
    { id: "all", label: "All Time" },
    { id: "today", label: "Today" },
    { id: "yesterday", label: "Yesterday" },
    { id: "month", label: "This Month" },
    { id: "year", label: "This Year" },
  ];

  if (selectedProductData) {
    return (
      <div>
        <Button variant="ghost" size="sm" onClick={() => { setSelectedProduct(null); setBuyerSearch(""); }} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to list
        </Button>
        <h2 className="font-display text-xl font-bold mb-4">{selectedProductData.title}</h2>

        {/* Metrics */}
        <div className="grid gap-4 sm:grid-cols-3 mb-6">
          <div className="rounded-xl border border-border bg-card p-4">
            <DollarSign className="h-5 w-5 text-accent mb-1" />
            <p className="font-display text-xl font-bold text-accent">{selectedProductData.revenue.toLocaleString()} ETB</p>
            <p className="text-xs text-muted-foreground">Total Revenue</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <Users className="h-5 w-5 text-primary mb-1" />
            <p className="font-display text-xl font-bold">{selectedProductData.totalUsers}</p>
            <p className="text-xs text-muted-foreground">Total Buyers</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <Percent className="h-5 w-5 text-warning mb-1" />
            <p className="font-display text-xl font-bold">{selectedProductData.withDiscountCount}</p>
            <p className="text-xs text-muted-foreground">With Discount</p>
          </div>
        </div>

        {/* Buyers */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Buyers</h3>
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search buyers..." value={buyerSearch} onChange={(e) => setBuyerSearch(e.target.value)} className="pl-9 h-8 text-sm" />
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary">
              <tr>
                <th className="text-left p-3 font-medium">Name</th>
                <th className="text-left p-3 font-medium">Email</th>
                <th className="text-left p-3 font-medium">Transaction ID</th>
                <th className="text-left p-3 font-medium">Discount</th>
              </tr>
            </thead>
            <tbody>
              {buyers.map((b, i) => (
                <tr key={i} className="border-t border-border hover:bg-secondary/50">
                  <td className="p-3 font-medium">{b.name}</td>
                  <td className="p-3 text-muted-foreground">{b.email}</td>
                  <td className="p-3 font-mono text-xs">{b.transactionId || "—"}</td>
                  <td className="p-3">{b.hasDiscount ? <Badge className="bg-warning/10 text-warning border-warning/20">Yes</Badge> : "No"}</td>
                </tr>
              ))}
              {buyers.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No buyers found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-6">Payments Analytics</h1>

      {/* Tab switcher */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {([
          { id: "courses" as ProductType, label: "Courses", icon: BookOpen },
          { id: "ebooks" as ProductType, label: "Ebooks", icon: FileText },
          { id: "files" as ProductType, label: "Files", icon: FolderOpen },
        ]).map(t => (
          <Button key={t.id} variant={tab === t.id ? "default" : "outline"} size="sm" onClick={() => { setTab(t.id); setSearch(""); setSelectedProduct(null); }} className="gap-1.5">
            <t.icon className="h-4 w-4" />{t.label}
          </Button>
        ))}
      </div>

      {/* Date filter + search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {DATE_FILTERS.map(f => (
            <Button key={f.id} size="sm" variant={dateFilter === f.id ? "default" : "outline"} onClick={() => setDateFilter(f.id)} className="text-xs h-8">
              {f.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Product list */}
      <div className="rounded-xl border border-border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-secondary">
            <tr>
              <th className="text-left p-3 font-medium">Product</th>
              <th className="text-left p-3 font-medium">Price</th>
              <th className="text-left p-3 font-medium">Sales</th>
              <th className="text-left p-3 font-medium">Revenue</th>
              <th className="text-left p-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {productList.map(p => (
              <tr key={p.id} className="border-t border-border hover:bg-secondary/50 transition-colors cursor-pointer" onClick={() => setSelectedProduct(p.id)}>
                <td className="p-3 font-medium">{p.title}</td>
                <td className="p-3">{p.isFree ? <Badge className="bg-accent/10 text-accent border-accent/20">Free</Badge> : `${p.price} ETB`}</td>
                <td className="p-3"><Badge variant="secondary">{p.totalUsers}</Badge></td>
                <td className="p-3 font-semibold text-accent">{p.revenue.toLocaleString()} ETB</td>
                <td className="p-3"><Button variant="outline" size="sm" className="text-xs">Details</Button></td>
              </tr>
            ))}
            {productList.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No products found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

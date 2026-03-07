import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import Navbar from "@/components/Navbar";
import { COURSES, CATEGORIES, MOCK_TRANSACTIONS } from "@/data/mockData";
import {
  LayoutDashboard, BookOpen, Users, CreditCard, Plus, Pencil, Trash2, Eye, X,
} from "lucide-react";

const ADMIN_TABS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "courses", label: "Courses", icon: BookOpen },
  { id: "users", label: "Users", icon: Users },
  { id: "transactions", label: "Transactions", icon: CreditCard },
];

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [showAddCourse, setShowAddCourse] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16 flex">
        {/* Sidebar */}
        <aside className="hidden md:flex w-64 flex-col border-r border-border bg-card min-h-[calc(100vh-4rem)] p-4 sticky top-16">
          <div className="p-3 mb-6">
            <p className="font-display text-lg font-bold">Admin Panel</p>
            <p className="text-xs text-muted-foreground">Manage your platform</p>
          </div>
          {ADMIN_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors mb-1 ${
                activeTab === tab.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </aside>

        {/* Content */}
        <main className="flex-1 p-6">
          {activeTab === "overview" && (
            <div>
              <h1 className="font-display text-2xl font-bold mb-6">Dashboard Overview</h1>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                {[
                  { label: "Total Courses", value: COURSES.length, color: "text-primary" },
                  { label: "Total Students", value: "248", color: "text-success" },
                  { label: "Revenue", value: "42,500 ETB", color: "text-accent" },
                  { label: "Transactions", value: MOCK_TRANSACTIONS.length, color: "text-warning" },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-xl border border-border bg-card p-5">
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className={`font-display text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
                  </div>
                ))}
              </div>
              <h2 className="font-display text-lg font-semibold mb-4">Recent Transactions</h2>
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-secondary">
                    <tr>
                      <th className="text-left p-3 font-medium">ID</th>
                      <th className="text-left p-3 font-medium">Student</th>
                      <th className="text-left p-3 font-medium">Course</th>
                      <th className="text-left p-3 font-medium">Amount</th>
                      <th className="text-left p-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MOCK_TRANSACTIONS.map((t) => (
                      <tr key={t.id} className="border-t border-border">
                        <td className="p-3 font-mono text-xs">{t.id}</td>
                        <td className="p-3">{t.studentName}</td>
                        <td className="p-3">{t.courseTitle}</td>
                        <td className="p-3">{t.amount} ETB</td>
                        <td className="p-3">
                          <Badge variant={t.status === "confirmed" ? "default" : t.status === "pending" ? "secondary" : "destructive"}>
                            {t.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
                    <div><Label>Title</Label><Input placeholder="Course title" className="mt-1" /></div>
                    <div><Label>Instructor</Label><Input placeholder="Instructor name" className="mt-1" /></div>
                    <div><Label>Category</Label>
                      <select className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                        {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div><Label>Price (ETB)</Label><Input type="number" placeholder="499" className="mt-1" /></div>
                    <div className="sm:col-span-2"><Label>Description</Label><Textarea placeholder="Course description..." className="mt-1" /></div>
                    <div><Label>Thumbnail URL</Label><Input placeholder="https://..." className="mt-1" /></div>
                    <div><Label>Video URL</Label><Input placeholder="YouTube embed URL" className="mt-1" /></div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button variant="hero">Save Course</Button>
                    <Button variant="outline" onClick={() => setShowAddCourse(false)}>Cancel</Button>
                  </div>
                </div>
              )}

              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-secondary">
                    <tr>
                      <th className="text-left p-3 font-medium">Title</th>
                      <th className="text-left p-3 font-medium">Category</th>
                      <th className="text-left p-3 font-medium">Price</th>
                      <th className="text-left p-3 font-medium">Students</th>
                      <th className="text-left p-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {COURSES.map((c) => (
                      <tr key={c.id} className="border-t border-border">
                        <td className="p-3 font-medium">{c.title}</td>
                        <td className="p-3"><Badge variant="secondary">{c.category}</Badge></td>
                        <td className="p-3">{c.price} ETB</td>
                        <td className="p-3">{c.students}</td>
                        <td className="p-3">
                          <div className="flex gap-1">
                            <Button size="icon" variant="ghost"><Eye className="h-4 w-4" /></Button>
                            <Button size="icon" variant="ghost"><Pencil className="h-4 w-4" /></Button>
                            <Button size="icon" variant="ghost"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "users" && (
            <div>
              <h1 className="font-display text-2xl font-bold mb-6">Users</h1>
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-secondary">
                    <tr>
                      <th className="text-left p-3 font-medium">Name</th>
                      <th className="text-left p-3 font-medium">Email</th>
                      <th className="text-left p-3 font-medium">Courses</th>
                      <th className="text-left p-3 font-medium">Joined</th>
                      <th className="text-left p-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: "Kidist Mengistu", email: "kidist@example.com", courses: 2, joined: "2026-01-15" },
                      { name: "Samuel Bekele", email: "samuel@example.com", courses: 1, joined: "2026-02-01" },
                      { name: "Tigist Assefa", email: "tigist@example.com", courses: 3, joined: "2026-01-20" },
                      { name: "Dawit Hailu", email: "dawit@example.com", courses: 1, joined: "2026-02-15" },
                      { name: "Hana Girma", email: "hana@example.com", courses: 2, joined: "2026-03-01" },
                    ].map((u) => (
                      <tr key={u.email} className="border-t border-border">
                        <td className="p-3 font-medium">{u.name}</td>
                        <td className="p-3 text-muted-foreground">{u.email}</td>
                        <td className="p-3">{u.courses}</td>
                        <td className="p-3">{u.joined}</td>
                        <td className="p-3">
                          <Button size="sm" variant="outline">Unlock Course</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "transactions" && (
            <div>
              <h1 className="font-display text-2xl font-bold mb-6">All Transactions</h1>
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-secondary">
                    <tr>
                      <th className="text-left p-3 font-medium">Transaction ID</th>
                      <th className="text-left p-3 font-medium">Student</th>
                      <th className="text-left p-3 font-medium">Course</th>
                      <th className="text-left p-3 font-medium">Amount</th>
                      <th className="text-left p-3 font-medium">Date</th>
                      <th className="text-left p-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MOCK_TRANSACTIONS.map((t) => (
                      <tr key={t.id} className="border-t border-border">
                        <td className="p-3 font-mono text-xs">{t.id}</td>
                        <td className="p-3">{t.studentName}</td>
                        <td className="p-3">{t.courseTitle}</td>
                        <td className="p-3">{t.amount} ETB</td>
                        <td className="p-3">{t.date}</td>
                        <td className="p-3">
                          <Badge variant={t.status === "confirmed" ? "default" : t.status === "pending" ? "secondary" : "destructive"}>
                            {t.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminPanel;

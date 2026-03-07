import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import CourseCard from "@/components/CourseCard";
import { COURSES, MOCK_USER, COMMUNITY_LINKS } from "@/data/mockData";
import {
  Home, BookOpen, FolderOpen, Users, User, Award, ExternalLink, GraduationCap,
} from "lucide-react";

const TABS = [
  { id: "home", label: "Home", icon: Home },
  { id: "courses", label: "My Courses", icon: BookOpen },
  { id: "projects", label: "Projects", icon: FolderOpen },
  { id: "community", label: "Community", icon: Users },
  { id: "profile", label: "Profile", icon: User },
];

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState("home");
  const unlockedCourses = COURSES.filter((c) => MOCK_USER.coursesUnlocked.includes(c.id));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16 flex">
        {/* Sidebar */}
        <aside className="hidden md:flex w-64 flex-col border-r border-border bg-card min-h-[calc(100vh-4rem)] p-4 sticky top-16">
          <div className="flex items-center gap-3 p-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-full gradient-primary text-sm font-bold text-primary-foreground">
              {MOCK_USER.fullName.split(" ").map(n => n[0]).join("")}
            </div>
            <div>
              <p className="text-sm font-semibold">{MOCK_USER.fullName}</p>
              <p className="text-xs text-muted-foreground">{MOCK_USER.email}</p>
            </div>
          </div>
          {TABS.map((tab) => (
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

        {/* Mobile tabs */}
        <div className="fixed bottom-0 left-0 right-0 z-50 flex border-t border-border bg-card md:hidden">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-1 flex-col items-center gap-1 py-3 text-xs ${
                activeTab === tab.id ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <main className="flex-1 p-6 pb-24 md:pb-6">
          {activeTab === "home" && (
            <div>
              <h1 className="font-display text-2xl font-bold mb-1">Welcome back, {MOCK_USER.fullName.split(" ")[0]}!</h1>
              <p className="text-muted-foreground mb-8">Continue your learning journey</p>
              <div className="grid gap-4 sm:grid-cols-3 mb-8">
                <div className="rounded-xl border border-border bg-card p-5">
                  <BookOpen className="h-5 w-5 text-primary mb-2" />
                  <p className="font-display text-2xl font-bold">{unlockedCourses.length}</p>
                  <p className="text-sm text-muted-foreground">Enrolled Courses</p>
                </div>
                <div className="rounded-xl border border-border bg-card p-5">
                  <Award className="h-5 w-5 text-success mb-2" />
                  <p className="font-display text-2xl font-bold">{unlockedCourses.length}</p>
                  <p className="text-sm text-muted-foreground">Certificates</p>
                </div>
                <div className="rounded-xl border border-border bg-card p-5">
                  <GraduationCap className="h-5 w-5 text-accent mb-2" />
                  <p className="font-display text-2xl font-bold">12h</p>
                  <p className="text-sm text-muted-foreground">Learning Time</p>
                </div>
              </div>
              <h2 className="font-display text-lg font-semibold mb-4">All Courses</h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {COURSES.slice(0, 6).map((c) => (
                  <CourseCard key={c.id} course={c} isUnlocked={MOCK_USER.coursesUnlocked.includes(c.id)} />
                ))}
              </div>
            </div>
          )}

          {activeTab === "courses" && (
            <div>
              <h1 className="font-display text-2xl font-bold mb-6">My Courses</h1>
              {unlockedCourses.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {unlockedCourses.map((c) => <CourseCard key={c.id} course={c} isUnlocked />)}
                </div>
              ) : (
                <div className="py-16 text-center">
                  <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground mb-4">You haven't unlocked any courses yet.</p>
                  <Link to="/marketplace"><Button variant="hero">Browse Courses</Button></Link>
                </div>
              )}
            </div>
          )}

          {activeTab === "projects" && (
            <div>
              <h1 className="font-display text-2xl font-bold mb-6">Projects & Resources</h1>
              <div className="grid gap-4 sm:grid-cols-2">
                {["Starter Templates", "Code Snippets", "Design Assets", "Learning Roadmaps"].map((p) => (
                  <div key={p} className="rounded-xl border border-border bg-card p-6 hover:shadow-md transition-shadow">
                    <FolderOpen className="h-5 w-5 text-primary mb-3" />
                    <h3 className="font-display font-semibold mb-1">{p}</h3>
                    <p className="text-sm text-muted-foreground">Coming soon</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "community" && (
            <div>
              <h1 className="font-display text-2xl font-bold mb-2">Community</h1>
              <p className="text-muted-foreground mb-6">Join Telegram groups for each category</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {COMMUNITY_LINKS.map((c) => (
                  <a key={c.category} href={c.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between rounded-xl border border-border bg-card p-4 hover:border-primary/30 transition-colors">
                    <span className="text-sm font-medium">{c.category}</span>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {activeTab === "profile" && (
            <div>
              <h1 className="font-display text-2xl font-bold mb-6">Profile</h1>
              <div className="rounded-2xl border border-border bg-card p-8 max-w-lg">
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full gradient-primary text-xl font-bold text-primary-foreground">
                    {MOCK_USER.fullName.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <h2 className="font-display text-lg font-semibold">{MOCK_USER.fullName}</h2>
                    <p className="text-sm text-muted-foreground">{MOCK_USER.email}</p>
                  </div>
                </div>
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Member since</span>
                    <span>{MOCK_USER.signupDate}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Courses enrolled</span>
                    <span>{unlockedCourses.length}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Certificates</span>
                    <Badge variant="secondary">{unlockedCourses.length}</Badge>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;

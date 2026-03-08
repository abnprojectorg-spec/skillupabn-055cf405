import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnimatedBackground from "@/components/AnimatedBackground";
import { useCourses } from "@/hooks/useFirestore";
import CourseCard from "@/components/CourseCard";
import { CATEGORIES } from "@/data/mockData";
import {
  GraduationCap, Search, CreditCard, Award, Code, Palette, Briefcase, Brain,
  Languages, Megaphone, TrendingUp, Heart, Music, Atom, ChevronRight, Star,
  Shield, Zap, Users,
} from "lucide-react";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  "Programming & Tech": <Code className="h-6 w-6" />,
  "Design & Creativity": <Palette className="h-6 w-6" />,
  "Business & Entrepreneurship": <Briefcase className="h-6 w-6" />,
  "Personal Development": <Brain className="h-6 w-6" />,
  "Languages & Communication": <Languages className="h-6 w-6" />,
  "Marketing & Social Media": <Megaphone className="h-6 w-6" />,
  "Finance & Investment": <TrendingUp className="h-6 w-6" />,
  "Health & Fitness": <Heart className="h-6 w-6" />,
  "Arts & Music": <Music className="h-6 w-6" />,
  "Science & Engineering": <Atom className="h-6 w-6" />,
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const LandingPage = () => {
  const { courses, loading } = useCourses();
  const featuredCourses = courses.slice(0, 4);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-20 lg:pt-44 lg:pb-32">
        <AnimatedBackground />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl"
          >
            <Badge className="mb-6 gradient-primary border-0 text-primary-foreground px-4 py-1.5 text-sm">
              🚀 The Future of Learning
            </Badge>
            <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl lg:text-7xl">
              Learn Real Skills.{" "}
              <span className="text-gradient-glow">Build Real Income.</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed">
              Master in-demand skills from expert instructors. Join a growing community of learners transforming their careers.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link to="/signup">
                <Button variant="hero" size="lg" className="text-base px-8 py-6 shadow-glow">
                  Get Started Free
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/marketplace">
                <Button variant="heroOutline" size="lg" className="text-base px-8 py-6">
                  Browse Courses
                </Button>
              </Link>
            </div>
            <div className="mt-12 flex items-center gap-8 text-sm text-muted-foreground">
              <span className="flex items-center gap-2"><Zap className="h-4 w-4 text-warning" /> Instant Access</span>
              <span className="flex items-center gap-2"><Shield className="h-4 w-4 text-accent" /> Secure Payments</span>
              <span className="flex items-center gap-2"><Award className="h-4 w-4 text-warning" /> Certificates</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y border-border bg-card/50 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4 text-center">
            {[
              { value: `${courses.length || "—"}`, label: "Courses Available" },
              { value: "10", label: "Categories" },
              { value: "24/7", label: "Access Anytime" },
              { value: "100%", label: "Completion Certs" },
            ].map((s) => (
              <div key={s.label}>
                <p className="font-display text-3xl font-bold text-gradient">{s.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">How It Works</Badge>
            <h2 className="font-display text-3xl font-bold sm:text-4xl">Start Learning in Minutes</h2>
            <p className="mt-4 text-muted-foreground max-w-lg mx-auto">Three simple steps to unlock your potential</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { icon: <Search className="h-7 w-7" />, title: "Browse & Choose", desc: "Explore courses across 10 categories and find what fits your career goals." },
              { icon: <CreditCard className="h-7 w-7" />, title: "Secure Payment", desc: "Quick and secure payment via Telebirr. Instant access after confirmation." },
              { icon: <GraduationCap className="h-7 w-7" />, title: "Learn & Certify", desc: "Learn at your own pace and earn a recognized certificate of completion." },
            ].map((step, i) => (
              <motion.div
                key={step.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="relative text-center p-8 rounded-2xl border border-border bg-card hover:border-accent/30 hover:shadow-glow transition-all duration-500 group"
              >
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl gradient-primary text-primary-foreground group-hover:shadow-glow transition-shadow duration-500">
                  {step.icon}
                </div>
                <h3 className="font-display text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-24 bg-card/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">Categories</Badge>
            <h2 className="font-display text-3xl font-bold sm:text-4xl">Explore 10 Skill Paths</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
            {CATEGORIES.map((cat, i) => (
              <motion.div
                key={cat}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
              >
                <Link
                  to={`/marketplace?category=${encodeURIComponent(cat)}`}
                  className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-5 text-center transition-all duration-300 hover:shadow-glow hover:border-accent/40 hover:-translate-y-1 group"
                >
                  <div className="text-accent group-hover:text-warning transition-colors duration-300">{CATEGORY_ICONS[cat]}</div>
                  <span className="text-xs font-medium">{cat}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-24 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <Badge variant="secondary" className="mb-4">Featured</Badge>
              <h2 className="font-display text-3xl font-bold sm:text-4xl">Popular Courses</h2>
              <p className="mt-3 text-muted-foreground">Top picks from our growing catalog</p>
            </div>
            <Link to="/marketplace">
              <Button variant="outline" className="group">
                View All <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[1,2,3,4].map((i) => (
                <div key={i} className="rounded-xl border border-border bg-card h-80 animate-pulse" />
              ))}
            </div>
          ) : featuredCourses.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featuredCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>Courses are being added. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-card/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">Why SkillUp</Badge>
            <h2 className="font-display text-3xl font-bold sm:text-4xl">Built for Real Learning</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { icon: <Award className="h-8 w-8" />, title: "Recognized Certificates", desc: "Earn certificates that validate your skills to employers and clients." },
              { icon: <Users className="h-8 w-8" />, title: "Community Access", desc: "Join Telegram groups for each category. Learn and grow with peers." },
              { icon: <Zap className="h-8 w-8" />, title: "Instant Access", desc: "Pay via Telebirr and start learning immediately. No waiting." },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="p-8 rounded-2xl border border-border bg-card hover:border-accent/30 transition-all duration-500 group"
              >
                <div className="text-accent mb-4 group-hover:text-warning transition-colors duration-300">{f.icon}</div>
                <h3 className="font-display text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 overflow-hidden">
        <AnimatedBackground />
        <div className="relative mx-auto max-w-3xl px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-display text-3xl font-bold sm:text-5xl">
              Ready to <span className="text-gradient-glow">Transform</span> Your Career?
            </h2>
            <p className="mt-6 text-muted-foreground text-lg">
              Join our growing community of learners building real skills for real income.
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <Link to="/signup">
                <Button variant="hero" size="lg" className="text-base px-8 py-6 shadow-glow">
                  Join Now — It's Free
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;

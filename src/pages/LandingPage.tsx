import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CourseCard from "@/components/CourseCard";
import { COURSES, CATEGORIES, TESTIMONIALS } from "@/data/mockData";
import {
  GraduationCap, Search, CreditCard, Award, Code, Palette, Briefcase, Brain,
  Languages, Megaphone, TrendingUp, Heart, Music, Atom, ChevronRight, Star,
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
  const featuredCourses = COURSES.slice(0, 4);

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden gradient-hero pt-32 pb-20 lg:pt-40 lg:pb-28">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 h-72 w-72 rounded-full bg-primary/30 blur-3xl" />
          <div className="absolute bottom-10 right-10 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl"
          >
            <Badge className="mb-6 gradient-primary border-0 text-primary-foreground">
              🚀 Start Learning Today
            </Badge>
            <h1 className="font-display text-4xl font-bold tracking-tight text-primary-foreground sm:text-5xl lg:text-6xl">
              Learn Real Skills.{" "}
              <span className="text-accent">Build Real Income.</span>
            </h1>
            <p className="mt-6 text-lg text-primary-foreground/70 max-w-xl">
              Master in-demand skills from expert instructors. Pay easily with Telebirr and unlock courses instantly.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/signup">
                <Button variant="hero" size="lg">
                  Get Started Free
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/marketplace">
                <Button variant="heroOutline" size="lg" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                  Browse Courses
                </Button>
              </Link>
            </div>
            <div className="mt-10 flex items-center gap-6 text-sm text-primary-foreground/60">
              <span className="flex items-center gap-1"><GraduationCap className="h-4 w-4" /> 50+ Courses</span>
              <span className="flex items-center gap-1"><Star className="h-4 w-4" /> 4.7 Rating</span>
              <span className="flex items-center gap-1"><Award className="h-4 w-4" /> Certificates</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl font-bold">How It Works</h2>
            <p className="mt-3 text-muted-foreground">Three simple steps to start learning</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { icon: <Search className="h-7 w-7" />, title: "Browse & Choose", desc: "Explore courses across 10 categories and find what fits your goals." },
              { icon: <CreditCard className="h-7 w-7" />, title: "Pay with Telebirr", desc: "Quick and secure payment via Telebirr H5. Instant confirmation." },
              { icon: <GraduationCap className="h-7 w-7" />, title: "Learn & Earn", desc: "Access your course instantly, learn at your pace, and earn a certificate." },
            ].map((step, i) => (
              <motion.div
                key={step.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="text-center p-8 rounded-2xl border border-border bg-card hover:shadow-lg transition-shadow"
              >
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl gradient-primary text-primary-foreground">
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
      <section className="py-20 bg-secondary/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl font-bold">Explore Categories</h2>
            <p className="mt-3 text-muted-foreground">Find your path from 10 skill categories</p>
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
                  className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-5 text-center transition-all hover:shadow-md hover:border-primary/30 hover:-translate-y-1"
                >
                  <div className="text-primary">{CATEGORY_ICONS[cat]}</div>
                  <span className="text-xs font-medium text-card-foreground">{cat}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-20 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="font-display text-3xl font-bold">Featured Courses</h2>
              <p className="mt-2 text-muted-foreground">Top picks from our catalog</p>
            </div>
            <Link to="/marketplace">
              <Button variant="outline">View All <ChevronRight className="h-4 w-4" /></Button>
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-secondary/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl font-bold">Student Success Stories</h2>
            <p className="mt-3 text-muted-foreground">Hear from our community</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.name}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="rounded-2xl border border-border bg-card p-7"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full gradient-primary text-sm font-bold text-primary-foreground">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">"{t.text}"</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 gradient-hero">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="font-display text-3xl font-bold text-primary-foreground sm:text-4xl">
            Ready to Start Your Journey?
          </h2>
          <p className="mt-4 text-primary-foreground/70">
            Join hundreds of students building real skills for real income.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link to="/signup">
              <Button variant="hero" size="lg">Join Now — It's Free</Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { GraduationCap, Target, Eye, Heart, Sparkles } from "lucide-react";

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="text-center mb-16">
            <div className="flex justify-center mb-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary">
                <GraduationCap className="h-8 w-8 text-primary-foreground" />
              </div>
            </div>
            <h1 className="font-display text-4xl font-bold mb-4">About SkillUp</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Empowering learners to build real skills and create real income through practical, career-building education.
            </p>
          </div>

          <div className="space-y-12">
            <section className="rounded-2xl border border-border bg-card p-8">
              <div className="flex items-center gap-3 mb-4">
                <Target className="h-6 w-6 text-primary" />
                <h2 className="font-display text-2xl font-bold">Our Mission</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                SkillUp is on a mission to make quality education accessible to everyone. We believe that learning should not be limited by geography, income, or background. Our platform provides affordable, practical courses designed to equip learners with skills that matter in the real world — from programming and design to business and personal development.
              </p>
            </section>

            <section className="rounded-2xl border border-border bg-card p-8">
              <div className="flex items-center gap-3 mb-4">
                <Eye className="h-6 w-6 text-accent" />
                <h2 className="font-display text-2xl font-bold">Our Vision</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                We envision a world where every individual, regardless of their starting point, has the opportunity to learn, grow, and succeed. SkillUp aims to become the leading learning platform in Africa and beyond, bridging the gap between education and employment by providing hands-on, industry-relevant skills training.
              </p>
            </section>

            <section className="rounded-2xl border border-border bg-card p-8">
              <div className="flex items-center gap-3 mb-4">
                <Heart className="h-6 w-6 text-destructive" />
                <h2 className="font-display text-2xl font-bold">The Founder's Story</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed mb-4">
                SkillUp was founded by <span className="text-foreground font-semibold">Abenezar Mitiku</span>, a Grade 11 student with a big dream — to create a platform that helps people learn practical skills and transform their lives.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                What started as a simple idea born out of a passion for technology and education has grown into a full learning platform. Abenezar believes that age is just a number when it comes to making an impact, and that young people can build solutions that change the world.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                <span className="text-foreground italic">"I started SkillUp because I saw how many talented people lacked access to quality learning resources. I wanted to build something that could help anyone, anywhere, learn the skills they need to succeed."</span>
                <br />
                <span className="text-sm text-muted-foreground mt-2 block">— Abenezar Mitiku, Founder of SkillUp</span>
              </p>
            </section>

            <section className="rounded-2xl border border-border bg-card p-8">
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="h-6 w-6 text-warning" />
                <h2 className="font-display text-2xl font-bold">What Makes Us Different</h2>
              </div>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2"><span className="text-accent mt-1">•</span> Practical, career-focused courses designed for real-world application</li>
                <li className="flex items-start gap-2"><span className="text-accent mt-1">•</span> Affordable pricing that makes quality education accessible to all</li>
                <li className="flex items-start gap-2"><span className="text-accent mt-1">•</span> Community-driven learning with Telegram groups for peer support</li>
                <li className="flex items-start gap-2"><span className="text-accent mt-1">•</span> Built by a young visionary who understands the needs of modern learners</li>
                <li className="flex items-start gap-2"><span className="text-accent mt-1">•</span> Continuously evolving with new courses, ebooks, and resources</li>
              </ul>
            </section>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default AboutPage;

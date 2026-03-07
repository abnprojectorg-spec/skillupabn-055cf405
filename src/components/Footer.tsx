import { Link } from "react-router-dom";
import { GraduationCap } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
                <GraduationCap className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-display text-lg font-bold">SkillUp</span>
            </div>
            <p className="text-sm text-muted-foreground">Learn real skills. Build real income. The premier learning platform for practical, career-building education.</p>
          </div>
          <div>
            <h4 className="font-display font-semibold mb-3">Platform</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/marketplace" className="hover:text-primary transition-colors">Browse Courses</Link></li>
              <li><Link to="/signup" className="hover:text-primary transition-colors">Sign Up</Link></li>
              <li><Link to="/login" className="hover:text-primary transition-colors">Login</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display font-semibold mb-3">Categories</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Programming & Tech</li>
              <li>Design & Creativity</li>
              <li>Business</li>
              <li>Marketing</li>
            </ul>
          </div>
          <div>
            <h4 className="font-display font-semibold mb-3">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Help Center</li>
              <li>Contact Us</li>
              <li>Terms of Service</li>
              <li>Privacy Policy</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-border pt-8 text-center text-sm text-muted-foreground">
          © 2026 SkillUp. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;

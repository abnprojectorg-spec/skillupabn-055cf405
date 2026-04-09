import { Link } from "react-router-dom";
import { GraduationCap } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const Footer = () => {
  const { settings } = useSiteSettings();
  const { footer } = settings;

  return (
    <footer className="border-t border-border bg-card/50">
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
            {(footer.contactEmail || footer.contactPhone) && (
              <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                {footer.contactEmail && <p>📧 {footer.contactEmail}</p>}
                {footer.contactPhone && <p>📱 {footer.contactPhone}</p>}
              </div>
            )}
          </div>
          <div>
            <h4 className="font-display font-semibold mb-3">Platform</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/marketplace" className="hover:text-accent transition-colors">Browse Courses</Link></li>
              <li><Link to="/ebooks" className="hover:text-accent transition-colors">Ebooks</Link></li>
              <li><Link to="/files" className="hover:text-accent transition-colors">Files</Link></li>
              <li><Link to="/news" className="hover:text-accent transition-colors">News</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display font-semibold mb-3">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/about" className="hover:text-accent transition-colors">About</Link></li>
              <li><Link to="/contact" className="hover:text-accent transition-colors">Contact Us</Link></li>
              <li><Link to="/signup" className="hover:text-accent transition-colors">Sign Up</Link></li>
              <li><Link to="/login" className="hover:text-accent transition-colors">Login</Link></li>
              {footer.customLinks.map((link, i) => (
                <li key={i}>
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-display font-semibold mb-3">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/terms" className="hover:text-accent transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:text-accent transition-colors">Privacy Policy</Link></li>
              <li><Link to="/refund" className="hover:text-accent transition-colors">Refund Policy</Link></li>
            </ul>
            {/* Social Links */}
            {(footer.socialTelegram || footer.socialTwitter || footer.socialInstagram || footer.socialYoutube) && (
              <div className="mt-4">
                <h4 className="font-display font-semibold mb-2 text-sm">Follow Us</h4>
                <div className="flex gap-3 text-sm text-muted-foreground">
                  {footer.socialTelegram && (
                    <a href={`https://t.me/${footer.socialTelegram.replace("@", "")}`} target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">
                      Telegram
                    </a>
                  )}
                  {footer.socialTwitter && (
                    <a href={`https://twitter.com/${footer.socialTwitter.replace("@", "")}`} target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">
                      X
                    </a>
                  )}
                  {footer.socialInstagram && (
                    <a href={`https://instagram.com/${footer.socialInstagram.replace("@", "")}`} target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">
                      IG
                    </a>
                  )}
                  {footer.socialYoutube && (
                    <a href={footer.socialYoutube} target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">
                      YouTube
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="mt-8 border-t border-border pt-8 text-center text-sm text-muted-foreground">
          {footer.copyrightText || "© 2026 ABN by Abenezar Mitiku. All rights reserved."}
        </div>
      </div>
    </footer>
  );
};

export default Footer;

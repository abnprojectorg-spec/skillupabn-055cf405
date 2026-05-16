import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  const { settings } = useSiteSettings();

  const logoUrl = settings.homepage.hero.logoUrl;
  const logoText = settings.homepage.hero.logoText || "SkillUp";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/marketplace", label: "Courses" },
    { href: "/ebooks", label: "Ebooks" },
    { href: "/files", label: "Files" },
    { href: "/news", label: "News" },
    { href: "/pricing", label: "Pricing" },
    { href: "/dashboard", label: "Dashboard" },
  ];

  const isLanding = location.pathname === "/" || location.pathname === "/index";
  const navBg = scrolled || !isLanding
    ? "bg-background/90 backdrop-blur-xl border-b border-border"
    : "bg-transparent border-b border-transparent";

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navBg}`}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 group">
          {logoUrl ? (
            <img src={logoUrl} alt={logoText} className="h-9 w-9 rounded-lg object-cover" />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary group-hover:shadow-glow transition-shadow duration-300">
              <span className="text-primary-foreground font-bold text-sm">{logoText.charAt(0)}</span>
            </div>
          )}
          <span className="font-display text-xl font-bold">{logoText}</span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`relative px-3 py-2 text-sm font-medium transition-colors duration-200 hover:text-accent group ${
                location.pathname === link.href ? "text-accent" : "text-foreground/80"
              }`}
            >
              {link.label}
              <span
                className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-accent transition-all duration-300 ${
                  location.pathname === link.href ? "w-3/4" : "w-0 group-hover:w-3/4"
                }`}
              />
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <Button variant="ghost" size="sm" onClick={logout} className="hover:text-destructive transition-colors">
              <LogOut className="h-4 w-4 mr-1" /> Logout
            </Button>
          ) : (
            <>
              <Link to="/login"><Button variant="ghost" size="sm" className="hover:text-accent transition-colors">Login</Button></Link>
              <Link to="/signup"><Button variant="hero" size="sm" className="shadow-glow">Sign Up</Button></Link>
            </>
          )}
        </div>

        <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {isOpen && (
        <div className="border-t border-border bg-background/95 backdrop-blur-xl px-4 py-4 md:hidden">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link key={link.href} to={link.href} onClick={() => setIsOpen(false)}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start ${location.pathname === link.href ? "text-accent" : ""}`}
                >
                  {link.label}
                </Button>
              </Link>
            ))}
            <hr className="my-2 border-border" />
            {user ? (
              <Button variant="ghost" className="w-full justify-start" onClick={() => { logout(); setIsOpen(false); }}>
                <LogOut className="h-4 w-4 mr-1" /> Logout
              </Button>
            ) : (
              <>
                <Link to="/login" onClick={() => setIsOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">Login</Button>
                </Link>
                <Link to="/signup" onClick={() => setIsOpen(false)}>
                  <Button variant="hero" className="w-full">Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

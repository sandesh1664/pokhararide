import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Car } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-hero/95 backdrop-blur-md border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Car className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-hero-foreground">RideFlow</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#rides" className="text-hero-muted hover:text-hero-foreground transition-colors">
              Ride
            </a>
            <a href="#drive" className="text-hero-muted hover:text-hero-foreground transition-colors">
              Drive
            </a>
            <a href="#safety" className="text-hero-muted hover:text-hero-foreground transition-colors">
              Safety
            </a>
            <a href="#about" className="text-hero-muted hover:text-hero-foreground transition-colors">
              About
            </a>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" className="text-hero-foreground hover:bg-white/10">
              Log in
            </Button>
            <Button variant="hero" size="default">
              Sign up
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-hero-foreground"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-white/10 animate-fade-in">
            <div className="flex flex-col gap-4">
              <a href="#rides" className="text-hero-muted hover:text-hero-foreground transition-colors py-2">
                Ride
              </a>
              <a href="#drive" className="text-hero-muted hover:text-hero-foreground transition-colors py-2">
                Drive
              </a>
              <a href="#safety" className="text-hero-muted hover:text-hero-foreground transition-colors py-2">
                Safety
              </a>
              <a href="#about" className="text-hero-muted hover:text-hero-foreground transition-colors py-2">
                About
              </a>
              <div className="flex flex-col gap-2 pt-4 border-t border-white/10">
                <Button variant="ghost" className="text-hero-foreground hover:bg-white/10 justify-start">
                  Log in
                </Button>
                <Button variant="hero">
                  Sign up
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

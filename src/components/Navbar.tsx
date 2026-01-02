import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Car, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-hero/95 backdrop-blur-md border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Car className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-hero-foreground">RideFlow</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#rides" className="text-hero-muted hover:text-hero-foreground transition-colors">
              Ride
            </a>
            <Link to="/driver" className="text-hero-muted hover:text-hero-foreground transition-colors">
              Drive
            </Link>
            <a href="#safety" className="text-hero-muted hover:text-hero-foreground transition-colors">
              Safety
            </a>
            <a href="#about" className="text-hero-muted hover:text-hero-foreground transition-colors">
              About
            </a>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            {loading ? (
              <div className="w-20 h-10 bg-white/10 rounded-lg animate-pulse" />
            ) : user ? (
              <>
                <span className="text-hero-muted text-sm">
                  {user.email}
                </span>
                <Button 
                  variant="ghost" 
                  className="text-hero-foreground hover:bg-white/10"
                  onClick={handleSignOut}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  className="text-hero-foreground hover:bg-white/10"
                  onClick={() => navigate('/auth')}
                >
                  Log in
                </Button>
                <Button variant="hero" size="default" onClick={() => navigate('/auth')}>
                  Sign up
                </Button>
              </>
            )}
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
              <Link to="/driver" className="text-hero-muted hover:text-hero-foreground transition-colors py-2">
                Drive
              </Link>
              <a href="#safety" className="text-hero-muted hover:text-hero-foreground transition-colors py-2">
                Safety
              </a>
              <a href="#about" className="text-hero-muted hover:text-hero-foreground transition-colors py-2">
                About
              </a>
              <div className="flex flex-col gap-2 pt-4 border-t border-white/10">
                {loading ? (
                  <div className="w-full h-10 bg-white/10 rounded-lg animate-pulse" />
                ) : user ? (
                  <>
                    <span className="text-hero-muted text-sm px-4 py-2">
                      {user.email}
                    </span>
                    <Button 
                      variant="ghost" 
                      className="text-hero-foreground hover:bg-white/10 justify-start"
                      onClick={handleSignOut}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      variant="ghost" 
                      className="text-hero-foreground hover:bg-white/10 justify-start"
                      onClick={() => navigate('/auth')}
                    >
                      Log in
                    </Button>
                    <Button variant="hero" onClick={() => navigate('/auth')}>
                      Sign up
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

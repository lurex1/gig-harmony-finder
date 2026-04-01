import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Music, Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-background border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Music className="w-6 h-6 text-foreground" />
          <span className="font-display text-xl font-bold text-foreground">GigMatch</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Funkcje</a>
          <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Cennik</a>
          <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Jak to działa</a>
          <Link to="/musician" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Muzyk</Link>
          <Link to="/venue" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Lokal</Link>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" asChild>
            <Link to="/login">Zaloguj się</Link>
          </Button>
          <Button variant="pill" asChild>
            <Link to="/register">Zarejestruj się</Link>
          </Button>
        </div>

        <button className="md:hidden text-foreground" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border bg-background"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col gap-3">
              <a href="#features" className="text-sm text-muted-foreground py-2">Funkcje</a>
              <a href="#pricing" className="text-sm text-muted-foreground py-2">Cennik</a>
              <a href="#how-it-works" className="text-sm text-muted-foreground py-2">Jak to działa</a>
              <Link to="/musician" className="text-sm text-muted-foreground py-2">Muzyk</Link>
              <Link to="/venue" className="text-sm text-muted-foreground py-2">Lokal</Link>
              <Button variant="ghost" asChild className="justify-start">
                <Link to="/login">Zaloguj się</Link>
              </Button>
              <Button variant="pill" asChild>
                <Link to="/register">Zarejestruj się</Link>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;

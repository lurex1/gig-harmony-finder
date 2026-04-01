import { Music } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="py-10 border-t border-border">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <Link to="/" className="flex items-center gap-2">
            <Music className="w-5 h-5 text-foreground" />
            <span className="font-display text-lg font-bold text-foreground">GigMatch</span>
          </Link>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link to="/privacy-policy" className="hover:text-foreground transition-colors">Polityka prywatności</Link>
            <Link to="/terms" className="hover:text-foreground transition-colors">Regulamin</Link>
            <Link to="/cookies" className="hover:text-foreground transition-colors">Cookies</Link>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} GigMatch. Wszelkie prawa zastrzeżone.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

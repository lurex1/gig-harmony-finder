import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Music, Menu, X, Globe } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "react-i18next";

const languages = [
  { code: "pl", label: "PL" },
  { code: "en", label: "EN" },
  { code: "de", label: "DE" },
  { code: "fr", label: "FR" },
  { code: "es", label: "ES" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const { t, i18n } = useTranslation();

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
    setLangOpen(false);
  };

  const currentLang = languages.find((l) => l.code === i18n.language?.substring(0, 2)) || languages[0];

  return (
    <nav className="sticky top-0 z-50 bg-background border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Music className="w-6 h-6 text-foreground" />
          <span className="font-display text-xl font-bold text-foreground">GigMatch</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t('nav.howItWorks')}</a>
          <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t('nav.pricing')}</a>
          <Link to="/musician" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t('nav.musician')}</Link>
          <Link to="/venue" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t('nav.venue')}</Link>
        </div>

        <div className="hidden md:flex items-center gap-3">
          {/* Language Switcher */}
          <div className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <Globe className="w-4 h-4" />
              {currentLang.label}
            </button>
            {langOpen && (
              <div className="absolute right-0 top-full mt-1 bg-background border border-border rounded-lg shadow-lg py-1 min-w-[80px] z-50">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    className={`w-full px-3 py-1.5 text-sm text-left hover:bg-secondary transition-colors ${
                      currentLang.code === lang.code ? "text-foreground font-medium" : "text-muted-foreground"
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Button variant="ghost" asChild>
            <Link to="/login">{t('nav.login')}</Link>
          </Button>
          <Button variant="pill" asChild>
            <Link to="/register">{t('nav.register')}</Link>
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
              <a href="#how-it-works" className="text-sm text-muted-foreground py-2">{t('nav.howItWorks')}</a>
              <a href="#pricing" className="text-sm text-muted-foreground py-2">{t('nav.pricing')}</a>
              <Link to="/musician" className="text-sm text-muted-foreground py-2">{t('nav.musician')}</Link>
              <Link to="/venue" className="text-sm text-muted-foreground py-2">{t('nav.venue')}</Link>
              
              {/* Mobile Language Switcher */}
              <div className="flex items-center gap-2 py-2 border-t border-border pt-3">
                <Globe className="w-4 h-4 text-muted-foreground" />
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    className={`px-2 py-1 rounded text-xs transition-colors ${
                      currentLang.code === lang.code ? "bg-secondary text-foreground font-medium" : "text-muted-foreground"
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>

              <Button variant="ghost" asChild className="justify-start">
                <Link to="/login">{t('nav.login')}</Link>
              </Button>
              <Button variant="pill" asChild>
                <Link to="/register">{t('nav.register')}</Link>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;

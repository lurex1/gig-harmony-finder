import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MapPin, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import heroIllustration from "@/assets/hero-illustration.jpg";

const HeroSection = () => {
  return (
    <section className="py-12 md:py-20">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Left side - text */}
          <div className="flex-1 max-w-xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <MapPin className="w-4 h-4" />
                <span>PL</span>
                <a href="#" className="text-primary underline">Zmień miasto</a>
              </div>

              <h1 className="font-display text-4xl md:text-6xl font-bold leading-[1.05] text-foreground mb-5">
                Znajdź muzyka na teraz lub później
              </h1>

              <p className="text-muted-foreground text-lg mb-8">
                Dodaj szczegóły koncertu, dobierz muzyka i ruszaj z muzyką.
              </p>

              <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-border bg-background text-sm text-foreground mb-6">
                <MapPin className="w-4 h-4" />
                Szukaj teraz
                <ChevronDown className="w-4 h-4" />
              </div>

              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-secondary">
                  <div className="w-2 h-2 rounded-full bg-foreground" />
                  <input
                    type="text"
                    placeholder="Twoja lokalizacja"
                    className="bg-transparent text-foreground placeholder:text-muted-foreground flex-1 outline-none text-sm"
                    readOnly
                  />
                  <MapPin className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-secondary">
                  <div className="w-2 h-2 rounded-sm bg-foreground" />
                  <input
                    type="text"
                    placeholder="Jaki gatunek muzyczny?"
                    className="bg-transparent text-foreground placeholder:text-muted-foreground flex-1 outline-none text-sm"
                    readOnly
                  />
                </div>
              </div>

              <Button variant="pill" size="lg" asChild>
                <Link to="/register">Znajdź muzyka</Link>
              </Button>
            </motion.div>
          </div>

          {/* Right side - illustration */}
          <div className="flex-1 max-w-lg lg:max-w-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <img
                src={heroIllustration}
                alt="Muzyk grający na scenie w barze"
                className="w-full h-auto rounded-2xl"
                width={1024}
                height={768}
              />
            </motion.div>
          </div>
        </div>

        {/* Suggestions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16"
        >
          <h2 className="font-display text-2xl font-bold text-foreground mb-6">Sugestie</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link to="/register" className="p-5 rounded-xl border border-border hover:bg-secondary transition-colors">
              <span className="font-display font-semibold text-foreground">Muzyk na wieczór</span>
              <p className="text-sm text-muted-foreground mt-1">Solo gitarzysta, pianista, DJ</p>
            </Link>
            <Link to="/register" className="p-5 rounded-xl border border-border hover:bg-secondary transition-colors">
              <span className="font-display font-semibold text-foreground">Zespół na event</span>
              <p className="text-sm text-muted-foreground mt-1">Cover band, jazz trio, akustyk</p>
            </Link>
            <Link to="/register" className="p-5 rounded-xl border border-border hover:bg-secondary transition-colors">
              <span className="font-display font-semibold text-foreground">Jestem muzykiem</span>
              <p className="text-sm text-muted-foreground mt-1">Szukam gigów w mojej okolicy</p>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;

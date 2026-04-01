import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Music, MapPin, MessageSquare, Calendar, User, LogOut, Bell } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const mockOffers = [
  { id: 1, venue: "The Blue Note Jazz Club", date: "25 mar 2026", time: "20:00", budget: "$200", genre: "Jazz", score: 95 },
  { id: 2, venue: "Skyline Rooftop Bar", date: "27 mar 2026", time: "21:30", budget: "$150", genre: "Acoustic", score: 82 },
  { id: 3, venue: "Hotel Grand Ballroom", date: "30 mar 2026", time: "19:00", budget: "$350", genre: "Pop/Rock", score: 71 },
];

const MusicianDashboard = () => {
  const [isAvailable, setIsAvailable] = useState(false);
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-background sticky top-0 z-50">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Music className="w-5 h-5 text-foreground" />
            <span className="font-display text-lg font-bold text-foreground">GigMatch</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon"><Bell className="w-4 h-4" /></Button>
            <Button variant="ghost" size="icon"><User className="w-4 h-4" /></Button>
            <Button variant="ghost" size="icon"><LogOut className="w-4 h-4" /></Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-64 shrink-0 space-y-4">
            <div className="p-5 rounded-xl border border-border">
              <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center mb-3">
                <User className="w-7 h-7 text-muted-foreground" />
              </div>
              <h2 className="font-display text-lg font-bold text-foreground">Alex Rivera</h2>
              <p className="text-sm text-muted-foreground">Solo · Jazz, Blues, Acoustic</p>
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-foreground" />
                    <span className="text-sm text-foreground">{t('musicianDash.availableNow')}</span>
                  </div>
                  <Switch checked={isAvailable} onCheckedChange={setIsAvailable} />
                </div>
                {isAvailable && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-green mt-2 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green animate-pulse" />
                    {t('musicianDash.locationActive')}
                  </motion.p>
                )}
              </div>
            </div>

            <div className="space-y-1">
              {[
                { icon: MapPin, labelKey: "musicianDash.gigOffers", active: true },
                { icon: MessageSquare, labelKey: "musicianDash.messages", active: false },
                { icon: Calendar, labelKey: "musicianDash.calendar", active: false },
                { icon: User, labelKey: "musicianDash.profile", active: false },
              ].map((item) => (
                <button
                  key={item.labelKey}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    item.active ? "bg-secondary text-foreground font-medium" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {t(item.labelKey)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="font-display text-2xl font-bold text-foreground mb-1">{t('musicianDash.gigOffers')}</h1>
              <p className="text-muted-foreground text-sm mb-6">{t('musicianDash.matchedGigs')}</p>

              <div className="space-y-3">
                {mockOffers.map((offer, i) => (
                  <motion.div
                    key={offer.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-5 rounded-xl border border-border hover:border-foreground/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-display text-base font-semibold text-foreground">{offer.venue}</h3>
                        <span className="px-2 py-0.5 rounded-full bg-secondary text-xs font-medium text-foreground">
                          {offer.score}% {t('musicianDash.match')}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        <span>{offer.date}</span>
                        <span>·</span>
                        <span>{offer.time}</span>
                        <span>·</span>
                        <span className="font-medium text-foreground">{offer.budget}</span>
                        <span>·</span>
                        <span>{offer.genre}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="pill" size="sm">{t('musicianDash.accept')}</Button>
                      <Button variant="ghost" size="sm">{t('musicianDash.reject')}</Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicianDashboard;

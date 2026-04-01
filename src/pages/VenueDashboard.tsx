import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Music, MapPin, Plus, MessageSquare, Calendar, Building2, User, LogOut, Star } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const mockMatches = [
  { id: 1, name: "Alex Rivera", type: "Solo", genre: "Jazz, Blues", distance: "2.3 km", score: 95, reasonKey: "Perfect genre match, very close, acoustic setup" },
  { id: 2, name: "The Moonlight Trio", type: "Band", genre: "Jazz, Bossa Nova", distance: "5.1 km", score: 88, reasonKey: "Strong genre coverage, full band for larger venue" },
  { id: 3, name: "Sarah Chen", type: "Solo", genre: "Acoustic Pop", distance: "8.7 km", score: 74, reasonKey: "Good acoustic fit, a bit farther but versatile repertoire" },
];

const VenueDashboard = () => {
  const [showPostGig, setShowPostGig] = useState(false);
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
                <Building2 className="w-7 h-7 text-muted-foreground" />
              </div>
              <h2 className="font-display text-lg font-bold text-foreground">The Blue Note</h2>
              <p className="text-sm text-muted-foreground">Jazz Club · 150 {t('venueDash.seats')}</p>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> ul. Główna 123, Centrum
              </p>
            </div>

            <div className="space-y-1">
              {[
                { icon: MapPin, labelKey: "venueDash.findMusicians", active: true },
                { icon: Calendar, labelKey: "venueDash.myGigs", active: false },
                { icon: MessageSquare, labelKey: "venueDash.messages", active: false },
                { icon: Building2, labelKey: "venueDash.venueProfile", active: false },
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

            <Button variant="pill" className="w-full" onClick={() => setShowPostGig(true)}>
              <Plus className="w-4 h-4 mr-1" /> {t('venueDash.addGig')}
            </Button>
          </div>

          <div className="flex-1">
            {showPostGig ? (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg">
                <div className="flex items-center justify-between mb-6">
                  <h1 className="font-display text-2xl font-bold text-foreground">{t('venueDash.addGig')}</h1>
                  <Button variant="ghost" size="sm" onClick={() => setShowPostGig(false)}>{t('venueDash.cancel')}</Button>
                </div>
                <div className="space-y-4 p-6 rounded-xl border border-border">
                  <div className="space-y-2">
                    <Label>{t('venueDash.gigTitle')}</Label>
                    <Input placeholder={t('venueDash.gigTitlePlaceholder')} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t('venueDash.date')}</Label>
                      <Input type="date" />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('venueDash.time')}</Label>
                      <Input type="time" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t('venueDash.duration')}</Label>
                      <Input type="number" placeholder="3" />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('venueDash.budget')}</Label>
                      <Input type="number" placeholder="200" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>{t('venueDash.requirements')}</Label>
                    <Textarea placeholder={t('venueDash.requirementsPlaceholder')} />
                  </div>
                  <Button variant="pill" className="w-full" size="lg">{t('venueDash.publishAndFind')}</Button>
                </div>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="font-display text-2xl font-bold text-foreground mb-1">{t('venueDash.aiMatches')}</h1>
                <p className="text-muted-foreground text-sm mb-6">{t('venueDash.bestMusicians')} "{t('venueDash.gigTitlePlaceholder')}"</p>

                <div className="h-56 rounded-xl bg-secondary border border-border flex items-center justify-center mb-6">
                  <div className="text-center">
                    <MapPin className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">{t('venueDash.interactiveMap')}</p>
                    <p className="text-xs text-muted-foreground">{t('venueDash.googleMaps')}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {mockMatches.map((match, i) => (
                    <motion.div
                      key={match.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="p-5 rounded-xl border border-border hover:border-foreground/20 transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-display text-base font-semibold text-foreground">{match.name}</h3>
                            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary text-xs font-bold text-foreground">
                              <Star className="w-3 h-3" />
                              {match.score}
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mb-2">
                            <span>{match.type}</span>
                            <span>·</span>
                            <span>{match.genre}</span>
                            <span>·</span>
                            <span className="font-medium text-foreground">{match.distance}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">"{match.reasonKey}"</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="pill" size="sm">{t('venueDash.sendOffer')}</Button>
                          <Button variant="ghost" size="sm">
                            <MessageSquare className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VenueDashboard;

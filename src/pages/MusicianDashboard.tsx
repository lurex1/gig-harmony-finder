import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Music, MapPin, MessageSquare, Calendar, User, LogOut, Bell } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const mockOffers = [
  { id: 1, venue: "The Blue Note Jazz Club", date: "Mar 25, 2026", time: "8:00 PM", budget: "$200", genre: "Jazz", score: 95 },
  { id: 2, venue: "Skyline Rooftop Bar", date: "Mar 27, 2026", time: "9:30 PM", budget: "$150", genre: "Acoustic", score: 82 },
  { id: 3, venue: "Hotel Grand Ballroom", date: "Mar 30, 2026", time: "7:00 PM", budget: "$350", genre: "Pop/Rock", score: 71 },
];

const MusicianDashboard = () => {
  const [isAvailable, setIsAvailable] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border/50 glass sticky top-0 z-50">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Music className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-bold text-foreground">GigMatch</span>
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon"><Bell className="w-4 h-4" /></Button>
            <Button variant="ghost" size="icon"><User className="w-4 h-4" /></Button>
            <Button variant="ghost" size="icon"><LogOut className="w-4 h-4" /></Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-72 shrink-0 space-y-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-6 rounded-xl bg-gradient-card border border-border/50"
            >
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <User className="w-8 h-8 text-muted-foreground" />
              </div>
              <h2 className="font-display text-xl font-bold text-foreground">Alex Rivera</h2>
              <p className="text-sm text-muted-foreground">Solo · Jazz, Blues, Acoustic</p>
              <div className="mt-4 pt-4 border-t border-border/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="text-sm text-foreground">Available Now</span>
                  </div>
                  <Switch
                    checked={isAvailable}
                    onCheckedChange={setIsAvailable}
                  />
                </div>
                {isAvailable && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs text-primary mt-2 flex items-center gap-1"
                  >
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
                    Location sharing active
                  </motion.p>
                )}
              </div>
            </motion.div>

            <div className="space-y-1">
              {[
                { icon: MapPin, label: "Gig Offers", active: true },
                { icon: MessageSquare, label: "Messages", active: false },
                { icon: Calendar, label: "Calendar", active: false },
                { icon: User, label: "Profile", active: false },
              ].map((item) => (
                <button
                  key={item.label}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
                    item.active ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="font-display text-3xl font-bold text-foreground mb-1">Gig Offers</h1>
              <p className="text-muted-foreground mb-6">Matched gigs near your location</p>

              <div className="space-y-4">
                {mockOffers.map((offer, i) => (
                  <motion.div
                    key={offer.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-5 rounded-xl bg-gradient-card border border-border/50 hover:border-primary/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-display text-lg font-semibold text-foreground">{offer.venue}</h3>
                        <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                          {offer.score}% match
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <span>{offer.date}</span>
                        <span>·</span>
                        <span>{offer.time}</span>
                        <span>·</span>
                        <span className="text-secondary font-medium">{offer.budget}</span>
                        <span>·</span>
                        <span>{offer.genre}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="hero" size="sm">Accept</Button>
                      <Button variant="ghost" size="sm">Decline</Button>
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

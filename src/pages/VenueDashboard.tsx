import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Music, MapPin, Plus, MessageSquare, Calendar, Building2, User, LogOut, Star } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const mockMatches = [
  { id: 1, name: "Alex Rivera", type: "Solo", genre: "Jazz, Blues", distance: "2.3 km", score: 95, reason: "Perfect genre match, very close, acoustic setup" },
  { id: 2, name: "The Moonlight Trio", type: "Band", genre: "Jazz, Bossa Nova", distance: "5.1 km", score: 88, reason: "Strong genre overlap, full band for larger capacity" },
  { id: 3, name: "Sarah Chen", type: "Solo", genre: "Acoustic Pop", distance: "8.7 km", score: 74, reason: "Good acoustic fit, slightly further but versatile repertoire" },
];

const VenueDashboard = () => {
  const [showPostGig, setShowPostGig] = useState(false);

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
                <Building2 className="w-8 h-8 text-muted-foreground" />
              </div>
              <h2 className="font-display text-xl font-bold text-foreground">The Blue Note</h2>
              <p className="text-sm text-muted-foreground">Jazz Club · 150 capacity</p>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> 123 Main St, Downtown
              </p>
            </motion.div>

            <div className="space-y-1">
              {[
                { icon: MapPin, label: "Find Musicians", active: true },
                { icon: Calendar, label: "My Gigs", active: false },
                { icon: MessageSquare, label: "Messages", active: false },
                { icon: Building2, label: "Venue Profile", active: false },
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

            <Button variant="hero" className="w-full" onClick={() => setShowPostGig(true)}>
              <Plus className="w-4 h-4 mr-1" /> Post a Gig
            </Button>
          </div>

          {/* Main content */}
          <div className="flex-1">
            {showPostGig ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-lg"
              >
                <div className="flex items-center justify-between mb-6">
                  <h1 className="font-display text-3xl font-bold text-foreground">Post a Gig</h1>
                  <Button variant="ghost" size="sm" onClick={() => setShowPostGig(false)}>Cancel</Button>
                </div>
                <div className="space-y-4 p-6 rounded-xl bg-gradient-card border border-border/50">
                  <div className="space-y-2">
                    <Label>Gig Title</Label>
                    <Input placeholder="Friday Night Jazz Session" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Date</Label>
                      <Input type="date" />
                    </div>
                    <div className="space-y-2">
                      <Label>Time</Label>
                      <Input type="time" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Duration (hours)</Label>
                      <Input type="number" placeholder="3" />
                    </div>
                    <div className="space-y-2">
                      <Label>Budget ($)</Label>
                      <Input type="number" placeholder="200" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Requirements</Label>
                    <Textarea placeholder="Looking for a solo jazz guitarist, acoustic only. Should know standards and be comfortable with improvisation." />
                  </div>
                  <Button variant="hero" className="w-full" size="lg">Post Gig & Find Matches</Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h1 className="font-display text-3xl font-bold text-foreground mb-1">AI Matches</h1>
                <p className="text-muted-foreground mb-6">Top musicians for "Friday Night Jazz Session"</p>

                {/* Map placeholder */}
                <div className="h-64 rounded-xl bg-muted/30 border border-border/50 flex items-center justify-center mb-6">
                  <div className="text-center">
                    <MapPin className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Interactive map coming soon</p>
                    <p className="text-xs text-muted-foreground">Google Maps / Mapbox integration</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {mockMatches.map((match, i) => (
                    <motion.div
                      key={match.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="p-5 rounded-xl bg-gradient-card border border-border/50 hover:border-primary/30 transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-display text-lg font-semibold text-foreground">{match.name}</h3>
                            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold">
                              <Star className="w-3 h-3" />
                              {match.score}
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mb-2">
                            <span>{match.type}</span>
                            <span>·</span>
                            <span>{match.genre}</span>
                            <span>·</span>
                            <span className="text-primary">{match.distance}</span>
                          </div>
                          <p className="text-sm text-muted-foreground italic">"{match.reason}"</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="hero" size="sm">Send Offer</Button>
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

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Music, MapPin, MessageSquare, ClipboardList, User, LogOut, Loader2, Guitar,
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import MapView from "@/components/MapView";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";

type Tab = "gigs" | "applications" | "profile" | "messages";

interface GigItem {
  id: string;
  title: string;
  date: string;
  budget: number | null;
  genre: string | null;
  venue_id: string;
  venue_name: string;
}

interface ApplicationItem {
  id: string;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
  gig_id: string;
  gig_title: string;
  gig_date: string;
  gig_budget: number | null;
  venue_name: string;
}

const MusicianDashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<{ name: string } | null>(null);
  const [musicianProfile, setMusicianProfile] = useState<{
    genres: string[];
    instruments: string[];
    hourly_rate: number | null;
    radius: number | null;
    available_days: string[];
    bio: string | null;
    available: boolean;
  } | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("gigs");
  const [isAvailable, setIsAvailable] = useState(false);

  const [gigs, setGigs] = useState<GigItem[]>([]);
  const [loadingGigs, setLoadingGigs] = useState(false);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());

  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [loadingApps, setLoadingApps] = useState(false);

  // ── Auth guard ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) { navigate("/login"); return; }

    supabase.from("profiles").select("name").eq("user_id", user.id).single()
      .then(({ data }) => setProfile(data));

    supabase.from("musician_profiles").select("*").eq("user_id", user.id).maybeSingle()
      .then(({ data }) => {
        setMusicianProfile(data);
        setIsAvailable(data?.available ?? false);
      });
  }, [user, navigate]);

  // ── Fetch gigs ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (activeTab !== "gigs") return;
    setLoadingGigs(true);

    const fetchGigs = async () => {
      try {
        const { data: gigsData, error } = await supabase
          .from("gigs")
          .select("id, title, date, budget, genre, venue_id")
          .eq("status", "open")
          .order("date", { ascending: true });

        if (error || !gigsData || gigsData.length === 0) {
          setGigs([]);
          return;
        }

        const venueIds = [...new Set(gigsData.map((g) => g.venue_id))];
        const { data: venueData } = await supabase
          .from("venue_profiles")
          .select("user_id, venue_name")
          .in("user_id", venueIds);

        const venueMap = Object.fromEntries((venueData ?? []).map((v) => [v.user_id, v.venue_name]));

        setGigs(gigsData.map((g) => ({
          ...g,
          date: new Date(g.date).toLocaleDateString("pl-PL", { day: "numeric", month: "short", year: "numeric" }),
          venue_name: venueMap[g.venue_id] ?? "—",
        })));
      } catch {
        setGigs([]);
      } finally {
        setLoadingGigs(false);
      }
    };

    fetchGigs();
  }, [activeTab]);

  // ── Fetch applications ──────────────────────────────────────────────────
  useEffect(() => {
    if (activeTab !== "applications" || !user) return;
    setLoadingApps(true);

    const fetchApplications = async () => {
      try {
        const { data: appsData, error } = await supabase
          .from("gig_applications")
          .select("id, status, created_at, gig_id")
          .eq("musician_id", user.id)
          .order("created_at", { ascending: false });

        if (error || !appsData || appsData.length === 0) {
          setApplications([]);
          return;
        }

        const gigIds = [...new Set(appsData.map((a) => a.gig_id))];
        const { data: gigsData } = await supabase
          .from("gigs")
          .select("id, title, date, budget, venue_id")
          .in("id", gigIds);

        const venueIds = [...new Set((gigsData ?? []).map((g) => g.venue_id))];
        const { data: venueData } = await supabase
          .from("venue_profiles")
          .select("user_id, venue_name")
          .in("user_id", venueIds);

        const gigMap = Object.fromEntries((gigsData ?? []).map((g) => [g.id, g]));
        const venueMap = Object.fromEntries((venueData ?? []).map((v) => [v.user_id, v.venue_name]));

        setApplications(appsData.map((a) => {
          const gig = gigMap[a.gig_id];
          return {
            id: a.id,
            status: a.status,
            created_at: a.created_at,
            gig_id: a.gig_id,
            gig_title: gig?.title ?? "—",
            gig_date: gig ? new Date(gig.date).toLocaleDateString("pl-PL", { day: "numeric", month: "short", year: "numeric" }) : "—",
            gig_budget: gig?.budget ?? null,
            venue_name: gig ? (venueMap[gig.venue_id] ?? "—") : "—",
          };
        }));
      } catch {
        setApplications([]);
      } finally {
        setLoadingApps(false);
      }
    };

    fetchApplications();
  }, [activeTab, user]);

  // ── Handlers ────────────────────────────────────────────────────────────
  const handleToggleAvailable = async (val: boolean) => {
    if (!user) return;
    setIsAvailable(val);
    await supabase.from("musician_profiles")
      .upsert({ user_id: user.id, available: val }, { onConflict: "user_id" });
  };

  const handleApply = async (gigId: string) => {
    if (!user) return;
    setApplyingId(gigId);
    const { error } = await supabase.from("gig_applications")
      .insert({ gig_id: gigId, musician_id: user.id });
    if (!error) {
      setAppliedIds((prev) => new Set([...prev, gigId]));
      setGigs((prev) => prev.filter((g) => g.id !== gigId));
    }
    setApplyingId(null);
  };

  const handleDismiss = (gigId: string) => {
    setGigs((prev) => prev.filter((g) => g.id !== gigId));
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const statusLabel = (status: string) => {
    if (status === "accepted") return <Badge className="bg-green-100 text-green-800 border-green-200">Zaakceptowana</Badge>;
    if (status === "rejected") return <Badge className="bg-red-100 text-red-800 border-red-200">Odrzucona</Badge>;
    return <Badge variant="secondary">Oczekuje</Badge>;
  };

  const navItems: { icon: React.ElementType; label: string; tab: Tab }[] = [
    { icon: MapPin, label: "Oferty gigów", tab: "gigs" },
    { icon: ClipboardList, label: "Moje aplikacje", tab: "applications" },
    { icon: User, label: "Mój profil", tab: "profile" },
    { icon: MessageSquare, label: "Wiadomości", tab: "messages" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-background sticky top-0 z-50">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Music className="w-5 h-5 text-foreground" />
            <span className="font-display text-lg font-bold text-foreground">GigMatch</span>
          </Link>
          <Button variant="ghost" size="icon" onClick={handleSignOut}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64 shrink-0 space-y-4">
            <div className="p-5 rounded-xl border border-border">
              <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center mb-3">
                <Guitar className="w-7 h-7 text-muted-foreground" />
              </div>
              <h2 className="font-display text-lg font-bold text-foreground">
                {profile?.name ?? <span className="text-muted-foreground">Ładowanie…</span>}
              </h2>
              {musicianProfile && (
                <p className="text-sm text-muted-foreground">
                  {musicianProfile.genres.slice(0, 2).join(", ") || "Brak gatunków"}
                </p>
              )}
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-foreground" />
                    <span className="text-sm text-foreground">Dostępny teraz</span>
                  </div>
                  <Switch checked={isAvailable} onCheckedChange={handleToggleAvailable} />
                </div>
                {isAvailable && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-green-600 mt-2 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse inline-block" />
                    Lokalizacja aktywna
                  </motion.p>
                )}
              </div>
            </div>

            <div className="space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.tab}
                  onClick={() => setActiveTab(item.tab)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    activeTab === item.tab
                      ? "bg-secondary text-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
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
            {/* ── Oferty gigów ──────────────────────────── */}
            {activeTab === "gigs" && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="font-display text-2xl font-bold text-foreground mb-1">Oferty gigów</h1>
                <p className="text-muted-foreground text-sm mb-4">Dopasowane gigy w Twojej okolicy</p>

                <div className="mb-6">
                  <MapView role="musician" onAcceptGig={handleApply} />
                </div>

                {loadingGigs ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : gigs.length === 0 ? (
                  <div className="py-12 text-center border border-border rounded-xl">
                    <Music className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">Brak otwartych gigów w tej chwili.</p>
                    <p className="text-xs text-muted-foreground mt-1">Sprawdź ponownie wkrótce.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {gigs.map((gig, i) => (
                      <motion.div
                        key={gig.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="p-5 rounded-xl border border-border hover:border-foreground/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="flex-1">
                          <h3 className="font-display text-base font-semibold text-foreground mb-1">{gig.title}</h3>
                          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                            <span>{gig.venue_name}</span>
                            <span>·</span>
                            <span>{gig.date}</span>
                            {gig.budget && <><span>·</span><span className="font-medium text-foreground">{gig.budget} PLN</span></>}
                            {gig.genre && <><span>·</span><span>{gig.genre}</span></>}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="pill"
                            size="sm"
                            onClick={() => handleApply(gig.id)}
                            disabled={applyingId === gig.id || appliedIds.has(gig.id)}
                          >
                            {applyingId === gig.id ? <Loader2 className="w-3 h-3 animate-spin" /> : "Aplikuj"}
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDismiss(gig.id)}>
                            Pomiń
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* ── Moje aplikacje ────────────────────────── */}
            {activeTab === "applications" && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="font-display text-2xl font-bold text-foreground mb-1">Moje aplikacje</h1>
                <p className="text-muted-foreground text-sm mb-6">Gigy na które aplikowałeś</p>

                {loadingApps ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : applications.length === 0 ? (
                  <div className="py-12 text-center border border-border rounded-xl">
                    <ClipboardList className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">Nie aplikowałeś jeszcze na żaden gig.</p>
                    <p className="text-xs text-muted-foreground mt-1">Przejdź do zakładki "Oferty gigów" i aplikuj.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {applications.map((app, i) => (
                      <motion.div
                        key={app.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="p-5 rounded-xl border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div>
                          <h3 className="font-display text-base font-semibold text-foreground mb-1">{app.gig_title}</h3>
                          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                            <span>{app.venue_name}</span>
                            <span>·</span>
                            <span>{app.gig_date}</span>
                            {app.gig_budget && <><span>·</span><span className="font-medium text-foreground">{app.gig_budget} PLN</span></>}
                          </div>
                        </div>
                        {statusLabel(app.status)}
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* ── Mój profil ───────────────────────────── */}
            {activeTab === "profile" && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="font-display text-2xl font-bold text-foreground mb-1">Mój profil</h1>
                <p className="text-muted-foreground text-sm mb-6">Twoje preferencje muzyczne</p>

                {!musicianProfile ? (
                  <div className="py-12 text-center border border-border rounded-xl">
                    <User className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">Profil muzyczny nie jest jeszcze wypełniony.</p>
                    <Button variant="pill" className="mt-4" onClick={() => navigate("/onboarding")}>
                      Uzupełnij profil
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4 max-w-lg">
                    <div className="p-5 rounded-xl border border-border space-y-4">
                      {musicianProfile.genres.length > 0 && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-2">Gatunki muzyczne</p>
                          <div className="flex flex-wrap gap-2">
                            {musicianProfile.genres.map((g) => (
                              <span key={g} className="px-3 py-1 rounded-full bg-secondary text-xs font-medium">{g}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      {musicianProfile.instruments.length > 0 && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-2">Instrumenty</p>
                          <div className="flex flex-wrap gap-2">
                            {musicianProfile.instruments.map((i) => (
                              <span key={i} className="px-3 py-1 rounded-full bg-secondary text-xs font-medium">{i}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border">
                        <div>
                          <p className="text-xs text-muted-foreground">Stawka za gig</p>
                          <p className="text-sm font-medium text-foreground">
                            {musicianProfile.hourly_rate ? `${musicianProfile.hourly_rate} PLN` : "Nie podano"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Zasięg</p>
                          <p className="text-sm font-medium text-foreground">
                            {musicianProfile.radius ? `${musicianProfile.radius} km` : "Nie podano"}
                          </p>
                        </div>
                      </div>
                      {musicianProfile.available_days.length > 0 && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-2">Dostępne dni</p>
                          <div className="flex gap-2">
                            {["pn","wt","sr","cz","pt","sb","nd"].map((d) => (
                              <span
                                key={d}
                                className={`flex-1 text-center py-1.5 rounded-lg text-xs font-medium border ${
                                  musicianProfile.available_days.includes(d)
                                    ? "bg-foreground text-background border-foreground"
                                    : "text-muted-foreground border-border"
                                }`}
                              >
                                {d.charAt(0).toUpperCase() + d.slice(1)}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {musicianProfile.bio && (
                        <div className="pt-2 border-t border-border">
                          <p className="text-xs text-muted-foreground mb-1">Bio</p>
                          <p className="text-sm text-foreground">{musicianProfile.bio}</p>
                        </div>
                      )}
                    </div>
                    <Button variant="pill" onClick={() => navigate("/onboarding")}>
                      Edytuj profil
                    </Button>
                  </div>
                )}
              </motion.div>
            )}

            {/* ── Wiadomości ───────────────────────────── */}
            {activeTab === "messages" && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="font-display text-2xl font-bold text-foreground mb-1">Wiadomości</h1>
                <p className="text-muted-foreground text-sm mb-6">Czat z lokalami</p>
                <div className="py-12 text-center border border-border rounded-xl">
                  <MessageSquare className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">Brak wiadomości.</p>
                  <p className="text-xs text-muted-foreground mt-1">Wiadomości pojawią się gdy lokal skontaktuje się z Tobą.</p>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicianDashboard;

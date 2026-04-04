import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Music, MapPin, Plus, MessageSquare, Calendar, Building2, User, LogOut, Loader2, ChevronDown, ChevronUp,
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import MapView from "@/components/MapView";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";

type Tab = "find" | "gigs" | "messages" | "profile";

interface GigData {
  id: string;
  title: string;
  date: string;
  budget: number | null;
  genre: string | null;
  status: string;
  applications: ApplicationData[];
  expanded: boolean;
}

interface ApplicationData {
  id: string;
  status: "pending" | "accepted" | "rejected";
  message: string | null;
  musician_id: string;
  musician_name: string;
  created_at: string;
}

const VenueDashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<{ name: string } | null>(null);
  const [venueProfile, setVenueProfile] = useState<{
    venue_name: string;
    venue_type: string | null;
    location: string | null;
    capacity: number | null;
  } | null>(null);

  const [activeTab, setActiveTab] = useState<Tab>("find");
  const [showPostGig, setShowPostGig] = useState(false);

  // Post gig form
  const [gigTitle, setGigTitle] = useState("");
  const [gigDate, setGigDate] = useState("");
  const [gigTime, setGigTime] = useState("");
  const [gigBudget, setGigBudget] = useState("");
  const [gigGenre, setGigGenre] = useState("");
  const [gigNotes, setGigNotes] = useState("");
  const [postingGig, setPostingGig] = useState(false);
  const [postGigError, setPostGigError] = useState<string | null>(null);

  // Gigs tab
  const [gigs, setGigs] = useState<GigData[]>([]);
  const [loadingGigs, setLoadingGigs] = useState(false);
  const [updatingAppId, setUpdatingAppId] = useState<string | null>(null);

  // ── Auth guard + profile fetch ──────────────────────────────────────────
  useEffect(() => {
    if (!user) { navigate("/login"); return; }

    supabase.from("profiles").select("name").eq("user_id", user.id).single()
      .then(({ data }) => setProfile(data));

    supabase.from("venue_profiles")
      .select("venue_name, venue_type, location, capacity")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => setVenueProfile(data));
  }, [user, navigate]);

  // ── Fetch venue gigs ────────────────────────────────────────────────────
  const fetchGigs = async () => {
    if (!user) return;
    setLoadingGigs(true);

    try {
      const { data: gigsData, error } = await supabase
        .from("gigs")
        .select("id, title, date, budget, genre, status")
        .eq("venue_id", user.id)
        .order("date", { ascending: true });

      if (error || !gigsData || gigsData.length === 0) {
        setGigs([]);
        return;
      }

      const gigIds = gigsData.map((g) => g.id);

      const { data: appsWithGig } = await supabase
        .from("gig_applications")
        .select("id, gig_id, status, message, musician_id, created_at")
        .in("gig_id", gigIds);

      const musicianIds = [...new Set((appsWithGig ?? []).map((a) => a.musician_id))];
      let nameMap: Record<string, string> = {};
      if (musicianIds.length > 0) {
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("user_id, name")
          .in("user_id", musicianIds);
        nameMap = Object.fromEntries((profilesData ?? []).map((p) => [p.user_id, p.name]));
      }

      const appsByGigMap: Record<string, ApplicationData[]> = {};
      for (const app of appsWithGig ?? []) {
        if (!appsByGigMap[app.gig_id]) appsByGigMap[app.gig_id] = [];
        appsByGigMap[app.gig_id].push({
          id: app.id,
          status: app.status,
          message: app.message,
          musician_id: app.musician_id,
          musician_name: nameMap[app.musician_id] ?? "Muzyk",
          created_at: app.created_at,
        });
      }

      setGigs(gigsData.map((g) => ({
        id: g.id,
        title: g.title,
        date: new Date(g.date).toLocaleDateString("pl-PL", { day: "numeric", month: "short", year: "numeric" }),
        budget: g.budget,
        genre: g.genre,
        status: g.status,
        applications: appsByGigMap[g.id] ?? [],
        expanded: false,
      })));
    } catch {
      setGigs([]);
    } finally {
      setLoadingGigs(false);
    }
  };

  useEffect(() => {
    if (activeTab === "gigs") fetchGigs();
  }, [activeTab, user]);

  // ── Post gig ────────────────────────────────────────────────────────────
  const handlePostGig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !gigTitle || !gigDate) return;
    setPostingGig(true);
    setPostGigError(null);

    const dateTime = gigTime ? `${gigDate}T${gigTime}:00` : `${gigDate}T20:00:00`;

    const { error } = await supabase.from("gigs").insert({
      venue_id: user.id,
      title: gigTitle,
      date: dateTime,
      budget: gigBudget ? parseFloat(gigBudget) : null,
      genre: gigGenre || null,
      status: "open",
    });

    if (error) {
      setPostGigError(error.message);
      setPostingGig(false);
      return;
    }

    setGigTitle(""); setGigDate(""); setGigTime("");
    setGigBudget(""); setGigGenre(""); setGigNotes("");
    setPostingGig(false);
    setShowPostGig(false);
    setActiveTab("gigs");
  };

  // ── Accept / Reject application ─────────────────────────────────────────
  const handleUpdateApplication = async (appId: string, gigId: string, status: "accepted" | "rejected") => {
    setUpdatingAppId(appId);
    const { error } = await supabase
      .from("gig_applications")
      .update({ status })
      .eq("id", appId);

    if (!error) {
      setGigs((prev) =>
        prev.map((g) =>
          g.id === gigId
            ? {
                ...g,
                applications: g.applications.map((a) =>
                  a.id === appId ? { ...a, status } : a
                ),
              }
            : g
        )
      );
    }
    setUpdatingAppId(null);
  };

  const handleToggleGig = (gigId: string) => {
    setGigs((prev) => prev.map((g) => g.id === gigId ? { ...g, expanded: !g.expanded } : g));
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const statusBadge = (status: string) => {
    if (status === "accepted") return <Badge className="bg-green-100 text-green-800 border-green-200">Zaakceptowana</Badge>;
    if (status === "rejected") return <Badge className="bg-red-100 text-red-800 border-red-200">Odrzucona</Badge>;
    return <Badge variant="secondary">Oczekuje</Badge>;
  };

  const gigStatusBadge = (status: string) => {
    if (status === "open") return <Badge variant="secondary">Otwarte</Badge>;
    if (status === "filled") return <Badge className="bg-green-100 text-green-800 border-green-200">Obsadzone</Badge>;
    if (status === "cancelled") return <Badge className="bg-red-100 text-red-800 border-red-200">Anulowane</Badge>;
    return <Badge variant="secondary">{status}</Badge>;
  };

  const navItems: { icon: React.ElementType; label: string; tab: Tab }[] = [
    { icon: MapPin, label: "Znajdź muzyków", tab: "find" },
    { icon: Calendar, label: "Moje gigy", tab: "gigs" },
    { icon: MessageSquare, label: "Wiadomości", tab: "messages" },
    { icon: Building2, label: "Profil lokalu", tab: "profile" },
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
                <Building2 className="w-7 h-7 text-muted-foreground" />
              </div>
              <h2 className="font-display text-lg font-bold text-foreground">
                {venueProfile?.venue_name || profile?.name || <span className="text-muted-foreground">Ładowanie…</span>}
              </h2>
              {venueProfile?.venue_type && (
                <p className="text-sm text-muted-foreground">{venueProfile.venue_type}</p>
              )}
              {venueProfile?.location && (
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {venueProfile.location}
                </p>
              )}
              {!venueProfile && (
                <p className="text-xs text-muted-foreground mt-2">
                  Uzupełnij profil lokalu w zakładce "Profil lokalu".
                </p>
              )}
            </div>

            <div className="space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.tab}
                  onClick={() => { setActiveTab(item.tab); setShowPostGig(false); }}
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

            <Button variant="pill" className="w-full" onClick={() => setShowPostGig(true)}>
              <Plus className="w-4 h-4 mr-1" /> Dodaj gig
            </Button>
          </div>

          {/* Main content */}
          <div className="flex-1">

            {/* ── Formularz dodawania giga ──────────────── */}
            {showPostGig && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg">
                <div className="flex items-center justify-between mb-6">
                  <h1 className="font-display text-2xl font-bold text-foreground">Dodaj gig</h1>
                  <Button variant="ghost" size="sm" onClick={() => setShowPostGig(false)}>Anuluj</Button>
                </div>
                <form onSubmit={handlePostGig} className="space-y-4 p-6 rounded-xl border border-border">
                  <div className="space-y-2">
                    <Label>Tytuł giga *</Label>
                    <Input
                      placeholder="Piątkowy wieczór jazzowy"
                      value={gigTitle}
                      onChange={(e) => setGigTitle(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Data *</Label>
                      <Input type="date" value={gigDate} onChange={(e) => setGigDate(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Godzina</Label>
                      <Input type="time" value={gigTime} onChange={(e) => setGigTime(e.target.value)} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Budżet (PLN)</Label>
                      <Input type="number" placeholder="500" value={gigBudget} onChange={(e) => setGigBudget(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Gatunek</Label>
                      <Input placeholder="Jazz, Pop, Rock…" value={gigGenre} onChange={(e) => setGigGenre(e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Dodatkowe wymagania</Label>
                    <Textarea
                      placeholder="np. Szukam gitarzysty jazzowego solo, tylko akustyk."
                      value={gigNotes}
                      onChange={(e) => setGigNotes(e.target.value)}
                    />
                  </div>
                  {postGigError && <p className="text-sm text-destructive">{postGigError}</p>}
                  <Button variant="pill" className="w-full" size="lg" type="submit" disabled={postingGig}>
                    {postingGig ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    {postingGig ? "Publikuję…" : "Opublikuj i znajdź muzyków"}
                  </Button>
                </form>
              </motion.div>
            )}

            {/* ── Znajdź muzyków ────────────────────────── */}
            {!showPostGig && activeTab === "find" && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="font-display text-2xl font-bold text-foreground mb-1">Znajdź muzyków</h1>
                <p className="text-muted-foreground text-sm mb-6">Dostępni muzycy w Twojej okolicy</p>
                <MapView
                  role="venue"
                  onSendOffer={(userId) => console.log("send offer to", userId)}
                />
              </motion.div>
            )}

            {/* ── Moje gigy ────────────────────────────── */}
            {!showPostGig && activeTab === "gigs" && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="font-display text-2xl font-bold text-foreground mb-1">Moje gigy</h1>
                <p className="text-muted-foreground text-sm mb-6">Opublikowane oferty i aplikacje muzyków</p>

                {loadingGigs ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : gigs.length === 0 ? (
                  <div className="py-12 text-center border border-border rounded-xl">
                    <Calendar className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">Nie opublikowałeś jeszcze żadnego giga.</p>
                    <Button variant="pill" className="mt-4" onClick={() => setShowPostGig(true)}>
                      <Plus className="w-4 h-4 mr-1" /> Dodaj pierwszy gig
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {gigs.map((gig, i) => (
                      <motion.div
                        key={gig.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="rounded-xl border border-border overflow-hidden"
                      >
                        {/* Gig header */}
                        <button
                          className="w-full p-5 flex items-center justify-between text-left hover:bg-secondary/30 transition-colors"
                          onClick={() => handleToggleGig(gig.id)}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="font-display text-base font-semibold text-foreground">{gig.title}</h3>
                              {gigStatusBadge(gig.status)}
                              {gig.applications.length > 0 && (
                                <Badge variant="secondary">{gig.applications.length} aplikacji</Badge>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                              <span>{gig.date}</span>
                              {gig.budget && <><span>·</span><span className="font-medium text-foreground">{gig.budget} PLN</span></>}
                              {gig.genre && <><span>·</span><span>{gig.genre}</span></>}
                            </div>
                          </div>
                          {gig.expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                        </button>

                        {/* Applications list */}
                        {gig.expanded && (
                          <div className="border-t border-border">
                            {gig.applications.length === 0 ? (
                              <p className="px-5 py-4 text-sm text-muted-foreground">Brak aplikacji na ten gig.</p>
                            ) : (
                              gig.applications.map((app) => (
                                <div key={app.id} className="px-5 py-4 flex items-center justify-between border-b border-border last:border-0">
                                  <div>
                                    <p className="text-sm font-medium text-foreground">{app.musician_name}</p>
                                    {app.message && (
                                      <p className="text-xs text-muted-foreground mt-0.5">"{app.message}"</p>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {app.status === "pending" ? (
                                      <>
                                        <Button
                                          variant="pill"
                                          size="sm"
                                          onClick={() => handleUpdateApplication(app.id, gig.id, "accepted")}
                                          disabled={updatingAppId === app.id}
                                        >
                                          {updatingAppId === app.id ? <Loader2 className="w-3 h-3 animate-spin" /> : "Akceptuj"}
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleUpdateApplication(app.id, gig.id, "rejected")}
                                          disabled={updatingAppId === app.id}
                                        >
                                          Odrzuć
                                        </Button>
                                      </>
                                    ) : (
                                      statusBadge(app.status)
                                    )}
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* ── Wiadomości ───────────────────────────── */}
            {!showPostGig && activeTab === "messages" && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="font-display text-2xl font-bold text-foreground mb-1">Wiadomości</h1>
                <p className="text-muted-foreground text-sm mb-6">Czat z muzykami</p>
                <div className="py-12 text-center border border-border rounded-xl">
                  <MessageSquare className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">Brak wiadomości.</p>
                  <p className="text-xs text-muted-foreground mt-1">Wiadomości pojawią się gdy skontaktujesz się z muzykiem.</p>
                </div>
              </motion.div>
            )}

            {/* ── Profil lokalu ────────────────────────── */}
            {!showPostGig && activeTab === "profile" && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="font-display text-2xl font-bold text-foreground mb-1">Profil lokalu</h1>
                <p className="text-muted-foreground text-sm mb-6">Informacje o Twoim lokalu</p>

                {!venueProfile ? (
                  <div className="py-12 text-center border border-border rounded-xl">
                    <Building2 className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">Profil lokalu nie jest jeszcze wypełniony.</p>
                    <Button variant="pill" className="mt-4" onClick={() => navigate("/onboarding")}>
                      Uzupełnij profil
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4 max-w-lg">
                    <div className="p-5 rounded-xl border border-border space-y-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Nazwa lokalu</p>
                        <p className="text-sm font-medium text-foreground">{venueProfile.venue_name || "—"}</p>
                      </div>
                      {venueProfile.venue_type && (
                        <div>
                          <p className="text-xs text-muted-foreground">Typ</p>
                          <p className="text-sm font-medium text-foreground">{venueProfile.venue_type}</p>
                        </div>
                      )}
                      {venueProfile.location && (
                        <div>
                          <p className="text-xs text-muted-foreground">Lokalizacja</p>
                          <p className="text-sm font-medium text-foreground">{venueProfile.location}</p>
                        </div>
                      )}
                      {venueProfile.capacity && (
                        <div>
                          <p className="text-xs text-muted-foreground">Pojemność</p>
                          <p className="text-sm font-medium text-foreground">{venueProfile.capacity} miejsc</p>
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default VenueDashboard;

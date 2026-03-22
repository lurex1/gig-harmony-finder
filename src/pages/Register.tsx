import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Music, Building2, Guitar } from "lucide-react";
import { motion } from "framer-motion";

type Role = "musician" | "venue" | null;

const Register = () => {
  const [role, setRole] = useState<Role>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [gdprConsent, setGdprConsent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement with Supabase auth
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
            <Music className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="font-display text-2xl font-bold text-foreground">GigMatch</span>
        </Link>

        <div className="p-8 rounded-2xl bg-gradient-card border border-border/50">
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">Create your account</h1>
          <p className="text-muted-foreground text-sm mb-6">Choose your role to get started</p>

          {!role ? (
            <div className="grid grid-cols-2 gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setRole("musician")}
                className="p-6 rounded-xl border border-border/50 bg-muted/30 hover:border-primary/50 hover:shadow-glow transition-all text-center"
              >
                <Guitar className="w-10 h-10 text-primary mx-auto mb-3" />
                <span className="font-display text-lg font-semibold text-foreground block">Musician</span>
                <span className="text-xs text-muted-foreground mt-1 block">$1.99/month</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setRole("venue")}
                className="p-6 rounded-xl border border-border/50 bg-muted/30 hover:border-secondary/50 hover:shadow-glow-amber transition-all text-center"
              >
                <Building2 className="w-10 h-10 text-secondary mx-auto mb-3" />
                <span className="font-display text-lg font-semibold text-foreground block">Venue</span>
                <span className="text-xs text-muted-foreground mt-1 block">$3.99/month</span>
              </motion.button>
            </div>
          ) : (
            <motion.form
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <button
                type="button"
                onClick={() => setRole(null)}
                className="text-sm text-primary hover:underline mb-2"
              >
                ← Change role
              </button>

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs">
                {role === "musician" ? <Guitar className="w-3 h-3" /> : <Building2 className="w-3 h-3" />}
                {role === "musician" ? "Musician" : "Venue"} Account
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">{role === "musician" ? "Artist/Band Name" : "Venue Name"}</Label>
                <Input
                  id="name"
                  placeholder={role === "musician" ? "The Blue Notes" : "The Jazz Lounge"}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="flex items-start gap-3 pt-2">
                <Checkbox
                  id="gdpr"
                  checked={gdprConsent}
                  onCheckedChange={(checked) => setGdprConsent(checked === true)}
                />
                <Label htmlFor="gdpr" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
                  I consent to GigMatch collecting and processing my location data when I enable availability tracking. My location is only shared while I am actively available and is never stored permanently. I can withdraw consent at any time.
                </Label>
              </div>

              <Button variant="hero" className="w-full" size="lg" type="submit" disabled={!gdprConsent}>
                Create Account
              </Button>
            </motion.form>
          )}

          <p className="text-sm text-muted-foreground text-center mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;

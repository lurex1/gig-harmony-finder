import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Music, Building2, Guitar } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

type Role = "musician" | "venue" | null;

const Register = () => {
  const [role, setRole] = useState<Role>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [gdprConsent, setGdprConsent] = useState(false);
  const { t } = useTranslation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <Music className="w-7 h-7 text-foreground" />
          <span className="font-display text-2xl font-bold text-foreground">GigMatch</span>
        </Link>

        <div className="p-8 rounded-2xl border border-border bg-background">
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">{t('register.createAccount')}</h1>
          <p className="text-muted-foreground text-sm mb-6">{t('register.chooseRole')}</p>

          {!role ? (
            <div className="grid grid-cols-2 gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setRole("musician")}
                className="p-6 rounded-xl border border-border hover:border-foreground/30 transition-all text-center"
              >
                <Guitar className="w-10 h-10 text-foreground mx-auto mb-3" />
                <span className="font-display text-lg font-semibold text-foreground block">{t('register.musician')}</span>
                <span className="text-xs text-muted-foreground mt-1 block">{t('register.musicianTrial')}</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setRole("venue")}
                className="p-6 rounded-xl border border-border hover:border-foreground/30 transition-all text-center"
              >
                <Building2 className="w-10 h-10 text-foreground mx-auto mb-3" />
                <span className="font-display text-lg font-semibold text-foreground block">{t('register.venue')}</span>
                <span className="text-xs text-muted-foreground mt-1 block">{t('register.venueTrial')}</span>
              </motion.button>
            </div>
          ) : (
            <motion.form
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <button type="button" onClick={() => setRole(null)} className="text-sm text-muted-foreground hover:text-foreground mb-2">
                {t('register.changeRole')}
              </button>

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border text-xs text-foreground">
                {role === "musician" ? <Guitar className="w-3 h-3" /> : <Building2 className="w-3 h-3" />}
                {role === "musician" ? t('register.musician') : t('register.venue')}
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">{role === "musician" ? t('register.artistName') : t('register.venueName')}</Label>
                <Input id="name" placeholder={role === "musician" ? "The Blue Notes" : "The Jazz Lounge"} value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t('register.email')}</Label>
                <Input id="email" type="email" placeholder="ty@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t('register.password')}</Label>
                <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>

              <div className="flex items-start gap-3 pt-2">
                <Checkbox id="gdpr" checked={gdprConsent} onCheckedChange={(checked) => setGdprConsent(checked === true)} />
                <Label htmlFor="gdpr" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
                  {t('register.gdprConsent')}
                </Label>
              </div>

              <Button variant="pill" className="w-full" size="lg" type="submit" disabled={!gdprConsent}>
                {t('register.startFree')}
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-2">
                {role === "musician" ? t('register.trialInfoMusician') : t('register.trialInfoVenue')}
              </p>
            </motion.form>
          )}

          <p className="text-sm text-muted-foreground text-center mt-6">
            {t('register.hasAccount')}{" "}
            <Link to="/login" className="text-foreground font-medium hover:underline">{t('register.login')}</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;

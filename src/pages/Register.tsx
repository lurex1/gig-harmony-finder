import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Music, Building2, Guitar, MailCheck } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";

type Role = "musician" | "venue" | null;

function validatePassword(password: string): string | null {
  if (password.length < 8) return null; // let main error handle it
  const hasLetter = /[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/.test(password);
  const hasDigit = /\d/.test(password);
  if (password.length < 8 || !hasLetter || !hasDigit) return "error";
  return null;
}

const Register = () => {
  const [role, setRole] = useState<Role>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [gdprConsent, setGdprConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { t } = useTranslation();
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const isPasswordValid = (pwd: string) => {
    const hasLetter = /[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/.test(pwd);
    const hasDigit = /\d/.test(pwd);
    return pwd.length >= 8 && hasLetter && hasDigit;
  };

  const handlePasswordBlur = () => {
    if (password && !isPasswordValid(password)) {
      setPasswordError(t('register.passwordError'));
    } else {
      setPasswordError(null);
    }
  };

  const handleConfirmBlur = () => {
    if (confirmPassword && password !== confirmPassword) {
      setConfirmPasswordError(t('register.passwordMismatch'));
    } else {
      setConfirmPasswordError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) return;

    // Validate password
    if (!isPasswordValid(password)) {
      setPasswordError(t('register.passwordError'));
      return;
    }
    setPasswordError(null);

    // Validate confirm password
    if (password !== confirmPassword) {
      setConfirmPasswordError(t('register.passwordMismatch'));
      return;
    }
    setConfirmPasswordError(null);

    setError(null);
    setIsLoading(true);

    const { error, emailSent: sent } = await signUp(email, password, name, role);
    if (error) {
      setError(error);
      setIsLoading(false);
      return;
    }

    if (sent) {
      setEmailSent(true);
    } else {
      navigate('/onboarding');
    }
  };

  if (emailSent) {
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

          <div className="p-8 rounded-2xl border border-border bg-background text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                <MailCheck className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground mb-3">
              {t('register.emailSentTitle')}
            </h1>
            <p className="text-muted-foreground text-sm mb-2">
              {t('register.emailSentDesc')}
            </p>
            <p className="text-muted-foreground text-xs mb-6">
              {t('register.emailSentSpam')}
            </p>
            <Link to="/login">
              <Button variant="pill" className="w-full" size="lg">
                {t('register.backToLogin')}
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

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
                <span className="text-xs text-muted-foreground mt-1 block">{t('register.betaNotice')}</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setRole("venue")}
                className="p-6 rounded-xl border border-border hover:border-foreground/30 transition-all text-center"
              >
                <Building2 className="w-10 h-10 text-foreground mx-auto mb-3" />
                <span className="font-display text-lg font-semibold text-foreground block">{t('register.venue')}</span>
                <span className="text-xs text-muted-foreground mt-1 block">{t('register.betaNotice')}</span>
              </motion.button>
            </div>
          ) : (
            <>
            <div className="space-y-3 mb-4">
              <button
                type="button"
                onClick={() => {
                  localStorage.setItem('gigmatch_pending_role', role)
                  supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: { redirectTo: 'https://gigmatch-omega.vercel.app/auth/callback' },
                  })
                }}
                className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl border border-border bg-background hover:bg-secondary transition-colors text-sm font-medium text-foreground"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" aria-hidden="true">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Kontynuuj z Google
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center">
                  <span className="px-3 bg-background text-xs text-muted-foreground">lub wypełnij formularz</span>
                </div>
              </div>
            </div>

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
                <Input id="name" placeholder={role === "musician" ? "The Blue Notes" : "The Jazz Lounge"} value={name} onChange={(e) => setName(e.target.value)} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t('register.email')}</Label>
                <Input id="email" type="email" placeholder="ty@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>

              <div className="space-y-1">
                <Label htmlFor="password">{t('register.password')}</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setPasswordError(null); }}
                  onBlur={handlePasswordBlur}
                  required
                />
                {passwordError ? (
                  <p className="text-xs text-destructive">{passwordError}</p>
                ) : (
                  <p className="text-xs text-muted-foreground">{t('register.passwordHint')}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="confirmPassword">{t('register.confirmPassword')}</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setConfirmPasswordError(null); }}
                  onBlur={handleConfirmBlur}
                  required
                />
                {confirmPasswordError && (
                  <p className="text-xs text-destructive">{confirmPasswordError}</p>
                )}
              </div>

              <div className="flex items-start gap-3 pt-2">
                <Checkbox id="gdpr" checked={gdprConsent} onCheckedChange={(checked) => setGdprConsent(checked === true)} />
                <Label htmlFor="gdpr" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
                  {t('register.gdprConsent')}
                </Label>
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <Button variant="pill" className="w-full" size="lg" type="submit" disabled={!gdprConsent || isLoading}>
                {isLoading ? "..." : t('register.startFree')}
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-2">
                {role === "musician" ? t('register.trialInfoMusician') : t('register.trialInfoVenue')}
              </p>
            </motion.form>
            </>
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

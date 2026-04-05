import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Music, Loader2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";

const ResetPassword = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Whether Supabase has set a recovery session from the URL hash
  const [sessionReady, setSessionReady] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);

  // Supabase embeds the recovery token in the URL hash.
  // The onAuthStateChange listener fires with event=PASSWORD_RECOVERY once
  // the SDK exchanges the token for a session.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setSessionReady(true);
        setSessionChecked(true);
      }
    });

    // Also check if there's already an active session (e.g. page refresh)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSessionReady(true);
      }
      setSessionChecked(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError(t("resetPassword.errorTooShort"));
      return;
    }
    if (password !== confirm) {
      setError(t("resetPassword.errorMismatch"));
      return;
    }

    setIsLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setIsLoading(false);

    if (error) {
      setError(error.message);
    } else {
      // Sign out so user logs in fresh with new password
      await supabase.auth.signOut();
      navigate("/login?message=password_changed");
    }
  };

  if (!sessionChecked) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
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
          {!sessionReady ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-7 h-7 text-destructive" />
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                {t("resetPassword.errorInvalid")}
              </p>
              <Link to="/forgot-password">
                <Button variant="outline" size="sm">
                  {t("forgotPassword.submit")}
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <h1 className="font-display text-2xl font-bold text-foreground mb-2">
                {t("resetPassword.title")}
              </h1>
              <p className="text-muted-foreground text-sm mb-6">
                {t("resetPassword.subtitle")}
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">{t("resetPassword.newPassword")}</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm">{t("resetPassword.confirmPassword")}</Label>
                  <Input
                    id="confirm"
                    type="password"
                    placeholder="••••••••"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                  />
                </div>

                {error && <p className="text-sm text-destructive">{error}</p>}

                <Button
                  variant="pill"
                  className="w-full"
                  size="lg"
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      {t("resetPassword.saving")}
                    </>
                  ) : (
                    t("resetPassword.submit")
                  )}
                </Button>
              </form>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;

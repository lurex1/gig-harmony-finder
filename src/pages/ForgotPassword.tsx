import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Music, ArrowLeft, MailCheck } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";

const ForgotPassword = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setIsLoading(false);

    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
  };

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
          {sent ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4"
            >
              <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-4">
                <MailCheck className="w-7 h-7 text-emerald-600" />
              </div>
              <h2 className="font-display text-xl font-bold text-foreground mb-2">
                {t("forgotPassword.successTitle")}
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                {t("forgotPassword.successDesc")}
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:underline"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                {t("forgotPassword.backToLogin")}
              </Link>
            </motion.div>
          ) : (
            <>
              <h1 className="font-display text-2xl font-bold text-foreground mb-2">
                {t("forgotPassword.title")}
              </h1>
              <p className="text-muted-foreground text-sm mb-6">
                {t("forgotPassword.subtitle")}
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">{t("forgotPassword.email")}</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="ty@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                  {isLoading ? t("forgotPassword.sending") : t("forgotPassword.submit")}
                </Button>
              </form>

              <p className="text-sm text-muted-foreground text-center mt-6">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-foreground font-medium hover:underline"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  {t("forgotPassword.backToLogin")}
                </Link>
              </p>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;

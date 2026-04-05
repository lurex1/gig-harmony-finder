import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Music, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const passwordChanged = searchParams.get('message') === 'password_changed';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const { error } = await signIn(email, password);
    if (error) {
      setError(error);
      setIsLoading(false);
      return;
    }

    // Fetch profile to redirect to the right dashboard
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      navigate(profile?.role === "venue" ? "/venue" : "/musician");
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
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">{t('login.welcome')}</h1>
          <p className="text-muted-foreground text-sm mb-6">{t('login.subtitle')}</p>

          {passwordChanged && (
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-emerald-50 border border-emerald-200 mb-4">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <p className="text-sm text-emerald-700">{t('login.passwordChanged')}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t('login.email')}</Label>
              <Input id="email" type="email" placeholder="ty@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{t('login.password')}</Label>
                <Link to="/forgot-password" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                  {t('login.forgotPassword')}
                </Link>
              </div>
              <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <Button variant="pill" className="w-full" size="lg" type="submit" disabled={isLoading}>
              {isLoading ? "..." : t('login.submit')}
            </Button>
          </form>

          <p className="text-sm text-muted-foreground text-center mt-6">
            {t('login.noAccount')}{" "}
            <Link to="/register" className="text-foreground font-medium hover:underline">{t('login.register')}</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;

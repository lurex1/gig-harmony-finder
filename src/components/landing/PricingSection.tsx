import { Link } from "react-router-dom";
import { Check, Music, Building2 } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

const musicianFeatures = [
  "Profil z audio i video",
  "Mapa gigów w okolicy",
  "Aplikowanie na gigi",
  "Ranking AI dopasowań",
  "Wiadomości z lokalami",
  "Kalendarz dostępności",
];

const venueFeatures = [
  "Profil lokalu z galerią",
  "Publikowanie ogłoszeń",
  "Przeglądanie muzyków",
  "Ranking AI dopasowań",
  "Wiadomości z muzykami",
  "Zarządzanie aplikacjami",
];

const PricingSection = () => {
  const { t } = useTranslation();

  return (
    <section
      id="pricing"
      className="py-20"
      style={{ background: "linear-gradient(135deg, #f8f6ff 0%, #f0f4ff 100%)" }}
    >
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
            {t('pricing.title')}
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            {t('pricing.subtitle')}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">

          {/* Musician card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0 }}
            className="p-8 rounded-2xl border-2 border-indigo-200 bg-white relative overflow-hidden"
          >
            {/* subtle indigo glow in top-right corner */}
            <div
              className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-20 pointer-events-none"
              style={{ background: "radial-gradient(circle, #818cf8, transparent 70%)" }}
            />

            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-full flex items-center justify-center"
                   style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
                <Music className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-display text-2xl font-bold text-foreground">Muzyk</h3>
            </div>

            <div className="mb-1">
              <span className="font-display text-4xl font-bold text-foreground">$4.99</span>
              <span className="text-sm text-muted-foreground">{t('pricing.perMonth')}</span>
            </div>
            <p className="text-xs font-medium text-indigo-500 mb-4">{t('pricing.trialInfo')}</p>

            <p className="text-sm text-muted-foreground mb-6">Dla solistów, zespołów i DJ-ów</p>

            <ul className="space-y-3 mb-8">
              {musicianFeatures.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm text-foreground">
                  <Check className="w-4 h-4 mt-0.5 shrink-0 text-indigo-500" />
                  {feature}
                </li>
              ))}
            </ul>

            <Link
              to="/register"
              className="block w-full py-3 rounded-full text-center font-semibold text-sm text-white transition-opacity hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)" }}
            >
              {t('pricing.startFree')}
            </Link>
          </motion.div>

          {/* Venue card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="p-8 rounded-2xl border border-border bg-white"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-full flex items-center justify-center bg-muted">
                <Building2 className="w-4 h-4 text-foreground" />
              </div>
              <h3 className="font-display text-2xl font-bold text-foreground">{t('pricing.venue')}</h3>
            </div>

            <div className="mb-1">
              <span className="font-display text-4xl font-bold text-foreground">$8.99</span>
              <span className="text-sm text-muted-foreground">{t('pricing.perMonth')}</span>
            </div>
            <p className="text-xs font-medium text-muted-foreground mb-4">{t('pricing.trialInfo')}</p>

            <p className="text-sm text-muted-foreground mb-6">{t('pricing.venueDesc')}</p>

            <ul className="space-y-3 mb-8">
              {venueFeatures.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm text-foreground">
                  <Check className="w-4 h-4 mt-0.5 shrink-0 text-muted-foreground" />
                  {feature}
                </li>
              ))}
            </ul>

            <Link
              to="/register"
              className="block w-full py-3 rounded-full text-center font-semibold text-sm border-2 border-indigo-500 text-indigo-600 bg-white transition-colors hover:bg-indigo-50"
            >
              {t('pricing.startFree')}
            </Link>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default PricingSection;

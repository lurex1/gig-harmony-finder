import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, Music, Building2 } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

const PricingSection = () => {
  const { t } = useTranslation();

  const plans = [
    {
      icon: Music,
      nameKey: "pricing.musician",
      price: "$1.99",
      descKey: "pricing.musicianDesc",
      featuresKey: "pricing.musicianFeatures",
      primary: true,
    },
    {
      icon: Building2,
      nameKey: "pricing.venue",
      price: "$3.99",
      descKey: "pricing.venueDesc",
      featuresKey: "pricing.venueFeatures",
      primary: false,
    },
  ];

  return (
    <section id="pricing" className="py-20 bg-secondary">
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
          {plans.map((plan, i) => {
            const features = t(plan.featuresKey, { returnObjects: true }) as string[];
            return (
              <motion.div
                key={plan.nameKey}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className={`p-8 rounded-2xl border ${plan.primary ? "bg-foreground text-background border-foreground" : "bg-background border-border"}`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <plan.icon className={`w-5 h-5 ${plan.primary ? "text-background" : "text-foreground"}`} />
                  <h3 className={`font-display text-2xl font-bold ${plan.primary ? "text-background" : "text-foreground"}`}>{t(plan.nameKey)}</h3>
                </div>

                <div className="mb-1">
                  <span className={`font-display text-4xl font-bold ${plan.primary ? "text-background" : "text-foreground"}`}>{plan.price}</span>
                  <span className={`text-sm ${plan.primary ? "text-background/60" : "text-muted-foreground"}`}>{t('pricing.perMonth')}</span>
                </div>
                <p className={`text-xs font-medium mb-4 ${plan.primary ? "text-background/70" : "text-muted-foreground"}`}>{t('pricing.trialInfo')}</p>

                <p className={`text-sm mb-6 ${plan.primary ? "text-background/70" : "text-muted-foreground"}`}>{t(plan.descKey)}</p>

                <ul className="space-y-3 mb-8">
                  {features.map((feature) => (
                    <li key={feature} className={`flex items-start gap-2 text-sm ${plan.primary ? "text-background" : "text-foreground"}`}>
                      <Check className={`w-4 h-4 mt-0.5 shrink-0 ${plan.primary ? "text-background/70" : "text-muted-foreground"}`} />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button
                  variant={plan.primary ? "secondary" : "default"}
                  className="w-full rounded-full"
                  size="lg"
                  asChild
                >
                  <Link to="/register">{t('pricing.startFree')}</Link>
                </Button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;

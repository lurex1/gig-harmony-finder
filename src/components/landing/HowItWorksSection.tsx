import { motion } from "framer-motion";
import { MapPin, Brain, MessageSquare, CreditCard } from "lucide-react";
import { useTranslation } from "react-i18next";

const featureIcons = [MapPin, Brain, MessageSquare, CreditCard];

const HowItWorksSection = () => {
  const { t } = useTranslation();

  const steps = [
    { n: "1", title: t("howItWorks.step1Title"), desc: t("howItWorks.step1Desc") },
    { n: "2", title: t("howItWorks.step2Title"), desc: t("howItWorks.step2Desc") },
    { n: "3", title: t("howItWorks.step3Title"), desc: t("howItWorks.step3Desc") },
    { n: "4", title: t("howItWorks.step4Title"), desc: t("howItWorks.step4Desc") },
  ];

  const features = [
    { icon: featureIcons[0], title: t("howItWorks.feat1Title"), desc: t("howItWorks.feat1Desc") },
    { icon: featureIcons[1], title: t("howItWorks.feat2Title"), desc: t("howItWorks.feat2Desc") },
    { icon: featureIcons[2], title: t("howItWorks.feat3Title"), desc: t("howItWorks.feat3Desc") },
    { icon: featureIcons[3], title: t("howItWorks.feat4Title"), desc: t("howItWorks.feat4Desc") },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-background">
      <div className="container mx-auto px-4">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
            {t("howItWorks.title")}
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            {t("howItWorks.subtitle")}
          </p>
        </motion.div>

        {/* ── 4 steps ──────────────────────────────────────────────────────── */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {steps.map((step, i) => (
            <motion.div
              key={step.n}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              className="relative p-6 rounded-xl bg-background border border-border"
            >
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-full w-6 border-t border-dashed border-border z-10" />
              )}
              <span className="font-display text-5xl font-bold text-muted-foreground/20 leading-none">
                {step.n}
              </span>
              <h3 className="font-display text-lg font-semibold mt-3 mb-2 text-foreground">
                {step.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* ── Divider ──────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h3 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
            {t("howItWorks.featuresTitle")}
          </h3>
          <p className="text-muted-foreground max-w-lg mx-auto text-sm">
            {t("howItWorks.featuresSubtitle")}
          </p>
        </motion.div>

        {/* ── Mini-features ─────────────────────────────────────────────────── */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, i) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-xl bg-secondary border border-border hover:shadow-sm transition-shadow"
            >
              <div className="w-10 h-10 rounded-lg bg-background border border-border flex items-center justify-center mb-4">
                <feat.icon className="w-5 h-5 text-foreground" />
              </div>
              <h4 className="font-display text-base font-semibold mb-2 text-foreground">
                {feat.title}
              </h4>
              <p className="text-muted-foreground text-sm leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default HowItWorksSection;

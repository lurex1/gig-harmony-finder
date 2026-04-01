import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

const HowItWorksSection = () => {
  const { t } = useTranslation();

  const steps = [
    { step: "1", titleKey: "howItWorks.step1Title", descKey: "howItWorks.step1Desc" },
    { step: "2", titleKey: "howItWorks.step2Title", descKey: "howItWorks.step2Desc" },
    { step: "3", titleKey: "howItWorks.step3Title", descKey: "howItWorks.step3Desc" },
    { step: "4", titleKey: "howItWorks.step4Title", descKey: "howItWorks.step4Desc" },
  ];

  return (
    <section id="how-it-works" className="py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
            {t('howItWorks.title')}
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            {t('howItWorks.subtitle')}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((item, i) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="relative p-6 rounded-xl bg-background border border-border"
            >
              <span className="font-display text-4xl font-bold text-muted-foreground/30">{item.step}</span>
              <h3 className="font-display text-lg font-semibold mt-2 mb-2 text-foreground">{t(item.titleKey)}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{t(item.descKey)}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;

import { MapPin, Brain, MessageSquare, CreditCard, Bell, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

const FeaturesSection = () => {
  const { t } = useTranslation();

  const features = [
    { icon: MapPin, titleKey: "features.liveMap", descKey: "features.liveMapDesc" },
    { icon: Brain, titleKey: "features.aiMatching", descKey: "features.aiMatchingDesc" },
    { icon: MessageSquare, titleKey: "features.messages", descKey: "features.messagesDesc" },
    { icon: CreditCard, titleKey: "features.simplePricing", descKey: "features.simplePricingDesc" },
    { icon: Bell, titleKey: "features.notifications", descKey: "features.notificationsDesc" },
    { icon: Shield, titleKey: "features.privacy", descKey: "features.privacyDesc" },
  ];

  return (
    <section id="features" className="py-20 bg-secondary">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
            {t('features.title')}
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            {t('features.subtitle')}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.titleKey}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-xl bg-background border border-border hover:shadow-md transition-shadow"
            >
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center mb-4">
                <feature.icon className="w-5 h-5 text-foreground" />
              </div>
              <h3 className="font-display text-lg font-semibold mb-2 text-foreground">{t(feature.titleKey)}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{t(feature.descKey)}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;

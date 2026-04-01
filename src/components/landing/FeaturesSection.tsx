import { MapPin, Brain, MessageSquare, CreditCard, Bell, Shield } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: MapPin,
    title: "Mapa na żywo",
    description: "Zobacz dostępnych muzyków w okolicy. Muzycy pojawiają się na mapie tylko gdy włączą dostępność.",
  },
  {
    icon: Brain,
    title: "AI Matching",
    description: "Nasz AI analizuje gatunek, instrumenty, odległość i styl, by dobrać najlepszych muzyków.",
  },
  {
    icon: MessageSquare,
    title: "Wiadomości",
    description: "Czatuj bezpośrednio z muzykami lub lokalami. Ustalaj szczegóły i potwierdzaj rezerwacje.",
  },
  {
    icon: CreditCard,
    title: "Prosty cennik",
    description: "Muzycy $1.99/mies., lokale $3.99/mies. Bez ukrytych opłat, bez prowizji.",
  },
  {
    icon: Bell,
    title: "Powiadomienia",
    description: "Otrzymuj natychmiast powiadomienia o dopasowanych gigach lub akceptacjach.",
  },
  {
    icon: Shield,
    title: "Prywatność",
    description: "Lokalizacja udostępniana tylko gdy jesteś aktywnie dostępny. Pełna zgodność z GDPR.",
  },
];

const FeaturesSection = () => {
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
            Wszystko czego potrzebujesz
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Stworzone dla branży muzyki na żywo.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-xl bg-background border border-border hover:shadow-md transition-shadow"
            >
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center mb-4">
                <feature.icon className="w-5 h-5 text-foreground" />
              </div>
              <h3 className="font-display text-lg font-semibold mb-2 text-foreground">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;

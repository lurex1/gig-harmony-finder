import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, Music, Building2 } from "lucide-react";
import { motion } from "framer-motion";

const plans = [
  {
    icon: Music,
    name: "Muzyk",
    price: "$1.99",
    description: "Dla solistów i zespołów szukających gigów",
    features: [
      "Pełny profil z audio/video",
      "Udostępnianie lokalizacji (opt-in)",
      "Oferty gigów dopasowane AI",
      "Wiadomości z lokalami",
      "Kalendarz dostępności",
      "Powiadomienia o gigach w okolicy",
    ],
    primary: true,
  },
  {
    icon: Building2,
    name: "Lokal",
    price: "$3.99",
    description: "Dla klubów, barów, restauracji i hoteli",
    features: [
      "Profil lokalu z pojemnością",
      "Nieograniczone oferty gigów",
      "Mapa muzyków na żywo",
      "Ranking AI dopasowań",
      "Wiadomości z muzykami",
      "Panel zarządzania gigami",
    ],
    primary: false,
  },
];

const PricingSection = () => {
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
            Prosty cennik
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            7 dni za darmo. Bez prowizji, bez ukrytych opłat.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className={`p-8 rounded-2xl border ${plan.primary ? "bg-foreground text-background border-foreground" : "bg-background border-border"}`}
            >
              <div className="flex items-center gap-3 mb-4">
                <plan.icon className={`w-5 h-5 ${plan.primary ? "text-background" : "text-foreground"}`} />
                <h3 className={`font-display text-2xl font-bold ${plan.primary ? "text-background" : "text-foreground"}`}>{plan.name}</h3>
              </div>

              <div className="mb-1">
                <span className={`font-display text-4xl font-bold ${plan.primary ? "text-background" : "text-foreground"}`}>{plan.price}</span>
                <span className={`text-sm ${plan.primary ? "text-background/60" : "text-muted-foreground"}`}>/miesiąc</span>
              </div>
              <p className={`text-xs font-medium mb-4 ${plan.primary ? "text-background/70" : "text-muted-foreground"}`}>7 dni za darmo, potem co miesiąc</p>

              <p className={`text-sm mb-6 ${plan.primary ? "text-background/70" : "text-muted-foreground"}`}>{plan.description}</p>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
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
                <Link to="/register">Rozpocznij za darmo</Link>
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;

import { motion } from "framer-motion";
import { MapPin, Brain, MessageSquare, CreditCard } from "lucide-react";

const steps = [
  {
    n: "1",
    title: "Zarejestruj się",
    desc: "Wybierz rolę — muzyk lub lokal. 7 dni trial za darmo, bez karty kredytowej.",
  },
  {
    n: "2",
    title: "Wypełnij profil",
    desc: "Podaj gatunki, instrumenty, atmosferę miejsca i ustaw lokalizację jednym kliknięciem.",
  },
  {
    n: "3",
    title: "AI dopasowuje",
    desc: "Claude AI analizuje kompatybilność stylu, budżetu i atmosfery. Widzisz tylko dopasowania ≥ 50%.",
  },
  {
    n: "4",
    title: "Czatuj i umawiaj gig",
    desc: "Zatwierdź propozycję — otwiera się czat real-time. Ustalcie szczegóły i grajcie.",
  },
];

const features = [
  {
    icon: MapPin,
    title: "Mapa na żywo",
    desc: "Muzycy i gigi widoczni na mapie Google w Twojej okolicy z wynikiem AI na pinie.",
  },
  {
    icon: Brain,
    title: "AI Matching",
    desc: "Claude AI ocenia zgodność stylu, budżetu i atmosfery. Drastyczna niezgodność wyklucza dopasowanie.",
  },
  {
    icon: MessageSquare,
    title: "Czat real-time",
    desc: "Każde zatwierdzenie propozycji otwiera bezpośredni czat. Równoległe rozmowy z wieloma stronami.",
  },
  {
    icon: CreditCard,
    title: "Prosty cennik",
    desc: "7 dni za darmo. Muzyk: 7,99 zł/mies. Lokal: 15,99 zł/mies. Anuluj kiedy chcesz.",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-24 bg-background">
      <div className="container mx-auto px-4">

        {/* ── Nagłówek ─────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
            Jak to działa?
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Od rejestracji do pierwszego giga w kilka minut.
          </p>
        </motion.div>

        {/* ── 4 kroki ──────────────────────────────────────────────────────── */}
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
              {/* Linia łącząca kroki (desktop) */}
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
            Wszystko czego potrzebujesz
          </h3>
          <p className="text-muted-foreground max-w-lg mx-auto text-sm">
            Jeden produkt zamiast arkuszy, telefonów i ogłoszeń.
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

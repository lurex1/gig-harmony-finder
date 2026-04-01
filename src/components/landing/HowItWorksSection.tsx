import { motion } from "framer-motion";

const steps = [
  { step: "1", title: "Stwórz profil", description: "Zarejestruj się jako muzyk lub lokal. Dodaj swoje dane i preferencje." },
  { step: "2", title: "Włącz dostępność", description: "Muzycy włączają dostępność, lokale publikują oferty gigów." },
  { step: "3", title: "Dopasowanie AI", description: "Nasz silnik AI rankuje najlepsze dopasowania wg odległości, gatunku i stylu." },
  { step: "4", title: "Zarezerwuj i graj", description: "Zaakceptuj gig, ustal szczegóły na czacie i wejdź na scenę." },
];

const HowItWorksSection = () => {
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
            Jak to działa
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Od rejestracji do sceny w 4 krokach.
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
              <h3 className="font-display text-lg font-semibold mt-2 mb-2 text-foreground">{item.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;

import { motion } from "framer-motion";

const steps = [
  {
    step: "01",
    title: "Create Your Profile",
    description: "Sign up as a musician or venue. Add your details, genre preferences, and samples.",
    accent: "border-primary/50",
  },
  {
    step: "02",
    title: "Go Live",
    description: "Musicians toggle availability to appear on the map. Venues post gig requirements.",
    accent: "border-accent/50",
  },
  {
    step: "03",
    title: "Get Matched",
    description: "Our AI engine ranks the best matches based on proximity, genre, and style fit.",
    accent: "border-secondary/50",
  },
  {
    step: "04",
    title: "Book & Play",
    description: "Accept the gig, chat to coordinate details, and hit the stage.",
    accent: "border-primary/50",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-24 relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            How It <span className="text-gradient">Works</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            From signup to stage in four simple steps.
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
              className={`relative p-6 rounded-xl bg-card border-l-4 ${item.accent}`}
            >
              <span className="font-display text-5xl font-bold text-muted/50">{item.step}</span>
              <h3 className="font-display text-lg font-semibold mt-3 mb-2 text-foreground">{item.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;

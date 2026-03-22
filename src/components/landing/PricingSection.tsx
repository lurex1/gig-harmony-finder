import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, Music, Building2 } from "lucide-react";
import { motion } from "framer-motion";

const plans = [
  {
    icon: Music,
    name: "Musician",
    price: "$1.99",
    description: "For solo artists and bands looking for gigs",
    features: [
      "Full profile with audio/video links",
      "Live location sharing (opt-in)",
      "Receive AI-matched gig offers",
      "In-app messaging with venues",
      "Availability calendar",
      "Push notifications for nearby gigs",
    ],
    variant: "hero" as const,
  },
  {
    icon: Building2,
    name: "Venue",
    price: "$3.99",
    description: "For clubs, bars, restaurants, and hotels",
    features: [
      "Venue profile with capacity info",
      "Post unlimited gig offers",
      "Live map of available musicians",
      "AI-ranked match recommendations",
      "In-app messaging with musicians",
      "Gig management dashboard",
    ],
    variant: "amber" as const,
  },
];

const PricingSection = () => {
  return (
    <section id="pricing" className="py-24 relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Simple <span className="text-gradient">Pricing</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Start with a 7-day free trial. No commissions, no hidden fees.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="p-8 rounded-2xl bg-gradient-card border border-border/50 hover:border-primary/30 hover:shadow-glow transition-all duration-500"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  <plan.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-display text-2xl font-bold text-foreground">{plan.name}</h3>
              </div>

              <div className="mb-1">
                <span className="font-display text-4xl font-bold text-foreground">{plan.price}</span>
                <span className="text-muted-foreground text-sm">/month</span>
              </div>
              <p className="text-xs text-primary font-medium mb-4">7 days free, then billed monthly</p>

              <p className="text-muted-foreground text-sm mb-6">{plan.description}</p>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-foreground">
                    <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button variant={plan.variant} className="w-full" size="lg" asChild>
                <Link to="/register">Start Free Trial</Link>
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;

import { MapPin, Brain, MessageSquare, CreditCard, Bell, Shield } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: MapPin,
    title: "Live Map View",
    description: "See available musicians near your venue in real-time. Musicians appear on the map only when they toggle availability.",
    color: "text-primary",
  },
  {
    icon: Brain,
    title: "AI Matching Engine",
    description: "Our AI analyzes genre, instruments, distance, and style to rank the best musicians for each gig.",
    color: "text-accent",
  },
  {
    icon: MessageSquare,
    title: "In-App Messaging",
    description: "Chat directly with matched musicians or venues. Coordinate details, share samples, and confirm bookings.",
    color: "text-secondary",
  },
  {
    icon: CreditCard,
    title: "Simple Subscriptions",
    description: "Musicians at $1.99/mo, venues at $3.99/mo. No hidden fees, no commissions on your gigs.",
    color: "text-primary",
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    description: "Get notified instantly when a gig matches your profile or a musician accepts your offer.",
    color: "text-accent",
  },
  {
    icon: Shield,
    title: "Privacy First",
    description: "Location is shared only when you're actively available. Full GDPR compliance with opt-in tracking.",
    color: "text-secondary",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Everything You <span className="text-gradient">Need</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Built for the live music industry, from solo artists to full bands.
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
              className="group p-6 rounded-xl bg-gradient-card border border-border/50 hover:border-primary/30 hover:shadow-glow transition-all duration-500"
            >
              <div className={`w-12 h-12 rounded-lg bg-muted flex items-center justify-center mb-4 ${feature.color}`}>
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-2 text-foreground">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;

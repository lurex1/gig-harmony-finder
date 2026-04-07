import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import heroIllustration from "@/assets/hero-illustration.jpg";

const HeroSection = () => {
  const { t } = useTranslation();
  return (
    <section
      className="py-12 md:py-24"
      style={{ background: "linear-gradient(135deg, #f8f6ff 0%, #f0f4ff 100%)" }}
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

          {/* Left: text + CTA */}
          <div className="flex-1 max-w-xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="font-display text-4xl md:text-6xl font-bold leading-[1.05] text-foreground mb-6">
                {t('hero.title')}
              </h1>

              <p className="text-muted-foreground text-lg mb-10 leading-relaxed">
                {t('hero.subtitle')}
              </p>

              <div className="flex flex-wrap gap-3">
                <Link
                  to="/register"
                  className="px-7 py-3 rounded-full font-semibold text-white text-sm transition-opacity hover:opacity-90"
                  style={{ background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)" }}
                >
                  {t('hero.musicianCta')}
                </Link>
                <Link
                  to="/register"
                  className="px-7 py-3 rounded-full font-semibold text-sm border-2 border-indigo-500 text-indigo-600 bg-white transition-colors hover:bg-indigo-50"
                >
                  {t('hero.venueCta')}
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Right: illustration */}
          <div className="flex-1 max-w-lg lg:max-w-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <img
                src={heroIllustration}
                alt="Musician performing on stage"
                className="w-full h-auto rounded-2xl shadow-xl"
                width={1024}
                height={768}
              />
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default HeroSection;

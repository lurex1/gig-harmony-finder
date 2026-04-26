import { Music } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="py-10 border-t border-border">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <Link to="/" className="flex items-center gap-2">
            <Music className="w-5 h-5 text-foreground" />
            <span className="font-display text-lg font-bold text-foreground">GigMatch</span>
          </Link>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link to="/privacy-policy" className="hover:text-foreground transition-colors">{t('footer.privacyPolicy')}</Link>
            <Link to="/terms" className="hover:text-foreground transition-colors">{t('footer.terms')}</Link>
            <Link to="/cookies" className="hover:text-foreground transition-colors">{t('footer.cookies')}</Link>
            {import.meta.env.VITE_TALLY_FEEDBACK_URL && (
              <a
                href={import.meta.env.VITE_TALLY_FEEDBACK_URL as string}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                {t('footer.feedback', { defaultValue: 'Daj feedback' })}
              </a>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {t('footer.allRights', { year: new Date().getFullYear() })}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

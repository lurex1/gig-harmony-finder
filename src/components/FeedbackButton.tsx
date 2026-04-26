import { MessageCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

/**
 * Floating "Daj feedback" button — visible on every page when
 * VITE_TALLY_FEEDBACK_URL is configured. Hidden on landing's footer
 * to avoid duplication, but otherwise globally pinned bottom-right.
 */
const FeedbackButton = () => {
  const { t } = useTranslation();
  const url = import.meta.env.VITE_TALLY_FEEDBACK_URL as string | undefined;

  if (!url) return null;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background shadow-lg transition-transform hover:scale-105"
      aria-label={t("feedback.button", { defaultValue: "Daj feedback" })}
    >
      <MessageCircle className="h-4 w-4" />
      <span className="hidden sm:inline">
        {t("feedback.button", { defaultValue: "Daj feedback" })}
      </span>
    </a>
  );
};

export default FeedbackButton;

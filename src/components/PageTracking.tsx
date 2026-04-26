import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { posthog } from "@/lib/posthog";

/**
 * Empty component that triggers a PostHog $pageview event on every
 * React Router navigation. Mounted once inside <BrowserRouter>.
 */
const PageTracking = () => {
  const location = useLocation();

  useEffect(() => {
    if (!import.meta.env.VITE_POSTHOG_KEY) return;
    posthog.capture("$pageview", {
      $current_url: window.location.href,
      path: location.pathname,
    });
  }, [location]);

  return null;
};

export default PageTracking;

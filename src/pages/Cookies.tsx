import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";

const Cookies = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <Link to="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('legal.backBtn')}
          </Button>
        </Link>

        <h1 className="text-4xl font-bold mb-8 text-foreground">{t('cookies.title')}</h1>

        <div className="bg-card rounded-lg border border-border p-6 md:p-10 space-y-8">
          <p className="text-sm text-muted-foreground">{t('legal.lastUpdated', { date: new Date().toLocaleDateString() })}</p>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-foreground">{t('cookies.s1Title')}</h2>
            <p className="text-muted-foreground">{t('cookies.s1Text')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-foreground">{t('cookies.s2Title')}</h2>
            <div className="space-y-3 text-muted-foreground">
              <p><strong className="text-foreground">{t('cookies.s2_essentialTerm')}</strong>{t('cookies.s2_essentialDesc')}</p>
              <p><strong className="text-foreground">{t('cookies.s2_functionalTerm')}</strong>{t('cookies.s2_functionalDesc')}</p>
              <p><strong className="text-foreground">{t('cookies.s2_analyticsTerm')}</strong>{t('cookies.s2_analyticsDesc')}</p>
              <p><strong className="text-foreground">{t('cookies.s2_marketingTerm')}</strong>{t('cookies.s2_marketingDesc')}</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-foreground">{t('cookies.s3Title')}</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-muted-foreground border border-border rounded-lg">
                <thead>
                  <tr className="bg-muted">
                    <th className="p-3 text-left text-foreground font-semibold">{t('cookies.s3_colName')}</th>
                    <th className="p-3 text-left text-foreground font-semibold">{t('cookies.s3_colType')}</th>
                    <th className="p-3 text-left text-foreground font-semibold">{t('cookies.s3_colPurpose')}</th>
                    <th className="p-3 text-left text-foreground font-semibold">{t('cookies.s3_colDuration')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="p-3">sb-*-auth-token</td>
                    <td className="p-3">{t('cookies.s3_r1Type')}</td>
                    <td className="p-3">{t('cookies.s3_r1Purpose')}</td>
                    <td className="p-3">{t('cookies.s3_r1Duration')}</td>
                  </tr>
                  <tr>
                    <td className="p-3">sb-*-auth-token-code-verifier</td>
                    <td className="p-3">{t('cookies.s3_r2Type')}</td>
                    <td className="p-3">{t('cookies.s3_r2Purpose')}</td>
                    <td className="p-3">{t('cookies.s3_r2Duration')}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-foreground">{t('cookies.s4Title')}</h2>
            <p className="text-muted-foreground mb-3">{t('cookies.s4_intro')}</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>
                <strong className="text-foreground">Stripe</strong> –{" "}
                <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{t('cookies.s4_privacyPolicy')}</a>
              </li>
              <li>
                <strong className="text-foreground">Google</strong> (Maps, Analytics) –{" "}
                <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{t('cookies.s4_privacyPolicy')}</a>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-foreground">{t('cookies.s5Title')}</h2>
            <p className="text-muted-foreground mb-3">{t('cookies.s5_intro')}</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Chrome</a></li>
              <li><a href="https://support.mozilla.org/pl/kb/ciasteczka" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Mozilla Firefox</a></li>
              <li><a href="https://support.apple.com/pl-pl/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Safari</a></li>
              <li><a href="https://support.microsoft.com/pl-pl/microsoft-edge" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Microsoft Edge</a></li>
            </ul>
            <p className="text-muted-foreground mt-3">{t('cookies.s5_warning')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-foreground">{t('cookies.s6Title')}</h2>
            <p className="text-muted-foreground">
              {t('cookies.s6Text')}{" "}
              <Link to="/cookies" className="text-primary hover:underline">/cookies</Link>.
            </p>
          </section>

          <div className="mt-8 p-6 bg-muted rounded-lg">
            <h3 className="text-lg font-semibold text-foreground mb-2">{t('legal.contactTitle')}</h3>
            <p className="text-muted-foreground">
              Paweł Eberle – Paveelo<br />
              ul. Zamojskiego 18H/2, 37-450 Stalowa Wola<br />
              E-mail: <a href="mailto:eberlepawel@gmail.com" className="text-primary hover:underline">eberlepawel@gmail.com</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cookies;

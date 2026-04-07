import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";

const Terms = () => {
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

        <h1 className="text-4xl font-bold mb-8 text-foreground">{t('terms.title')}</h1>

        <div className="bg-card rounded-lg border border-border p-6 md:p-10 space-y-8">
          <p className="text-sm text-muted-foreground">{t('legal.lastUpdated', { date: new Date().toLocaleDateString() })}</p>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">{t('terms.s1Title')}</h2>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li>{t('terms.s1_l1')}</li>
              <li>{t('terms.s1_l2')}</li>
              <li>{t('terms.s1_l3')}</li>
              <li>{t('terms.s1_l4')}</li>
              <li>{t('terms.s1_l5')}</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">{t('terms.s2Title')}</h2>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li><strong>{t('terms.s2_l1_term')}</strong>{t('terms.s2_l1_desc')}</li>
              <li><strong>{t('terms.s2_l2_term')}</strong>{t('terms.s2_l2_desc')}</li>
              <li><strong>{t('terms.s2_l3_term')}</strong>{t('terms.s2_l3_desc')}</li>
              <li><strong>{t('terms.s2_l4_term')}</strong>{t('terms.s2_l4_desc')}</li>
              <li><strong>{t('terms.s2_l5_term')}</strong>{t('terms.s2_l5_desc')}</li>
              <li><strong>{t('terms.s2_l6_term')}</strong>{t('terms.s2_l6_desc')}</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">{t('terms.s3Title')}</h2>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li>{t('terms.s3_l1')}</li>
              <li>{t('terms.s3_l2')}</li>
              <li>{t('terms.s3_l3')}</li>
              <li>{t('terms.s3_l4')}</li>
              <li>{t('terms.s3_l5')}</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">{t('terms.s4Title')}</h2>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li>{t('terms.s4_l1')}</li>
              <li>{t('terms.s4_l2')}</li>
              <li>{t('terms.s4_l3')}</li>
              <li>{t('terms.s4_l4')}</li>
              <li>{t('terms.s4_l5')}</li>
              <li>{t('terms.s4_l6')}</li>
              <li>{t('terms.s4_l7')}</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">{t('terms.s5Title')}</h2>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li>{t('terms.s5_l1')}</li>
              <li>{t('terms.s5_l2')}</li>
              <li>{t('terms.s5_l3')}</li>
              <li>{t('terms.s5_l4')}</li>
              <li>{t('terms.s5_l5')}</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">{t('terms.s6Title')}</h2>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li>{t('terms.s6_l1')}</li>
              <li>{t('terms.s6_l2')}</li>
              <li>{t('terms.s6_l3')}</li>
              <li>{t('terms.s6_l4')}</li>
              <li>{t('terms.s6_l5')}</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">{t('terms.s7Title')}</h2>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li>{t('terms.s7_l1')}</li>
              <li>{t('terms.s7_l2')}</li>
              <li>{t('terms.s7_l3')}</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">{t('terms.s8Title')}</h2>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li>{t('terms.s8_l1')}</li>
              <li>{t('terms.s8_l2')}</li>
              <li>{t('terms.s8_l3')}</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">{t('terms.s9Title')}</h2>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li>{t('terms.s9_l1')}</li>
              <li>{t('terms.s9_l2')}</li>
              <li>
                {t('terms.s9_l3_text')}{" "}
                <Link to="/privacy-policy" className="text-primary hover:underline">{t('terms.s9_privacyLink')}</Link>.
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">{t('terms.s10Title')}</h2>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li>{t('terms.s10_l1')}</li>
              <li>{t('terms.s10_l2')}</li>
              <li>{t('terms.s10_l3')}</li>
              <li>{t('terms.s10_l4', { date: new Date().toLocaleDateString() })}</li>
            </ol>
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

export default Terms;

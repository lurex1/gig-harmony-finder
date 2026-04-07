import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";

const PrivacyPolicy = () => {
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

        <h1 className="text-4xl font-bold mb-8 text-foreground">{t('privacy.title')}</h1>

        <div className="bg-card rounded-lg border border-border p-6 md:p-10 space-y-8">
          <p className="text-muted-foreground">{t('privacy.intro')}</p>
          <p className="text-sm text-muted-foreground">{t('legal.lastUpdated', { date: new Date().toLocaleDateString() })}</p>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-foreground">{t('privacy.s1Title')}</h2>
            <div className="space-y-3 text-muted-foreground">
              <p><strong className="text-foreground">{t('privacy.s1_serviceTerm')}</strong>{t('privacy.s1_serviceDesc')}</p>
              <p><strong className="text-foreground">{t('privacy.s1_adminTerm')}</strong>{t('privacy.s1_adminDesc')}</p>
              <p><strong className="text-foreground">{t('privacy.s1_userTerm')}</strong>{t('privacy.s1_userDesc')}</p>
              <p><strong className="text-foreground">{t('privacy.s1_deviceTerm')}</strong>{t('privacy.s1_deviceDesc')}</p>
              <p><strong className="text-foreground">{t('privacy.s1_cookiesTerm')}</strong>{t('privacy.s1_cookiesDesc')}</p>
              <p><strong className="text-foreground">{t('privacy.s1_gdprTerm')}</strong>{t('privacy.s1_gdprDesc')}</p>
              <p><strong className="text-foreground">{t('privacy.s1_personalDataTerm')}</strong>{t('privacy.s1_personalDataDesc')}</p>
              <p><strong className="text-foreground">{t('privacy.s1_locationDataTerm')}</strong>{t('privacy.s1_locationDataDesc')}</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-foreground">{t('privacy.s2Title')}</h2>
            <p className="text-muted-foreground">
              {t('privacy.s2Text')}{" "}
              <a href="mailto:eberlepawel@gmail.com" className="text-primary hover:underline">eberlepawel@gmail.com</a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-foreground">{t('privacy.s3Title')}</h2>
            <div className="space-y-3 text-muted-foreground">
              <p><strong className="text-foreground">{t('privacy.s3_internalTerm')}</strong>{t('privacy.s3_internalDesc')}</p>
              <p><strong className="text-foreground">{t('privacy.s3_externalTerm')}</strong>{t('privacy.s3_externalDesc')}</p>
              <p><strong className="text-foreground">{t('privacy.s3_sessionTerm')}</strong>{t('privacy.s3_sessionDesc')}</p>
              <p><strong className="text-foreground">{t('privacy.s3_persistentTerm')}</strong>{t('privacy.s3_persistentDesc')}</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-foreground">{t('privacy.s4Title')}</h2>
            <p className="text-muted-foreground mb-3">{t('privacy.s4_p1')}</p>
            <p className="text-muted-foreground">{t('privacy.s4_p2')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-foreground">{t('privacy.s5Title')}</h2>
            <p className="text-muted-foreground mb-3">{t('privacy.s5_intro')}</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>{t('privacy.s5_l1')}</li>
              <li>{t('privacy.s5_l2')}</li>
              <li>{t('privacy.s5_l3')}</li>
              <li>{t('privacy.s5_l4')}</li>
              <li>{t('privacy.s5_l5')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-foreground">{t('privacy.s6Title')}</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>{t('privacy.s6_p1')}</p>
              <p>{t('privacy.s6_p2')}</p>
              <p>{t('privacy.s6_p3')}</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-foreground">{t('privacy.s7Title')}</h2>
            <p className="text-muted-foreground mb-3">
              <strong className="text-foreground">{t('privacy.s7_autoTerm')}</strong>{t('privacy.s7_autoDesc')}
            </p>
            <p className="text-muted-foreground">
              <strong className="text-foreground">{t('privacy.s7_voluntaryTerm')}</strong>{t('privacy.s7_voluntaryDesc')}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-foreground">{t('privacy.s8Title')}</h2>
            <p className="text-muted-foreground mb-3">{t('privacy.s8_intro')}</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>{t('privacy.s8_l1')}</li>
              <li>{t('privacy.s8_l2')}</li>
              <li>{t('privacy.s8_l3')}</li>
              <li>{t('privacy.s8_l4')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-foreground">{t('privacy.s9Title')}</h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>{t('privacy.s9_l1')}</li>
              <li>{t('privacy.s9_l2')}</li>
              <li>{t('privacy.s9_l3')}</li>
              <li>{t('privacy.s9_l4')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-foreground">{t('privacy.s10Title')}</h2>
            <p className="text-muted-foreground mb-3">{t('privacy.s10_intro')}</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>{t('privacy.s10_l1')}</li>
              <li>{t('privacy.s10_l2')}</li>
              <li>{t('privacy.s10_l3')}</li>
              <li>{t('privacy.s10_l4')}</li>
            </ul>
            <p className="text-muted-foreground mt-3">
              {t('privacy.s10_contactText')}{" "}
              <a href="mailto:eberlepawel@gmail.com" className="text-primary hover:underline">eberlepawel@gmail.com</a>
              {" "}{t('privacy.s10_contactSuffix')}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-foreground">{t('privacy.s11Title')}</h2>
            <p className="text-muted-foreground">{t('privacy.s11Text')}</p>
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

export default PrivacyPolicy;

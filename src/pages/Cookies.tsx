import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const Cookies = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <Link to="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Powrót do strony głównej
          </Button>
        </Link>

        <h1 className="text-4xl font-bold mb-8 text-foreground">Polityka Cookies</h1>

        <div className="bg-card rounded-lg border border-border p-6 md:p-10 space-y-8">
          <p className="text-sm text-muted-foreground">Data ostatniej aktualizacji: {new Date().toLocaleDateString('pl-PL')}</p>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-foreground">§1 Czym są pliki Cookies?</h2>
            <p className="text-muted-foreground">
              Cookies to małe pliki tekstowe zapisywane na Urządzeniu Użytkownika podczas korzystania z serwisu GigMatch. Służą do prawidłowego działania Serwisu, zapamiętywania preferencji oraz celów analitycznych.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-foreground">§2 Rodzaje plików Cookies</h2>
            <div className="space-y-3 text-muted-foreground">
              <p><strong className="text-foreground">Cookies niezbędne</strong> – wymagane do prawidłowego działania Serwisu: logowanie, utrzymanie sesji, zabezpieczenia. Nie wymagają zgody.</p>
              <p><strong className="text-foreground">Cookies funkcjonalne</strong> – zapamiętywanie preferencji Użytkownika (np. ustawienia konta, wybrany język).</p>
              <p><strong className="text-foreground">Cookies analityczne</strong> – pomiar i analiza ruchu w Serwisie w celu optymalizacji działania platformy.</p>
              <p><strong className="text-foreground">Cookies marketingowe</strong> – dopasowanie treści reklam (jeśli dotyczy).</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-foreground">§3 Cookies używane w GigMatch</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-muted-foreground border border-border rounded-lg">
                <thead>
                  <tr className="bg-muted">
                    <th className="p-3 text-left text-foreground font-semibold">Nazwa</th>
                    <th className="p-3 text-left text-foreground font-semibold">Typ</th>
                    <th className="p-3 text-left text-foreground font-semibold">Cel</th>
                    <th className="p-3 text-left text-foreground font-semibold">Czas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="p-3">sb-*-auth-token</td>
                    <td className="p-3">Niezbędny</td>
                    <td className="p-3">Uwierzytelnianie użytkownika</td>
                    <td className="p-3">Sesja</td>
                  </tr>
                  <tr>
                    <td className="p-3">sb-*-auth-token-code-verifier</td>
                    <td className="p-3">Niezbędny</td>
                    <td className="p-3">Weryfikacja bezpieczeństwa logowania</td>
                    <td className="p-3">Sesja</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-foreground">§4 Cookies podmiotów trzecich</h2>
            <p className="text-muted-foreground mb-3">W Serwisie mogą działać skrypty partnerów, które umieszczają własne cookies:</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li><strong className="text-foreground">Stripe</strong> – obsługa płatności – <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">polityka prywatności</a></li>
              <li><strong className="text-foreground">Google</strong> (Maps, Analytics) – <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">polityka prywatności</a></li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-foreground">§5 Zarządzanie Cookies</h2>
            <p className="text-muted-foreground mb-3">
              Użytkownik może zarządzać plikami cookies poprzez ustawienia przeglądarki. Poniżej linki do instrukcji najpopularniejszych przeglądarek:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Chrome</a></li>
              <li><a href="https://support.mozilla.org/pl/kb/ciasteczka" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Mozilla Firefox</a></li>
              <li><a href="https://support.apple.com/pl-pl/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Safari</a></li>
              <li><a href="https://support.microsoft.com/pl-pl/microsoft-edge" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Microsoft Edge</a></li>
            </ul>
            <p className="text-muted-foreground mt-3">
              Wyłączenie cookies może spowodować ograniczenie funkcjonalności Serwisu (np. brak możliwości zalogowania się).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-foreground">§6 Zmiany Polityki Cookies</h2>
            <p className="text-muted-foreground">
              Administrator zastrzega sobie prawo do zmiany niniejszej Polityki Cookies. Aktualna wersja jest zawsze dostępna pod adresem <Link to="/cookies" className="text-primary hover:underline">/cookies</Link>.
            </p>
          </section>

          <div className="mt-8 p-6 bg-muted rounded-lg">
            <h3 className="text-lg font-semibold text-foreground mb-2">Kontakt</h3>
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

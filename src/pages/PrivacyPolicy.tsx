import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <Link to="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Powrót do strony głównej
          </Button>
        </Link>

        <h1 className="text-4xl font-bold mb-8 text-foreground">Polityka prywatności</h1>

        <div className="bg-card rounded-lg border border-border p-6 md:p-10 space-y-8">
          <p className="text-muted-foreground">
            Poniższa Polityka Prywatności określa zasady zapisywania i uzyskiwania dostępu do danych na Urządzeniach Użytkowników korzystających z serwisu GigMatch (platforma łącząca muzyków z lokalami) do celów świadczenia usług drogą elektroniczną przez Administratora oraz zasady gromadzenia i przetwarzania danych osobowych Użytkowników, które zostały podane przez nich osobiście i dobrowolnie za pośrednictwem narzędzi dostępnych w Serwisie.
          </p>
          <p className="text-sm text-muted-foreground">Data ostatniej aktualizacji: {new Date().toLocaleDateString('pl-PL')}</p>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-foreground">§1 Definicje</h2>
            <div className="space-y-3 text-muted-foreground">
              <p><strong className="text-foreground">Serwis</strong> – serwis internetowy GigMatch prowadzony przez Administratora, służący jako platforma łącząca muzyków z lokalami (kluby, bary, restauracje, hotele), w ramach której lokale mogą publikować oferty występów (gigy), a muzycy mogą na nie odpowiadać.</p>
              <p><strong className="text-foreground">Administrator Serwisu / Danych (Administrator)</strong> – Paweł Eberle, prowadzący nierejestrowaną działalność gospodarczą pod nazwą Paveelo, adres: ul. Zamojskiego 18H/2, 37-450 Stalowa Wola, e-mail: eberlepawel@gmail.com.</p>
              <p><strong className="text-foreground">Użytkownik</strong> – osoba fizyczna korzystająca z Serwisu, w szczególności: muzyk (artysta szukający występów) oraz lokal (podmiot oferujący występy).</p>
              <p><strong className="text-foreground">Urządzenie</strong> – elektroniczne urządzenie wraz z oprogramowaniem, za pośrednictwem którego Użytkownik uzyskuje dostęp do Serwisu.</p>
              <p><strong className="text-foreground">Cookies (ciasteczka)</strong> – dane tekstowe gromadzone w formie plików zamieszczanych na Urządzeniu Użytkownika.</p>
              <p><strong className="text-foreground">RODO</strong> – Rozporządzenie (UE) 2016/679.</p>
              <p><strong className="text-foreground">Dane osobowe</strong> – informacje o zidentyfikowanej lub możliwej do zidentyfikowania osobie fizycznej.</p>
              <p><strong className="text-foreground">Dane lokalizacyjne</strong> – informacje o położeniu geograficznym Użytkownika, udostępniane dobrowolnie za pośrednictwem przeglądarki po udzieleniu wyraźnej zgody (dotyczy funkcji „Jestem dostępny" dla muzyków).</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-foreground">§2 Inspektor Ochrony Danych</h2>
            <p className="text-muted-foreground">
              Na podstawie art. 37 RODO Administrator nie powołał Inspektora Ochrony Danych. Kontakt w sprawach ochrony danych: <a href="mailto:eberlepawel@gmail.com" className="text-primary hover:underline">eberlepawel@gmail.com</a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-foreground">§3 Rodzaje plików Cookies</h2>
            <div className="space-y-3 text-muted-foreground">
              <p><strong className="text-foreground">Cookies wewnętrzne</strong> – zapisywane i odczytywane przez system Serwisu (np. mechanizmy logowania, utrzymanie sesji, ustawienia konta).</p>
              <p><strong className="text-foreground">Cookies zewnętrzne</strong> – zapisywane i odczytywane przez systemy Serwisów zewnętrznych (np. Google, systemy płatności).</p>
              <p><strong className="text-foreground">Cookies sesyjne</strong> – usuwane po zakończeniu sesji przeglądarki.</p>
              <p><strong className="text-foreground">Cookies trwałe</strong> – przechowywane do czasu ich ręcznego usunięcia lub wygaśnięcia.</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-foreground">§4 Bezpieczeństwo składowania danych</h2>
            <p className="text-muted-foreground mb-3">
              Mechanizmy zapisu/odczytu cookies działają poprzez przeglądarkę internetową i nie umożliwiają pobierania innych danych z Urządzenia Użytkownika. Administrator stosuje środki techniczne i organizacyjne adekwatne do ryzyka (art. 32 RODO), w tym m.in. szyfrowanie połączeń (SSL/TLS), kontrolę dostępu oraz kopie zapasowe.
            </p>
            <p className="text-muted-foreground">
              Użytkownik może w każdej chwili zmienić ustawienia cookies w przeglądarce lub usunąć zapisane cookies. Ograniczenie stosowania cookies może wpłynąć na działanie niektórych funkcji Serwisu.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-foreground">§5 Cele przetwarzania danych osobowych</h2>
            <p className="text-muted-foreground mb-3">Dane podawane dobrowolnie przez Użytkownika są przetwarzane w szczególności w następujących celach:</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>założenie i obsługa konta Użytkownika (muzyk, lokal), obsługa platformy (publikacja ofert występów, dopasowywanie muzyków, komunikacja) – art. 6 ust. 1 lit. b RODO;</li>
              <li>obsługa subskrypcji i płatności (plan Muzyk: $1.99/mies., plan Lokal: $3.99/mies., 7 dni trial) – art. 6 ust. 1 lit. b RODO;</li>
              <li>przetwarzanie danych lokalizacyjnych w celu dopasowywania muzyków do lokali w okolicy – art. 6 ust. 1 lit. a RODO (wyłącznie na podstawie wyraźnej zgody);</li>
              <li>kontakt i obsługa zapytań – art. 6 ust. 1 lit. b lub f RODO;</li>
              <li>realizacja obowiązków prawnych – art. 6 ust. 1 lit. c RODO.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-foreground">§6 Dane lokalizacyjne</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>Serwis GigMatch wykorzystuje dane lokalizacyjne wyłącznie w celu dopasowywania muzyków do lokali w ich okolicy. Lokalizacja jest udostępniana wyłącznie gdy muzyk aktywuje funkcję „Jestem dostępny" i nigdy nie jest udostępniana gdy ta funkcja jest wyłączona.</p>
              <p>Zgoda na udostępnianie lokalizacji jest dobrowolna i może być cofnięta w każdej chwili poprzez wyłączenie funkcji „Jestem dostępny" lub zmianę ustawień przeglądarki.</p>
              <p>Dane lokalizacyjne nie są przechowywane dłużej niż jest to niezbędne do realizacji celu (dopasowanie do lokali).</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-foreground">§7 Rodzaje gromadzonych danych</h2>
            <p className="text-muted-foreground mb-3">
              <strong className="text-foreground">Dane gromadzone automatycznie:</strong> adres IP, typ przeglądarki, system operacyjny, czas wizyty, identyfikatory cookies/urządzenia.
            </p>
            <p className="text-muted-foreground">
              <strong className="text-foreground">Dane podawane dobrowolnie:</strong> imię/nazwa, e-mail, hasło (hashowane), rola (muzyk/lokal), bio, zdjęcie profilowe, gatunek muzyczny, instrumenty, próbki audio/video (linki), kalendarz dostępności, dane lokalizacyjne (opcjonalnie), dane rozliczeniowe.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-foreground">§8 Dostęp do danych przez podmioty trzecie</h2>
            <p className="text-muted-foreground mb-3">Dane mogą być udostępniane podmiotom świadczącym usługi niezbędne do funkcjonowania Serwisu:</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>dostawcy hostingu i infrastruktury (np. Supabase, Vercel);</li>
              <li>dostawcy systemów płatności (np. Stripe);</li>
              <li>dostawcy narzędzi analitycznych;</li>
              <li>dostawcy usług mapowych (np. Google Maps).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-foreground">§9 Okres przetwarzania danych</h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>dane przetwarzane na podstawie zgody – do czasu jej cofnięcia;</li>
              <li>dane przetwarzane na podstawie uzasadnionego interesu – do czasu wniesienia skutecznego sprzeciwu;</li>
              <li>dane księgowe/podatkowe – przez okres wymagany przepisami prawa;</li>
              <li>dane lokalizacyjne – wyłącznie w czasie aktywnej sesji „Jestem dostępny".</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-foreground">§10 Prawa Użytkowników</h2>
            <p className="text-muted-foreground mb-3">Użytkownikowi przysługują prawa wynikające z RODO:</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>prawo dostępu do danych, ich sprostowania, usunięcia, ograniczenia przetwarzania, przenoszenia danych;</li>
              <li>prawo sprzeciwu wobec przetwarzania danych;</li>
              <li>prawo cofnięcia zgody w dowolnym momencie;</li>
              <li>prawo wniesienia skargi do Prezesa Urzędu Ochrony Danych Osobowych.</li>
            </ul>
            <p className="text-muted-foreground mt-3">
              Wnioski można składać na adres e-mail: <a href="mailto:eberlepawel@gmail.com" className="text-primary hover:underline">eberlepawel@gmail.com</a> lub listownie na adres: ul. Zamojskiego 18H/2, 37-450 Stalowa Wola.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-foreground">§11 Zmiany w Polityce Prywatności</h2>
            <p className="text-muted-foreground">
              Administrator może zmieniać niniejszą Politykę Prywatności. O istotnych zmianach Administrator poinformuje poprzez publikację zaktualizowanej wersji w Serwisie. Dalsze korzystanie z Serwisu po opublikowaniu zmian oznacza akceptację nowej treści Polityki Prywatności.
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

export default PrivacyPolicy;

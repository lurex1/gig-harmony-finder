import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <Link to="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Powrót do strony głównej
          </Button>
        </Link>

        <h1 className="text-4xl font-bold mb-8 text-foreground">Regulamin</h1>

        <div className="bg-card rounded-lg border border-border p-6 md:p-10 space-y-8">
          <p className="text-sm text-muted-foreground">Data ostatniej aktualizacji: {new Date().toLocaleDateString('pl-PL')}</p>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">§1 Postanowienia ogólne</h2>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li>Serwis internetowy GigMatch (dalej: „Serwis") to platforma łącząca muzyków z lokalami (kluby, bary, restauracje, hotele).</li>
              <li>Serwis prowadzony jest przez Pawła Eberle, prowadzącego nierejestrowaną działalność gospodarczą pod nazwą Paveelo, adres: ul. Zamojskiego 18H/2, 37-450 Stalowa Wola.</li>
              <li>Kontakt z Serwisem możliwy jest pod adresem e-mail: eberlepawel@gmail.com</li>
              <li>Niniejszy Regulamin określa zasady korzystania z Serwisu, rejestracji, subskrypcji, publikowania ofert, komunikacji między użytkownikami oraz ochrony danych.</li>
              <li>Użytkownik zobowiązany jest do zapoznania się z Regulaminem przed rejestracją.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">§2 Definicje</h2>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li><strong>Serwis</strong> – platforma GigMatch dostępna pod adresem strony internetowej.</li>
              <li><strong>Muzyk</strong> – Użytkownik zarejestrowany z rolą „muzyk", szukający występów w lokalach.</li>
              <li><strong>Lokal</strong> – Użytkownik zarejestrowany z rolą „lokal" (klub, bar, restauracja, hotel), publikujący oferty występów.</li>
              <li><strong>Gig</strong> – oferta występu muzycznego opublikowana przez Lokal.</li>
              <li><strong>Subskrypcja</strong> – abonament umożliwiający korzystanie z pełnej funkcjonalności Serwisu.</li>
              <li><strong>Trial</strong> – 7-dniowy bezpłatny okres próbny po rejestracji.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">§3 Rejestracja i konto</h2>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li>Rejestracja wymaga podania adresu e-mail, hasła oraz wybrania roli (muzyk lub lokal).</li>
              <li>Podczas rejestracji Użytkownik musi wyrazić zgodę na przetwarzanie danych osobowych oraz zaakceptować niniejszy Regulamin.</li>
              <li>Muzycy korzystający z funkcji lokalizacji muszą wyrazić dodatkową zgodę na udostępnianie danych lokalizacyjnych (GDPR).</li>
              <li>Każdy Użytkownik może posiadać tylko jedno konto.</li>
              <li>Użytkownik odpowiada za bezpieczeństwo swojego konta i hasła.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">§4 Subskrypcje i płatności</h2>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li>Po rejestracji Użytkownik otrzymuje 7-dniowy bezpłatny okres próbny (trial).</li>
              <li>Po upływie okresu trial dostęp do funkcji Serwisu wymaga aktywnej subskrypcji.</li>
              <li>Plan „Muzyk" – $1.99/miesiąc – dostęp do wyszukiwania gigów, odpowiadania na oferty, komunikacji z lokalami.</li>
              <li>Plan „Lokal" – $3.99/miesiąc – dostęp do publikowania gigów, wyszukiwania muzyków, komunikacji z muzykami.</li>
              <li>Płatności obsługiwane są przez Stripe. Dane karty płatniczej przetwarzane są bezpośrednio przez Stripe i nie są przechowywane w Serwisie.</li>
              <li>Subskrypcja odnawia się automatycznie co miesiąc do momentu anulowania.</li>
              <li>Anulowanie subskrypcji można wykonać w panelu użytkownika. Subskrypcja pozostaje aktywna do końca opłaconego okresu.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">§5 Zasady korzystania z Serwisu</h2>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li>Użytkownik zobowiązuje się do korzystania z Serwisu zgodnie z jego przeznaczeniem i obowiązującymi przepisami prawa.</li>
              <li>Zabrania się publikowania treści obraźliwych, nielegalnych, wprowadzających w błąd lub naruszających prawa osób trzecich.</li>
              <li>Muzycy zobowiązują się do podawania prawdziwych informacji w swoich profilach (gatunek, instrumenty, doświadczenie).</li>
              <li>Lokale zobowiązują się do podawania rzetelnych informacji w ofertach gigów (data, budżet, wymagania).</li>
              <li>Administrator zastrzega sobie prawo do usunięcia konta naruszającego Regulamin.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">§6 Lokalizacja</h2>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li>Funkcja lokalizacji jest dostępna wyłącznie dla muzyków po udzieleniu wyraźnej zgody.</li>
              <li>Lokalizacja jest udostępniana wyłącznie gdy muzyk aktywuje przełącznik „Jestem dostępny".</li>
              <li>Gdy przełącznik jest wyłączony, lokalizacja nie jest w żaden sposób udostępniana ani przetwarzana.</li>
              <li>Dane lokalizacyjne służą wyłącznie do dopasowywania muzyków do pobliskich lokali.</li>
              <li>Użytkownik może cofnąć zgodę na lokalizację w dowolnym momencie.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">§7 Komunikacja</h2>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li>Serwis umożliwia wymianę wiadomości między muzykami a lokalami.</li>
              <li>Wiadomości są przetwarzane i przechowywane w celu umożliwienia komunikacji.</li>
              <li>Administrator nie monitoruje treści wiadomości, ale zastrzega sobie prawo do ich usunięcia w przypadku zgłoszenia naruszenia.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">§8 Odpowiedzialność</h2>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li>GigMatch jest platformą pośredniczącą i nie jest stroną umów zawieranych między muzykami a lokalami.</li>
              <li>Administrator nie ponosi odpowiedzialności za jakość występów, terminowość ani rozliczenia między użytkownikami.</li>
              <li>Administrator dokłada starań, aby Serwis działał nieprzerwanie, ale nie gwarantuje dostępności 24/7.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">§9 Ochrona danych osobowych</h2>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li>Administratorem danych osobowych jest Paweł Eberle – Paveelo.</li>
              <li>Dane osobowe przetwarzane są zgodnie z RODO i polskimi przepisami o ochronie danych.</li>
              <li>Szczegółowe informacje dotyczące przetwarzania danych znajdują się w <Link to="/privacy-policy" className="text-primary hover:underline">Polityce Prywatności</Link>.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">§10 Postanowienia końcowe</h2>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li>Administrator zastrzega sobie prawo do zmiany Regulaminu. Zmiany wchodzą w życie po opublikowaniu w Serwisie.</li>
              <li>W sprawach nieuregulowanych niniejszym Regulaminem zastosowanie mają przepisy prawa polskiego.</li>
              <li>Wszelkie spory będą rozstrzygane przez właściwe sądy polskie.</li>
              <li>Regulamin obowiązuje od dnia {new Date().toLocaleDateString('pl-PL')}.</li>
            </ol>
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

export default Terms;

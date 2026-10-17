# Piwowar (Brewcraft) — Jedna Lista Decyzji i Pytań Otwartych (DEC-01…DEC-20)

Każdy dylemat architektoniczny, biznesowy i rzemieślniczy został formalnie zarejestrowany wraz z opcjami A/B, kompromisami, rekomendacją analityka oraz ostateczną dyspozycją Właściciela.

---

### `DEC-01: Nazwa marki w portfolio i repozytorium GitHub`
- **Problem:** Jaka tożsamość najlepiej współgra z istniejącym portfolio studia (Napar, Piekarz, Słoik, Charcutier, Ferment)?
- **Opcje:**
  - **Opcja A (Rekomendowana):** "Piwowar (Brewcraft)" — bezpośrednia kontynuacja rzemieślniczej linii ról (Piekarz, Charcutier, Serowar/Ferment). Repozytorium: `lkarwowski494/piwowar`.
  - **Opcja B:** "Brzeczka (Wortwise)" — nazwa surowcowa w stylu Napar / Słoik.
- **Kompromis:** Opcja A natychmiast pozycjonuje użytkownika jako mistrza rzemiosła i jest intuicyjna globalnie.
- **Rekomendacja analityka:** Opcja A.
- **Dyspozycja Właściciela:** **ZATWIERDZONO: OPCJA A** (Repozytorium utworzone na GitHubie jako `lkarwowski494/piwowar`).

---

### `DEC-02: Format wymiany receptur (BeerXML 1.0 vs Czysty JSON)`
- **Problem:** Czy w MVP wspieramy standard branżowy BeerXML 1.0?
- **Opcje:**
  - **Opcja A:** Czysty eksport/import JSON w MVP, a parser BeerXML dodany jako funkcja w v1.1.
  - **Opcja B (Wybrana):** Pełny import/export BeerXML 1.0 już w MVP, umożliwiający wczytanie receptur z Brewfather i BeerSmith od Dnia 1.
- **Kompromis:** Opcja B wymaga dodatkowego nakładu na parser, ale tworzy natychmiastowy magnes migracyjny i eliminuje vendor lock-in konkurencji.
- **Rekomendacja analityka:** Opcja A (ostrożna) / B (agresywny wzrost).
- **Dyspozycja Właściciela:** **ZATWIERDZONO: OPCJA B** (Pełne wsparcie BeerXML 1.0 od Dnia 1 w MVP).

---

### `DEC-03: Model zapisu danych w trakcie dnia warzenia`
- **Problem:** Czy wprowadzanie zmian parametrów warki powinno wymagać kliknięcia „Zapisz”, czy zapisywać się natychmiast?
- **Opcje:**
  - **Opcja A (Rekomendowana):** Zapis natychmiastowy przy każdej zmianie wartości w transakcji SQLite z dolnym paskiem Snackbar z przyciskiem „Cofnij”.
  - **Opcja B:** Praca na lokalnym szkicu (draft state) w formularzu modalnym z wymogiem kliknięcia „Zapisz”.
- **Kompromis:** Opcja A eliminuje ryzyko utraty wpisu przy wygaszeniu telefonu w oparach brzeczki i z mokrymi dłońmi.
- **Rekomendacja analityka:** Opcja A.
- **Dyspozycja Właściciela:** **ZATWIERDZONO: OPCJA A**.

---

### `DEC-04: Obsługa cyfrowych gęstościomierzy bezprzewodowych (Tilt Hydrometer BLE)`
- **Problem:** Czy aplikacja powinna łączyć się przez Bluetooth Low Energy (BLE) ze spławikami cyfrowymi Tilt?
- **Opcje:**
  - **Opcja A:** MVP skupione na ręcznych odczytach; BLE odłożone do wersji 2.0.
  - **Opcja B (Wybrana):** Wdrożenie obsługi Tilt BLE bezpośrednio w v1.0.
- **Kompromis:** Opcja B tworzy unikalną przewagę rynkową (bezpośredni odczyt bez serwerów i Raspberry Pi).
- **Rekomendacja analityka:** Opcja B dla silnego pozycjonowania technologicznego.
- **Dyspozycja Właściciela:** **ZATWIERDZONO: OPCJA B** (Tilt BLE w v1.0).

---

### `DEC-05: Wbudowana baza stylów BJCP 2021 offline`
- **Problem:** Czy dołączamy pełny korpus 100+ stylów piwnych BJCP 2021 w lokalnej bazie SQLite?
- **Opcje:**
  - **Opcja A (Rekomendowana):** Tak, pełny zestaw stylów BJCP 2021 offline jako tabele referencyjne SQLite w pakiecie startowym aplikacji.
  - **Opcja B:** Tylko 15 najpopularniejszych stylów z opcją ręcznego dodania.
- **Kompromis:** Opcja A zajmuje ~150 KB, a daje olbrzymią wartość merytoryczną od pierwszego uruchomienia.
- **Rekomendacja analityka:** Opcja A.
- **Dyspozycja Właściciela:** **ZATWIERDZONO: OPCJA A**.

---

### `DEC-06: Strategia Monetyzacji i Podział Funkcji Darmowe vs Pro`
- **Problem:** Co wchodzi w darmowy rdzeń, a co w Apps4Brew Pass Pro?
- **Opcje:**
  - **Opcja A:** Wersja darmowa: nielimitowane warki, kalkulatory i import BeerXML; Pro: Tilt BLE, woda zaawansowana, Apple Watch.
  - **Opcja B:** Ograniczenie darmowych warek do 5.
- **Dyspozycja Właściciela:** **6A [ZATWIERDZONE WARUNKOWO]** — *„Do ostatecznego rozstrzygnięcia podczas dedykowanego audytu strategii monetyzacji (`audyt-monetyzacji`), bo może się okazać, że to nie jest najlepszy model biznesowy”*. Do czasu audytu przyjmujemy architekturę elastyczną (Feature Flags).

---

### `DEC-07: Formuła obliczania goryczki IBU`
- **Opcje:** Opcja A (Glenn Tinseth domyślnie, z możliwością przełączenia na Ragera w ustawieniach).
- **Dyspozycja Właściciela:** **ZATWIERDZONO: OPCJA A**.

---

### `DEC-08: Równanie korekcji refraktometru w obecności alkoholu`
- **Opcje:** Opcja A (Algorytm Seana Terrilla, wielomian 2. stopnia, $\text{WCF}=1.04$).
- **Dyspozycja Właściciela:** **ZATWIERDZONO: OPCJA A**.

---

### `DEC-09: Zakres rozszerzenia dla Apple Watch`
- **Opcje:** Opcja A (Stoper wieloetapowy zacierania/chmielenia z haptyką + karta podglądu Tilt BLE).
- **Dyspozycja Właściciela:** **ZATWIERDZONO: OPCJA A**.

---

### `DEC-10: Biblioteka parsowania plików BeerXML 1.0`
- **Opcje:** Opcja A (`fast-xml-parser` mapujący do SQLite).
- **Dyspozycja Właściciela:** **ZATWIERDZONO: OPCJA A**.

---

### `DEC-11: Profile sprzętowe piwowara (Equipment Profiles)`
- **Problem:** Jak zbalansować prostotę startu z potrzebami zaawansowanych piwowarów?
- **Opcje:** Opcja Hybrydowa zdefiniowana przez Właściciela:
  - Domyślnie Opcja A (uproszczony setup z 3 szablonami: Garnek BIAB, Kocioł automatyczny, 3-naczyniowy) z widocznym odnośnikiem informującym, że można przejść do precyzyjnej edycji w ustawieniach.
  - W ustawieniach pełny tryb precyzyjny (Opcja B) z możliwością dodawania wielu własnych zestawów sprzętu i trwałego zapisywania ich w SQLite.
- **Dyspozycja Właściciela:** **ZATWIERDZONO: HYBRYDA A (domyślna) + B (w ustawieniach) + nielimitowane profile własne w SQLite**.

---

### `DEC-12: Kalkulator infuzji temperaturowych wody (Strike Water)`
- **Opcje:** Opcja A (Zintegrowana karta na starcie stopera zacierania: Just-in-Time Calculation).
- **Dyspozycja Właściciela:** **ZATWIERDZONO: OPCJA A**.

---

### `DEC-13: Przypomnienia kalendarzowe dla etapów fermentacji`
- **Opcje:** Opcja A (Lokalne powiadomienia iOS/Android w 100% offline + 1-tap eksport do Apple Calendar / Google Calendar).
- **Dyspozycja Właściciela:** **ZATWIERDZONO: OPCJA A**.

---

### `DEC-14: Poziom szczegółowości profili wody zaciernej w MVP`
- **Opcje:** Opcja A (6 głównych jonów: $\text{Ca}^{2+}, \text{Mg}^{2+}, \text{Na}^+, \text{SO}_4^{2-}, \text{Cl}^-, \text{HCO}_3^-$, stosunek $\text{SO}_4/\text{Cl}$ oraz wyliczanie dawki kwasu mlekowego do docelowego pH zacieru w MVP).
- **Dyspozycja Właściciela:** **ZATWIERDZONO: OPCJA A**.

---

### `DEC-15: Standard przechowywania receptur i warek w bazie`
- **Opcje:** Opcja A (Warka tworzy niezależny, zamrożony zrzut — Snapshot — receptury w momencie rozpoczęcia warzenia; żelazna integralność historyczna).
- **Dyspozycja Właściciela:** **ZATWIERDZONO: OPCJA A**.

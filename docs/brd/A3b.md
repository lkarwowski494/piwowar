# Piwowar (Brewcraft) — Tom A3b: Tabela Zakresu Funkcjonalnego (Część 2 — Tilt BLE, BeerXML, Dziennik, BJCP, Watch, Platforma)

---

## Tabela Zakresu Funkcjonalnego (Z-021…Z-057)

| ID | Obszar / Funkcja | Szczegółowy Zakres Merytoryczny | Etap | Nakład (Agent / Właściciel) | Uzasadnienie Biznesowe i Rzemieślnicze |
|---|---|---|---|---|---|
| **Z-021** | **Tilt: Skaner BLE (v1.0)** | Bezpośrednie nasłuchiwanie iBeacon z cyfrowego spławika Tilt przez Bluetooth LE. | **MVP** | 1.5d / 30m | **Główny filar technologiczny (DEC-04=4B).** |
| **Z-022** | **Tilt: Kalibracja 2-Punktowa** | Kalibracja odczytu Tilt na wodzie (1.000) i brzeczce wzorcowej bezpośrednio w SQLite. | **MVP** | 0.5d / 15m | Eliminacja błędu fabrycznego spławika. |
| **Z-023** | **Tilt: Wykres Atenuacji Offline** | Wykres spadku gęstości w czasie i temperatury fermentacji w piwnicy. | **MVP** | 0.8d / 15m | Wizualizacja fazy burzliwej i ustabilizowania ekstraktu. |
| **Z-024** | **Tilt: Detekcja Końca Fermentacji** | Algorytm badający brak zmiany gęstości przez 48h i powiadamiający o gotowości do rozlewu. | **1.1** | 0.5d / 10m | Sygnał dla piwowara, że piwo można bezpiecznie butelkować. |
| **Z-025** | **Tilt: Auto-współczynnik iSpindel** | Wsparcie dla spławików iSpindel przez lokalną sieć Wi-Fi / REST. | **1.2** | 1.0d / 20m | Rozszerzenie dla majsterkowiczów IoT. |
| **Z-026** | **BeerXML: Import Receptury** | Szybki import pojedynczych receptur i wielopaków `.xml` z Brewfather, BeerSmith. | **MVP** | 1.0d / 20m | **Magnes migracyjny od Dnia 1 (DEC-02=2B).** |
| **Z-027** | **BeerXML: Eksport Receptury** | Generowanie standardowego pliku BeerXML 1.0 do wysłania znajomemu lub na konkurs. | **MVP** | 0.6d / 10m | Suwerenność danych (ZP-02). |
| **Z-028** | **Receptury: Edytor Zasypu i Chmieli** | Składanie warki: słody, chmiele, dodatki (mech irlandzki, przyprawy), drożdże. | **MVP** | 1.2d / 20m | Podstawowy notatnik piwowara. |
| **Z-029** | **Receptury: Split-Batch (Dzielenie)** | Rozbicie 20L warki na 2 fermentory z różnymi drożdżami lub chmieleniem na zimno. | **1.1** | 0.8d / 15m | Eksperymenty porównawcze (P2). |
| **Z-030** | **Receptury: Skalowanie Objętości** | Automatyczne przeliczenie gramatur słodów i chmieli z warki 20L na garnek 10L lub kocioł 50L. | **MVP** | 0.4d / 5m | Elastyczność sprzętowa. |
| **Z-031** | **Dziennik: Cykl Życia Warki** | Stany: *Planowana → Dzień Warzenia → Burzliwa → Cicha / Dry-Hop → Cold Crash → Butelkowana → Leżakowanie → Archiwum*. | **MVP** | 0.8d / 15m | Przejrzysty rejestr domowej piwnicy. |
| **Z-032** | **Dziennik: Notatki Sensoryczne** | Arkusz oceny degustacyjnej: Aromat (12), Wygląd (3), Smak (20), Odczucie (5), Ogólne (10) — wzorzec BJCP 50 pkt. | **MVP** | 0.6d / 10m | Przygotowanie piwa pod konkursy piwowarskie. |
| **Z-033** | **Dziennik: Etykiety i Kody QR** | Generowanie karty warki w PDF/SVG z kodem QR do wydruku na skrzynkę butelek. | **1.1** | 0.8d / 15m | Organizacja spiżarni i piwnicy. |
| **Z-034** | **Wiedza: Atlas 100+ Stylów BJCP** | Kompletna specyfikacja BJCP 2021 offline: historia, parametry widełkowe, profil, przykłady komercyjne. | **MVP** | 0.8d / 15m | Encyklopedia w kieszeni (DEC-05=5A). |
| **Z-035** | **Wiedza: Wskaźnik Widełek Stylu** | Dynamiczny wykres kołowy/słupkowy pokazujący, czy warka mieści się w stylu BJCP (OG, FG, IBU, SRM, ABV). | **MVP** | 0.6d / 10m | Natychmiastowa walidacja założeń piwowara. |
| **Z-036** | **Wiedza: Doctor Wad Piwa (Off-Flavors)** | Diagnostyka 20 wad sensorycznych: diacetyl, aldehyd, DMS, kwas izowalerianowy, fenole, utlenienie. | **MVP** | 1.0d / 20m | Nieoceniony ratunek przy nieudanym piwie. |
| **Z-037** | **Wiedza: Przewodnik Sanityzacji** | Instrukcja sterylizacji i dezynfekcji no-rinse (Star San, Oxi) oraz ochrona strefy zimnej. | **MVP** | 0.4d / 10m | Ochrona biologiczna (P1). |
| **Z-038** | **Watch: Stoper Warzenia na Nadgarstku** | Dedykowany ekran watchOS: aktualny krok zacierania/gotowania, pozostały czas, powiadomienie haptyczne. | **MVP** | 1.5d / 25m | Praca z garem bez dotykania telefonu (DEC-09=9A). |
| **Z-039** | **Watch: Podgląd Gęstości z Tilt BLE** | Karta na Apple Watch pokazująca aktualne °Blg i temperaturę fermentora. | **MVP** | 0.6d / 15m | Rzut oka na nadgarstek w drodze przez piwnicę. |
| **Z-040** | **System: Live Activity & Dynamic Island** | Wyświetlanie aktywnego stopera gotowania i najbliższego chmielenia na zablokowanym ekranie iPhone'a. | **MVP** | 0.8d / 15m | Spojrzenie z drugiego końca kuchni bez odblokowywania. |
| **Z-041** | **System: 35 Języków (i18n)** | Pełne tłumaczenia interfejsu i terminologii piwowarskiej ze sprawdzarką symetrii kluczy `check-i18n.mjs`. | **MVP** | 1.0d / 20m | Globalny zasięg od Dnia 1 (ZP-07). |
| **Z-042** | **System: Jednostki Metric & US Customary** | Przełącznik w locie: litry vs galony, °C vs °F, gramy vs uncje, kilogramy vs funty, °Plato/°Blg vs SG. | **MVP** | 0.5d / 10m | Bezproblemowa obsługa amerykańskich receptur. |
| **Z-043** | **System: Eksport/Import JSON** | Pełna kopia zapasowa wszystkich warek, receptur i ustawień do pojedynczego pliku `.json`. | **MVP** | 0.4d / 5m | Suwerenność danych (ZP-02). |
| **Z-044** | **System: Dostępność WCAG AAA & VoiceOver** | Pełne udźwiękowienie timerów i tabel, wysoki kontrast, dynamiczne skalowanie tekstu. | **MVP** | 0.8d / 15m | Pełna dostępność dla piwowarów niewidomych (P5). |
| **Z-045** | **Magazyn: Spiżarnia Chmieli i Słodów** | Śledzenie otwartych paczek chmielu (rok zbioru, zawartość $\alpha$-kwasów) i ubytek słodów po warkach. | **1.1** | 1.0d / 15m | Kontrola stanów w domowej spiżarni. |
| **Z-046** | **Magazyn: Degradacja Alfa-Kwasów Chmielu** | Kalkulator utraty goryczki chmielu w zależności od wieku, formy i temperatury przechowywania. | **1.2** | 0.5d / 10m | Rzeczywista goryczka z kilkuletniego chmielu (P2). |
| **Z-047** | **Sprzęt: Profile Warzelni (Equipment)** | Domyślnie 3 uproszczone szablony (BIAB, kociołek, 3-naczyniowy) z zaawansowaną edycją w ustawieniach i zapisem w SQLite. | **MVP** | 0.8d / 15m | **Zgodnie z dyspozycją DEC-11 (Hybryda A+B).** |
| **Z-048** | **Integracja: Eksport do Kalendarza** | Dodanie przypomnienia „Chmielenie na zimno za 7 dni” lub „Rozlew warki #24” do kalendarza urządzenia. | **1.1** | 0.4d / 5m | Integracja bez używania serwerów zewnętrznych. |
| **Z-049** | **Wymiana Receptur P2P (QR Code)** | Generowanie gęstego kodu QR z zakodowaną skompresowaną recepturą do zeskanowania telefon-telefon offline. | **1.1** | 0.6d / 10m | Wymiana receptur na spotkaniach piwowarów offline. |
| **Z-050** | **Chmielenie Hop Stand / Dip Hopping** | Zaawansowane profile ekstrakcji olejków eterycznych w temperaturach 60–80°C. | **1.2** | 0.5d / 10m | Nowoczesne techniki nowofalowego chmielenia NEIPA. |
| **Z-051** | **Kalkulator Kegowania (CO2 Force Carbonation)** | Tabela ciśnienia butli $CO_2$ (bar / PSI) w zależności od temperatury kega (kegerator 4°C). | **1.1** | 0.5d / 10m | Dla piwowarów używających kegów Cornelius. |
| **Z-052** | **Kalkulator Spundingu (Zawór Ciśnieniowy)** | Fermentacja ciśnieniowa w stożkach fermenatora i naturalne nagazowanie CO2 z fermentacji. | **1.2** | 0.6d / 10m | Profesjonalna fermentacja ciśnieniowa lagerów. |
| **Z-053** | **Zarządzanie Chłodnicą (Cooling Rate)** | Monitorowanie czasu chłodzenia i zużycia wody lodowej. | **2.x** | 0.8d / 10m | Optymalizacja zużycia wody w gospodarstwie domowym. |
| **Z-054** | **Rejestr Badań Mikrobiologicznych** | Zapis wyników posiewów na agarze HLP/UBA do wykrywania bakterii beztlenowych. | **badanie** | 1.5d / 30m | Skrajnie niszowe laboratorium rzemieślnicze. |
| **Z-055** | **Wymuszony Portal Społecznościowy / Czat** | Budowanie wewnętrznego portalu społecznościowego w aplikacji. | **nigdy** | — | **ODRZUCONE (Naruszenie ZP-01, ZP-03, ZP-06).** |
| **Z-056** | **Chmurowa Baza Danych i Synchronizacja SaaS** | Wymuszenie konta chmurowego z abonamentem serwerowym. | **nigdy** | — | **ODRZUCONE (Naruszenie ZP-01, ZP-04, ZP-06).** |
| **Z-057** | **Reklamy Bannerowe i Popupy** | Monetyzacja sieciami reklamowymi AdMob/Unity. | **nigdy** | — | **ODRZUCONE (Naruszenie ZP-05).** |

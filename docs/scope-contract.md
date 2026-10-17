# Kontrakt Zakresu Produktu (Product Scope Contract)
*Projekt:* Piwowar (Brewcraft)  
*Data zatwierdzenia:* 2026-10-18  
*Wersja:* 1.0-FROZEN  
*Status:* Scope Locked for v1.0  
*Organizacja:* Apps4Craft / Apps4Brew Studio  
*Opiekun:* Head of Product & Scope Gatekeeper  

---

## 1. The Core Job (Prymat Jednego Zadania)

> **„Aplikacja umożliwia domowemu i rzemieślniczemu piwowarowi bezbłędne uwarzenie, fermentację i rozlew partii piwa w warunkach kuchenno-warsztatowych (mokre ręce, pośpiech, opary), w 100% offline, bez utraty danych i bez konieczności zakładania konta czy subskrybowania serwerów w chmurze.”**

---

## 2. Zakres MVP v1.0 (Co budujemy i dlaczego)

Wszystkie funkcje zakwalifikowane do wydania v1.0 przeszły bezlitosny audyt bloatu („Test Słoika”) i posiadają bezpośrednie uzasadnienie w badaniach chęci płacenia (WTP Tier 1) oraz fizyce procesu:

| ID BRD | Nazwa Funkcji | Uzasadnienie Rynkowe / WTP | Odzysk z Portfolio | Uwagi dla UX i Architektury |
| :--- | :--- | :--- | :--- | :--- |
| **Z-001** | Skupiony Widok Dnia Warzenia (Focused Brew Day) | Zapobiega wykipieniu brzeczki i przegapieniu chmielenia (WTP Tier 1) | Wzorzec stopera serii z *Trening* | Min. 56pt dotyku, cyfry 68pt `tabular-nums`, timer w tle, alerty dźwiękowe i haptyczne |
| **Z-002** | Dziennik Warek (Batch Ledger) & Snapshoting | Kompletny rejestr partii, odwracalne usuwanie („Cofnij”), nienaruszalne archiwum | Architektura SQLite WAL z *Oczko* / *Słoik* | Zamrożony snapshot receptury w momencie warki (`DEC-15`), zero modalnych formularzy blokujących |
| **Z-003** | Silnik Obliczeniowy Piwowarstwa (Pocket Lab) | Zastępuje 6 osobnych kalkulatorów online; natychmiastowy wynik w czasie rzeczywistym | Silnik precyzyjnych przeliczeń z *Napar* | Tinseth IBU (`DEC-07`), Terrill Refractometer $WCF=1.04$ (`DEC-08`), NIST Hydrometer, SRM Morey, Palmer Strike |
| **Z-004** | Bottle Bomb Blocker (Ochrona przed granatami) | Ochrona zdrowia i mienia piwowara przed wybuchem butelek (WTP Tier 1) | Algorytm strefy ryzyka z *Słoik* | Czerwony baner ostrzegawczy z syreną haptyczną, jeśli SG > FG lub cukier do refermentacji > 9.5 g/L |
| **Z-005** | Baza Stylów BJCP 2021 Offline | Dostęp do 100+ stylów piwnych bez konieczności szukania w internecie | Wzorzec słowników referencyjnych SQLite z *Trening* | Pełna baza 120 stylów BJCP 2021, w tym *Piwo Grodziskie*, Sahti, Rauchbier (`DEC-05`) |
| **Z-006** | Profile Sprzętowe (Equipment Profiles) | Klucz do precyzji obliczeń wydajności i strat brzeczki | Wzorzec profili z *Napar* | 3 profile domyślne (BIAB, kocioł, 3-naczyniowy) + pełna edycja w ustawieniach (`DEC-11`) |
| **Z-007** | Bezstratny Import / Eksport BeerXML 1.0 | Eliminacja vendor lock-in; natychmiastowa migracja z Brewfather i BeerSmith | Wzorzec parsera XML z *Organizer* | Pełne mapowanie do SQLite bez utraty niestandardowych tagów (`DEC-02`, `DEC-10`) |
| **Z-008** | Integracja Tilt Hydrometer BLE | Bezdotykowy odczyt gęstości i temperatury z fermentora | Architektura bufora szeregowego BLE | Bezpośrednie BLE w v1.0, lokalny zapis próbek w SQLite, podgląd na żywo (`DEC-04`) |
| **Z-009** | Chemia Wody i Sole Zacierne | Korekta profilu wody i kalkulacja kwasu mlekowego 80% do docelowego pH | Moduł chemii z *Napar* | 6 kluczowych jonów, stosunek $SO_4/Cl$, dawka kwasu mlekowego (`DEC-14`) |
| **Z-010** | Model Freemium Quota (Apps4Brew Pass) | Monetyzacja $0 kosztów stałych, etyczny paywall, nienaruszalny Read-Only | Wzorzec limitów z *Oczko* / *Piekarz* | 3 warki w 100% odblokowane Pro, nielimitowany dostęp Lifetime/Roczny, 0 utraty danych (`DEC-06`) |

---

## 3. Bezwzględna Lista Odcięć (Feature Kill List)

Zgodnie z **Zasadą Słoika** i zakazem estetyki AI (Anti-AI Slop Mandate), poniższe funkcje zostały bezlitośnie usunięte z głównego interfejsu użytkownika w v1.0:

| ID BRD | Nazwa Odrzuconej Funkcji | Kategoria Śmiecia | Dlaczego Odrzucono (Kompromis) | Gdzie Trafia Wiedza / Zastępstwo? |
| :--- | :--- | :--- | :--- | :--- |
| **Z-K01** | Encyklopedia Biochemii i Kinetyki Enzymów | `[BLOAT-THEORY]` | Użytkownik w oparach brzeczki nie czyta podręcznika akademickiego; paraliż decyzyjny i spadek konwersji | Przeniesiono do dedykowanego In-App Field Guide (`docs/knowledge-base.md`) |
| **Z-K02** | Chatbot AI / Asystent Konwersacyjny w dymku | `[AI-SLOP]` | Sztuczne dymki czatu w narzędziu warsztatowym są powolne, wymagają sieci i generują halucynacje w obliczeniach | Zastąpiono deterministycznymi wzorami matematycznymi i "Doctorem Wad Piwa" |
| **Z-K03** | Moduł Społecznościowy, Komentarze i Feed | `[BLOAT-SOCIAL]` | Użytkownik poszukuje prywatnego, pewnego notatnika rzemieślniczego, a nie kolejnego Facebooka | Zastąpiono 1-tap eksportem karty warki do PNG/SVG oraz pliku BeerXML |
| **Z-K04** | Logowanie w chmurze i Wymóg Zakładania Konta | `[BLOAT-CLOUD]` | Niszczy TTV (Time-to-Value); wymaga serwerów i polityki RODO; uniemożliwia pracę w piwnicy bez zasięgu | Architektura 100% Offline-First SQLite (WAL); brak konta, start w 0.3 sekundy |
| **Z-K05** | Symulator 3D kadzi zaciernej / Animacje WebGL | `[BLOAT-VISUAL]` | Zużycie baterii, powolne renderowanie na starszych telefonach, brak wartości rzemieślniczej | Zastąpiono czytelnym, minimalistycznym diagramem etapów z WCAG AAA |
| **Z-K06** | Moduł Księgowości Akcyzowej dla Browarów Komercyjnych | `[BLOAT-ENTERPRISE]` | Rynek domowy to 99% instalacji; biurokracja akcyzowa zabiłaby ergonomię domową | Przeznaczono do ewentualnego osobnego spin-offu B2B w przyszłości |
| **Z-K07** | Karuzela powitalna z 5 slajdami (Onboarding Slop) | `[ONBOARDING-SLOP]` | Zmusza użytkownika do przeklikiwania oczywistości zamiast pozwolić mu natychmiast uwarzyć piwo | TTV < 60s: natychmiastowy pulpit z gotowym przyciskiem „Rozpocznij dzień warzenia” |

---

## 4. Architektura Portfela: Jedna Aplikacja czy Rodzina Aplikacji? (Suite Split Decision)

- **Werdykt architektoniczny:** `[POJEDYNCZA APLIKACJA SKUPIONA Z LINII APPS4BREW / APPS4CRAFT]`
- **Uzasadnienie podziału (Test 4 Pęknięć Domenowych):**
  1. *Kontekst ergonomiczny:* Cały cykl piwowarski (od planowania zasypu, przez 5-godzinny dzień warzenia, po tygodnie fermentacji i rozlew) łączy jeden fizyczny obiekt — **Warka (Batch)**.
  2. *Częstotliwość użycia:* Dzień warzenia występuje 1–2 razy w miesiącu (wysokie skupienie, stoper, duże przyciski), natomiast monitorowanie fermentacji Tilt BLE odbywa się codziennie w 3 sekundy. Obie te role doskonale integrują się w 5-zakładkowym układzie nawigacji dolnej.
  3. *Dywersyfikacja person:* Od początkującego piwowara z garnkiem 15L (BIAB) po zaawansowanego rzemieślnika z kotłem automatycznym i spławikiem Tilt.
  4. *Przewaga ASO w sklepach:* Precyzyjny tytuł „Piwowar (Brewcraft)” pozycjonuje się organicznie w kategorii Food & Drink na czołowych pozycjach w 35 językach.

---

## 5. Synergie z Portfolio (Portfolio Harvesting)

- **Komponenty zaimportowane ze studia Apps4Craft:**
  - Silnik bazy SQLite z trybem WAL i transakcjami z projektu *Oczko* / *Słoik*.
  - Design System "Dark Steel & Wort Amber" z celami dotykowymi $\ge 56\,\text{pt}$ i WCAG AAA.
  - Słownik 8 pojęć interakcji i wzorzec cofania operacji Snackbar z *Oczko*.
  - Architektura lokalizacji w 35 językach świata z walidatorem symetrii parametrów z projektu *Trening*.
  - Wzorzec etycznego Paywalla Freemium Quota (3 darmowe partie z wieczystym prawem do odczytu) z *Piekarz*.
- **Planowane Spin-offy:**
  - Moduł zaawansowanej mikrobiologii drożdży i banku gęstwy może w przyszłości zasilić aplikację satelicką *Drożdżownia (Yeast Lab)*.

---

## 6. Pętla Zwrotna do Lead Business Analysta (RFC to BA)

W toku weryfikacji wymagań i wyceny chęci płacenia WTP zidentyfikowano i zatwierdzono 2 kluczowe wnioski uzupełniające:

> **RFC-01: Włączenie modułu Bottle Bomb Blocker do krytycznych wymagań bezpieczeństwa**  
> - *Stanowisko:* Wybuch butelek z piwem stanowi realne zagrożenie zdrowia piwowara i domowników.  
> - *Dyspozycja dla BA:* Wymóg `BR-BOT-002` został formalnie włączony do Tomu B5 z bezwzględnym algorytmem blokady rozlewu przy niedokończonej fermentacji.

> **RFC-02: Włączenie modułu kwasu mlekowego 80% do korekty pH zacieru**  
> - *Stanowisko:* Samo obliczanie jonów $Ca/Mg$ jest niewystarczające bez precyzyjnej dawki kwasu w ml do zbicia pH do 5.2–5.4.  
> - *Dyspozycja dla BA:* Formuła Palmera/deLange została formalnie zintegrowana w `BR-WODA-002` i przetestowana wektorami `VEC-WOD-01..02`.

---
*Kontrakt podpisany: Head of Product & Scope Gatekeeper, Apps4Craft Studio*

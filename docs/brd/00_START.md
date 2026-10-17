# Piwowar (Brewcraft) — Wymagania Biznesowe (BRD), wersja robocza 0.1, 17.10.2026

**Status:** Wersja robocza v0.1 poddana rygorystycznemu procesowi Product Discovery studia **Apps4Craft / Apps4Brew**.
**Autor:** Lead Business Analyst & Product Discovery Architect (koordynujący). Części A–D opracowane na bazie analizy rynku, dekonstrukcji ocen 1★/2★ konkurencji (Brewfather, BeerSmith) oraz literatury naukowej Tier 1–3 (ASBC, EBC, Palmer, Kunze, Daniels, Tinseth, Terrill).

---

## 1. Jak czytać ten pakiet dokumentacji

Pakiet dokumentacji analitycznej w `docs/brd/` stanowi **Single Source of Truth** dla całego zespołu (Architekt Systemu, Programista, Architekt Testów, Audytor Monetyzacji, Gatekeeper Zakresu):

| Plik | Rozdziały | Zawartość i Przeznaczenie |
| :--- | :--- | :--- |
| **`00_START.md`** (ten plik) | — | Streszczenie wykonawcze, statystyki dokumentu, co blokuje wydanie (Release Blockers), spis tomów. |
| **`00b_Decyzje.md`** | — | **Jedna lista decyzji (DEC-01…DEC-20)** ze statusem, opcjami A/B, kompromisami i dyspozycjami Właściciela. |
| **`00c_Errata.md`** | — | Sprzeczności w literaturze piwowarskiej, errata formuł matematycznych, otwarte pytania badawcze. |
| **`A1.md`** | 1–3 | Tożsamość marki Apps4Brew, 8 niezmienników produktu (`ZP-01…08`), persony (`P1…P6`), sytuacje (`SYT-01…06`), dekompozycja pakietu (Anti-Combine). |
| **`A2.md`** | 4–5 | Analiza rynku, dekonstrukcja recenzji 1★/2★ konkurencji, 5 filarów przewagi, model finansowy (0,99 € / 4,99 € / 14,99 €) i break-even (22 subskrypcje/rok). |
| **`A3a.md` … `A3c.md`** | 6 | Tabela zakresu funkcjonalnego (`Z-001…Z-057`) z etapami (MVP, 1.1, 1.2, 2.x, nigdy), nakład pracy (dni agenta AI vs czas właściciela). |
| **`A4.md`** | 13, 15 | KPI bez śledzenia użytkownika (Zero Telemetry), strategia ASO, polityka prywatności "Data Not Collected". |
| **`B1.md` … `B6.md`** | 7 | Wymagania funkcjonalne narzędzi (`BR-XXX-nnn`): Dzień Warzenia, Tilt BLE, BeerXML 1.0, Refermentacja, Apple Watch, Profile wody i sprzętu. |
| **`C1.md`** | 7 (nauka) | Piwowarski Doctor Problemów (Troubleshooting 20 wad piwa), Atlas 100+ stylów BJCP 2021, przewodnik sanityzacji strefy zimnej. |
| **`C2.md` … `C3.md`** | 8 | Reguły dziedzinowe (`RD-01…RD-25`) z deterministycznymi wzorami matematycznymi i powiązanymi wektorami testowymi. |
| **`C4.md`** | 8.P | Proces weryfikacji treści merytorycznych i rejestr decyzji badacza dziedzinowego (`D-01…D-15`). |
| **`D1.md`** | 9–10 | Wymagania niefunkcjonalne (`NFR-XXX-nnn`) i zgodność z App Store Review Guidelines (3.1.2, 4.3, 5.1.1). |
| **`D2.md`** | 11–12 | Architektura techniczna offline-first, schemat relacyjny SQLite DDL (tryb WAL), indeksy, polityka zamrażania receptur (Snapshot). |
| **`D3.md`** | 14, 16 | Rejestr ryzyk (`RYZ-01…RYZ-25`) z macierzą prawdopodobieństwo × skutek i planem mitygacji. |
| **`D4.md`** | 17 | 9-warstwowa strategia testów automatycznych (jednostkowe, mutacyjne, macierzowe, E2E Maestro). |
| **`W.md`** | — | Raport weryfikacji twierdzeń ze źródłami bibliograficznymi (`[FAKT]`, `[NORMA]`, `[OBLICZENIE]`). |

---

## 2. Streszczenie dla Właściciela Produktu

### Czym jest Piwowar (Brewcraft)
**Piwowar (Brewcraft)** to autonomiczny, kieszonkowy asystent i cyfrowy notes dla domowych i rzemieślniczych piwowarów, stworzony w bezkompromisowym standardzie studia **Apps4Craft / Apps4Brew**. Łączy wieloetapowy stoper dnia warzenia (zacieranie, próba jodowa, gotowanie, chmielenie z alertami audio PCM w tle i wsparciem dla Apple Watch) z deterministycznymi kalkulatorami fizykochemicznymi (korekta gęstości areometru, refraktometria z algorytmem Seana Terrilla, IBU Tinsetha, barwa SRM/EBC Moreya, mineralizacja wody solami $SO_4/Cl$, kalkulator refermentacji chroniący przed eksplozją butelek), bezprzewodowym odbiorem cyfrowych spławików **Tilt Hydrometer BLE** w 100% offline oraz bezstratnym importem/eksportem standardu branżowego **BeerXML 1.0**.

Aplikacja działa **w 100% offline, bez konieczności rejestracji konta, bez serwerów zewnętrznych i bez reklam**, w 35 językach. Zgodnie z etosem Apps4Brew oferuje nielimitowany darmowy rdzeń warek i kalkulatorów, a opcjonalny Apps4Brew Pass kosztuje **mniej niż jedno piwo rzemieślnicze miesięcznie** (0,99 €) lub dostępny jest w jednorazowym zakupie dożywotnim (14,99 € Lifetime).

---

## 3. Co Blokuje Wydanie (Release Blockers)

Zgodnie z rygorem inżynierskim studia, żadna wersja v1.0 nie może trafić do App Store / Google Play w przypadku wystąpienia któregokolwiek z poniższych warunków:
1. **Ryzyko eksplozji butelek („Granaty piwne”):** Brak twardej blokady kalkulatora refermentacji przed zabutelkowaniem piwa o niedokończonej atenuacji lub błąd w formule obliczania gramatury cukru.
2. **Utrata danych warki:** Jakikolwiek przypadek utraty wprowadzonych notatek lub odczytów warki po zamknięciu aplikacji w tle lub restarcie telefonu (wymóg zapisu transakcyjnego SQLite w trybie WAL).
3. **Błąd w algorytmach obliczeniowych (RD):** Niezgodność z plikiem `docs/brd/fixtures/test-vectors.json` powyżej zdefiniowanych tolerancji.
4. **Naruszenie deklaracji prywatności:** Wykrycie jakiegokolwiek zewnętrznego trackera lub wysyłki danych analitycznych (wymóg App Store Privacy Manifest "Data Not Collected").
5. **Zawodzący stoper w tle:** Wyłączenie dźwięku alertu lub stopera chmielenia po wygaszeniu ekranu podczas gotowania brzeczki.
6. **Bariera dostępności VoiceOver:** Niemożność odczytania kluczowych etapów dnia warzenia przez niewidomego piwowara.

---

## 4. Statystyki Dokumentu

- Liczba zmapowanych wymagań funkcjonalnych: **57 pozycji w tabeli zakresu (Z-001…Z-057)**
- Liczba dedykowanych wymagań BR: **18 specyfikacji formalnych z kryteriami Gherkin**
- Liczba reguł dziedzinowych RD: **25 deterministycznych formuł matematyczno-chemicznych**
- Liczba wektorów testowych: **32 zweryfikowane wektory w `test-vectors.json`**
- Liczba zidentyfikowanych ryzyk projektowych: **25 pozycji w rejestrze RYZ**
- Liczba decyzji produktowych rozstrzygniętych: **15 decyzji (DEC-01…DEC-15)**

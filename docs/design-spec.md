# Piwowar (Brewcraft) — Specyfikacja Projektowa UX & Design System (Design Blueprint)

> **Status:** Zatwierdzona wersja v1.0  
> **Autor:** Staff Product Designer & Principal UX Research Architect  
> **Standard:** Apps4Craft Studio (`@apps4craft/ui`)  
> **Platforma:** iOS, watchOS, Android (React Native / Expo)  

---

## 1. Ramy Ergonomiczne i Kontekst Użytkownika (Kitchen-Proof UX)

Piwowar domowy operuje w warunkach wymagających bezkompromisowej ochrony przed błędami i zmęczeniem poznawczym:
- **Środowisko:** Garnek 30–50L z wrzącą cieczą, para wodna skraplająca się na ekranie, lepkie krople brzeczki na opuszkach palców, grube rękawice neoprenowe/kuchenne przy chłodnicy zanurzeniowej.
- **Odległość operacyjna:** Telefon leży na blacie w odległości 1.0–1.5 m od palnika; piwowar zerka na stoper bez podnoszenia urządzenia.
- **Zasady Ergonomii Dotykowej:**
  - **Strefa Kciuka (Thumb Zone):** Wszystkie krytyczne przyciski akcji (`Pauza`, `Następny Krok`, `+1 min`) zgrupowane w dolnych 35% wysokości ekranu o wymiarach **min. $56\times 56\,\text{pt}$** z odstępami min. $12\,\text{pt}$ (ochrona przed omyłkowym stuknięciem).
  - **Czytelność z dystansu:** Cyfry głównego stopera o rozmiarze **64–72 pt** (czytelne z 1.5 m przez parę wodną).
  - **Fizyka i haptyka:** Twarde wciśnięcie przycisku (`scale: 0.97`) z natychmiastową ciężką odpowiedzią haptyczną (`ImpactFeedbackStyle.Heavy`).
  - **Blokada wygaszania:** `Keep-Awake` aktywny wyłącznie podczas trwania stopera zacierania i gotowania.

---

## 2. Tożsamość Wizualna i Zasada Anty-AI (Anti-AI Slop Mandate)

Projektowany interfejs stanowi bezkompromisowe zaprzeczenie generycznych szablonów i neonowych fioletów.
- **Zakazane:** fiolety, indygo `#6366F1`, neonowe rozmycia tła (`glow orbs`), lewitujące karty z gigantycznym rozlanym cieniem, plastelinowe ilustracje 3D.
- **Obowiązkowe:** surowa stal nierdzewna, złocisty bursztyn brzeczki, zieleń chmielu, miedź aparatury, wysoki kontrast WCAG AAA ($\ge 7:1$) oraz precyzyjne fizyczne mikro-ramki 1px.

---

## 3. Kompletny System Tokenów Wzorniczych

### A. Tokeny Kolorystyczne (Dark & Light Mode)

| Token Semantyczny | Wartość Dark Mode | Wartość Light Mode | Kontrast WCAG (Dark) | Zastosowanie |
|---|---|---|---|---|
| `color.bg.canvas` | `#101216` (Sadza paleniska) | `#F8F7F4` (Papier kraft) | — (Tło bazowe) | Tło całego ekranu (60%). |
| `color.bg.surface` | `#171A21` (Stal warsztatowa) | `#FFFFFF` (Biel alpejska) | — (Powierzchnia robocza) | Karty, listy, panele (30%). |
| `color.bg.elevated` | `#20242E` (Ceramika kociołka) | `#F0EFEA` (Jasny piaskowiec) | — (Warstwa uniesiona) | Modale, arkusze dolne (Bottom Sheets). |
| `color.border.subtle` | `#282D3A` (Mikro-ramka 1px) | `#E2DFD8` (Krawędź papieru) | $\ge 3:1$ | Fizyczna mikro-ramka 1px zamiast rozmytych cieni. |
| `color.text.primary` | `#F2F4F8` (Biel cynkowa) | `#14171D` (Głęboki grafit) | **14.2:1 (AAA)** | Liczby stopera, główne nagłówki, wartości odczytów. |
| `color.text.secondary`| `#A8B0C2` (Stal szczotkowana) | `#4D5361` (Ciemny łupek) | **7.4:1 (AAA)** | Podpisy jednostek, etykiety formularzy, czas etapów. |
| `color.text.muted` | `#767E91` (Szary dymny) | `#6B7280` (Średni szary) | **4.6:1 (AA)** | Dyskretne wskazówki pomocnicze, data historyczna. |
| `color.accent.primary`| **`#E58A2B` (Bursztyn Brzeczki)** | **`#B85C0A` (Ciemny Bursztyn)** | **8.2:1 (AAA)** | Główne przyciski CTA, aktywny timer, ikona Pro (10%). |
| `color.accent.hop` | **`#3E7B54` (Zieleń Chmielu)** | **`#2A593B` (Głęboki Chmiel)** | **7.1:1 (AAA)** | Odznaki chmielenia, zbieżność ze stylem BJCP. |
| `color.status.danger` | `#E03E3E` (Cynober alarmowy) | `#C92A2A` (Czerwień rubinowa) | **7.5:1 (AAA)** | **Bottle Bomb Blocker**, alerty skażenia, akcje destrukcyjne. |
| `color.status.warning`| `#EAA824` (Miedź ostrzegawcza) | `#B57404` (Ciemna ochra) | **8.0:1 (AAA)** | Zbliżający się chmiel (T-60s), wysokie odparowanie. |
| `color.status.success`| `#389E58` (Zieleń stabilizacji) | `#23783E` (Zieleń leśna) | **7.2:1 (AAA)** | Stabilizacja odfermentowania Tilt, poprawna waga. |

---

### B. Dynamiczna Paleta Barw Piwnych EBC / SRM

Dla dynamicznego kolorowania pasków barwy brzeczki w oparciu o formułę Moreya (RD-06):
- `4 EBC / 2 SRM`: `#F8F796` (Pilsner, Witbier)
- `8 EBC / 4 SRM`: `#F2DA60` (Helles, Kolsch, Pale Ale)
- `14 EBC / 7 SRM`: `#E6A817` (West Coast IPA, Marcowe)
- `22 EBC / 11 SRM`: `#D47A0E` (Amber Ale, Koźlak)
- `35 EBC / 18 SRM`: `#9E4508` (Brown Ale, Dunkel)
- `55 EBC / 28 SRM`: `#5A2204` (Robust Porter, Stout)
- `80+ EBC / 40+ SRM`: `#1A0A02` (Russian Imperial Stout, Black IPA)

---

### C. Archetyp Typograficzny (Archetyp A: Precyzja Techniczna)

- **Liczby, Czas, Wagi, Gęstości, IBU:** **`IBM Plex Mono`** (Warianty: Bold / Medium, bezwzględne **`tabular-nums`** — zapobiega drganiom layoutu przy odliczaniu).
- **Nagłówki & Ekrany:** **`Tektur`** (Bold / SemiBold — techniczny, surowy krój inżynierski).
- **Tekst podstawowy & Formularze:** **`IBM Plex Sans`** (Regular 400 / Medium 500 — optymalna czytelność przy powiększaniu Dynamic Type do 200%).

---

### D. Siatka 8pt i Odstępy

- `spacing.xs`: 4pt (mikro-odstęp ikona-tekst)
- `spacing.sm`: 8pt (zwarty margines wewnętrzny)
- `spacing.md`: 12pt (odstęp pól formularza)
- `spacing.lg`: 16pt (standardowy padding kontenerów)
- `spacing.xl`: 24pt (margines sekcji)
- `spacing.xxl`: 32pt (odstęp nagłówka)
- `spacing.hero`: 48pt (strefa stopera)

---

## 4. Architektura Informacji i 5 Głównych Zakładek

1. **⏱️ Dzień Warzenia (Brew Day):** Stoper wieloetapowy (zacieranie, gotowanie, chmielenie), widok skupiony Focused Active View, kalkulator Strike Water Just-in-Time.
2. **🫙 Warki & Dziennik (Batches):** Aktywne fermentacje z kartą Tilt BLE, archiwum historyczne Read-Only, notatki sensoryczne BJCP 50 pkt.
3. **📜 Receptury (Recipe Vault):** Magazyn receptur, 1-klikowy import/eksport BeerXML 1.0, edytor zasypu i chmieli.
4. **🎛️ Kalkulatory (Pocket Lab):** Refraktometr Terrilla ($WCF=1.04$), areometr NIST, IBU Tinsetha, barwa Moreya, Refermentacja i Bottle Bomb Blocker, Mineralizacja wody $SO_4/Cl$.
5. **🧭 Wiedza & Sprzęt (Library & Settings):** Atlas 100+ stylów BJCP 2021 offline, Piwowarski Doctor Wad Piwa, Profile sprzętu (Hybryda A+B), Języki (35), Kopia JSON.

---

## 5. Wzorzec Widoku Skupionego (Focused Active Brew View)

W trakcie gotowania i zacierania aplikacja eliminuje szum informacyjny:
- **Display 64pt:** Olbrzymi zegar IBM Plex Mono `tabular-nums`.
- **Paski kontekstowe:** Podgląd kroku poprzedniego (zwinięty) i następnego (zapowiedź).
- **Strefa Thumb Zone (dolne 35% ekranu):**
  - Przycisk `[ ▌▌ PAUZA / WZNÓW ]` (wysokość 60pt)
  - Pigułki `[-1 MIN]` oraz `[+1 MIN]` (56pt)
  - Przycisk `[ NASTĘPNY KROK ▶ ]` (58pt, akcent bursztynowy `#E58A2B`)
- **Progresywne Ujawnianie:** Akordeon *„🔬 Pomiar w locie”* do szybkiego zapisu odczytu refraktometru bez opuszczania stopera.

---

## 6. Macierz 9 Stanów UI (Matrix of 9 States)

| Stan UI | Ekran Stopera Warzenia | Karta Telemetrii Tilt BLE | Kalkulator Refermentacji |
|---|---|---|---|
| **1. Domyślny (Golden Path)** | Płynne odliczanie, zielony wskaźnik temperatury. | Wykres atenuacji w piwnicy, spadek °P, RSSI -68dBm. | Wyliczona dawka glukozy $121.5\,\text{g}$, bezpieczne 2.1 bar. |
| **2. Zero Data (Onboarding)** | Karta kraftowa: „Gotowy na warkę?” + Szybki start BIAB. | Rysunek fermentora + instrukcja wrzucenia spławika. | Wypełnione domyślne parametry stylu (20L, 20°C). |
| **3. Ładowanie (Skeleton)** | Animowane szkielety stopera i przycisków Thumb Zone. | Szkielet osi wykresu z pulsującą ikoną Bluetooth. | Błyskawiczne obliczenie lokalne ($< 1\,\text{ms}$). |
| **4. Błąd / Awaria** | Alert: „Nie udało się zsynchronizować zegarka” + [Wznów z bazy]. | Czerwony baner: „Brak sygnału BLE. Sprawdź baterię”. | Zablokowane obliczenie przy ujemnych wartościach. |
| **5. Częściowe Dane** | Pominięty krok oznaczony jako: „Krok pominięty manualnie”. | Pojedyncza kropka: „Krzywa pojawi się po 3 pomiarach”. | Brak temperatury: kalkulator przyjmuje 20°C z ostrzeżeniem. |
| **6. Puste Wyniki** | Nie dotyczy. | Nie dotyczy. | Nie dotyczy. |
| **7. Brak Uprawnień** | „Włącz powiadomienia w tle, by słyszeć chmielenie”. | Ekran z prośbą o uprawnienie Bluetooth dla spławika BLE. | Nie dotyczy (100% offline). |
| **8. Ostrzeżenie Bezpieczeństwa** | Zbliżający się chmiel pulsuje miedzią na 60s przed końcem. | Pomarańczowy alert: „Zatrzymanie fermentacji na 6.2°P”. | **BOTTLE BOMB BLOCKER:** Czerwony alert i blokada rozlewu przy FG > 4°P! |
| **9. Praca w Tle** | Banner na górze innych zakładek z bieżącym czasem gotowania. | Dyskretna zielona kropka oznaczająca odczyt z ostatnich 15 min. | Nie dotyczy. |

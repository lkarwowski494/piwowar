# Piwowar (Brewcraft) 🍺🌾

> **„Warz z dumą, mierz z precyzją — rzemiosło piwowarskie w Twojej dłoni.”**

Autonomiczny, kieszonkowy asystent i cyfrowy notes dla domowych oraz rzemieślniczych piwowarów, stworzony zgodnie z bezkompromisowymi zasadami ekosystemu **Apps4Craft / Apps4Brew**.

[![TypeScript](https://img.shields.io/badge/TypeScript-Strict%20Zero--Any-blue.svg)](https://www.typescriptlang.org/)
[![Tests](https://img.shields.io/badge/Tests-67%2F67%20Passed-brightgreen.svg)](#)
[![Offline](https://img.shields.io/badge/100%25-Offline--First%20SQLite%20WAL-green.svg)](#)
[![Privacy](https://img.shields.io/badge/Data-Not%20Collected-success.svg)](#)
[![BeerXML](https://img.shields.io/badge/BeerXML-1.0%20Compatible-orange.svg)](#)
[![BLE](https://img.shields.io/badge/Tilt%20BLE-Direct%20Reading-blueviolet.svg)](#)
[![BJCP](https://img.shields.io/badge/BJCP-2021%20Offline-yellow.svg)](#)
[![WCAG](https://img.shields.io/badge/WCAG-AAA%20Compliant-success.svg)](#)

---

## 🌟 Główne Zasady Produktowe (Apps4Brew)

- **100% Offline-First:** Pełna funkcjonalność bez połączenia z internetem. Działa w piwnicy fermentacyjnej, garażu, kuchni i plenerze na lokalnej bazie SQLite w bezpiecznym trybie transakcyjnym WAL (`PRAGMA journal_mode = WAL`).
- **Niezmienne Snapshoty Warek (DEC-15):** Każda rozpoczęta warka zamraża głęboki snapshot JSON receptury bazowej i profilu sprzętowego. Modyfikacje w bibliotece nigdy nie zaburzają historii archiwalnych warek.
- **Zero Logowania i Rejestracji:** Brak ekranów zakładania kont, zbędnych pytań o e-mail i ankiet onboardingowych. Gotowa do pierwszego pomiaru w $< 2\,\text{s}$ po instalacji.
- **Prywatność „Data Not Collected”:** Zero inwazyjnych bibliotek analitycznych (brak Firebase, Meta, Google Analytics). Zgodność z Apple Privacy Manifest.
- **Pełna Suwerenność Danych:** Bezpłatny i bezstratny import/eksport receptur w standardzie **BeerXML 1.0** (`fast-xml-parser`) oraz natychmiastowe operacje WAL z dolnym snackbarem *Cofnij* (`DEC-03`).
- **Deterministyczna Fizyka i Chemia Piwowarska:** Wszystkie formuły (wielomiany ASBC Lincolna dla °Plato/SG, refraktometria Seana Terrilla, IBU Glenna Tinsetha, barwa SRM/EBC Moreya, mineralizacja wody solami $SO_4/Cl$, temperaturowe bilanse refermentacji deClercka) oparte na literaturze Tier 1–3 i zwalidowane 32 wektorami testowymi.

---

## 📱 5 Głównych Zakładek Aplikacji

1. **⏱️ Dzień Warzenia (`brew.tsx`) — Focused Active Brew View:**
   - Gigantyczny stoper 68pt `tabular-nums` widoczny z odległości 1.5 m przez parę wodną.
   - **Kitchen-Proof Thumb Zone:** kontrolki dotykowe $\ge 56\,\text{pt}$ (Pauza/Wznów, +1 min, -1 min, Następny krok ▶) w dolnej strefie ekranu.
   - Sekwencja przerw zacierania i odliczanie gotowania z alertami dodawania chmielu (nazwa i gramatura).
   - Pomiar refraktometru w locie z 2 kropel brzeczki oraz kalkulator wody zaciernej Just-in-Time (`DEC-12`).
   - Automatyczna blokada wygaszania ekranu (`expo-keep-awake`) i odpowiedź haptyczna (`expo-haptics`).

2. **🫙 Warki & Dziennik (`batches.tsx`):**
   - Rejestr aktywnych i archiwalnych warek z filtrowaniem.
   - Odznaki cyklu życia: *Planowanie*, *Zacieranie*, *Gotowanie*, *Fermentacja burzliwa/cicha*, *Cold Crash*, *Zabutelkowana*.
   - Zarządzanie limitem darmowych 3 warek (`DEC-06`) i natychmiastowe usuwanie z opcją *Cofnij*.

3. **📜 Receptury (`recipes.tsx`):**
   - Biblioteka receptur rzemieślniczych (w tym startowe *Piastowskie APA 12°Blg*).
   - 1-klikowy import i eksport plików **BeerXML 1.0** kompatybilnych z Brewfather, BeerSmith i Grainfather.
   - Narzędzie proporcjonalnego skalowania warki pod nową objętość lub wydajność warzelni (`BR-REC-001`).

4. **🎛️ Kalkulatory Piwowarskie (`calculators.tsx`):**
   - **Refraktometr Terrilla (DEC-08):** precyzyjna korekta odczytu z pryzmatu w obecności etanolu z $WCF=1.04$.
   - **Areometr NIST:** temperaturowa korekta pozornego ciężaru brzeczki (10–70°C).
   - **Goryczka IBU Tinsetha:** model utylizacji $\alpha$-kwasów z korektą na granulat i szyszkę.
   - **Barwa SRM / EBC Moreya:** dynamiczne wyliczanie barwy i 13 realistycznych kolorów hex.
   - **Woda zacierna (Palmer):** termodynamiczny bilans temperatury wody przed zasypem.
   - **Refermentacja & Bottle Bomb Blocker (BR-BOT-001..002):** obliczanie surowca refermentacyjnego (sacharoza, glukoza, DME) i twarda blokada rozlewu przy groźbie eksplozji butelek.
   - **Chemia wody & pH (DEC-14):** stężenie 6 jonów, stosunek $SO_4/Cl$ i kwas mlekowy 80%.

5. **⚙️ Ustawienia & Baza Wiedzy (`settings.tsx`):**
   - **Profile Sprzętowe (DEC-11: Hybryda A+B):** 3 domyślne zestawy (BIAB 20L, Kociołek All-in-One 30L, 3-Vessel) oraz edytor nielimitowanych zestawów własnych.
   - **Atlas Stylów BJCP 2021 Offline (DEC-05):** baza stylów piwnych z parametrami widełek OG, FG, IBU, SRM, ABV oraz opisami sensorycznymi.
   - **Status Apps4Brew Pass (DEC-06):** wgląd w limit darmowych warek i zarządzanie subskrypcją.

---

## 🛠️ Uruchomienie i Weryfikacja

### Wymagania
- Node.js $\ge 20$ (testowane na v24.20.0)
- npm $\ge 10$

### Instalacja i Start
```bash
# Instalacja zależności
npm install

# Start aplikacji w Expo
npm run start
```

### Bramki Jakości (Verify Suite)
Przed scaleniem jakichkolwiek zmian, repozytorium jest weryfikowane 3-stopniowym pipeline'em:
```bash
# 1. Weryfikacja spójności słownika interfejsu (32 wzorce)
npm run check:i18n

# 2. Rygorystyczny typecheck TypeScript (zero any)
npm run typecheck

# 3. Zestaw testów jednostkowych (repozytoria, wektory fizykochemiczne, BeerXML, UI)
npm test

# Zespolony test bramkowy:
npm run verify
```

---

## 💎 Model Monetyzacji (DEC-06)

Zgodnie z audytem monetyzacyjnym i dyspozycją `DEC-06`:
- **Pierwsze 3 warki w 100% odblokowane w standardzie Pro:** Pełny dostęp do stopera, profilu sprzętowego, wody, kalkulatorów i telemetrii (efekt Aha!).
- **Od 4. warki wzwyż:** Tworzenie nowych partii wymaga subskrypcji **Apps4Brew Pass** (0,99 €/msc, 4,99 €/rok lub 14,99 € Lifetime).
- **Gwarancja Etycznego Read-Only:** Dotychczasowe warki, historia, notatki sensoryczne, import/eksport BeerXML 1.0 oraz kalkulatory pozostają bezpłatne i w 100% dostępne do odczytu na zawsze.

---

## 📜 Licencja

Projekt autorski zrealizowany dla **Apps4Craft Studio** (`@apps4craft/piwowar`). Wszelkie prawa zastrzeżone.

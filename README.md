# Piwowar (Brewcraft) 🍺🌾

> **„Warz z dumą, mierz z precyzją — rzemiosło piwowarskie w Twojej dłoni.”**

Autonomiczny, kieszonkowy asystent i cyfrowy notes dla domowych oraz rzemieślniczych piwowarów, stworzony zgodnie z bezkompromisowymi zasadami ekosystemu **Apps4Craft / Apps4Brew**.

[![TypeScript](https://img.shields.io/badge/TypeScript-Strict%20Zero--Any-blue.svg)](https://www.typescriptlang.org/)
[![Offline](https://img.shields.io/badge/100%25-Offline--First-green.svg)](#)
[![Privacy](https://img.shields.io/badge/Data-Not%20Collected-success.svg)](#)
[![BeerXML](https://img.shields.io/badge/BeerXML-1.0%20Compatible-orange.svg)](#)
[![BLE](https://img.shields.io/badge/Tilt%20BLE-Direct%20Reading-blueviolet.svg)](#)
[![BJCP](https://img.shields.io/badge/BJCP-2021%20Offline-yellow.svg)](#)
[![i18n](https://img.shields.io/badge/35%20Languages-CLDR%20Plurals-informational.svg)](#)

---

## 🌟 Główne Zasady Produktowe (Apps4Brew)

- **100% Offline-First:** Pełna funkcjonalność bez połączenia z internetem. Działa w piwnicy fermentacyjnej, garażu, kuchni i plenerze na lokalnej bazie SQLite (tryb WAL).
- **Zero Logowania i Rejestracji:** Brak ekranów zakładania kont, zbędnych pytań o e-mail i ankiet onboardingowych. Gotowa do pierwszego pomiaru w $< 2\,\text{s}$ po instalacji.
- **Prywatność „Data Not Collected”:** Zero inwazyjnych bibliotek analitycznych (brak Firebase, Meta, Google Analytics). Zgodność z Apple Privacy Manifest.
- **Pełna Suwerenność Danych:** Bezpłatny i bezstratny import/eksport receptur w standardzie **BeerXML 1.0** oraz nielimitowana rotacyjna kopia JSON.
- **Deterministyczna Fizyka i Chemia Piwowarska:** Wszystkie formuły (wielomiany ASBC Lincolna dla °Plato/SG, refraktometria Seana Terrilla, IBU Glenna Tinsetha, barwa SRM/EBC Moreya, mineralizacja wody solami $SO_4/Cl$, temperaturowe bilanse refermentacji deClercka) oparte na literaturze Tier 1–3 i zwalidowane wektorami testowymi.

---

## 📱 Główne Moduły i Możliwości

1. **⏱️ Asystent Dnia Warzenia (Brew Day Engine):**
   - Wieloetapowy stoper zacierania (przerwy maltozowa, dekstrynująca, mash-out) z głośnymi alertami audio PCM w tle.
   - Odliczanie gotowania z sekwencją alarmów chmielenia (60', 15', 5', 0') oraz etapem chłodzenia/whirlpool w zdefiniowanej temperaturze.
   - **Kitchen-Proof Thumb Zone:** gigantyczne kontrolki operacyjne ($\ge 52\,\text{pt}$) w dolnej strefie ekranu, zoptymalizowane pod obsługę jedną ręką z mokrymi dłońmi i w rękawicach.
   - Wsparcie dla **Apple Watch** (wibracje haptyczne 30s przed kolejnym chmielem) oraz **Live Activity / Dynamic Island** na ekranie blokady iPhone'a.
2. **🎛️ Zestaw Deterministycznych Kalkulatorów:**
   - **Korekta Temperatury Areometru:** przeliczanie pozornego ciężaru brzeczki o temperaturze 10–90°C na wzorcowe 20°C.
   - **Refraktometr z Korektą Alkoholu (Terrill):** odczyt z pryzmatu w obecności etanolu z współczynnikiem brzeczki $\text{WCF}=1.04$.
   - **Goryczka IBU:** wzór Tinsetha z korektą na gęstość i formę chmielu (T90, szyszka, Cryo).
   - **Barwa SRM / EBC:** wzór Moreya z dynamiczną paletą barw hex.
   - **Kalkulator Wody i Infuzji (Strike Water):** wyliczanie temperatury wody przed zasypem słodu.
3. **📡 Bezpośredni Monitoring Tilt Hydrometer BLE (DEC-04):**
   - Odbiór pakietów iBeacon ze spławików cyfrowych Tilt w 100% offline bez Raspberry Pi i chmury.
   - Wykres atenuacji i temperatury fermentacji w piwnicy z detekcją stabilizacji ekstraktu.
4. **🍻 Bezpieczna Refermentacja i Ochrona przed „Granatami Butelek” (ZP-08):**
   - Obliczenie glukozy, sacharozy i DME w relacji do temperatury warki i stylu ($V_{CO2}$).
   - Twardy Bottle Bomb Blocker: czerwony alert i blokada kalkulatora przy próbie zabutelkowania niedofermentowanej warki.
5. **📜 Magnes Migracyjny BeerXML 1.0:**
   - 1-klikowy import i eksport receptur z Brewfather i BeerSmith.
6. **🧭 Kompendium BJCP 2021 & Doctor Wad Piwa:**
   - Kompletny atlas 100+ stylów BJCP offline z dynamicznym weryfikatorem widełek receptury.
   - Deterministyczny kompas sensoryczny diagnozujący 20 wad piwa (diacetyl, aldehyd, DMS, infekcje, chlorofenole).

---

## 🛠️ Architektura i Uruchomienie

### Stos Technologiczny
- **Frontend / Aplikacja:** React Native / Expo (Expo Router)
- **Baza Danych:** SQLite (`expo-sqlite`) w trybie transakcyjnym WAL
- **Zarządzanie Stanem:** Zustand
- **Komunikacja BLE:** `react-native-ble-plx` (odczyt cyfrowych spławików Tilt)
- **Parser XML:** `fast-xml-parser` (BeerXML 1.0)
- **Lokalizacja:** Silnik 35 języków z regułami liczby mnogiej CLDR

### Uruchomienie Lokalne
```bash
# Instalacja zależności
npm install

# Start środowiska deweloperskiego Expo
npx expo start
```

### Bramki Jakości (Verify Suite)
Przed zatwierdzeniem jakichkolwiek zmian kod musi przejść pełen pakiet weryfikacji:
```bash
npm run typecheck    # Weryfikacja typów TypeScript (zero-any)
npm run check:i18n   # Weryfikacja symetrii 35 języków
npm test             # Deterministyczne testy jednostkowe zasilane test-vectors.json
npm run verify       # Zespolona bramka commitowa (wszystkie powyższe)
```

---

## 💎 Model Monetyzacji i Licencja

- **Nielimitowany Darmowy Rdzeń:** brak limitu 10 receptur, pełne kalkulatory, import/eksport BeerXML, baza BJCP 2021.
- **Apps4Brew Pass (Opcjonalny Pro):** 0,99 €/mc, 4,99 €/rok lub 14,99 € Lifetime (bezpośredni odczyt Tilt BLE, zaawansowane profile wody, Apple Watch).
- **Licencja:** Kod autorski studia Apps4Craft. Pełna suwerenność danych użytkownika.

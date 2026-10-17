# Zgłoszenie i Obrona w App Store (App Store Submission & Review Defense Kit)
*Projekt:* Piwowar (Brewcraft)  
*Rola:* Principal App Store Operations Specialist & Review Defense Architect  
*Wersja dokumentu:* 1.0.0-PROD  
*Standard:* Apple App Store Review Guidelines (2026 Edition), Fastlane, Privacy Manifest  

---

## 1. Informacje dla Zespołu Recenzenckiego Apple (App Review Notes)

*Język dokumentacji dla Apple Review Team:* Angielski (wymóg Apple Connect).

### App Review Information:
- **Demo Account Required:** NO (App is 100% offline-first, no login or registration).
- **Contact Information:** `developer@apps4craft.com`
- **External Hardware (Bluetooth / Tilt Hydrometer):**
  > *„This application supports wireless readings from Tilt Hydrometers via Bluetooth Low Energy (iBeacon protocol). To enable smooth testing without physical hardware in Cupertino, an automatic simulated demo stream is activated whenever no physical Tilt device is detected nearby. Navigating to Calculators or Batch Detail displays real-time simulated gravity/temperature curves.”*

### 90-Second Fast Reviewer Guide:
1. Launch the app. Notice instant startup without onboarding modals or account requirements.
2. Tap the large **"Start Brew Day"** button in the first tab ("Brew"). Observe the high-contrast 68pt timer and active mashing step.
3. Switch to the **"Calculators"** tab. Select **"Refractometer (Terrill)"** and change the FG Brix input — real-time SG calculation is updated instantly without network calls.
4. Tap **"Bottle Priming"** calculator. Observe the **"Bottle Bomb Blocker"** safety guard which raises an immediate safety alert when carb volume exceeds safe thresholds.
5. Tap **"Batch Ledger"** tab to view historical craft batches stored deterministically in local SQLite.

---

## 2. Pakiet Obrony Apple Guideline 4.2 i 4.3 (Defense Kit)

### Guideline 4.2 (Minimum Functionality Defense):
Piwowar (Brewcraft) NIE jest prostym opakowaniem strony www (WebView) ani podstawowym kalkulatorem. Aplikacja stanowi wyspecjalizowany, zintegrowany warsztat inżynierii piwowarskiej:
- **Wielomodelowy silnik fizyko-chemiczny:** implementuje 12 zaawansowanych wzorów matematycznych (ASBC Lincoln Plato-SG, Glenn Tinseth IBU z pellet factor 1.03, Sean Terrill WCF=1.04, Dan Morey SRM/EBC, Palmer Strike Water, deLange 80% lactic acid pH).
- **Lokalna relacyjna baza danych SQLite:** architektura WAL, bezstratny import/eksport BeerXML 1.0, 120 stylów BJCP 2021 offline.
- **Bezpieczeństwo biologiczne:** predykcja Bottle Bomb Blocker chroniąca przed eksplozją butelek pod ciśnieniem.
- **Wsparcie BLE:** bezdotykowy odczyt iBeacon dla gęstościomierzy cyfrowych Tilt.

### Guideline 4.3 (Spam / Copycat Defense):
- Aplikacja należy do prestiżowego studia rzemieślniczego **Apps4Craft / Apps4Brew**.
- Unikalny, autorski język projektowy: *Dark Steel & Wort Amber* (WCAG AAA $\ge 7:1$, cel dotykowy $\ge 56\,\text{pt}$ w strefie kciuka).
- Zgodność z Aksjomatem Braku Śledzenia: zerowa obecność trackerów zewnętrznych.

---

## 3. Dostarczenie Aplikacji do Użytkownika i Ścieżka TestFlight

### A. Wdrożenie TestFlight przez Expo Application Services (EAS Build)
1. **Instalacja EAS CLI i logowanie:**
   ```bash
   npm install -g eas-cli
   eas login
   ```
2. **Uruchomienie automatycznego buildu na iOS:**
   ```bash
   eas build --platform ios --profile preview
   ```
3. **Automatyczne przesłanie do Apple TestFlight:**
   ```bash
   eas submit --platform ios --profile preview
   ```
   *Paczka `.ipa` jest kompilowana w chmurze Expo, podpisywana certyfikatem produkcyjnym Apple Developer i automatycznie ląduje w App Store Connect w zakładce TestFlight.*

### B. Wdrożenie przez Fastlane (Alternatywna Ścieżka Natywna):
   ```bash
   bundle exec fastlane ios beta
   ```

### C. Zarządzanie Testerami w TestFlight:
1. **Grupa Wewnętrzna (Internal Testing):** Natychmiastowy dostęp (0 minut oczekiwania na review Apple) dla zespołu deweloperskiego (do 100 osób).
2. **Grupa Zewnętrzna (External Beta):** Publiczny link TestFlight (do 10 000 piwowarów rzemieślniczych) po jednorazowej, automatycznej weryfikacji Beta App Review przez Apple (< 24h).

---

## 4. Deklaracja Prywatności (Apple Privacy Manifest Audit)

W pliku `ios/PrivacyInfo.xcprivacy` zadeklarowano:
- `NSPrivacyTracking`: `false`
- `NSPrivacyCollectedDataTypes`: `[]` (Pusta tablica — brak zbierania jakichkolwiek danych użytkownika).
- `NSPrivacyAccessedAPITypes`:
  - `NSPrivacyAccessedAPICategoryUserDefaults` (kod `CA92.1` — zapamiętywanie lokalnych preferencji jednostek wewnątrz aplikacji).
  - `NSPrivacyAccessedAPICategoryFileTimestamp` (kod `C617.1` — weryfikacja daty modyfikacji lokalnej bazy SQLite i kopii zapasowych).

---
*Zatwierdzono do wdrożenia: Principal App Store Operations Specialist*

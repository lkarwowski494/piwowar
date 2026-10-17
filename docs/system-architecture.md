# Architektura Systemu i Projekt Techniczny (System Architecture & Technical Blueprint)
*Projekt:* Piwowar (Brewcraft)  
*Wersja dokumentu:* 1.0.0-PROD  
*Data:* 2026-10-18  
*Rola:* Principal System Architect & Tech Lead  
*Standard:* Apps4Craft Clean Architecture / Offline-First SQLite WAL  

---

## 1. Architektura Globalna i Clean Architecture

System został zaprojektowany w oparciu o zasady **Czystej Architektury (Clean Architecture)** oraz podział modularny **Feature-Sliced Design**. Warstwa czystej logiki domenowej (fizyka, chemia piwowarska, reguły biznesowe) jest całkowicie odizolowana od frameworka interfejsu (React Native / Expo) oraz mechanizmów składowania danych.

```
┌────────────────────────────────────────────────────────┐
│                   WARSTWA PREZENTACJI (UI)             │
│        Expo Router / React Native Components / Zustand │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│              WARSTWA APLIKACJI I PRZYPADKÓW UŻYCIA     │
│   brewStore, batchStore, equipmentStore, undoStore     │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│                 WARSTWA DOMENOWA (PURE LOGIC)          │
│ lib/brewing: gravity, hydrometer, refractometer, abv,  │
│ bitterness, color, strikeWater, priming, water, scale  │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│              WARSTWA INFRASTRUKTURY I ADAPTERÓW        │
│   SQLite WAL (op-sqlite/expo-sqlite), Tilt BLE,        │
│   BeerXML Parser, Notification Manager, Migrations     │
└────────────────────────────────────────────────────────┘
```

### Podstawowe Zasady Izolacji:
1. **Zero `any`:** 100% kodu TypeScript jest ściśle otypowane (strict: true).
2. **Determinizm Matematyczny:** Wszystkie obliczenia w `lib/brewing/` są funkcjami czystymi (pure functions), przetestowanymi wektorami z `docs/brd/fixtures/test-vectors.json`.
3. **Wall-Clock Invariance:** Żaden timer w aplikacji nie polega na `setInterval` odliczającym w nieskończoność. Stan licznika bazuje na `startTimestamp` i `targetTimestamp` w formacie epoch milliseconds, co gwarantuje poprawność odliczania po uśpieniu telefonu lub zabiciu procesu przez iOS/Android (`S4 Wall-Clock Skew`).

---

## 2. Model Danych SQLite DDL i Silnik Transakcyjny

Baza danych działa w trybie **WAL (Write-Ahead Logging)** z `PRAGMA busy_timeout = 5000` i wymuszonymi kluczami obcymi `PRAGMA foreign_keys = ON`. Chroni to przed uśpieniem procesu w systemie iOS (`0xDEAD10CC` exception).

### Struktura Relacyjna Schematu (`db/schema.sql`):
- `recipes`: Biblioteka receptur piwowara z parametrami zasypu, zacierania, chmielenia i drożdży w formacie znormalizowanym oraz JSON.
- `batches`: Dziennik warek powiązany z recepturami. Zgodnie z `DEC-15`, w momencie utworzenia warki tworzona jest zamrożona migawka (`recipe_snapshot_json`), chroniąca historię przed późniejszymi modyfikacjami receptury bazowej.
- `equipment_profiles`: Zdefiniowane profile instalacji piwowarskiej (objętość garnka, odparowanie %/h, chmieliny, martwa przestrzeń).
- `tilt_readings`: Historyczne odczyty gęstości SG i temperatury ze spławika cyfrowego Tilt BLE z indeksem czasowym.
- `bjcp_styles`: Korpus stylów piwnych BJCP 2021 offline.
- `pending_ops`: Bufor operacji asynchronicznych (Outbox Pattern) dla synchronizacji w tle.
- `schema_migrations`: Rejestr wykonanych kroków migracji bazy danych.

```sql
-- Kluczowe indeksy pod zapytania < 5ms:
CREATE INDEX IF NOT EXISTS idx_batches_status ON batches(status);
CREATE INDEX IF NOT EXISTS idx_batches_brew_date ON batches(brew_date DESC);
CREATE INDEX IF NOT EXISTS idx_tilt_batch_time ON tilt_readings(batch_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_bjcp_category ON bjcp_styles(category_number, style_letter);
```

---

## 3. Zarządzanie Stanem i Reaktywność

Stan aplikacji podzielony jest na wyspecjalizowane magazyny Zustand:
1. `brewStore`: Zarządza sesją aktywnego dnia warzenia. Przechowuje aktualny krok (zacieranie / chmielenie / chłodzenie), sygnatury czasowe, odliczanie stopera oraz listę alertów chmielowych.
2. `batchStore`: Zarządza kolekcją warek w pamięci podręcznej i synchronizuje operacje z repozytorium SQLite.
3. `equipmentStore`: Udostępnia aktywny profil sprzętowy dla silnika kalkulatorów.
4. `undoStore`: Zapewnia natychmiastowe odwracanie operacji niszczących (np. usunięcie warki) za pomocą dolnego paska typu Snackbar („Cofnij”), zapobiegając nieodwracalnej utracie danych (`DEC-03`).

---

## 4. Komunikacja Peryferyjna i Odporność BLE (Tilt Hydrometer)

Integracja ze spławikami Tilt BLE realizowana jest poprzez adapter szeregowy:
- Pasmo iBeacon zgodne ze specyfikacją Baron Brew: UUID identyfikujący kolor spławika (Red, Green, Black, Purple itp.), pole Major = temperatura (°F), Minor = gęstość ($\text{SG} \times 10000$).
- Bezpieczny filtr szumów: średnia ruchoma z ostatnich 3 próbek odrzucająca anomalie falowania brzeczki podczas burzliwej fermentacji.
- Zapis próbek do tabeli `tilt_readings` z interwałem min. 15 minut dla oszczędzania baterii urządzenia i pamięci telefonu.

---

## 5. Zgodność z Wymaganiami NFR i Bezpieczeństwo

1. **Prywatność i RODO:** 100% danych użytkownika pozostaje na urządzeniu w lokalnym pliku SQLite. Aplikacja nie zawiera żadnych SDK śledzących (zero Firebase Analytics, zero Meta Pixel). Deklaracja Apple Privacy Manifest (`PrivacyInfo.xcprivacy`) określa brak gromadzenia danych osobowych (`NSPrivacyCollectedDataType` puste).
2. **Wydajność:** Czas uruchomienia zimnego (Cold Start) $\le 450\,\text{ms}$, czas zapytania bazy danych $\le 5\,\text{ms}$, renderowanie interfejsu w 60/120 FPS.
3. **Bezpieczeństwo Procesowe:** Algorytm *Bottle Bomb Blocker* wstrzymuje rekomendację butelkowania, jeśli ekstrakt końcowy przekracza bezpieczną granicę odfermentowania lub zaplanowana dawka cukru grozi eksplozją szkła.

---

## 6. Rejestr Decyzji Architektonicznych (ADR Matrix)

| ADR ID | Tytuł | Status | Kluczowy Wpływ Techniczny |
| :--- | :--- | :--- | :--- |
| **ADR-001** | Architektura Portfolio i Nazwa | Zatwierdzony | Spójność ze studiem Apps4Craft / Apps4Brew |
| **ADR-002** | Format Wymiany BeerXML 1.0 | Zatwierdzony | Bezstratny import/eksport receptur XML |
| **ADR-003** | Transakcyjny Zapis SQLite i Undo | Zatwierdzony | Zero utraty danych; operacje w transakcjach ACID |
| **ADR-004** | Obsługa Tilt Hydrometer BLE | Zatwierdzony | Bezpośredni odczyt iBeacon bez chmury |
| **ADR-005** | Baza Stylów BJCP 2021 Offline | Zatwierdzony | 120 stylów w tabeli SQLite; brak zapytań HTTP |
| **ADR-006** | Freemium Quota i Apps4Brew Pass | Zatwierdzony | Model 3 darmowych warek + wieczysty Read-Only |
| **ADR-007** | Formuły Goryczki Tinsetha | Zatwierdzony | Standard Glenn Tinseth z pellet factor 1.03 |
| **ADR-008** | Korekcja Refraktometru Terrill | Zatwierdzony | Wielomian Seana Terrilla z WCF = 1.04 |
| **ADR-009** | Rozszerzenie Apple Watch | Zatwierdzony | WatchConnectivity + stoper zacierania |
| **ADR-010** | Parser BeerXML fast-xml-parser | Zatwierdzony | Lekki parser bez zależności DOM |
| **ADR-011** | Profile Sprzętowe Hybrydowe | Zatwierdzony | 3 szablony domyślne + nielimitowane w SQLite |
| **ADR-012** | Strike Water Just-in-Time | Zatwierdzony | Formuła Palmera zintegrowana ze stoperem |
| **ADR-013** | Lokalne Powiadomienia Offline | Zatwierdzony | Expo Notifications bez push tokenów i sieci |
| **ADR-014** | Chemia Wody i Sole Zacierne | Zatwierdzony | 6 jonów, $SO_4/Cl$ oraz dawka kwasu mlekowego 80% |
| **ADR-015** | Zamrożone Migawki Receptur (Snapshot) | Zatwierdzony | `recipe_snapshot_json` w warkach dla archiwum |

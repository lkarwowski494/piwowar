# Procedury Ratunkowe SRE i Circuit Breaker Safe Mode (Production SRE & Disaster Recovery Runbook)
*Projekt:* Piwowar (Brewcraft)  
*Rola:* Principal Site Reliability Engineer & Mobile Crash Forensics Architect  
*Wersja dokumentu:* 1.0.0-PROD  
*Aksjomat:* Zero Utraty Danych ($0 Data Loss Guarantee)  

---

## 1. Architektura Circuit Breaker Safe Mode

W środowisku mobilnym awaria przy starcie (Cold Boot Crash-Loop) odcina użytkownika od możliwości wejścia do ustawień. Aby chronić rzemieślnika przed koniecznością odinstalowania aplikacji i utraty bazy warek, wdrożono **SafeModeCircuitBreaker** (`lib/sre/safeMode.ts`):

```
┌─────────────────────────────────────────────────────────────┐
│ 1. ZIMNY START APLIKACJI                                    │
│    • Inkrementacja licznika awarii w oknie 15 sekund        │
└──────────────────────────────┬──────────────────────────────┘
                               │
               ┌───────────────┴───────────────┐
               │ Licznik awarii >= 3 w 15s?   │
               └───────┬───────────────┬───────┘
                      TAK             NIE
                       │               │
        ┌──────────────▼──────────┐    │
        │ 2. TRYB BEZPIECZNY      │    │
        │ (EMERGENCY SAFE MODE)   │    │
        │ • Zrzut tombstone.json  │    │
        │ • Izolacja bazy SQLite  │    │
        │ • Ekran ratunkowy UI    │    │
        └─────────────────────────┘    │
                                       │
        ┌──────────────────────────────▼──────────────────────┐
        │ 3. NORMALNY START I ZEROWANIE LICZNIKA              │
        │ • markStartupSuccessful() po 15s stabilnej pracy    │
        └─────────────────────────────────────────────────────┘
```

### Struktura Zrzutu Awaryjnego (`crash_tombstone.json`):
```json
{
  "timestamp": "2026-10-18T00:04:10.000Z",
  "consecutiveCrashes": 3,
  "lastErrorMessage": "SQLite disk I/O error or corruption",
  "safeModeTriggered": true
}
```

---

## 2. Funkcje Panelu Awaryjnego (Safe Mode Actions)

Kiedy Circuit Breaker aktywuje tryb awaryjny, aplikacja uruchamia minimalistyczny ekran serwisowy:
1. **[ Eksportuj bazę `piwowar.db` do Plików ]**: Bezpieczne skopiowanie surowego pliku bazy SQLite do pamięci systemowej (iOS Files / Android Documents) lub udostępnienie przez AirDrop.
2. **[ Sprawdź i napraw spójność bazy ]**: Uruchomienie procedury `PRAGMA integrity_check` oraz `REINDEX`.
3. **[ Zresetuj pamięć podręczną interfejsu ]**: Wyczyszczenie stanu Zustand/MMKV bez dotykania relacyjnej bazy SQLite.
4. **[ Uruchom w trybie awaryjnym (Tylko Odczyt) ]**: Odpalenie aplikacji z wyłączonymi procesami w tle i BLE.

---

## 3. Runbook Ratowania Bazy SQLite przy Uszkodzeniu B-Drzewa (.recover)

W przypadku uszkodzenia pliku bazy na skutek nagłego wyłączenia telefonu lub błędu systemu plików, obowiązuje poniższa procedura inżynieryjna:

### Krok 1: Weryfikacja uszkodzenia (Integrity Check)
```sql
PRAGMA integrity_check;
PRAGMA foreign_key_check;
```
Jeśli wynik zwraca błędy inne niż `ok`:

### Krok 2: Uruchomienie narzędzia ratunkowego SQLite `.recover`
Narzędzie `.recover` skanuje cały plik bazy strona po stronie, omijając uszkodzone węzły B-drzewa i rekonstruując maksymalną ilość poprawnych rekordów:

```bash
# Wyciągnięcie bazy z urządzenia i rekonstrukcja SQL:
sqlite3 piwowar_corrupted.db ".recover" > piwowar_recovered.sql

# Inicjalizacja nowej, czystej bazy danych z odzyskanego zrzutu:
sqlite3 piwowar_clean.db < piwowar_recovered.sql

# Weryfikacja nowej bazy:
sqlite3 piwowar_clean.db "PRAGMA integrity_check;"
```

### Krok 3: Przywrócenie trybu WAL i indeksów
```sql
PRAGMA journal_mode = WAL;
PRAGMA busy_timeout = 5000;
REINDEX;
```

---

## 4. Procedura Fast-Track Hotfix & Expedited Review

Gdy w produkcji wystąpi awaria poziomu `P0` (crash-loop):
1. **Wdrożenie testu regresyjnego:** Napisanie testu odtwarzającego błąd w `tests/`.
2. **Chirurgiczny commit:** Podbicie wersji Patch (np. `1.0.1`) i commit.
3. **Kompilacja i wysyłka do App Store Connect:**
   ```bash
   eas build --platform ios --profile production --auto-submit
   ```
4. **Złożenie wniosku o Apple Expedited Review:**
   - W formularzu kontaktowym App Store Connect wybierz: *Request Expedited App Review*.
   - Wpisz uzasadnienie: *„Critical P0 startup crash on specific iOS devices affecting active fermentation logs. Patch 1.0.1 resolves the issue with zero data loss.”*
   - Czas reakcji Apple: zwykle 2–4 godziny.

---
*Zatwierdzono: Principal Site Reliability Engineer & Mobile Crash Forensics Architect*

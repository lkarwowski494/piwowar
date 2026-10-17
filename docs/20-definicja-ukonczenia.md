# 9-Warstwowa Definicja Ukończenia (DoD — Definition of Done)
*Projekt:* Piwowar (Brewcraft)  
*Rola:* Senior Software Engineer & Feature Implementation Lead  
*Wersja dokumentu:* 1.0.0-PROD  
*Aksjomat:* Zero Fałszywego Poczucia Bezpieczeństwa (Zero False Confidence)  

---

Funkcjonalność w projekcie Piwowar (Brewcraft) uznaje się za ukończoną (DONE) **wyłącznie wtedy**, gdy spełnia wszystkie 9 komplementarnych warstw weryfikacji inżynieryjnej:

```
┌─────────────────────────────────────────────────────────────┐
│ WARSTWA 9: E2E na Symulatorze (Scenariusz Maestro YAML)     │
├─────────────────────────────────────────────────────────────┤
│ WARSTWA 8: Testy Regresyjne (TDD Red -> Green dla usterek)  │
├─────────────────────────────────────────────────────────────┤
│ WARSTWA 7: Wielojęzyczność (35 języków, symetria parametrów)│
├─────────────────────────────────────────────────────────────┤
│ WARSTWA 6: Trwałość Danych (Prawdziwy SQLite WAL, migracje) │
├─────────────────────────────────────────────────────────────┤
│ WARSTWA 5: Niezmienniki Matematyczne (PBT, symetria wzorów) │
├─────────────────────────────────────────────────────────────┤
│ WARSTWA 4: Macierz Wymiarów (Wszystkie trasy Expo Router)   │
├─────────────────────────────────────────────────────────────┤
│ WARSTWA 3: Pełne Scenariusze Użytkownika (Proces Warzenia)  │
├─────────────────────────────────────────────────────────────┤
│ WARSTWA 2: Ekran i Komponenty UI (Kontrakty ≥ 56pt, A11Y)   │
├─────────────────────────────────────────────────────────────┤
│ WARSTWA 1: Czysta Logika Domenowa (Zero Any, Pure Functions)│
└─────────────────────────────────────────────────────────────┘
```

---

## Szczegółowe Kryteria 9 Warstw:

### 1. Warstwa 1: Logika Domenowa i Chemia Piwowarska
- 100% funkcji w `lib/brewing/` to funkcje czyste (Pure Functions) bez efektów ubocznych.
- Pokrycie testami wektorów deterministycznych `tests/brewing.test.ts` (32 wektory brzegowe).
- Rygorystyczna obsługa zera, wartości ujemnych i zaokrągleń rzemieślniczych (C9).

### 2. Warstwa 2: Komponenty UI i Dostępność
- Przyciski dotykowe w strefie kciuka mają wysokość `minHeight: 56pt` (C5).
- Kontrast barw tekstu i tła spełnia normę WCAG AAA $\ge 7:1$.
- Każdy komponent posiada atrybuty semantyczne `accessibilityRole` i `accessibilityLabel`.

### 3. Warstwa 3: Pełne Scenariusze Użytkownika
- Przejście całego Dnia Warzenia: Zacieranie ➔ Gotowanie ➔ Chmielenie ➔ Chłodzenie bez utraty stanu.
- Obsługa KeepAwake (C12) i odporność na uśpienie telefonu (`S4 Wall-Clock Invariance`).

### 4. Warstwa 4: Macierz Tras i Wymiarów
- Wszystkie 5 zakładek nawigacji dolnej (`brew`, `batches`, `recipes`, `calculators`, `settings`) renderują się bezbłędnie.
- Płynne przejścia w 60 FPS na urządzeniach mobilnych.

### 5. Warstwa 5: Niezmienniki Matematyczne i PBT
- Symetria konwersji ASBC Plato ↔ SG: $f(f^{-1}(x)) = x$ w granicach $\pm 0.0001$.
- Monotoniczność spadku gęstości w trakcie fermentacji.

### 6. Warstwa 6: Trwałość Danych i SQLite WAL
- Transakcyjny zapis w SQLite WAL z `PRAGMA busy_timeout = 5000` (C2).
- Zero Partial Writes — operacje wielotabelowe objęte `withTransactionAsync`.
- Nienaruszalne migawki receptur (`DEC-15`) i bezpieczne migracje `v1 -> v2`.

### 7. Warstwa 7: Wielojęzyczność 35 Języków
- 100% kluczy wyekstrahowanych do `_source.json` (77 kluczy).
- Walidacja symetrii parametrów `{...}` we wszystkich 35 plikach słowników `lib/locales/*.json` za pomocą `scripts/check-i18n.mjs`.

### 8. Warstwa 8: Testy Regresyjne
- Blokada Bottle Bomb Blocker (`VEC-BOT-03`) przy próbie butelkowania piwa o gęstości $> FG$ lub dawce cukru $> 9.5\,\text{g/L}$.
- Precyzja Tinseth z pellet factor 1.03 chroniąca przed niedochmieleniem.

### 9. Warstwa 9: Testy E2E na Symulatorze (Maestro)
- Automatyczny scenariusz `.maestro/01-brew-flow.yaml` weryfikujący krytyczną ścieżkę użytkownika.

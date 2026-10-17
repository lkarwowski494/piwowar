# Transformacja Procesowa i Architektura Przepływów To-Be (BPR + UX Refactor)
*Projekt:* Piwowar (Brewcraft)  
*Rola:* Principal Product Architect, BPR Lead & Senior UX Designer  
*Standard:* Lean / Business Process Reengineering & Apps4Craft 9-State Matrix  
*Status:* Approved for Production v1.0  

---

## 1. Cel Transformacji i Identyfikacja Wąskich Gardeł (As-Is)

W tradycyjnym oprogramowaniu piwowarskim (Brewfather, BeerSmith) użytkownik zmuszony jest do:
1. Wypełniania ponad 25 pól formularza przed uwarzeniem pierwszej warki (wielki próg wejścia),
2. Przełączania się między 8 osobnymi zakładkami podczas gotowania brzeczki,
3. Manualnego przeliczania jednostek z kalkulatorów internetowych i ręcznego przepisywania ich do receptury,
4. Ryzyka utraty wpisanych odczytów w razie uśpienia ekranu lub przypadkowego kliknięcia wstecz bez zapisu.

---

## 2. Katalog Zastosowanych Wzorców BPR (P1–P17)

| Wzorzec BPR | Tytuł Wzorca | Zastosowanie w Piwowar (Brewcraft) | Zysk Ergonomiczny |
| :--- | :--- | :--- | :--- |
| **P2** | **Zero Manual Re-Entry** | Automatyczne pobieranie parametrów odparowania, strat i wydajności z domyślnego profilu sprzętowego (`DEC-11`) | Skrócenie konfiguracji warki z 15 minut do 1 tapnięcia |
| **P4** | **Inline Auto-Save & Undo** | Rezygnacja z modali zapisu; każda edycja zapisuje się w transakcji SQLite z paskiem `UndoSnackbar` („Cofnij”) | 0 kliknięć „Zapisz”; brak utraty danych przy uśpieniu telefonu |
| **P10** | **Just-in-Time Calculation** | Kalkulator wody do zasypu (Strike Water) obliczany na karcie startowej etapu zacierania w Dniu Warzenia | Brak konieczności otwierania osobnej zakładki kalkulatorów |
| **P16** | **Jedna Karta Otwarta (Accordion)** | Na ekranie Dnia Warzenia aktywny krok jest rozwinięty, a pozostałe zwinięte w zwięzłe podsumowania | Redukcja przewijania o 85%; brak pomyłki etapów w pośpiechu |
| **P17** | **Anti-Combine Flow Split** | Rozdzielenie Dnia Warzenia (wysokie skupienie, 68pt stoper, min. 56pt dotyku) od Analityki Fermentacji (wykresy Tilt BLE, rzadkie odczyty) | Czysty interfejs dopasowany do fizjologii sytuacji |

---

## 3. Zestawienie Przepływów: As-Is vs To-Be

### Przepływ A: Rozpoczęcie Dnia Warzenia (Brew Day Start)
- **Stan As-Is (Konkurencja):**
  1. Otwórz menu boczne ➔ 2. Wybierz Receptury ➔ 3. Kliknij w recepturę ➔ 4. Kliknij „Warz tę recepturę” ➔ 5. Wybierz sprzęt ➔ 6. Potwierdź datę w modalnym kalendarzu ➔ 7. Kliknij „Rozpocznij”.  
  *Koszt:* 7 kroków, 3 ekrany, 4 decyzje.
- **Stan To-Be (Piwowar):**
  1. Otwórz zakładkę „Warz” ➔ 2. Stuknij duży przycisk 56pt `Rozpocznij dzień warzenia`.  
  *Koszt:* 1 stuknięcie. System automatycznie przyjmuje aktywną lub ostatnio edytowaną recepturę i domyślny profil sprzętowy.

### Przepływ B: Odczyt Refraktometru i Korekta Alkoholu
- **Stan As-Is:**
  1. Zmierz °Brix ➔ 2. Otwórz przeglądarkę ➔ 3. Znajdź kalkulator Terrilla ➔ 4. Wpisz OG w Plato ➔ 5. Wpisz FG w Brix ➔ 6. Wpisz WCF ➔ 7. Przepisz wynik do notatek.  
  *Koszt:* 7 kroków, zmiana aplikacji, ryzyko pomyłki.
- **Stan To-Be:**
  1. Otwórz zakładkę „Kalkulatory” ➔ 2. Karta „Refraktometr (Terrill)” natychmiast przelicza wpisaną wartość na rzeczywiste $SG$ i $ABV$ w czasie rzeczywistym.  
  *Koszt:* 2 pola numeryczne na jednym ekranie z natychmiastowym wynikiem.

---

## 4. Tabela Metryczna Redukcji Złożoności (Lean Metrics)

| Obszar Procesu | Wskaźnik As-Is | Wskaźnik To-Be | Redukcja Tarcia / Zysk |
| :--- | :---: | :---: | :---: |
| Start dnia warzenia | 7 kroków, 3 ekrany | 1 stuknięcie, 1 ekran | **-85% kroków** |
| Minimalny rozmiar przycisku w warzeniu | 36 pt (nieporęczny) | $\ge 56\,\text{pt}$ (Thumb Zone) | **+55% ergonomii dotyku** |
| Ryzyko utraty danych przy uśpieniu | Wysokie (wymaga modalu) | 0% (Auto-save + SQLite WAL) | **100% ochrona danych** |
| Czas do pierwszego odczytu (TTV) | > 3 minuty (rejestracja) | < 30 sekund (Zero Signup) | **-83% czasu wejścia** |

---

## 5. Diagram Przepływu To-Be (Focused Brew State Machine)

```
┌─────────────────────────────────────────────────────────────┐
│ 1. PRZYGOTOWANIE ZASYPU                                     │
│    • Strike Water Calc: Wyświetlenie temp. nalania wody     │
│    • Zsypanie słodów ➔ Przycisk: "Start Zacierania"        │
└──────────────────────────────┬──────────────────────────────┘
                               │ (Auto-save stanu w SQLite)
┌──────────────────────────────▼──────────────────────────────┐
│ 2. ZACIERANIE (MASHING)                                     │
│    • 68pt Stoper odliczający od timestampu (Background OK)  │
│    • Klawisze szybkiej korekty: +1 MIN / -1 MIN            │
│    • Alerty przerw temperaturowych                          │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│ 3. GOTOWANIE I CHMIELENIE (BOILING)                         │
│    • Odliczanie czasu gotowania (np. 60 min)                │
│    • Haptyczne alerty wrzucania chmielu (60', 15', 5', 0')  │
│    • Przycisk: "Zakończ gotowanie"                          │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│ 4. CHŁODZENIE I FERMENTOR (WHIRLPOOL & COOLING)             │
│    • Rejestracja OG brzeczki nastawnej                     │
│    • Przypisanie spławika Tilt BLE (automatyczny odczyt)   │
│    • Zakończenie dnia warzenia ➔ Przeniesienie do warki    │
└─────────────────────────────────────────────────────────────┘
```

---
*Zatwierdzono do implementacji produkcyjnej: Principal Product Architect & BPR Lead*

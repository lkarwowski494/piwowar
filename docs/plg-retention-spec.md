# Specyfikacja Wzrostu Sterowanego Produktem i Retencji (PLG & Retention Specification)
*Projekt:* Piwowar (Brewcraft)  
*Rola:* Principal Product-Led Growth (PLG) Architect & Retention Engineer  
*Wersja dokumentu:* 1.0.0-PROD  
*Standard:* Zero-Tracker Private Analytics / Craft Hook Model / TTV < 60s  

---

## 1. Architektura Natychmiastowego Time-To-Value (TTV < 60s)

Aplikacja eliminuje jakiekolwiek ekrany blokujące, modale samouczka czy rejestrację konta (Zero-Modal First Run):
- **Sekunda 0–3:** Aplikacja uruchamia się bezpośrednio do pulpitu z preinstalowaną recepturą startową („American Pale Ale — Pierwsza Warka”) i domyślnym profilem sprzętowym.
- **Sekunda 10–20:** Użytkownik może stuknąć jeden duży przycisk 56pt `Rozpocznij dzień warzenia` lub wejść w kalkulator i zmienić wartość refraktometru — wynik aktualizuje się w czasie rzeczywistym.
- **Aha! Moment:** Piwowar widzi wyliczoną temperaturę Strike Water bez szukania wzorów oraz natychmiastowy stoper zacierania z cyframi 68pt widocznymi z drugiego końca kuchni.

---

## 2. Model Pętli Nawyku Rzemieślnika (The Craft Hook)

```
             ┌──────────────────────────────────────────────┐
             │            1. WYZWALACZ (TRIGGER)             │
             │ Zewnętrzny: Zaplanowany dzień warzenia       │
             │ Wewnętrzny: Obawa przed zepsuciem warki      │
             └──────────────────────┬───────────────────────┘
                                    │
             ┌──────────────────────▼───────────────────────┐
             │             2. DZIAŁANIE (ACTION)            │
             │ 1 tap: "Start Warzenia" lub odczyt gęstości  │
             └──────────────────────┬───────────────────────┘
                                    │
             ┌──────────────────────▼───────────────────────┐
             │       3. ZMIENNA NAGRODA (VARIABLE REWARD)   │
             │ Spokój: Dokładne IBU, brak wykipienia,       │
             │ ochrona przed Bottle Bomb, idealne piwo      │
             └──────────────────────┬───────────────────────┘
                                    │
             ┌──────────────────────▼───────────────────────┐
             │            4. INWESTYCJA (INVESTMENT)        │
             │ Zapis partii w Dzienniku Warek, wykres Tilt, │
             │ notatka degustacyjna, kalibracja sprzętu     │
             └──────────────────────────────────────────────┘
```

---

## 3. Lokalny Rejestr Aktywności SQLite (`user_activity_days`)

Zgodnie z zasadą pełnej prywatności (Zero-Tracker Mandate), aplikacja nie wysyła zdarzeń analitycznych do chmury. Monitorowanie retencji i regularności opiera się na lokalnej tabeli relacyjnej:

```sql
CREATE TABLE IF NOT EXISTS user_activity_days (
  activity_date TEXT PRIMARY KEY,
  actions_count INTEGER NOT NULL DEFAULT 1,
  last_action_type TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

### Zastosowanie:
- Wyliczanie lokalnych wskaźników aktywności użytkownika.
- Personalizacja powiadomień bez ujawniania tożsamości piwowara.
- Odblokowywanie odznak mistrzowskich za staż w rzemiośle (np. „10 uwarzonych warek”).

---

## 4. Harmonogram Lokalnych Powiadomień Offline (Offline Smart Push)

Powiadomienia są planowane natywnie w systemie (`UNUserNotificationCenter` w iOS / `AlarmManager` w Androidzie). Obowiązuje **Ścisła Cisza Nocna (Quiet Hours 22:00–08:00)** — żadne powiadomienie nie ma prawa obudzić użytkownika w nocy.

| Dzień Cyklu | Etap Warki | Treść Powiadomienia | Cel Rzemieślniczy |
| :---: | :--- | :--- | :--- |
| **D +3** | Fermentacja burzliwa | *„Warka #{{n}}: Drożdże pracują najintensywniej. Sprawdź temperaturę otoczenia fermentora.”* | Zapobieganie przegrzaniu i fuzlom |
| **D +7** | Chmielenie na zimno (Dry Hop) | *„Czas na chmielenie na zimno! Dodaj chmiel aromatyczny, aby uzyskać świeże nuty cytrusowe.”* | Kluczowy moment ekstrakcji aromatów |
| **D +14** | Pomiary końcowe (FG) | *„Fermentacja powinna dobiegać końca. Zmierz gęstość areometrem lub sprawdź odczyt Tilt BLE.”* | Przygotowanie do cold crashu |
| **D +18** | Butelkowanie | *„Piwo jest gotowe do rozlewu. Użyj kalkulatora refermentacji, aby uniknąć granatów!”* | Ochrona przed Bottle Bomb |
| **D +32** | Degustacja pierwszej butelki | *„Dwa tygodnie od rozlewu: Twoje piwo jest nagazowane i gotowe do pierwszej oceny sensorycznej!”* | Moment zachwytu i celebracja sukcesu |

---

## 5. Strategia Retencji D1, D7, D30 i Fosa Danych (Data Moat)

1. **D1 (Następny dzień po warzeniu):** Subtelne przypomnienie o wpisaniu gęstości nastawnej OG w dzienniku, jeśli pole pozostało puste.
2. **D7 (Tydzień po warzeniu):** Raport dynamiki fermentacji na podstawie odczytów Tilt BLE lub ręcznych próbek.
3. **D30 (Miesiąc w rzemiośle):** Karta podsumowania miesiąca z ilością uwarzonego piwa w litrach.
4. **Fosa Danych (Personal Data Moat):** Każda kolejna warka zapisana w lokalnej bazie danych buduje bezcenną historię parametrów sprzętu i profilu fermentacji. Użytkownik nie chce porzucić aplikacji, ponieważ zawiera ona całe jego piwowarskie archiwum.

---
*Zatwierdzono do implementacji: Principal PLG Architect & Retention Engineer*

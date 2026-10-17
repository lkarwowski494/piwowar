# Piwowar (Brewcraft) — Sprzeczności Dziedzinowe, Errata i Otwarte Kwestie Badawcze

Podczas inżynierii wymagań zidentyfikowano rozbieżności w literaturze piwowarskiej (Palmer vs Kunze vs Daniels vs ASBC) oraz niejednoznaczności normatywne. Niniejszy tom stanowi formalną erratę dla Architekta Systemu i Programistów.

---

## 1. Sprzeczności w Formułach Obliczania Goryczki (IBU)

### Problem: Rozbieżność wyników Tinseth vs Rager
- **Stan wiedzy:** Wzór Glenna Tinsetha opiera się na badaniach utylizacji chmielu w brzeczce o zróżnicowanej gęstości w warunkach domowych. Formuła Jackie Ragera zakłada wyższą utylizację przy niskich gęstościach i stosuje skokową korektę grawitacji powyżej 1.050 SG.
- **Różnica w wynikach:** Dla tego samego chmielenia (np. 50g chmielu 10% AA w 20L brzeczki 1.070 SG) Tinseth wylicza 42 IBU, a Rager aż 58 IBU!
- **Rozstrzygnięcie erraty (D-03):** 
  - Standardem domyślnym aplikacji Piwowar jest **formuła Tinsetha**, powszechnie uznawana przez ASBC i BJCP za najbliższą pomiarom spektrofotometrycznym piw rzemieślniczych.
  - Formuła Ragera jest dostępna jako opcjonalny przełącznik w ustawieniach z jasną adnotacją: *„Rager generuje wyniki wyższe o 15–30% i był standardem w literaturze lat 90.”*.

---

## 2. Refraktometr w Obecności Etanolu

### Problem: Błąd liniowych przeliczników
- **Stan wiedzy:** Wielu piwowarów używa prostego przelicznika $\text{Brix} \approx \text{Plato}$ przez cały okres fermentacji. Po wytworzeniu alkoholu (etanol ma niższy współczynnik załamania światła niż woda i cukier) refraktometr pokazuje fałszywie zawyżone odczyty (np. 7.5 °Brix zamiast rzeczywistych 2.5 °Plato). Użycie prostego dzielnika przez 1.04 daje błąd do 30% ABV!
- **Rozstrzygnięcie erraty (D-04):** 
  - Bezwzględny zakaz stosowania uproszczonych formuł liniowych.
  - Implementacja wielomianu 2. stopnia **Seana Terrilla** z Wort Correction Factor $\text{WCF}=1.04$, zwalidowana wektorami testowymi `VEC-REF-01…03`.

---

## 3. Przeliczanie Gęstości SG a °Plato / °Balling

### Problem: Plato vs Balling vs SG
- **Stan wiedzy:** Skala Ballinga (°Blg) bazuje na roztworach sacharozy w temperaturze 17.5°C. Skala Plato (°P) została udoskonalona przez Kaisera i znormalizowana na 20°C. Skala SG (Specific Gravity) jest bezwymiarowym stosunkiem gęstości do czystej wody w 20°C.
- **Rozstrzygnięcie erraty (D-01):**
  - Dla celów praktyki piwowarskiej w zakresie 0–25° różnica między °Blg a °P wynosi $< 0.05$ stopnia i jest pomijalna dla piwowara domowego.
  - Wewnętrznie baza SQLite przechowuje wartości jako precyzyjne `SG` (z dokładnością do 4 miejsc po przecinku: np. 1.0520), a interfejs przelicza je dynamicznie według formuły wielomianowej Lincolna (ASBC).

---

## 4. Temperatura Refermentacji a Rozpuszczony CO₂

### Problem: Temperatura rozlewu vs najwyższa temperatura fermentacji
- **Stan wiedzy:** Większość kalkulatorów pyta o „temperaturę piwa podczas butelkowania”. Jeśli piwo fermentowało w 20°C, a przed rozlewem zostało schłodzone do 2°C (Cold Crash), w piwie NIE MA więcej rozpuszczonego $CO_2$, ponieważ gazy nie rozpuszczają się z próżni w zamkniętym fermentorze! Podanie temperatury 2°C spowoduje zaniżenie dawki cukru i piwo będzie niedogazowane.
- **Rozstrzygnięcie erraty (D-06):**
  - Formularz kalkulatora precyzuje: *„Podaj najwyższą temperaturę, jaką piwo osiągnęło po zakończeniu fermentacji burzliwej (zazwyczaj 18–22°C, nawet jeśli zastosowano Cold Crash)”*.

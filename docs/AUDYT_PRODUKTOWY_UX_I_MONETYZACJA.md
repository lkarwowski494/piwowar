# Strategia Monetyzacji, Audyt UX i Prognozy Przychodowe M1–M12: Piwowar (Brewcraft)

> **Status:** Zatwierdzony przez Właściciela Produktu (ETAP 2)  
> **Autor:** Principal Monetization & Product Strategy Architect, Behavioral Pricing Economist  
> **Data audytu:** 17.10.2026  
> **Platforma:** iOS, watchOS, Android (React Native / Expo, SQLite WAL)  

---

## 1. Rekomendowana Architektura Monetyzacji i Cennik

### Rozstrzygnięcie Dylematu DEC-06 (Złoty Standard Freemium Quota + Read-Only)
Wstępny pomysł z BRD (nielimitowane warki za darmo, płatny tylko Tilt BLE i Watch) został jednoznacznie zidentyfikowany jako **bloker przychodu**, odcinający aplikację od 80% płacących piwowarów. Zamiast tego wdrażamy **sprawdzony model studia Apps4Craft**:

1. **Bezpłatny Pakiet Powitalny (Onboarding Quota):**
   - Każdy użytkownik po instalacji otrzymuje **3 pierwsze warki w 100% odblokowane w standardzie Pro**.
   - W ramach tych 3 warek ma nielimitowany dostęp do Tilt BLE, Apple Watch, zaawansowanego profilowania wody i stopera warzenia.
   - Buduje to potężny kapitał danych (*Switching Cost*) i doprowadza do zachwytu produktem (*Aha! Moment*).
2. **Etyczna Blokada i Nienaruszalne Archiwum (Zasada 12):**
   - Po uwarzeniu 3 warek, tworzenie 4. warki wymaga aktywacji **Apps4Brew Pass**.
   - **Żelazna zasada rzemieślnicza:** Dotychczasowe warki, historia, notatki degustacyjne, import/eksport BeerXML oraz podstawowe kalkulatory (refraktometr, gęstość, ABV) pozostają **na zawsze bezpłatne w trybie Read-Only / Basic**. Użytkownik nigdy nie traci dostępu do swoich danych!

### Struktura Cenowa („Cheaper than Craft Beer”):

| Wariant Planu | Cena Globalna | Cena w Polsce | Psychologiczna Kotwica Cenowa | Rola w Lejku Monetyzacji |
|---|---|---|---|---|
| **Subskrypcja Miesięczna** | **0,99 € / mc** | **3,99 zł / mc** | Mniej niż drożdże piekarskie/piwowarskie | Niski próg wejścia dla piwowarów warzących zrywami (sezon jesienno-zimowy). |
| **Subskrypcja Roczna** *(Wyróżniony)* | **4,99 € / rok** | **19,99 zł / rok** | **„Mniej niż jedno piwo rzemieślnicze rocznie”** | **Główny motor ARR (Najpopularniejszy)** — zapewnia stabilny, odnawialny strumień gotówki. |
| **Zakup Dożywotni (Lifetime)** | **14,99 € raz** | **59,99 zł raz** | Równowartość 4 piw w pubie kraftowym | **Kotwica cenowa i zastrzyk gotówki w M1** — odpowiada za 45–55% przychodu startowego wśród pasjonatów. |

---

## 2. Macierz Uprawnień: Free vs Trial vs Pro vs Read-Only

| Moduł / Akcja w Aplikacji | Free (Po limicie) | Trial (3 pierwsze warki) | Apps4Brew Pass Pro |
|---|---|---|---|
| Podstawowe kalkulatory (refraktometr Terrilla, areometr, ABV, IBU) | ✅ Pełny dostęp | ✅ Pełny dostęp | ✅ Pełny dostęp |
| Przeglądanie bazy 100+ stylów BJCP 2021 offline | ✅ Pełny dostęp | ✅ Pełny dostęp | ✅ Pełny dostęp |
| Eksport i kopia zapasowa JSON / import receptury BeerXML 1.0 | ✅ Pełny dostęp | ✅ Pełny dostęp | ✅ Pełny dostęp |
| Przeglądanie historii, notatek i wykresów zarchiwizowanych warek | ✅ **Read-Only** | ✅ Pełny dostęp | ✅ Pełny dostęp |
| **Rozpoczęcie nowej warki (Dzień Warzenia)** | 🔒 Wymaga Pro | ✅ Do 3 warek | ✅ **Nielimitowane** |
| **Bezpośredni odczyt cyfrowego spławika Tilt BLE** | 🔒 Wymaga Pro | ✅ Pełny dostęp | ✅ **Pełny dostęp** |
| **Zaawansowane profilowanie soli wody ($SO_4/Cl$) i pH** | 🔒 Wymaga Pro | ✅ Pełny dostęp | ✅ **Pełny dostęp** |
| **Dedykowany stoper i wibracje na Apple Watch** | 🔒 Wymaga Pro | ✅ Pełny dostęp | ✅ **Pełny dostęp** |
| **Moduł Split-Batch (dzielenie warki na 2 fermentory)** | 🔒 Wymaga Pro | ✅ Pełny dostęp | ✅ **Pełny dostęp** |
| **Doctor Wad Piwa (Recepty naprawcze i autodiagnoza)** | 👁️ Tylko podgląd wad | ✅ Pełne recepty | ✅ **Pełny dostęp** |

---

## 3. Matryca Zmian Produktowych BPR (Cięcia, Uproszczenia, Wzrost)

### ✂️ DO WYCIĘCIA (Kill List / Zasada Słoika — wzorzec M17):
1. **Wewnętrzny portal społecznościowy / czat piwowarski:** Odrzucony definitywnie (Z-055). Generuje potężny koszt serwerowy, rozprasza uwagę piwowara i przegrywa z forami (piwo.org, reddit).
2. **Konta chmurowe i backend SaaS:** Wycięte (Z-056). Lokalny SQLite eliminuje koszty chmury do 0,00 USD.
3. **Reklamy bannerowe:** Zakazane (Z-057). Zysk z reklam byłby znikomy ($0.20 RPM), a zrujnowałby prestiż i zaufanie rzemieślników.
4. **Encyklopedyczne elaboraty botaniczne na ekranie głównym:** Teoria genetyki chmielu schowana do bazy wiedzy, ekran główny skupiony na warzeniu.

### 🪗 DO UKRYCIA / UPROSZCZENIA (Progressive Disclosure):
1. **Złożony edytor 20 parametrów sprzętowych:** Domyślnie aktywny uproszczony setup z 3 szablonami (BIAB 20L, kociołek 30L, 3-naczyniowy). Pełna edycja laboratoryjna przeniesiona do Ustawień (`DEC-11`).
2. **Kalkulator Strike Water:** Zintegrowany jako automatyczny kafelek na starcie zacierania (Just-in-Time), zamiast osobnego, skomplikowanego formularza (`DEC-12`).

### 🚀 DO WYEKSPONOWANIA (Growth & Retention Catalysts):
1. **Pętla Wirusowa (Viral Craft Card):** 1-klikowe generowanie pięknej karty warki PNG/PDF do udostępnienia na Instagramie/forach z dyskretnym podpisem: *„Uwarzone z Piwowar (Brewcraft)”*.
2. **Widżet Ekonomii Rzemiosła (Craft Economy Widget):** Na podsumowaniu warki licznik: *„Koszt warki 20L: 65 zł. Oszczędność względem piwa kraftowego w pubie: ~235 zł”*.
3. **Natychmiastowy Aha! Moment:** Import receptury BeerXML z pliku pobranego z sieci w $< 500\,\text{ms}$ z natychmiastowym przeliczeniem parametrów.

---

## 4. Trzyletnie i Roczne Prognozy Finansowe (M1, M3, M6, M12)

### Założenia Modelu:
- **Koszty stałe:** 99 USD rocznie (Apple Developer Program), 0,00 USD serwery (Offline-First).
- **Prowizja platformy:** 15% (Apple Small Business Program / Google Play 15% tier).
- **Podział koszyka płatności:** 45% Subskrypcja Roczna (4,99 €), 40% Zakup Dożywotni Lifetime (14,99 €), 15% Subskrypcja Miesięczna (0,99 €).
- **Średni churn miesięczny subskrypcji:** 6% (niski, ze względu na wielotygodniowy cykl fermentacji piwa).

### Tabela Prognoz w 3 Scenariuszach:

| Wskaźnik Finansowy | Scenariusz 1: Konserwatywny *(Organic Only)* | Scenariusz 2: Bazowy *(ASO + Piwo.org + Reddit)* | Scenariusz 3: Ambitny *(Featured + Wiralny BeerXML)* |
|---|---|---|---|
| **Pobrania M1 (Launch Month)** | 450 | 1 600 | 4 800 |
| **Aktywacje (Warzący $\ge 1$ warkę)** | 270 (60%) | 1 040 (65%) | 3 360 (70%) |
| **Płatni Użytkownicy M1 (CR: 3.5% / 5.0% / 6.5%)** | 16 | 80 | 312 |
| **Przychód Brutto M1** | 148 € (~640 zł) | 738 € (~3 200 zł) | 2 878 € (~12 500 zł) |
| **Przychód Netto M1 (po prowizji 15%)** | **126 € (~545 zł)** | **627 € (~2 720 zł)** | **2 446 € (~10 600 zł)** |
| **Status Break-Even w M1** | **POKRYTY w 1. MIESIĄCU!** | **POKRYTY z 6-krotnym zyskiem** | **POKRYTY z 26-krotnym zyskiem** |
| | | | |
| **Pobrania Skumulowane (M1–M12)** | 5 200 | 21 000 | 65 000 |
| **Łączna liczba płacących klientów (12M)** | 234 | 1 155 | 4 550 |
| **Skumulowany Przychód Brutto (12M)** | 2 158 € (~9 350 zł) | 10 655 € (~46 200 zł) | 41 975 € (~182 000 zł) |
| **Skumulowany Cashflow Netto (12M Net)** | **1 834 € (~7 950 zł)** | **9 056 € (~39 300 zł)** | **35 678 € (~154 700 zł)** |
| **ARR na koniec 12. miesiąca** | **840 € / rok** | **4 150 € / rok** | **16 350 € / rok** |

---

## 5. Plan Wdrożenia Technicznego Monetyzacji (Dla Programisty)

1. **Implementacja Serwisu Uprawnień (`lib/access.ts`):**
   - Licznik ukończonych warek zapisywany atomowo w SQLite (`SELECT COUNT(*) FROM batches WHERE status != 'planning'`).
   - Reaktywny hook Zustand `useAppAccess()` zwracający `{ isPro, freeBatchesRemaining, canCreateBatch, canUseTilt, canUseWatch }`.
2. **Zabezpieczenie Ścieżek Zapisu (Mutation Guards):**
   - Weryfikacja uprawnień przy kliknięciu `[ Rozpocznij nową warkę ]`. Jeśli `batchesCount >= 3` i `!isPro`, otwarcie `PaywallModal`.
   - Zabezpieczenie parowania Tilt BLE oraz eksportu na Apple Watch.
3. **Architektura Paywalla (`components/PaywallModal.tsx`):**
   - 3 przejrzyste kafle: Miesięczny (3,99 zł), Roczny (19,99 zł z etykietą „Najpopularniejszy”), Dożywotni (59,99 zł).
   - Przycisk `[ Przywróć zakupy ]` oraz bezpośredni link do polityki prywatności i regulaminu (zgodność z Apple Guideline 3.1.2).
4. **Testy Automatyczne Bramki:**
   - Test jednostkowy: próba utworzenia 4. warki bez uprawnień rzuca błąd `PAYWALL_REQUIRED`.
   - Test odporności: funkcja `restorePurchases()` bez ważnego paragonu StoreKit 2 nie odblokowuje statusu Pro.

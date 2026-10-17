# Piwowar (Brewcraft) — Tom A3a: Tabela Zakresu Funkcjonalnego (Część 1 — Warzenie, Kalkulatory, Woda)

---

## Tabela Zakresu Funkcjonalnego (Z-001…Z-020)

| ID | Obszar / Funkcja | Szczegółowy Zakres Merytoryczny | Etap | Nakład (Agent / Właściciel) | Uzasadnienie Biznesowe i Rzemieślnicze |
|---|---|---|---|---|---|
| **Z-001** | **Brew: Stoper Zacierania** | Wieloetapowy stoper przerw (białkowa, maltozowa, dekstrynująca, mash-out) z dźwiękiem PCM i powiadomieniem. | **MVP** | 1.0d / 15m | Kluczowy element dnia warzenia (P1, P3). |
| **Z-002** | **Brew: Stoper Chmielenia** | Odliczanie 60/90 min gotowania z sekwencją alarmów wrzucania chmielu (np. 60', 30', 15', 5', 0'). | **MVP** | 0.8d / 10m | Ochrona przed przegapieniem chmielenia aromatycznego (P3, P6). |
| **Z-003** | **Brew: Chmielenie Whirlpool** | Dedykowany stoper chłodzenia i osadzania chmielin (np. 80°C przez 20 min) z wyliczaniem IBU w podwyższonej temperaturze. | **MVP** | 0.5d / 10m | Standard dla stylów IPA, NEIPA i APA (P2). |
| **Z-004** | **Brew: Kitchen-Proof Thumb Zone** | Dolny pas przycisków sterujących ($\ge 52\,\text{pt}$): Pauza, Następny krok, +1 min, -1 min. | **MVP** | 0.5d / 10m | Obsługa mokrymi dłońmi i w rękawicach (P6). |
| **Z-005** | **Brew: Próba Jodowa & Checklist** | Krok zatwierdzenia scukrzenia skrobi z instrukcją wizualną i testem jodowym. | **MVP** | 0.3d / 5m | Ochrona początkującego przed filtracją niscukrzonego zacieru (P1). |
| **Z-006** | **Kalk: Gęstość & Temperatura** | Korekta odczytu spławika areometru skalowanego na 20°C dla temperatur brzeczki od 10°C do 90°C. | **MVP** | 0.5d / 15m | Wyeliminowanie błędu pozornego ciężaru (błąd do 4°Blg przy gorącej brzeczce). |
| **Z-007** | **Kalk: Refraktometr (Terrill)** | Przelicznik °Brix na °Plato i SG z uwzględnieniem obecności alkoholu i współczynnika WCF=1.04. | **MVP** | 0.5d / 10m | Kluczowe narzędzie szybkiego pomiaru 2 kroplami brzeczki (P2, P3). |
| **Z-008** | **Kalk: Goryczka IBU (Tinseth)** | Obliczenia IBU z uwzględnieniem gęstości brzeczki, czasu gotowania i formy chmielu (granulat T90 vs szyszka). | **MVP** | 0.8d / 15m | Podstawa projektowania profilu smakowego (P1, P2). |
| **Z-009** | **Kalk: IBU (Rager / Garetz)** | Przełącznik alternatywnych formuł goryczki w ustawieniach. | **1.1** | 0.3d / 5m | Dla piwowarów odtwarzających historyczne receptury (DEC-07). |
| **Z-010** | **Kalk: Barwa SRM/EBC (Morey)** | Deterministyczny wzór Moreya na kolor piwa z wizualną paletą barw (od słomkowego 2 EBC do smolistej czerni 80+ EBC). | **MVP** | 0.5d / 10m | Weryfikacja zgodności wizualnej ze stylem BJCP. |
| **Z-011** | **Kalk: Alkohol ABV & Kalorie** | Rozszerzone równanie atenuacji pozornej/rzeczywistej, objętość alkoholu (ABV %) i kaloryczność na 500 ml. | **MVP** | 0.3d / 5m | Informacja konsumencka i poprawność odfermentowania. |
| **Z-012** | **Kalk: Woda do Zacierania** | Bilans wody: woda do zacieru (L/kg), absorpcja ziarna ($0.96\,\text{L/kg}$), woda do wysładzania, strata w młócie. | **MVP** | 0.8d / 15m | Precyzyjne odmierzenie garnka przed zapaleniem palnika (P1, P3). |
| **Z-013** | **Kalk: Temperatura Infuzji (Strike)** | Wyliczenie temperatury wody przed zasypem, aby po wsypaniu słodu uzyskać docelową przerwę. | **MVP** | 0.4d / 10m | Eliminuje loterię i konieczność gwałtownego dolewania wrzątku. |
| **Z-014** | **Kalk: Sole Wody & $SO_4/Cl$** | Mineralizacja wody: $\text{CaCl}_2, \text{CaSO}_4$ (gips), $\text{MgSO}_4$, $\text{NaCl}$, $\text{NaHCO}_3$ i bilans profilu goryczkowo-słodowego. | **MVP** | 1.2d / 20m | Kluczowa funkcja jakościowa i podstawa modułu Pro (P2). |
| **Z-015** | **Kalk: Zakwaszanie Zacieru (pH)** | Dawkowanie kwasu mlekowego 80% lub słodu zakwaszającego do osiągnięcia docelowego pH 5.2–5.5. | **MVP** | 0.8d / 15m | Zapobiega wymywaniu tanin z łuski podczas wysładzania. |
| **Z-016** | **Kalk: Refermentacja Butelkowa** | Wyliczenie gramatury glukozy/sacharozy/DME w zależności od temp. warki i docelowego nagazowania ($V_{CO2}$). | **MVP** | 0.6d / 15m | **Krytyczne bezpieczeństwo: ochrona przed wybuchem butelek (ZP-08).** |
| **Z-017** | **Kalk: Alert „Granat Butelkowy”** | Twarda blokada i czerwone ostrzeżenie przy próbie zabutelkowania piwa o niedokończonej atenuacji. | **MVP** | 0.3d / 5m | Zgodność z rygorem biologicznym ZP-08. |
| **Z-018** | **Kalk: Gęstość Zadania Drożdży** | Pitch Rate Calculator: miliony komórek / ml / °Plato (0.75 dla Ale, 1.5 dla Lager) i kalkulator gęstwy. | **MVP** | 0.8d / 15m | Ochrona przed posmakami siarkowymi i uśpieniem drożdży. |
| **Z-019** | **Kalk: Starter Drożdżowy** | Objętość brzeczki 9°Blg na mieszadle magnetycznym dla obudzenia drożdży płynnych. | **1.1** | 0.5d / 10m | Dla zaawansowanych piwowarów używających gęstwy i probówek (P2). |
| **Z-020** | **Kalk: Rozcieńczanie i Odparowanie** | Korekta zbyt gęstej brzeczki wodą lub zbyt rzadkiej przez wydłużone gotowanie. | **MVP** | 0.4d / 5m | Szybki ratunek przy niedoszacowanej wydajności warzelni. |

const fs = require('fs');
const path = require('path');

const adrs = [
  {
    id: 'ADR-001',
    name: 'ADR-001-nazwa-i-architektura-portfolio.md',
    title: 'Nazwa marki w portfolio i repozytorium GitHub',
    context: 'Wybór tożsamości rzemieślniczej spójnej z ekosystemem Apps4Craft (Napar, Piekarz, Słoik, Charcutier, Ferment).',
    options: 'Opcja A: Piwowar (Brewcraft) - linia rzemieślnicza ról. Opcja B: Brzeczka (Wortwise) - linia surowcowa.',
    decision: 'Opcja A (Piwowar / Brewcraft). Repozytorium: lkarwowski494/piwowar.',
    consequences: 'Precyzyjne pozycjonowanie użytkownika jako mistrza rzemiosła, spójność z archetypem marki Apps4Craft.'
  },
  {
    id: 'ADR-002',
    name: 'ADR-002-format-wymiany-beerxml.md',
    title: 'Format wymiany receptur (BeerXML 1.0 vs czysty JSON)',
    context: 'Użytkownicy posiadają obszerne kolekcje receptur w formatach zewnętrznych (Brewfather, BeerSmith).',
    options: 'Opcja A: Własny format JSON w MVP, BeerXML w v1.1. Opcja B: Pełny import/eksport BeerXML 1.0 w MVP.',
    decision: 'Opcja B (BeerXML 1.0 od Dnia 1).',
    consequences: 'Eliminacja bariery wejścia i vendor lock-in; natychmiastowa migracja z innych aplikacji piwowarskich.'
  },
  {
    id: 'ADR-003',
    name: 'ADR-003-transakcyjny-zapis-sqlite-i-undo.md',
    title: 'Model zapisu danych i mechanizm cofania (Undo)',
    context: 'Praca w warunkach kuchennych (mokre ręce, opary, ryzyko uśpienia telefonu).',
    options: 'Opcja A: Automatyczny zapis każdej zmiany w transakcji SQLite z dolnym paskiem Cofnij. Opcja B: Formularze modalne z przyciskiem Zapisz.',
    decision: 'Opcja A (Zapis natychmiastowy + UndoSnackbar).',
    consequences: 'Zero utraty danych (Aksjomat Zerowej Utraty Danych); pełna ergonomia pracy jedną ręką.'
  },
  {
    id: 'ADR-004',
    name: 'ADR-004-obsluga-tilt-hydrometer-ble.md',
    title: 'Bezprzewodowy odczyt gęstościomierza cyfrowego Tilt Hydrometer BLE',
    context: 'Konieczność monitorowania dynamiki fermentacji bez otwierania fermentora i ryzyka infekcji.',
    options: 'Opcja A: Odłożenie BLE do v2.0. Opcja B: Natywna obsługa iBeacon BLE dla spławików Tilt w v1.0.',
    decision: 'Opcja B (Obsługa Tilt BLE w v1.0).',
    consequences: 'Unikalny wyróżnik rynkowy w kategorii aplikacji offline; brak potrzeby instalacji serwera Raspberry Pi.'
  },
  {
    id: 'ADR-005',
    name: 'ADR-005-baza-bjcp-2021-offline.md',
    title: 'Wbudowana baza stylów piwnych BJCP 2021 offline',
    context: 'Piwowar potrzebuje parametrów docelowych (OG, FG, IBU, SRM, ABV) dla warzonego stylu.',
    options: 'Opcja A: Pełny korpus 100+ stylów BJCP 2021 w SQLite w pakiecie aplikacji. Opcja B: Tylko 15 stylów podstawowych.',
    decision: 'Opcja A (Pełny korpus BJCP 2021 offline, w tym Piwo Grodziskie, Sahti, Rauchbier).',
    consequences: 'Dostęp do wiedzy referencyjnej bez połączenia z internetem; rozmiar bazy rośnie zaledwie o 150 KB.'
  },
  {
    id: 'ADR-006',
    name: 'ADR-006-model-monetyzacji-freemium-quota.md',
    title: 'Model monetyzacji: Freemium Quota 3 warek + wieczysty Read-Only',
    context: 'Utrzymanie architektury zerowych kosztów stałych ($0) i budowa etycznego modelu przychodowego.',
    options: 'Opcja A: Twarde funkcje Pro (woda, Tilt) zablokowane od początku. Opcja B: Pierwsze 3 warki 100% Pro, potem zakup Apps4Brew Pass, z zachowaniem prawa do odczytu historii.',
    decision: 'Opcja B (Freemium Quota 3 warek + Apps4Brew Pass).',
    consequences: 'Maksymalny współczynnik zachwytu produktem (Aha! moment); wysoka konwersja bez niszczenia zaufania.'
  },
  {
    id: 'ADR-007',
    name: 'ADR-007-formuly-goryczki-tinseth-i-rager.md',
    title: 'Algorytm wyliczania goryczki chmielowej IBU (Glenn Tinseth)',
    context: 'Precyzja obliczania izomeryzacji alfa-kwasów w funkcji czasu gotowania i gęstości brzeczki.',
    options: 'Opcja A: Glenn Tinseth jako wzorzec podstawowy z uwzględnieniem pellet factor 1.03. Opcja B: Rager lub Mosher.',
    decision: 'Opcja A (Wzór Glenna Tinsetha jako domyślny, z możliwością wyboru formuły).',
    consequences: 'Zgodność z wektorami testowymi VEC-IBU-01..03 w granicach błędu < 0.5 IBU.'
  },
  {
    id: 'ADR-008',
    name: 'ADR-008-korekcja-refraktometru-terrill.md',
    title: 'Równanie korekcji refraktometru w obecności alkoholu (Sean Terrill)',
    context: 'Alkohol etylowy zakłóca współczynnik załamania światła refraktometru podczas fermentacji.',
    options: 'Opcja A: Model wielomianowy Seana Terrilla z WCF = 1.04. Opcja B: Uproszczona formuła liniowa.',
    decision: 'Opcja A (Algorytm Seana Terrilla).',
    consequences: 'Precyzyjny odczyt FG z refraktometru bez konieczności używania tradycyjnego areometru szklanego.'
  },
  {
    id: 'ADR-009',
    name: 'ADR-009-rozszerzenie-apple-watch.md',
    title: 'Rozszerzenie interfejsu dla Apple Watch',
    context: 'Piwowar odchodzi od kotła do mycia sprzętu i potrzebuje dyskretnych powiadomień na nadgarstku.',
    options: 'Opcja A: Stoper wieloetapowy zacierania/chmielenia z haptyką + szybki podgląd Tilt BLE. Opcja B: Brak wsparcia zegarka.',
    decision: 'Opcja A (Apple Watch Companion App przez WatchConnectivity).',
    consequences: 'Brak ryzyka przypalenia zacieru lub przegapienia chmielenia w warunkach polowych.'
  },
  {
    id: 'ADR-010',
    name: 'ADR-010-parser-beerxml-fast-xml-parser.md',
    title: 'Lekki i bezpieczny parser BeerXML oparty na fast-xml-parser',
    context: 'Parsowanie plików XML w środowisku mobilnym React Native bez narzutu DOMParsera.',
    options: 'Opcja A: Biblioteka fast-xml-parser bez zależności natywnych. Opcja B: Własny tokenizer regex.',
    decision: 'Opcja A (fast-xml-parser).',
    consequences: 'Szybkie, deterministyczne i bezpieczne parsowanie złożonych receptur BeerXML 1.0.'
  },
  {
    id: 'ADR-011',
    name: 'ADR-011-profile-sprzetowe-hybrydowe.md',
    title: 'Hybrydowy model konfiguracji profili sprzętowych',
    context: 'Balans pomiędzy natychmiastowym rozpoczęciem pracy a precyzyjną kalibracją aparatury.',
    options: 'Opcja A: Tylko 3 szablony domyślne. Opcja B: 30 pól konfiguracji na starcie. Opcja Hybrydowa: 3 profile domyślne gotowe natychmiast + pełna edycja w SQLite w ustawieniach.',
    decision: 'Opcja Hybrydowa (BIAB, Kocioł All-in-One, 3-naczyniowy + nielimitowane własne profile w SQLite).',
    consequences: 'TTV < 60s dla nowicjuszy przy 100% elastyczności dla zaawansowanych piwowarów.'
  },
  {
    id: 'ADR-012',
    name: 'ADR-012-kalkulator-infuzji-strike-water.md',
    title: 'Kalkulator infuzji temperaturowych wody (Strike Water Just-in-Time)',
    context: 'Wyliczenie temperatury wody do zasypu w celu uzyskania docelowej temperatury zacierania.',
    options: 'Opcja A: Zintegrowana karta startowa w Dniu Warzenia (Just-in-Time). Opcja B: Osobny, odizolowany kalkulator.',
    decision: 'Opcja A (Integracja z przepływem Dnia Warzenia wg formuły Palmera).',
    consequences: 'Użytkownik nie musi przełączać się między zakładkami; wartość wyliczana jest w kontekście zacierania.'
  },
  {
    id: 'ADR-013',
    name: 'ADR-013-lokalne-powiadomienia-offline.md',
    title: 'Architektura lokalnych powiadomień offline bez serwerów zewnętrznych',
    context: 'Dostarczanie alertów o etapach fermentacji i chmielenia w warunkach braku internetu.',
    options: 'Opcja A: Lokalne powiadomienia natywne Expo Notifications zaplanowane w systemie operacyjnym. Opcja B: Powiadomienia zdalne push (APNs/FCM).',
    decision: 'Opcja A (100% Lokalne powiadomienia offline).',
    consequences: 'Niezawodność w piwnicach i garażach; zero kosztów infrastruktury powiadomień ($0); pełna prywatność.'
  },
  {
    id: 'ADR-014',
    name: 'ADR-014-chemia-wody-i-kwas-mlekowy.md',
    title: 'Modelowanie profilu wody zaciernej i dozowanie kwasu mlekowego',
    context: 'Optymalizacja profilu mineralnego pod styl piwa oraz regulacja pH zacieru.',
    options: 'Opcja A: Obliczanie 6 jonów mineralnych, stosunku SO4/Cl oraz objętości kwasu mlekowego 80% do zbicia pH. Opcja B: Jedynie ogólny bilans twardości.',
    decision: 'Opcja A (Model 6-jonowy + deLange/Palmer Acid Calculation).',
    consequences: 'Rzemieślnicza precyzja zacierania, lepsza wydajność enzymatyczna i klarowność piwa.'
  },
  {
    id: 'ADR-015',
    name: 'ADR-015-zamrozone-migawki-receptur-snapshot.md',
    title: 'Nienaruszalne migawki receptur (Snapshotting) w dzienniku warek',
    context: 'Edycja receptury bazowej po uwarzeniu warki nie może niszczyć historycznych parametrów minionej partii.',
    options: 'Opcja A: Zamrożenie pełnego zrzutu receptury w polu JSON w tabeli batches. Opcja B: Jedynie powiązanie po kluczu obcym recipe_id.',
    decision: 'Opcja A (Niezależny snapshot receptury w momencie rozpoczęcia warki).',
    consequences: 'Gwarancja historycznej prawdy archiwalnej; modyfikacje receptury nie zmieniają danych uwarzonego piwa.'
  }
];

adrs.forEach(adr => {
  const content = `# ${adr.id}: ${adr.title}

*Status:* Zatwierdzony (Accepted)  
*Data:* 2026-10-18  
*Decydent:* Principal System Architect & Tech Lead  
*Powiązane wymaganie:* DEC-${adr.id.replace('ADR-', '')}  

---

## 1. Kontekst
${adr.context}

---

## 2. Rozważane Opcje
${adr.options}

---

## 3. Decyzja
${adr.decision}

---

## 4. Konsekwencje i Wpływ na System
${adr.consequences}
`;

  const filePath = path.join('docs', 'adr', adr.name);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Wrote ' + filePath);
});

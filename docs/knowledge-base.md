# Przewodnik Terenowy i Baza Wiedzy Piwowara (In-App Field Guide & Troubleshooting Doctor)
*Projekt:* Piwowar (Brewcraft)  
*Rola:* Principal Technical Writer & In-App Knowledge Base Architect  
*Wersja:* 1.0.0-PROD  
*Rozmiar pakietu:* < 150 KB (100% Offline-Ready)  
*Standard:* Apps4Craft Field Guide Standard (Zasada 2 Źródeł Naukowych)  

---

## 1. Architektura Bazy Wiedzy Offline

Wiedza wycięta z głównego interfejsu w myśl **Zasady Słoika** (`docs/scope-contract.md`) została zorganizowana w lekki, dwupoziomowy Przewodnik Terenowy. Każdy artykuł ma limit $\le 250$ słów, formatowanie wypunktowane i sekcję „W pigułce”.

```
docs/knowledge-base/
├── 1. Doctor Wad Piwa (20 Wad Sensorycznych i Troubleshooting)
├── 2. Normy Biologiczne i Tabele Referencyjne (Zasada 2 Źródeł)
├── 3. Przewodnik Sanitarny i Chemia Mycia (CIP & Dezynfekcja)
├── 4. Słownik Pojęć Rzemieślniczych (Craft Glossary)
└── 5. Mikro-copy UI i Wzorce Komunikatów Walidacyjnych
```

---

## 2. Doctor Wad Piwa (Troubleshooting Doctor — 20 Wad Sensorycznych)

| # | Wada Sensoryczna | Objaw (Co czujesz?) | Mechanizm Biologiczny / Chemiczny | Zdatne do picia? | Instrukcja Ratunkowa w 3 Krokach |
| :-: | :--- | :--- | :--- | :---: | :--- |
| **1** | **Diacetyl** | Masło, toffi, popcorn maślany, śliskość na języku | Prekursor alfa-acetomleczan utleniony do diacetylu przez przedwczesne schłodzenie | TAK | 1. Podnieś temp. fermentacji o 2–3°C na 48h (przerwa diacetylowa).<br>2. Nie oddzielaj piwa od drożdży zbyt wcześnie.<br>3. Zrób test podgrzewanej próbki przed rozlewem. |
| **2** | **DMS (Sulfid dimetylu)** | Gotowana kukurydza, gotowany seler, kapusta | Nieodparowany S-metylometionina (SMM) z jasnych słodów podczas gotowania | TAK | 1. Gotuj brzeczkę dynamicznie bez przykrycia (min. 60–90 min).<br>2. Chłodź brzeczkę błyskawicznie poniżej 60°C (chłodnica zanurzeniowa/płytowa).<br>3. Zapewnij intensywny odparowanie $\ge 8\%/\text{h}$. |
| **3** | **Aldehyd octowy** | Zielone jabłko, świeżo ścięta trawa, farba emulsyjna | Niedokończona redukcja aldehydu do etanolu w szlaku glikolizy drożdży | TAK | 1. Zostaw piwo na drożdżach dodatkowe 5–7 dni po ustaniu burzliwej.<br>2. Zapewnij zdrową gęstwę drożdżową (odpowiedni pitching rate).<br>3. Unikaj natleniania młodego piwa po fermentacji. |
| **4** | **Utlenienie (Staling)** | Mokry karton, stary papier, sherry, miód, ciemnienie | Reakcja tlenu rozpuszczonego ($DO$) z polifenolami, lipidami i alkoholem | TAK | 1. Płucz naczynia i butelki dwutlenkiem węgla ($CO_2$).<br>2. Unikaj chlapania piwem przy przelewaniu na cichą i rozlewie.<br>3. Przechowuj gotowe piwo w temperaturze $< 4^\circ\text{C}$. |
| **5** | **Fenole (Apteka / Plastik)** | Bandaż, szpital, goździki, dym, plastik | Związki 4-winylogwajakol (4-VG) lub 4-etylogwajakol z drożdży POF+ lub chlorofenoli | ZALEŻY | 1. Do stylów klasycznych używaj drożdży POF- (czysty profil).<br>2. Przestrzegaj reżimu temp. zadania drożdży (16–18°C dla ale).<br>3. Nigdy nie używaj wody chlorowanej bez filtracji węglowej. |
| **6** | **Octan etylu / Rozpuszczalnik** | Zmywacz do paznokci, rozpuszczalnik farb, agresywne estry | Zbyt wysoka temperatura fermentacji lub skrajne niedotlenienie brzeczki | TAK (w małych stężeniach) | 1. Kontroluj temperaturę fermentora sondą w gilzie, nie temp. otoczenia.<br>2. Zapewnij napowietrzenie brzeczki do $8\text{--}10\,\text{ppm}\,O_2$ przed zadaniem.<br>3. Nie dopuszczaj do przegrzania w fazie adaptacyjnej drożdży. |
| **7** | **Siarkowodór ($H_2S$)** | Zgniłe jaja, kanalizacja, zapałki siarkowe | Naturalny produkt uboczny drożdży (zwłaszcza lagerowych) przy stresie siarkowym | TAK | 1. Pozwól na dłuższe leżakowanie piwa w chłodzie (gaz $CO_2$ wypłukuje siarkę).<br>2. Wymieszaj piwo miedzianym drucikiem/rurką (miedź wiąże siarczki).<br>3. Zapewnij odżywki drożdżowe (cynk, FAN $\ge 150\,\text{mg/L}$). |
| **8** | **Kwas mlekowy** | Kwaśne mleko, jogurt, czysta kwasowość cytrynowa | Bakterie kwasu mlekowego (*Lactobacillus*, *Pediococcus*) w piwie niesour | TAK | 1. Jeśli to zamierzony styl (Berliner Weisse) — gratulacje!<br>2. W piwach klasycznych: wymień wężyki silikonowe i uszczelki.<br>3. Stosuj chmielenie $> 15\,\text{IBU}$ (chmiel hamuje bakterie gram-dodatnie). |
| **9** | **Kwas octowy** | Ocet winny, aceton, ostry kwas | Dzikie bakterie *Acetobacter* w obecności tlenu atmosferycznego | NIE (nieprzyjemne) | 1. Sprawdź szczelność rurki fermentacyjnej i uszczelki wiadra.<br>2. Zabezpiecz piwo poduszką $CO_2$ przy leżakowaniu.<br>3. Partię z wyraźnym octem wylej lub przeznacz na ocet piwny. |
| **10** | **Światłowstręt (Skunks / Lightstruck)** | Zapach skunksa, pot, przypalona guma | Rozpad izohumulonów chmielowych pod wpływem światła UV (350–520 nm) | TAK | 1. Używaj wyłącznie brązowych butelek szklanych (blokują 98% UV).<br>2. Fermentuj w ciemnym pomieszczeniu lub owiń wiadro kocem.<br>3. Chroń piwo przed bezpośrednim słońcem podczas rozlewu. |
| **11** | **Autoliza Drożdży** | Pieczarki, sos sojowy, zgnilizna mięsna, rosół | Samostrawienie komórek drożdżowych po długim kontakcie z martwym osadem | TAK | 1. Zlej piwo znad osadu po zakończeniu fermentacji burzliwej (max 21 dni).<br>2. Obniż temperaturę fermentora po fermentacji (Cold Crash).<br>3. Nie przetrzymuj piwa na gęstwie w temperaturze $> 20^\circ\text{C}$. |
| **12** | **Smak Metaliczny** | Monety, krew, rdza, atrament (test skóry) | Kontakt brzeczki z odsłoniętym żelazem, miedzią w kwaśnym środowisku | TAK | 1. Sprawdź stan emalii w garze lub używaj stali nierdzewnej AISI 304.<br>2. Pasywuj nowe naczynia kwasem cytrynowym/azotowym przed użyciem.<br>3. Zbadaj poziom żelaza w wodzie wodociągowej ($Fe < 0.1\,\text{mg/L}$). |
| **13** | **Ściąganie Garbnikowe (Astringency)** | Cierpkość, ściąganie policzków, suchy posmak torebki herbaty | Nadmierne wypłukanie garbników z łuski przy wysokim pH zacieru lub za gorącej wodzie | TAK | 1. Nie wysładzaj wodą cieplejszą niż 78°C.<br>2. Przerwij wysładzanie, gdy gęstość brzeczki spadnie poniżej $2.5^\circ\text{P}$ (1.010 SG).<br>3. Kontroluj pH zacieru i wody do wysładzania ($pH \le 5.8$). |
| **14** | **Granat Butelkowy (Bottle Bomb)** | Wybuchające butelki, rozrywanie szkła pod ciśnieniem | Butelkowanie niedofermentowanego piwa lub zakażenie dzikimi drożdżami | NIEBEZPIECZNE | 1. Natychmiast schłodź wszystkie butelki do 1–2°C (zmniejsza ciśnienie).<br>2. W okularach ochronnych i rękawicach ostrożnie upuść gaz kapslownicą.<br>3. Zawsze sprawdzaj stabilność SG (brak spadku przez 3 kolejne dni). |
| **15** | **Zatrzymanie Fermentacji (Stuck Fermentation)** | Gęstość zatrzymała się znacznie powyżej target FG | Szok termiczny drożdży, brak tlenu, niedostateczny pitching rate | TAK | 1. Delikatnie zakręć fermentorem (rozkołysz osad), nie napowietrzając piwa.<br>2. Podnieś temperaturę fermentacji o 2–3°C.<br>3. Dodaj aktywny starter ze świeżych drożdży o wysokiej atenuacji (np. US-05). |
| **16** | **Przegazowanie (Gushing)** | Fontanna piany natychmiast po odkapslowaniu butelki | Pęcherzyki zarodkowania (cząstki mineralne, szczawiany) lub zakażenie drożdżami dzikimi | ZALEŻY | 1. Schłodź piwo przed otwarciem do 2°C.<br>2. Otwieraj nad zlewem pod kątem 45 stopni.<br>3. Zadbaj o dokładne wyklarowanie piwa przed rozlewem (żelatyna / cold crash). |
| **17** | **Niska Piana / Brak Piany** | Piana znika w kilka sekund po nalaniu | Tłuszcz na szkle/sprzęcie, zbyt długa przerwa białkowa (rozkład protein) | TAK | 1. Zrezygnuj z przerwy białkowej (50–52°C) przy nowoczesnych, dobrze zmodyfikowanych słodach.<br>2. Myj szkło piwne bezzapachowym płynem i płucz zimną wodą.<br>3. Dodaj 5–10% słodu pszenicznego, Carafoam lub płatków jęczmiennych. |
| **18** | **Zmętnienie na zimno (Chill Haze)** | Piwo klarowne w temp. pokojowej, mętne po wyjęciu z lodówki | Odwracalne wiązanie polifenoli chmielowych z białkami słodowymi | TAK | 1. Wprowadź energiczny Whirlfloc / mech irlandzki na 10 min przed końcem gotowania.<br>2. Wykonaj szybkie schłodzenie brzeczki po gotowaniu (Cold Break).<br>3. Zastosuj przedłużony Cold Crash w 0–2°C przed rozlewem. |
| **19** | **Alkohole Wyższe (Fuzle)** | Ostry, piekący alkohol, rozgrzewanie w gardle, ból głowy | Zbyt wysoka temperatura w pierwszych 72h fermentacji lub ekstremalne stężenie cukrów | TAK | 1. Zadawaj drożdże w dolnym zakresie tolerancji szczepu (16–17°C dla ale).<br>2. Daj piwu czas na ułożenie — z czasem fuzle mogą utlenić się do estrów.<br>3. Unikaj dodawania czystego cukru w ilości $> 15\%$ zasypu na raz. |
| **20** | **Chlorofenole** | Szpital, płyn odkażający, woda z basenu, spalona taśma | Reakcja chloru z wody kranowej lub preparatów chlorowych z polifenolami brzeczki | NIE (odrzucający) | 1. Zawsze filtruj wodę z kranu przez filtr z węglem aktywnym.<br>2. Dodaj szczyptę pirosiarczynu potasu (Campden) do wody przed zacieraniem.<br>3. Do dezynfekcji używaj preparatów na bazie kwasu nadoctowego/fosforowego (Star San). |

---

## 3. Normy Biologiczne i Tabele Referencyjne (Zasada 2 Źródeł)

Wszystkie parametry zostały potwierdzone w co najmniej dwóch niezależnych źródłach recenzowanych (Ludwig Narziss *Die Bierbrauerei*, Wolfgang Kunze *Technology Brewing and Malting*, John Palmer *How to Brew*, George Fix *Principles of Brewing Science*).

### 3.1. Reżim Temperaturowy i Enzymatyczny Zacierania

| Przerwa Zacierania | Temperatura (°C) | Główny Enzym | Działanie / Efekt w Piwie | Czas Typowy |
| :--- | :---: | :--- | :--- | :---: |
| **Kwasowa / Fitazowa** | 35–45°C | Fitaza | Naturalne obniżenie pH zacieru (rzadko stosowana w nowoczesnym słodzie) | 15–30 min |
| **Ferulowa** | 43–45°C | Esteraza kwasu ferulowego | Uwalnia kwas ferulowy (drożdże weizen przekształcają go w goździkowy 4-VG) | 15–25 min |
| **Białkowa** | 50–54°C | Proteinaza / Peptydaza | Rozbija długie łańcuchy białek na FAN dla drożdży (uwaga: obniża trwałość piany!) | 15–20 min |
| **Beta-amylaza (Wytrawna)** | 62–65°C | $\beta$-amylaza | Odcina cząsteczki maltozy; daje piwo wytrawne, wysoce odfermentowane i lekkie | 30–60 min |
| **Alfa-amylaza (Pełna)** | 68–72°C | $\alpha$-amylaza | Rozbija skrobię na dekstryny niesfermentowane; daje słodowość i pełne ciało | 30–60 min |
| **Wygrzew (Mash-out)** | 76–78°C | Deaktywacja enzymów | Zatrzymuje działanie enzymów, upłynnia zacier i ułatwia filtrację | 10 min |

### 3.2. Bezpieczeństwo Butelkowania i Granice Nagazowania

$$V_{CO_2} = \frac{\text{Cukier (g/L)}}{4.0} + V_{residual}$$

- **Maksymalne bezpieczne ciśnienie butelki standardowej (500 ml euro/vichy):** $3.5\,\text{bar}$ przy $20^\circ\text{C}$ (ok. $3.0\,\text{vol}\,CO_2$).
- **Bezwzględna granica alarmowa (Bottle Bomb Blocker):** $\ge 9.5\,\text{g/L}$ glukozy/sacharozy lub odfermentowanie $\Delta SG > 0.003$ powyżej target FG.
- **Krytyczne stężenie alkoholu i pH:** Gotowe piwo o $pH \le 4.4$ i $\text{ABV} \ge 3.5\%$ jest środowiskiem mikrobiologicznie bezpiecznym (brak możliwości przeżycia patogenów chorobotwórczych, w tym *Clostridium botulinum*).

---

## 4. Przewodnik Sanitarny i Chemia Mycia (CIP & Dezynfekcja)

> [!IMPORTANT]
> **Złota Zasada Rzemieślnika:** *Nie można zdezynfekować czegoś, co nie jest czyste.*  
> Zawsze najpierw mechaniczne mycie zasadowe, a dopiero potem chemiczna dezynfekcja kwasowa.

1. **Czyszczenie (Mycie Odwapniające i Odtłuszczające):**
   - Środek: Węglan sodu (soda kalcynowana) lub PBW (Powdered Brewery Wash).
   - Temperatura: 50–65°C.
   - Cel: Usunięcie kamienia piwnego (szczawian wapnia), resztek chmielin i zaschniętej piany drożdżowej.
2. **Płukanie:**
   - Czysta woda bez chloru do usunięcia resztek detergentu zasadowego.
3. **Dezynfekcja (Sanityzacja bez spłukiwania):**
   - Środek: Kwas nadoctowy (PAA 0.1–0.2%) lub kwas dodecylobenzenosulfonowy z kwasem fosforowym (Star San).
   - Czas kontaktu: minimum 60 sekund.
   - Piana nie jest szkodliwa — drożdże asymilują resztki kwasu fosforowego jako pożywkę.

---

## 5. Mikro-copy UI i Wzorce Komunikatów Walidacyjnych

Każdy komunikat w aplikacji pisany jest z szacunkiem dla pracy rzemieślnika:

- **Błąd: Zbyt wysoka dawka surowca do refermentacji:**
  - *Zamiast:* „Wartość poza dopuszczalnym zakresem.”
  - *Jest:* „Uwaga: Dawka powyżej 9 g/L grozi rozsadzeniem butelek z ciemnego szkła. Dla tego stylu rekomendujemy 5.5–6.8 g/L.”
- **Błąd: Różnica temperatur przy zadawaniu drożdży:**
  - *Zamiast:* „Invalid yeast pitching temperature.”
  - *Jest:* „Szok termiczny drożdży: Różnica między temperaturą starteru a brzeczki przekracza 5°C. Wyrównaj temperatury przed zadaniem, aby zapobiec mutacjom i produkcji estrów rozpuszczalnikowych.”
- **Pusty stan Dziennika Warek (Empty State):**
  - „Kocioł czeka na pierwszy zacier. Wybierz recepturę i stuknij «Dodaj warkę», aby rozpocząć rejestrację swojej rzemieślniczej historii.”

---

## 6. Autentyczne Release Notes (Szablon dla App Store Connect)

```
Wersja 1.0.0 — Witamy w warzelni!

Z dumą oddajemy w Twoje ręce Piwowara (Brewcraft) — aplikację stworzoną przez piwowarów domowych dla piwowarów rzemieślniczych w ramach studia Apps4Craft.

Co znajdziesz w pierwszym wydaniu:
• Skupiony Widok Dnia Warzenia: wieloetapowy stoper zacierania i chmielenia z cyframi 68pt i alertami, które zobaczysz z drugiego końca kuchni.
• Bottle Bomb Blocker: algorytm chroniący Twoje butelki przed eksplozją w piwnicy.
• Kieszonkowe Laboratorium: precyzyjne przeliczniki Tinsetha (IBU), Terrilla (refraktometr z WCF 1.04), barwy SRM Moreya i wody zaciernej Palmera.
• Bezpośredni odczyt Tilt Hydrometer BLE: sprawdzaj gęstość i temperaturę fermentora bez otwierania wieka i ryzyka infekcji.
• 100% Offline i prywatność: Twoje receptury i notatki należą wyłącznie do Ciebie. Żadnych kont, żadnego śledzenia, żadnych reklam.

Udanego warzenia i czystych fermentacji!
Zespół Apps4Craft
```

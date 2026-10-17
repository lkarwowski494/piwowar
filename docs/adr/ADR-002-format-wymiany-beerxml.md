# ADR-002: Format wymiany receptur (BeerXML 1.0 vs czysty JSON)

*Status:* Zatwierdzony (Accepted)  
*Data:* 2026-10-18  
*Decydent:* Principal System Architect & Tech Lead  
*Powiązane wymaganie:* DEC-002  

---

## 1. Kontekst
Użytkownicy posiadają obszerne kolekcje receptur w formatach zewnętrznych (Brewfather, BeerSmith).

---

## 2. Rozważane Opcje
Opcja A: Własny format JSON w MVP, BeerXML w v1.1. Opcja B: Pełny import/eksport BeerXML 1.0 w MVP.

---

## 3. Decyzja
Opcja B (BeerXML 1.0 od Dnia 1).

---

## 4. Konsekwencje i Wpływ na System
Eliminacja bariery wejścia i vendor lock-in; natychmiastowa migracja z innych aplikacji piwowarskich.

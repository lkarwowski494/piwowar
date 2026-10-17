# ADR-012: Kalkulator infuzji temperaturowych wody (Strike Water Just-in-Time)

*Status:* Zatwierdzony (Accepted)  
*Data:* 2026-10-18  
*Decydent:* Principal System Architect & Tech Lead  
*Powiązane wymaganie:* DEC-012  

---

## 1. Kontekst
Wyliczenie temperatury wody do zasypu w celu uzyskania docelowej temperatury zacierania.

---

## 2. Rozważane Opcje
Opcja A: Zintegrowana karta startowa w Dniu Warzenia (Just-in-Time). Opcja B: Osobny, odizolowany kalkulator.

---

## 3. Decyzja
Opcja A (Integracja z przepływem Dnia Warzenia wg formuły Palmera).

---

## 4. Konsekwencje i Wpływ na System
Użytkownik nie musi przełączać się między zakładkami; wartość wyliczana jest w kontekście zacierania.

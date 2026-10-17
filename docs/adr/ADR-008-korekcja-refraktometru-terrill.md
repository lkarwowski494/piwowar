# ADR-008: Równanie korekcji refraktometru w obecności alkoholu (Sean Terrill)

*Status:* Zatwierdzony (Accepted)  
*Data:* 2026-10-18  
*Decydent:* Principal System Architect & Tech Lead  
*Powiązane wymaganie:* DEC-008  

---

## 1. Kontekst
Alkohol etylowy zakłóca współczynnik załamania światła refraktometru podczas fermentacji.

---

## 2. Rozważane Opcje
Opcja A: Model wielomianowy Seana Terrilla z WCF = 1.04. Opcja B: Uproszczona formuła liniowa.

---

## 3. Decyzja
Opcja A (Algorytm Seana Terrilla).

---

## 4. Konsekwencje i Wpływ na System
Precyzyjny odczyt FG z refraktometru bez konieczności używania tradycyjnego areometru szklanego.

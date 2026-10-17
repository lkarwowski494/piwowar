# ADR-007: Algorytm wyliczania goryczki chmielowej IBU (Glenn Tinseth)

*Status:* Zatwierdzony (Accepted)  
*Data:* 2026-10-18  
*Decydent:* Principal System Architect & Tech Lead  
*Powiązane wymaganie:* DEC-007  

---

## 1. Kontekst
Precyzja obliczania izomeryzacji alfa-kwasów w funkcji czasu gotowania i gęstości brzeczki.

---

## 2. Rozważane Opcje
Opcja A: Glenn Tinseth jako wzorzec podstawowy z uwzględnieniem pellet factor 1.03. Opcja B: Rager lub Mosher.

---

## 3. Decyzja
Opcja A (Wzór Glenna Tinsetha jako domyślny, z możliwością wyboru formuły).

---

## 4. Konsekwencje i Wpływ na System
Zgodność z wektorami testowymi VEC-IBU-01..03 w granicach błędu < 0.5 IBU.

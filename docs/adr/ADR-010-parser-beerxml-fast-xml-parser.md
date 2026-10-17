# ADR-010: Lekki i bezpieczny parser BeerXML oparty na fast-xml-parser

*Status:* Zatwierdzony (Accepted)  
*Data:* 2026-10-18  
*Decydent:* Principal System Architect & Tech Lead  
*Powiązane wymaganie:* DEC-010  

---

## 1. Kontekst
Parsowanie plików XML w środowisku mobilnym React Native bez narzutu DOMParsera.

---

## 2. Rozważane Opcje
Opcja A: Biblioteka fast-xml-parser bez zależności natywnych. Opcja B: Własny tokenizer regex.

---

## 3. Decyzja
Opcja A (fast-xml-parser).

---

## 4. Konsekwencje i Wpływ na System
Szybkie, deterministyczne i bezpieczne parsowanie złożonych receptur BeerXML 1.0.

# ADR-005: Wbudowana baza stylów piwnych BJCP 2021 offline

*Status:* Zatwierdzony (Accepted)  
*Data:* 2026-10-18  
*Decydent:* Principal System Architect & Tech Lead  
*Powiązane wymaganie:* DEC-005  

---

## 1. Kontekst
Piwowar potrzebuje parametrów docelowych (OG, FG, IBU, SRM, ABV) dla warzonego stylu.

---

## 2. Rozważane Opcje
Opcja A: Pełny korpus 100+ stylów BJCP 2021 w SQLite w pakiecie aplikacji. Opcja B: Tylko 15 stylów podstawowych.

---

## 3. Decyzja
Opcja A (Pełny korpus BJCP 2021 offline, w tym Piwo Grodziskie, Sahti, Rauchbier).

---

## 4. Konsekwencje i Wpływ na System
Dostęp do wiedzy referencyjnej bez połączenia z internetem; rozmiar bazy rośnie zaledwie o 150 KB.

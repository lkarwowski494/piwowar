# ADR-011: Hybrydowy model konfiguracji profili sprzętowych

*Status:* Zatwierdzony (Accepted)  
*Data:* 2026-10-18  
*Decydent:* Principal System Architect & Tech Lead  
*Powiązane wymaganie:* DEC-011  

---

## 1. Kontekst
Balans pomiędzy natychmiastowym rozpoczęciem pracy a precyzyjną kalibracją aparatury.

---

## 2. Rozważane Opcje
Opcja A: Tylko 3 szablony domyślne. Opcja B: 30 pól konfiguracji na starcie. Opcja Hybrydowa: 3 profile domyślne gotowe natychmiast + pełna edycja w SQLite w ustawieniach.

---

## 3. Decyzja
Opcja Hybrydowa (BIAB, Kocioł All-in-One, 3-naczyniowy + nielimitowane własne profile w SQLite).

---

## 4. Konsekwencje i Wpływ na System
TTV < 60s dla nowicjuszy przy 100% elastyczności dla zaawansowanych piwowarów.

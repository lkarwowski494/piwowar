# ADR-003: Model zapisu danych i mechanizm cofania (Undo)

*Status:* Zatwierdzony (Accepted)  
*Data:* 2026-10-18  
*Decydent:* Principal System Architect & Tech Lead  
*Powiązane wymaganie:* DEC-003  

---

## 1. Kontekst
Praca w warunkach kuchennych (mokre ręce, opary, ryzyko uśpienia telefonu).

---

## 2. Rozważane Opcje
Opcja A: Automatyczny zapis każdej zmiany w transakcji SQLite z dolnym paskiem Cofnij. Opcja B: Formularze modalne z przyciskiem Zapisz.

---

## 3. Decyzja
Opcja A (Zapis natychmiastowy + UndoSnackbar).

---

## 4. Konsekwencje i Wpływ na System
Zero utraty danych (Aksjomat Zerowej Utraty Danych); pełna ergonomia pracy jedną ręką.

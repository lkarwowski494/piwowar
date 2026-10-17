# ADR-015: Nienaruszalne migawki receptur (Snapshotting) w dzienniku warek

*Status:* Zatwierdzony (Accepted)  
*Data:* 2026-10-18  
*Decydent:* Principal System Architect & Tech Lead  
*Powiązane wymaganie:* DEC-015  

---

## 1. Kontekst
Edycja receptury bazowej po uwarzeniu warki nie może niszczyć historycznych parametrów minionej partii.

---

## 2. Rozważane Opcje
Opcja A: Zamrożenie pełnego zrzutu receptury w polu JSON w tabeli batches. Opcja B: Jedynie powiązanie po kluczu obcym recipe_id.

---

## 3. Decyzja
Opcja A (Niezależny snapshot receptury w momencie rozpoczęcia warki).

---

## 4. Konsekwencje i Wpływ na System
Gwarancja historycznej prawdy archiwalnej; modyfikacje receptury nie zmieniają danych uwarzonego piwa.

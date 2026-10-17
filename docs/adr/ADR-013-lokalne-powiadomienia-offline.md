# ADR-013: Architektura lokalnych powiadomień offline bez serwerów zewnętrznych

*Status:* Zatwierdzony (Accepted)  
*Data:* 2026-10-18  
*Decydent:* Principal System Architect & Tech Lead  
*Powiązane wymaganie:* DEC-013  

---

## 1. Kontekst
Dostarczanie alertów o etapach fermentacji i chmielenia w warunkach braku internetu.

---

## 2. Rozważane Opcje
Opcja A: Lokalne powiadomienia natywne Expo Notifications zaplanowane w systemie operacyjnym. Opcja B: Powiadomienia zdalne push (APNs/FCM).

---

## 3. Decyzja
Opcja A (100% Lokalne powiadomienia offline).

---

## 4. Konsekwencje i Wpływ na System
Niezawodność w piwnicach i garażach; zero kosztów infrastruktury powiadomień ($0); pełna prywatność.

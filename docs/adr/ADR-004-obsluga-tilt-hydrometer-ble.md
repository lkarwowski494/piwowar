# ADR-004: Bezprzewodowy odczyt gęstościomierza cyfrowego Tilt Hydrometer BLE

*Status:* Zatwierdzony (Accepted)  
*Data:* 2026-10-18  
*Decydent:* Principal System Architect & Tech Lead  
*Powiązane wymaganie:* DEC-004  

---

## 1. Kontekst
Konieczność monitorowania dynamiki fermentacji bez otwierania fermentora i ryzyka infekcji.

---

## 2. Rozważane Opcje
Opcja A: Odłożenie BLE do v2.0. Opcja B: Natywna obsługa iBeacon BLE dla spławików Tilt w v1.0.

---

## 3. Decyzja
Opcja B (Obsługa Tilt BLE w v1.0).

---

## 4. Konsekwencje i Wpływ na System
Unikalny wyróżnik rynkowy w kategorii aplikacji offline; brak potrzeby instalacji serwera Raspberry Pi.

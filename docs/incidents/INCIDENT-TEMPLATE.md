# Szablon Raportu Incydentu Produkcyjnego (Blameless Post-Mortem)
*Incydent:* INCIDENT-YYYY-MM-DD-{{NAZWA}}  
*Data wystąpienia:* RRRR-MM-DD GG:MM UTC  
*Poziom surowości:* {{P0 - KATASTROFA | P1 - BLOKER | P2 - POWAŻNY | P3 - DROBNY}}  
*Aplikacja:* Piwowar (Brewcraft)  
*Wersja aplikacji:* v{{X.Y.Z}} (Build {{N}})  
*Status:* {{ZBADANY | ROZWIĄZANY | MONITOROWANY}}  

---

## 1. Streszczenie Incydentu (Executive Summary)
Jedno-dwuakapitowe podsumowanie awarii: co się stało, ilu użytkowników zostało dotkniętych, jaki był objaw i jak zażegnano kryzys.

---

## 2. Oś Czasu Zdarzeń (Timeline UTC)
- **GG:MM** — Pierwszy raport o usterce w Sentry / zgłoszenie od testera w TestFlight.
- **GG:MM** — Triage i potwierdzenie poziomu surowości (np. P0: Crash-loop przy starcie na iOS 18).
- **GG:MM** — Izolacja przyczyny źródłowej i utworzenie testu regresyjnego (Red).
- **GG:MM** — Przygotowanie chirurgicznego hotfixu i przejście testu (Green).
- **GG:MM** — Wypuszczenie patcha vX.Y.Z+1 przez Fastlane i wysłanie wniosku o Apple Expedited Review.
- **GG:MM** — Zatwierdzenie przez Apple i udostępnienie aktualizacji w App Store.

---

## 3. Przyczyna Źródłowa (Root Cause Analysis - 5 Whys)
1. *Dlaczego aplikacja uległa awarii?*  
2. *Dlaczego ten warunek wystąpił?*  
3. *Dlaczego błąd nie został wykryty w testach PR?*  
4. *Dlaczego brakowało testu integracyjnego dla tego przypadku?*  
5. *Główna przyczyna systemowa:*  

---

## 4. Wpływ na Dane i Użytkowników (Impact Assessment)
- Liczba dotkniętych instalacji:
- Utrata danych ($0 Data Loss Guarantee): **TAK / NIE** (Jeśli tak: szczegóły procedury odzysku z `.recover`).
- Czy wystąpiła pętla awarii i uruchomienie Circuit Breaker Safe Mode:

---

## 5. Działania Naprawcze i Zapobiegawcze (Action Items)
| Zadanie Naprawcze | Typ | Właściciel | Status | Powiązany PR / Commit |
| :--- | :---: | :---: | :---: | :--- |
| Wdrożenie testu regresyjnego w `tests/` | PBT / Unit | Dev | Gotowe | `git commit ...` |
| Aktualizacja procedury migracji DDL | DB | Architekt | W toku | |
| Dodanie nowej reguły do matrycy testów | CI | Test Lead | Gotowe | |

---
*Zatwierdzono: Principal SRE & Mobile Crash Forensics Architect*

# Piwowar (Brewcraft) — Standard Wzorców Interakcji i Słownik UI (`docs/32`)

Dokument określa jednolite wzorce zachowania, nawigacji oraz nazewnictwa interfejsu użytkownika w aplikacji **Piwowar (Brewcraft)** w pełnej zgodności ze standardem ekosystemu **Apps4Craft**.

---

## 1. Rygorystyczny Słownik 8 Pojęć Interfejsu

Wszystkie ekrany, przyciski, modale i komunikaty w aplikacji muszą bezwzględnie stosować poniższe pojęcia:

| Termin | Kiedy używać | Gdzie w interfejsie |
|---|---|---|
| **Anuluj** | Rezygnacja z formularza bez zapisu, zamknięcie arkusza bez zmian. | Lewy górny róg okien modalnych (`headerLeft`), przycisk rezygnacji w alertach. |
| **Wróć** | Powrót do poprzedniego ekranu w hierarchii nawigacji stosu. | Lewy górny róg ekranów stosu nawigacji (strzałka powrotu). |
| **Wróć do edycji** | Przycisk w oknie dialogowym potwierdzającym próbę odrzucenia zmienionego formularza. | Dialog „Odrzucić zmiany?”. |
| **Zamknij** | Zamknięcie ekranu czysto informacyjnego (np. styl BJCP, Doctor Wad, licencje). | Prawy górny róg ekranów informacyjnych. |
| **Cofnij** | Natychmiastowe odwrócenie ostatniej wykonanej rutynowej akcji (np. usunięcia chmielu). | Pasek Snackbar na dole ekranu. |
| **Przywróć** | Odzyskanie warki z archiwum lub przywrócenie bazy z pliku kopii JSON. | Widok archiwum / ekran kopii zapasowej. |
| **Usuń {obiekt}** | Trwała lub odwracalna operacja destrukcyjna (np. „Usuń warkę”, „Usuń chmiel”). | Przycisk destrukcyjny w oknie potwierdzenia. |
| **Dodaj {obiekt}** | Utworzenie nowego wpisu (np. „Dodaj warkę”, „Dodaj chmiel”, „Dodaj profil”). | Przycisk w prawym górnym rogu nagłówka (`headerRight`), etykieta VoiceOver. |

---

## 2. Standard Okien Modalnych i Arkuszy (Modals & Bottom Sheets)

- **Przycisk rezygnacji:** ZAWSZE w lewym górnym rogu nagłówka (`headerLeft`), etykieta dosłownie: **„Anuluj”**. Kategoryczny zakaz stosowania etykiet „Zamknij”, „Wróć” ani samej ikony „X” do rezygnacji z formularza edycji.
- **Przycisk zatwierdzenia:** ZAWSZE w prawym górnym rogu nagłówka (`headerRight`), etykieta precyzyjna: **„Dodaj”** (przy tworzeniu nowej warki/receptury) lub **„Zapisz”** (przy edycji istniejącej).
- **Zabezpieczenie brudnego formularza:** Jeśli użytkownik zmodyfikował stan formularza i nacisnął „Anuluj”, aplikacja wyświetla pytanie potwierdzające: **„Odrzucić zmiany?”** z opcjami: `[Wróć do edycji, Odrzuć zmiany (destructive)]`.

---

## 3. Standard Operacji Usuwania: Rutynowe vs Nieodwracalne

- **Rutynowe usunięcie pozycji ze składników (chmiel, słód, krok zacierania):** Natychmiastowe usunięcie z bazy z jednoczesnym wyświetleniem paska Snackbar na dole ekranu z przyciskiem **„Cofnij”** (`undo`). Zakaz blokowania piwowara modalnym alertem typu „Czy na pewno chcesz usunąć?”.
- **Operacje destrukcyjne nieodwracalne (usunięcie całej warki, profilu sprzętowego, reset bazy):** Jawne okno dialogowe z przyciskiem destrukcyjnym: `[Anuluj, Usuń warkę (destructive)]`.

---

## 4. Dostępność i Etykiety VoiceOver

- Przycisk „+” w nagłówku listy ma zawsze precyzyjną etykietę: `accessibilityLabel="Dodaj {obiekt}"` (np. „Dodaj warkę”, „Dodaj recepturę”, „Dodaj profil sprzętu”), a nie ogólne „Dodaj” czy „Plus”.
- Minimalny rozmiar pola dotykowego to **44 × 44 pt** (dla głównych akcji kuchennych **56–64 pt**).
- Kolory tekstu i tła w obu motywach (jasnym i ciemnym) spełniają normę **WCAG AAA** (kontrast min. 7:1 dla tekstu podstawowego).

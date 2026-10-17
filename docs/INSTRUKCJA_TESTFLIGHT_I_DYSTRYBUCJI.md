# Piwowar (Brewcraft) — Kompletna Instrukcja Dystrybucji i Wdrożenia na TestFlight 🚀📲

Niniejszy przewodnik opisuje krok po kroku procedurę wdrożenia aplikacji **Piwowar (Brewcraft)** do testów na urządzeniach rzeczywistych (iPhone / iPad) za pośrednictwem **Apple TestFlight** oraz alternatywnej szybkiej ścieżki deweloperskiej (**Expo Go**).

---

## 1. Dwie Ścieżki Dystrybucji do Użytkownika

| Ścieżka | Czas uruchomienia | Czy wymaga konta Apple Developer ($99/rok)? | Przeznaczenie |
|---|---|---|---|
| **Ścieżka A: Expo Go / Tunnel (Natychmiastowa)** | **< 30 sekund** | **NIE** (całkowicie bezpłatne) | Błyskawiczny podgląd na własnym telefonie, testy UI, stopera i kalkulatorów. |
| **Ścieżka B: Apple TestFlight (Oficjalna)** | **~15 minut (build EAS)** | **TAK** (Apple Developer Program) | Prawdziwa instalacja natywna `.ipa`, testy w piwnicy z cyfrowym spławikiem Tilt BLE, udostępnienie testerom linkiem publicznym. |

---

## 2. Ścieżka A: Natychmiastowe uruchomienie na Twoim telefonie (Expo Go)

1. Pobierz darmową aplikację **Expo Go** z App Store na swojego iPhone'a.
2. Na komputerze w katalogu projektu uruchom serwer deweloperski:
   ```bash
   npx expo start --tunnel
   ```
3. Otwórz aplikację Aparat w iPhonie i **zeskanuj kod QR** wyświetlony w terminalu.
4. Aplikacja otworzy się natychmiast z pełnym wsparciem bazy SQLite, stoperem zacierania i kalkulatorami.

---

## 3. Ścieżka B: Wdrożenie na Apple TestFlight (Produkcyjne)

Dystrybucja na TestFlight jest w pełni zautomatyzowana za pomocą **EAS (Expo Application Services)** i skonfigurowana w plikach [`eas.json`](file:///c:/Users/lukas/Documents/antigravity/silly-mendel/eas.json) oraz workflow GitHub Actions [`.github/workflows/deploy-testflight.yml`](file:///c:/Users/lukas/Documents/antigravity/silly-mendel/.github/workflows/deploy-testflight.yml).

### Krok 1: Logowanie do konta Expo
Jeśli jeszcze nie posiadasz darmowego konta na [expo.dev](https://expo.dev), załóż je, a następnie w terminalu wykonaj:
```bash
npx eas-cli login
```

### Krok 2: Powiązanie projektu z chmurą EAS
W katalogu projektu zainicjalizuj identyfikator w chmurze Expo:
```bash
npx eas-cli project:init
```
*(Polecenie wygeneruje unikalny `projectId` w `app.json`).*

### Krok 3: Konfiguracja Certyfikatów Apple (Automatyczna)
EAS sam wygeneruje za Ciebie certyfikaty dystrybucyjne (`Distribution Certificate`) oraz profil udostępniania (`Provisioning Profile`).
Wystarczy uruchomić:
```bash
npx eas-cli credentials
```
lub od razu przejść do budowania — EAS poprosi Cię o dane logowania do Apple ID jednorazowo i bezpiecznie przechowa certyfikaty w chmurze.

### Krok 4: Zbudowanie aplikacji i wysłanie do TestFlight jednym poleceniem
Uruchom polecenie:
```bash
npx eas-cli build --platform ios --profile production --auto-submit
```
Co robi to polecenie:
1. Pakuje kod źródłowy aplikacji.
2. Uruchamia maszynę w chmurze Apple Silicon (macOS).
3. Kompiluje natywną paczkę `.ipa` z bundle identifier `com.apps4craft.piwowar`.
4. Po ukończeniu kompilacji automatycznie przesyła plik do **App Store Connect / TestFlight** (`--auto-submit`).

---

## 4. Konfiguracja CI/CD w GitHub Actions (Automatyczny TestFlight)

W repozytorium znajduje się gotowy workflow: [`.github/workflows/deploy-testflight.yml`](file:///c:/Users/lukas/Documents/antigravity/silly-mendel/.github/workflows/deploy-testflight.yml).

Aby wdrożyć nową wersję prosto z GitHuba bez obciążania własnego komputera:
1. W ustawieniach repozytorium GitHub (**Settings → Secrets and variables → Actions**) dodaj:
   - `EXPO_TOKEN` — wygenerowany na stronie [expo.dev/settings/access-tokens](https://expo.dev/settings/access-tokens).
2. Wypchnij nowy tag wersji:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```
3. GitHub Actions automatycznie:
   - Wykona pełną weryfikację jakościową (`npm run verify`: i18n, typecheck, 67 testów).
   - Zbuduje paczkę iOS w chmurze EAS.
   - Umieści gotowy build w Twoim panelu TestFlight!

---

## 5. Zapraszanie Testerów w App Store Connect

Po pomyślnym przesłaniu buildu:
1. Zaloguj się na [appstoreconnect.apple.com](https://appstoreconnect.apple.com) i przejdź do zakładki **TestFlight**.
2. **Grupa Wewnętrzna (Internal Testing):**
   - Dodaj swój adres e-mail oraz członków zespołu (do 100 osób).
   - Dostęp jest **natychmiastowy** — dostaniesz powiadomienie push w aplikacji TestFlight na iPhone w ciągu ~5 minut od zakończenia przetwarzania buildu przez Apple.
3. **Grupa Zewnętrzna (External Testing & Public Link):**
   - Utwórz grupę np. *„Domowi Piwowarzy — Beta 1.0”*.
   - Włącz opcję **Public Link** (Publiczny link do dołączenia).
   - Otrzymasz link w formacie `https://testflight.apple.com/join/XXXXX`, który możesz udostępnić piwowarom na forach (np. piwo.org, grupy piwowarstwa domowego na FB).
   - Maksymalnie 10 000 testerów!

---

## 6. Weryfikacja Działania na Urządzeniu

Gdy zainstalujesz aplikację z TestFlight:
- Zweryfikuj działanie stopera zacierania przy zablokowanym telefonie (`Keep-Awake`).
- Sprawdź działanie kalkulatorów offline w trybie samolotowym (odcięcie od Wi-Fi/LTE).
- Sprawdź limit darmowych warek (pierwsze 3 warki bez przeszkód, 4. warka z komunikatem o Apps4Brew Pass).

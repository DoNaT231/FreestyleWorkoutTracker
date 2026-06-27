# Freestyle Workout Tracker – Részletes alkalmazás dokumentáció

**Szerző:** Komoróczy Donát  
**Email:** donatkomoroczy@gmail.com  
**Projekt verzió:** 0.0.0 (MVP+)  
**Felület nyelve:** magyar  
**Forráskód:** angol változónevek, magyar kommentek és UI szövegek  
**Utolsó frissítés:** 2026. június

---

## Tartalomjegyzék

1. [Bevezetés](#1-bevezetés)
2. [Kinek készült és mire való](#2-kinek-készült-és-mire-való)
3. [Technológiai stack](#3-technológiai-stack)
4. [Architektúra és adatfolyam](#4-architektúra-és-adatfolyam)
5. [Felhasználói fiók és hitelesítés](#5-felhasználói-fiók-és-hitelesítés)
6. [Oldalak és navigáció](#6-oldalak-és-navigáció)
7. [Edzés rögzítés – teljes folyamat](#7-edzés-rögzítés--teljes-folyamat)
8. [Timer rendszer](#8-timer-rendszer)
9. [Gyakorlatok kezelése](#9-gyakorlatok-kezelése)
10. [Profil és testsúly napló](#10-profil-és-testsúly-napló)
11. [Pontszámítási rendszer](#11-pontszámítási-rendszer)
12. [Poszt-edzés összegző](#12-poszt-edzés-összegző)
13. [Progress oldal](#13-progress-oldal)
14. [Edzésnapló](#14-edzésnapló)
15. [Demó (vendég) mód](#15-demó-vendég-mód)
16. [Adattárolás és szinkronizáció](#16-adattárolás-és-szinkronizáció)
17. [Adatmodell](#17-adatmodell)
18. [Forráskód struktúra](#18-forráskód-struktúra)
19. [Telepítés és fejlesztés](#19-telepítés-és-fejlesztés)
20. [Tervezési döntések](#20-tervezési-döntések)
21. [Ismert korlátok és jövőbeli irányok](#21-ismert-korlátok-és-jövőbeli-irányok)

---

## 1. Bevezetés

A **Freestyle Workout Tracker** (FWT) egy webes, mobilra optimalizált edzésnapló alkalmazás. A célja, hogy a saját testsúlyos, kondiparkos és calisthenics edzéseket gyorsan, megbízhatóan lehessen rögzíteni – anélkül, hogy előre megírt edzéstervet kellene követni.

Az alkalmazás **freestyle** logikára épül: a felhasználó lemegy edzeni, kiválaszt egy gyakorlatot, megcsinál néhány szettet, megadja az ismétléseket vagy a tartási időt, majd továbblép. Nem kell minden adatot azonnal kitölteni – a pihenő alatt vagy később is pótolható a hiányzó ismétlésszám.

A projekt **local-first** elven működik: az aktív edzés minden lépése először a böngésző `localStorage`-ába kerül, így internetkimaradás, oldalfrissítés vagy app bezárása esetén sem veszik el az adatok. Bejelentkezett felhasználóknál a befejezett edzések és a profiladatok **Firebase Cloud Firestore**-ban tárolódnak.

---

## 2. Kinek készült és mire való

### Tipikus felhasználói helyzetek

| Helyzet | Hogyan segít az app |
|---------|---------------------|
| Kondiparkban edzel, nincs előre tervezett program | Gyors gyakorlatválasztás, szett timer, pihenőidőzítő |
| Nem akarsz regisztrálni először | Demó mód – kipróbálható mintaadatokkal |
| Szeretnéd látni, mennyit dolgoztál egy héten | Edzésterhelés, heti összesítés, Progress oldal |
| Szeretnéd követni a húzódzkodás fejlődését | Relatív erő, becsült 1RM, kiemelt gyakorlat trend |
| Plank, handstand hold stb. | Felfelé számláló tartás közben, automatikus másodperc mentés |
| Régi edzéseid pontszámai ne változzanak testsúly módosítás után | Testsúly snapshot edzés indításakor |

### Amit szándékosan nem csinál (jelenleg)

- Előre megírt heti edzésterv követése
- Étrend / makró számolás
- Közösségi funkciók, megosztás
- Natív iOS / Android app (webes PWA szinten fut)
- Egyetlen „összesített fitness pontszám” (helyette három külön mutató)

---

## 3. Technológiai stack

### Frontend

| Technológia | Verzió | Szerep |
|-------------|--------|--------|
| **React** | 19.x | UI komponensek, állapotkezelés |
| **Vite** | 8.x | Fejlesztői szerver, production build |
| **JavaScript** | ES modules | Nyelv (TypeScript nincs használva) |
| **Tailwind CSS** | 4.x | Utility-first stílus (`@tailwindcss/vite` plugin) |
| **React Router** | 7.x | Kliens oldali routing, védett útvonalak |

### Backend / felhő (Firebase)

| Szolgáltatás | Szerep |
|--------------|--------|
| **Firebase Authentication** | Email + jelszó regisztráció és bejelentkezés |
| **Cloud Firestore** | NoSQL adatbázis: profil, edzések, saját gyakorlatok, globális gyakorlatlista |
| **Firebase Admin SDK** | Node.js seed script – alap gyakorlatok feltöltése Firestore-ba |

### Kliens oldali tárolás

| Tároló | Tartalom |
|--------|----------|
| `localStorage` | Aktív edzés, demó session, demó edzések |
| `sessionStorage` | Utolsó befejezett edzés (poszt-összegző megjelenítéshez) |

### Egyéb

| Technológia | Szerep |
|-------------|--------|
| **Web Audio API** | Hangjelzés pihenőidő lejártakor (`src/utils/sounds.js`) |
| **ESLint** | Kódminőség ellenőrzés |

### Amit nem használ a projekt

- Redux, Zustand vagy más globális state library (Context + hookok helyette)
- Külső chart library (Chart.js, Recharts stb.) – saját CSS oszlopdiagramok
- TypeScript
- SSR / Next.js
- Backend szerver (csak Firebase + statikus hosting)

### Miért ezek a technológiák?

- **React + Vite:** gyors fejlesztés, kis projekthez ideális build idő
- **Tailwind:** mobil-first UI gyorsan, konzisztens design
- **Firebase:** auth + adatbázis egy helyen, nincs saját backend karbantartás
- **localStorage:** edzés közben a legfontosabb, hogy az adat ne vesszen el
- **Nincs chart lib:** kisebb bundle, egyszerűbb MVP

---

## 4. Architektúra és adatfolyam

### Rétegek (felülről lefelé)

```
┌──────────────────────────────────────────────────────────────────┐
│  PAGES (src/pages/)                                              │
│  Dashboard, ActiveWorkout, Progress, Profile, History, stb.      │
│  → magyar UI, mobil layout (~max 512px szélesség)                │
└────────────────────────────┬─────────────────────────────────────┘
                             │
┌────────────────────────────▼─────────────────────────────────────┐
│  COMPONENTS (src/components/)                                    │
│  layout, workout, summary, progress, profile, exercises, ui      │
└────────────────────────────┬─────────────────────────────────────┘
                             │
┌────────────────────────────▼─────────────────────────────────────┐
│  HOOKS + CONTEXT                                                 │
│  useAuth, useActiveWorkout, useWorkoutHistory, useExercises,     │
│  useUserProfile, useWeightLog, useWorkoutTimer                   │
│  AuthProvider, ActiveWorkoutProvider                             │
└────────────────────────────┬─────────────────────────────────────┘
                             │
         ┌───────────────────┼───────────────────┐
         ▼                   ▼                   ▼
   SERVICES            UTILS                  STORAGE
   Firestore API      scoring/               localStorage
   guestStorage       progress/              sessionStorage
   profileService     timer, workoutFactory
```

### Provider hierarchia (`src/main.jsx`)

A React fa kívülről befelé:

1. `StrictMode`
2. `BrowserRouter` – URL alapú navigáció
3. `AuthProvider` – bejelentkezés, vendég mód
4. `ActiveWorkoutProvider` – aktív edzés állapot (local-first)
5. `App` – route definíciók

### Edzés mentés adatfolyama

```
Felhasználó művelet (pl. szett vége)
        │
        ▼
ActiveWorkoutProvider (state frissítés)
        │
        ├──► localStorage mentés (azonnal)
        │
        └──► Firestore sync (ha bejelentkezett, nem vendég)
                    │
                    └──► syncStatus: 'synced' | 'pendingSync'
```

**Fontos:** A timer **nem** ír másodpercenként sem localStorage-ba, sem Firestore-ba. A timer állapot `phase`, `startedAt` és `durationSeconds` mezőkből számolódik újra – így oldalfrissítés után is helyes marad.

---

## 5. Felhasználói fiók és hitelesítés

### Bejelentkezett mód

- **Regisztráció:** email + jelszó (`createUserWithEmailAndPassword`)
- **Bejelentkezés:** email + jelszó (`signInWithEmailAndPassword`)
- **Kijelentkezés:** Firebase `signOut`
- Session: Firebase Auth automatikusan kezeli (`onAuthStateChanged`)

### Demó (vendég) mód

- **Belépés:** Login / Register oldalon a „Demó kipróbálása (vendég)” gomb
- **Működés:** `loginAsGuest()` – nem hoz létre Firebase fiókot
- **Session jelölés:** `localStorage` kulcs: `fwt_guest_session`
- **Felhasználó objektum:** speciális vendég user (`isGuest: true`, fix UID)
- **Kijelentkezés:** demó session törlése; opcionálisan megtartja a localStorage edzéseket

### Route védelem

| Komponens | Szerep |
|-----------|--------|
| `ProtectedRoute` | Csak bejelentkezve vagy demó módban enged tovább |
| `GuestRoute` | Login/Register – ha már be vagy lépve, átirányít főoldalra |

### Auth és demó váltás

- Ha valaki **Firebase-be jelentkezik be**, a demó session automatikusan törlődik
- Demó módban **nincs Firestore írás** – minden edzés localStorage-ban marad

---

## 6. Oldalak és navigáció

### Alsó navigációs sáv (`AppNav`)

| Címke | Útvonal | Funkció |
|-------|---------|---------|
| Főoldal | `/` | Dashboard, edzés indítás |
| Progress | `/progress` | Statisztikák, fejlődés |
| Gyakorlatok | `/exercises` | Katalógus, saját gyakorlatok |
| Napló | `/history` | Korábbi edzések |

A Profil (`/profile`) és az edzés flow oldalak a navigációs sávból külön linkkel / gombbal érhetők el.

### Teljes route lista

| Útvonal | Oldal | Védett | Leírás |
|---------|-------|--------|--------|
| `/` | `DashboardPage` | Igen | Főoldal, edzés indítás/folytatás |
| `/login` | `LoginPage` | Nem (vendég) | Bejelentkezés + demó gomb |
| `/register` | `RegisterPage` | Nem (vendég) | Regisztráció + demó gomb |
| `/profile` | `ProfilePage` | Igen | Testsúly, magasság, testsúly napló |
| `/exercises` | `ExercisesPage` | Igen | Gyakorlatlista, kategória szűrés |
| `/exercises/new` | `ExerciseFormPage` | Igen | Új saját gyakorlat |
| `/exercises/:id/edit` | `ExerciseFormPage` | Igen | Saját gyakorlat szerkesztése |
| `/workout/new` | `NewWorkoutPage` | Igen | Új edzés indítása (név opcionális) |
| `/workout/active` | `ActiveWorkoutPage` | Igen | Aktív edzés – timer flow |
| `/workout/summary` | `ExerciseSummaryPage` | Igen | Gyakorlat összegzés mentés előtt |
| `/workout/done` | `WorkoutPostSummaryPage` | Igen | Poszt-edzés összegző, pontszámok |
| `/history` | `WorkoutHistoryPage` | Igen | Edzésnapló lista |
| `/history/:workoutId` | `WorkoutDetailPage` | Igen | Edzés részletei, törlés |
| `/progress` | `ProgressPage` | Igen | Fejlődés, grafikonok, rekordok |
| `/guide/scoring` | `ScoringGuidePage` | Igen | Pontszámok magyarázata (HU) |

Ismeretlen útvonal → átirányítás a főoldalra.

### Layout komponensek

- **`AppLayout`** – fejléc (cím, alcím), fő tartalom, opcionális lábléc
- **`GuestModeBanner`** – sárga sáv demó módban: „Demó módban vagy”
- **`LogoutButton`** – kijelentkezés a fejlécben
- **`LoadingScreen`** – betöltés közben

---

## 7. Edzés rögzítés – teljes folyamat

### 7.1 Edzés indítása

1. Dashboard → **Új edzés indítása** (`/workout/new`)
2. Opcionális edzésnév megadása
3. Ha üres a név → automatikus: **„Edzés N”** (N = edzésszám + 1)
4. Edzés létrejön `in_progress` státusszal
5. **Testsúly snapshot** rögzítése: `bodyWeightKgAtWorkout` a profilból (ha van)
6. Átirányítás az aktív edzés képernyőre

### 7.2 Gyakorlat hozzáadása

1. Gyakorlat választó lista (saját + alap gyakorlatok)
2. Kiválasztás után a gyakorlat **snapshot** bemásolódik az edzésbe:
   - név, típus, kategóriák
   - `bodyweightLoadFactor`, `staticHoldFactor`, `difficultyMultiplier`
   - alap pihenőidő (`restSeconds`), felkészülési idő (`prepSeconds`)
3. A snapshot miatt későbbi gyakorlat-módosítások **nem írják át** a régi edzéseket

### 7.3 Egy gyakorlat szett flow-ja

```
[IDLE] Pihenő beállítás (+/- mp) → „Gyakorlat indítása”
        │
        ▼
[PREP] Felkészülési visszaszámláló (alapból 10 mp, kihagyható)
        │
        ▼
[ACTIVE_SET] Aktív szett
   • ismétléses: „Csak csináld – majd nyomj Vége-t”
   • tartás (time): felfelé számláló (pl. 0:00 → 1:05) → Vége rögzíti az időt
        │
        ▼
[REST] Pihenő visszaszámláló + ismétlés/mp választó
   • +10 mp / +30 mp pihenő hosszabbítás
   • hangjelzés pihenő végén
   • „Következő szett” vagy „Gyakorlat befejezése”
        │
        └──► vissza ACTIVE_SET (új szett) vagy gyakorlat vége
```

### 7.4 Rugalmas ismétlés megadás

- A pihenő alatt **nem kötelező** azonnal megadni az ismétlést
- Ha nem adod meg, a szett `missing_reps` státuszú marad
- Később a gyakorlat összegző képernyőn (`/workout/summary`) pótolható
- **Tartás gyakorlatoknál:** a Vége gomb automatikusan kitölti a másodperceket; pihenőnél finomhangolható

### 7.5 Gyakorlat és edzés befejezése

1. **Gyakorlat befejezése** → `/workout/summary` – szettek átnézése, hiányzó adatok pótlása
2. További gyakorlat vagy **edzés befejezése**
3. Edzés befejezésekor → Firestore mentés (vagy localStorage demóban)
4. Átirányítás → `/workout/done` poszt-edzés összegző

### 7.6 Félbehagyott edzés visszaállítása

- Ha van aktív edzés localStorage-ban, a Dashboard **RestoreWorkoutModal**-t mutat
- Lehetőség: folytatás vagy elvetés

---

## 8. Timer rendszer

### Timer fázisok (`TIMER_PHASE`)

| Fázis | Kulcs | Jelentés |
|-------|-------|----------|
| Várakozás | `idle` | Pihenő beállítás, gyakorlat még nem fut |
| Felkészülés | `prep` | Visszaszámláló szett előtt |
| Aktív szett | `active_set` | A szett folyamatban van |
| Pihenő | `rest` | Szettek közötti pihenő |

### Timer objektum mezői

```javascript
{
  phase: 'prep' | 'active_set' | 'rest' | 'idle',
  startedAt: 1718000000000,    // Unix ms – indulás pillanata
  durationSeconds: 90          // cél időtartam (prep/rest); active_set-nél 0
}
```

### Számítási logika (`src/utils/timer.js`)

- **Hátralévő idő** (prep, rest): `durationSeconds - eltelt másodpercek`
- **Eltelt idő** (tartás active_set): `Date.now() - startedAt` → felfelé számláló
- **Megjelenítés:** `formatTimerDisplay()` → pl. `1:05`
- **UI frissítés:** `useWorkoutTimer` hook – másodpercenként újraszámol, **nem ment** storage-ba

### Hangjelzés

Pihenőidő lejártakor `playRestTimerEndSound()` – rövid beep (Web Audio API). Ez segít, ha a telefon a zsebben van és nem nézed a képernyőt.

---

## 9. Gyakorlatok kezelése

### Alap gyakorlatok (globális katalógus)

- **Forrás fájl:** `scripts/data/defaultExercises.js` (~37 gyakorlat)
- **Firestore collection:** `defaultExercises/{exerciseId}`
- **Feltöltés:** `npm run seed:exercises`
- **Példák:** normál húzódzkodás, tolódzkodás, plank, handstand hold, muscle-up

### Saját gyakorlatok

- Felhasználónként: `users/{userId}/exercises/{exerciseId}`
- Létrehozás, szerkesztés, törlés az appban
- Megjelennek az alap gyakorlatok mellett az edzés választóban

### Gyakorlat típusok

| Típus | Kulcs | Mérés | Példa |
|-------|-------|-------|-------|
| Ismétléses | `reps` | ismétlésszám | Húzódzkodás, tolódzkodás |
| Idő alapú | `time` | másodperc (tartás) | Plank, L-sit, handstand hold |

### Kategóriák (mozgásminták)

Egy gyakorlatnak **több kategóriája** is lehet (pl. muscle-up: húzó + toló + skill):

| Kulcs | Magyar címke |
|-------|--------------|
| `pull` | Húzó |
| `push` | Toló |
| `core` | Törzs |
| `legs` | Láb |
| `skill` | Skill / technika |
| `full_body` | Teljes test |
| `cardio` | Cardio / kondíció |

### Terhelési mezők (pontszámításhoz)

| Mező | Jelentés |
|------|----------|
| `bodyweightLoadFactor` | Testsúly hány %-a számít terhelésnek (pl. tolódzkodás ~0,7) |
| `staticHoldFactor` | Tartás nehézségi tényező |
| `difficultyMultiplier` | Nehézség szorzó (főleg tartásoknál) |
| `supportsAdditionalWeight` | Lehet-e extra súly (öv, mellény) |

Ha ezek hiányoznak a snapshotból, a `loadDefaults.js` pótolja a seed katalógusból vagy kategória-alapú fallbackből.

### Gyakorlat betöltés forrásai

| Mód | Alap gyakorlatok | Saját gyakorlatok |
|-----|------------------|-------------------|
| Bejelentkezett | Firestore `defaultExercises` (+ helyi fallback) | Firestore `users/.../exercises` |
| Demó | Helyi `defaultExercises.js` fájl | Nincs (csak alap lista) |

---

## 10. Profil és testsúly napló

### Profil adatok (`/profile`)

- **Testsúly (kg)** – kötelező a pontszámításhoz (figyelmeztetés, ha hiányzik)
- **Magasság (cm)** – opcionális, jövőbeli funkciókhoz
- **Testsúly napló** – dátum + súly bejegyzések, törlés
- **Testsúly trend** – egyszerű CSS oszlopdiagram az utolsó mérésekről

### Testsúly snapshot edzésnél

Minden **új edzés indításakor** rögzítésre kerül:

- `bodyWeightKgAtWorkout`
- `heightCmAtWorkout`

**Miért fontos:** Ha később módosítod a profil testsúlyát, a régi edzések edzésterhelése és erőszintje **nem változik** – az edzés pillanatában érvényes testsúlyt használja a számítás.

### Tárolás

| Mód | Profil | Testsúly napló |
|-----|--------|----------------|
| Bejelentkezett | Firestore `users/{uid}/profile/main` | `users/{uid}/weightLog/{entryId}` |
| Demó | `DEMO_PROFILE` konstans (memória) | `DEMO_WEIGHT_LOG` konstans |

---

## 11. Pontszámítási rendszer

A rendszer **három külön mutatót** számol – nem egy összevont „fitness pontot”. Mindegyik más kérdésre válaszol.

| Mutató | Kérdés | Gyakorlat típus |
|--------|--------|-----------------|
| **Edzésterhelés** | Mennyit dolgoztál összesen? | `reps` |
| **Erőszint** | Milyen erőt mutattál? | `reps` |
| **Relatív erő** | Mennyire erős vagy testsúlyodhoz képest? | `reps` |
| **Statikus tartás pont** | Mennyire volt nehéz a tartás? | `time` |

Részletes magyarázat az appban: **`/guide/scoring`** (`src/content/scoringGuide.js`).

### 11.1 Edzésterhelés (Training Load)

**Fájl:** `src/utils/scoring/loadScore.js`

**Képlet egy szettre:**

```
effektív terhelés (kg) = testsúly × bodyweightLoadFactor + extra súly
edzésterhelés (szett) = ismétlések × effektív terhelés
```

**Edzés szinten:** összes ismétléses szett terhelésének összege.

**Példa – húzódzkodás:**
- Testsúly az edzésnél: 80 kg
- Testsúly-tényező: 1,0
- 8 ismétlés → 8 × 80 = **640 pont**

**Fontos szabályok:**
- Idő alapú gyakorlatokra **0** edzésterhelés
- **Nincs** `difficultyMultiplier` szorzás az edzésterhelésnél
- Testsúly hiányában az edzésterhelés **null** (nem számolható)

### 11.2 Erőszint (Strength – Epley 1RM)

**Fájl:** `src/utils/scoring/strengthScore.js`

**Képlet:**

```
becsült 1RM (kg) = effektív terhelés × (1 + ismétlések / 30)
relatív erő = becsült 1RM / testsúly
```

**Megbízhatóság** (hány ismétlésből számoltuk):

| Ismétlések | Megbízhatóság |
|------------|---------------|
| 1–5 | Magas |
| 6–10 | Közepes |
| 11+ | Alacsony |

**Példa:**
- 80 kg testsúly, 1,0 tényező, 5 ismétlés
- 1RM ≈ 80 × (1 + 5/30) = 80 × 1,167 ≈ **93,3 kg**
- Relatív erő ≈ 93,3 / 80 ≈ **1,17** (testsúly 117%-a)

Az edzés **legjobb erőszintje** = a legmagasabb becsült 1RM-et adó szett.

### 11.3 Statikus tartás pont (Hold Score)

**Fájl:** `src/utils/scoring/holdScore.js`

**Képlet:**

```
tartás pont = másodperc × testsúly × staticHoldFactor × difficultyMultiplier
```

**Példa – plank:**
- 60 mp tartás, 80 kg testsúly
- staticHoldFactor: 0,03, difficultyMultiplier: 1,0
- 60 × 80 × 0,03 × 1,0 = **144 pont**

### 11.4 Segéd modulok

| Fájl | Funkció |
|------|---------|
| `loadDefaults.js` | Hiányzó load faktorok pótlása katalógusból |
| `helpers.js` | Közös segédfüggvények (testsúly, reps lekérés) |
| `format.js` | Számok formázása megjelenítéshez |
| `workoutSummary.js` | Edzés szintű összesítés |
| `weeklySummary.js` | Heti / havi összesítés |
| `records.js` | Személyes rekordok keresése |

---

## 12. Poszt-edzés összegző

**Útvonal:** `/workout/done`  
**Komponens:** `WorkoutPostSummaryPage.jsx`

### Megjelenő információk

| Elem | Tartalom |
|------|----------|
| Fő statisztika kártyák | Edzésterhelés, legjobb erőszint, relatív erő, tartás pont, edzés időtartama |
| Kategória bontás | Terhelés / tartás kategóriánként |
| Gyakorlat kártyák | Szettek, ismétlések, összehasonlítás előző alkalommal |
| Kiemelések | Új rekordok, legjobb szett |
| Heti összegzés | Aktuális hét edzésterhelése vs. előző hét |
| Link | „Hogyan számolódnak a pontok?” → `/guide/scoring` |

### Adatforrás

- Az aktuális edzés: navigációs state vagy `sessionStorage` (utolsó befejezett)
- Korábbi edzések: Firestore vagy demó localStorage (összehasonlításhoz)

---

## 13. Progress oldal

**Útvonal:** `/progress`  
**Számítás:** `src/utils/progress/computeProgress.js`

### Időszak választó

| Opció | Jelentés |
|-------|----------|
| 4 hét | Utolsó 28 nap |
| 3 hónap | Utolsó 90 nap |
| 6 hónap | Utolsó 180 nap |
| Összes | Minden befejezett edzés |

### Szekciók részletesen

#### 1. Fejlődésed
Összesítő kártyák az időszakra: edzésszám, szettek, ismétlések, edzésterhelés, tartási idő, új rekordok száma.

#### 2. Relatív erő
Kiemelt gyakorlat (alapból húzódzkodás, ha volt ilyen) relatív erő trendje időben.

#### 3. Erőszint
Becsült 1RM trend, megbízhatóság jelzéssel.

#### 4. Heti edzésterhelés
CSS oszlopdiagram – heti összes edzésterhelés az időszakban.

#### 5. Aktivitás
Edzésszám, átlagos szettek/edzés, összesített mutatók.

#### 6. Kategória bontás
Vízszintes sávok: húzó, toló, core stb. – szettek, ismétlések, terhelés.

#### 7. Kiemelt gyakorlat fejlődése
Tab választó (ismétlések / terhelés / 1RM), trend lista időrendben.

#### 8. Statikus tartások
Tartási gyakorlatok összesített ideje és tartás pontja.

#### 9. Rekordok
Személyes csúcsok: legtöbb ismétlés, legjobb 1RM, leghosszabb tartás stb.

#### 10. Rendszeresség
- Edzések az elmúlt 7 / 30 napban
- Leghosszabb heti sorozat (hány hét egymás után edzettél)
- 30 napos pont rács – naponként volt-e edzés

### Demó mód figyelmeztetés

`ProgressDemoNotice` komponens – sárga doboz:
- Hány **minta edzés** (`isDemo: true`) és hány **saját demó edzés** szerepel a statisztikában
- Segít megérteni, hogy a 6 előre feltöltött edzés nem a saját munkád

---

## 14. Edzésnapló

### Lista (`/history`)

- Befejezett edzések dátum szerint (legújabb elöl)
- Kártyán: edzés neve, dátum, gyakorlatok száma, rövid összegzés

### Részletek (`/history/:workoutId`)

- Teljes edzés: gyakorlatok, szettek, ismétlések / másodpercek
- **Törlés** megerősítő dialógussal

### Adatforrás

| Mód | Forrás |
|-----|--------|
| Bejelentkezett | Firestore `users/{uid}/workouts` |
| Demó | `localStorage` → `fwt_guest_workouts` |

---

## 15. Demó (vendég) mód

### Cél

Regisztráció nélkül kipróbálni az appot – Progress, napló, edzés flow – anélkül, hogy Firestore-hoz kellene hozzáférni.

### Mit csinál a demó mód?

1. **Nem** hoz létre Firebase felhasználót
2. **Nem** ír Firestore-ba
3. Betölt **6 minta edzést** a Progress és napló szemléltetéséhez
4. A saját demó alatt rögzített edzések **localStorage-ban** maradnak
5. Gyakorlatok a **helyi katalógus fájlból** töltődnek

### localStorage kulcsok (demó)

| Kulcs | Tartalom |
|-------|----------|
| `fwt_guest_session` | Demó mód aktív (`'1'`) |
| `fwt_guest_workouts` | Minta + saját befejezett edzések |
| `fwt_guest_active_workout` | Folyamatban lévő demó edzés |

### Minta edzések (`demoData.js`)

- **6 db** előre generált edzés
- ID: `demo-workout-1` … `demo-workout-6`
- Jelölés: `isDemo: true`
- Különböző dátumok (utóbbi hetek/hónapok)
- Tartalmaznak húzó, toló, tartás gyakorlatokat – realisztikus statisztikákhoz

### Saját demó edzések

- ID: `guest-{timestamp}`
- Jelölés: `isDemo: false`
- Ugyanabban a localStorage listában, mint a minták

### Demó profil

```javascript
DEMO_PROFILE = { bodyWeightKg: 78, heightCm: 178 }
DEMO_WEIGHT_LOG = [ ... minta mérések ]
```

### Esemény: edzés frissítés

`GUEST_WORKOUTS_UPDATED_EVENT` – custom event, amikor demó edzés mentődik. A Progress oldal erre újratölti az adatokat.

### Kijelentkezés demóból

- `clearGuestSession({ keepWorkouts: true })` – session törlődik, edzések maradhatnak
- Regisztráció/bejelentkezés után demó session automatikusan törlődik

---

## 16. Adattárolás és szinkronizáció

### Firestore struktúra

```text
defaultExercises/
  {exerciseId}              ← globális gyakorlatok (csak olvasás kliensről)

users/
  {userId}/
    profile/
      main                    ← testsúly, magasság, updatedAt
    weightLog/
      {entryId}               ← dátum, bodyWeightKg
    exercises/
      {exerciseId}            ← saját gyakorlatok
    workouts/
      {workoutId}             ← befejezett edzések
```

### Firestore Security Rules (összefoglalva)

- `users/{userId}/**` – csak a saját UID-jű bejelentkezett user olvashat/írhat
- `defaultExercises` – bejelentkezett user olvashat, **írni nem lehet** kliensről

### Szinkronizációs státusz

| Érték | Jelentés |
|-------|----------|
| `synced` | Firestore-ban naprakész |
| `pendingSync` | Local mentve, felhő sync sikertelen vagy folyamatban |

`SyncStatusBadge` komponens jelzi az aktív edzés képernyőn.

### localStorage kulcsok (éles user)

| Kulcs | Tartalom |
|-------|----------|
| `activeWorkout` | Folyamatban lévő edzés (local-first) |

### sessionStorage

| Kulcs | Tartalom |
|-------|----------|
| Utolsó befejezett edzés | Poszt-összegző megjelenítéshez, ha nincs navigációs state |

### Mikor történik Firestore írás?

Fontos eseményeknél (nem másodpercenként):

- Edzés létrehozása
- Gyakorlat hozzáadása
- Pihenőidő módosítása
- Szett indítása / lezárása
- Ismétlés megadása / módosítása
- Gyakorlat befejezése
- **Edzés befejezése** (végleges mentés)

---

## 17. Adatmodell

### Edzés dokumentum (fő mezők)

```javascript
{
  userId: string,
  firestoreId: string | null,
  name: string,                    // pl. "Edzés 15"
  customName: boolean,
  status: 'in_progress' | 'completed',
  startedAt: string,               // ISO dátum
  finishedAt: string | null,
  durationSeconds: number | null,
  bodyWeightKgAtWorkout: number | null,
  heightCmAtWorkout: number | null,
  syncStatus: 'synced' | 'pendingSync',
  isDemo: boolean,                 // csak demó módban
  exercises: WorkoutExercise[],
  currentExerciseLocalId: string | null,
  timer: { phase, startedAt, durationSeconds },
  createdAt: string,
  updatedAt: string,
}
```

### Gyakorlat az edzésben (snapshot)

```javascript
{
  localId: string,
  exerciseId: string,              // katalógus ID
  source: 'default' | 'custom',
  name: string,
  type: 'reps' | 'time',
  categories: string[],
  primaryCategory: string,
  restSeconds: number,
  prepSeconds: number,
  bodyweightLoadFactor: number,
  staticHoldFactor: number,
  difficultyMultiplier: number,
  supportsAdditionalWeight: boolean,
  status: 'in_progress' | 'completed',
  sets: Set[],
}
```

### Szett

```javascript
{
  localId: string,
  setNumber: number,
  reps: number | null,             // ismétlés VAGY másodperc (time típusnál)
  additionalWeightKg: number,
  status: 'completed' | 'missing_reps',
  startedAt: string,
  finishedAt: string | null,
}
```

---

## 18. Forráskód struktúra

```text
freestyle-workout-tracker/
├── src/
│   ├── main.jsx                 # Belépési pont, providerek
│   ├── App.jsx                  # Route definíciók
│   ├── firebase.js              # Firebase inicializálás
│   ├── index.css                # Tailwind + globális stílusok
│   │
│   ├── pages/                   # Képernyők (1 route ≈ 1 fájl)
│   │   ├── DashboardPage.jsx
│   │   ├── ActiveWorkoutPage.jsx
│   │   ├── ProgressPage.jsx
│   │   ├── WorkoutPostSummaryPage.jsx
│   │   ├── ScoringGuidePage.jsx
│   │   └── ...
│   │
│   ├── components/
│   │   ├── layout/              # AppLayout, AppNav, GuestModeBanner
│   │   ├── workout/             # ExercisePicker, RestTimeAdjuster, ScrollNumberPicker
│   │   ├── summary/             # Stat kártyák, kiemelések
│   │   ├── progress/            # Grafikonok, szekciók, demó figyelmeztetés
│   │   ├── profile/             # Profil kártya, testsúly lista, trend
│   │   ├── exercises/           # Gyakorlat kártya, űrlap, szűrő
│   │   ├── guide/               # Pontszám útmutató panel
│   │   ├── auth/                # ProtectedRoute, GuestRoute
│   │   ├── history/             # Napló kártya
│   │   └── ui/                  # Button, Input, LoadingScreen
│   │
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useActiveWorkout.js
│   │   ├── useWorkoutHistory.js
│   │   ├── useExercises.js
│   │   ├── useUserProfile.js
│   │   ├── useWeightLog.js
│   │   └── useWorkoutTimer.js
│   │
│   ├── context/
│   │   ├── AuthProvider.jsx
│   │   ├── ActiveWorkoutProvider.jsx
│   │   ├── authContext.js
│   │   └── activeWorkoutContext.js
│   │
│   ├── services/
│   │   ├── workoutService.js        # Firestore edzések
│   │   ├── exerciseService.js       # Firestore gyakorlatok
│   │   ├── profileService.js        # Profil
│   │   ├── weightLogService.js      # Testsúly napló
│   │   ├── activeWorkoutStorage.js  # localStorage aktív edzés
│   │   ├── guestStorage.js          # Demó tárolás
│   │   └── lastWorkoutSummaryStorage.js
│   │
│   ├── utils/
│   │   ├── scoring/             # Pontszámítás (load, strength, hold, records)
│   │   ├── progress/            # Progress statisztikák
│   │   ├── timer.js             # Timer számítások
│   │   ├── workoutFactory.js    # Edzés objektumok létrehozása
│   │   ├── workoutDuration.js   # Edzés időtartam
│   │   ├── workoutSummary.js    # Poszt-edzés összeállítás
│   │   ├── guestWorkouts.js     # Demó edzés segédek
│   │   └── sounds.js            # Pihenő hang
│   │
│   ├── data/
│   │   ├── demoData.js              # 6 minta edzés, demo profil
│   │   └── defaultExercisesCatalog.js  # Helyi katalógus import
│   │
│   ├── content/
│   │   └── scoringGuide.js      # Magyar útmutató szövegek
│   │
│   └── constants/
│       ├── workout.js           # Timer fázisok, státuszok
│       ├── exerciseMeta.js      # Kategóriák, címkék
│       └── guest.js             # Demó konstansok
│
├── scripts/
│   ├── data/defaultExercises.js # Gyakorlat seed adat (37 db)
│   └── seedDefaultExercises.js  # Firestore feltöltő script
│
├── docs/
│   └── DOKUMENTACIO.md          # Ez a dokumentáció
│
├── package.json
├── README.md                    # Telepítési / Firebase setup útmutató
└── .env                         # Firebase config (nem verziókezelt)
```

### Fő hookok összefoglalva

| Hook | Mit ad |
|------|--------|
| `useAuth` | user, login, logout, isGuest, loginAsGuest |
| `useActiveWorkout` | aktív edzés állapot, szett műveletek |
| `useWorkoutHistory` | befejezett edzések listája |
| `useExercises` | alap + saját gyakorlatok |
| `useUserProfile` | profil adatok, mentés |
| `useWeightLog` | testsúly napló bejegyzések |
| `useWorkoutTimer` | timer UI frissítés (másodpercenként) |

---

## 19. Telepítés és fejlesztés

### Előfeltételek

- Node.js (ajánlott: LTS verzió)
- npm
- Firebase projekt (éles használathoz)
- `firebase-service-account.json` (csak seed scripthez)

### Parancsok

```bash
npm install              # Függőségek telepítése
npm run dev              # Fejlesztői szerver → http://localhost:5173
npm run build            # Production build → dist/
npm run preview          # Build előnézet
npm run lint             # ESLint
npm run seed:exercises   # Alap gyakorlatok → Firestore
```

### Környezeti változók (`.env`)

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_MEASUREMENT_ID=...
```

Részletes Firebase setup: lásd a gyökér **`README.md`** fájlt.

### Demó mód kipróbálása Firebase nélkül

1. `npm run dev`
2. Login oldal → „Demó kipróbálása”
3. Az app működik helyi gyakorlat katalógussal és localStorage-szal

---

## 20. Tervezési döntések

### 1. Local-first aktív edzés

**Probléma:** Edzés közben megszakadhat az internet, bezárható a lap, lemerülhet a telefon.  
**Megoldás:** Minden lépés először `localStorage`-ba, Firestore sync másodlagos.  
**Eredmény:** Az edzés nem veszik el technikai hiba miatt.

### 2. Gyakorlat snapshot az edzésben

**Probléma:** Ha módosítod a gyakorlat load faktorait, a régi edzések pontszámai elcsúsznának.  
**Megoldás:** Edzés indításakor a gyakorlat adatai bemásolódnak az edzés dokumentumba.  
**Eredmény:** Történelmi adatok konzisztensek maradnak.

### 3. Testsúly snapshot edzésenként

**Probléma:** Testsúly változás torzítaná a régi edzések terhelését.  
**Megoldás:** `bodyWeightKgAtWorkout` rögzítése edzés indításakor.  
**Eredmény:** Pontszámok az edzés pillanatában érvényes testsúlyt használnak.

### 4. Három külön pontszám

**Probléma:** Egy összevont pont keverné a volume-ot, erőt és tartást.  
**Megoldás:** Edzésterhelés, erőszint/relatív erő, statikus tartás pont külön.  
**Eredmény:** Érthetőbb statisztikák, jobb összehasonlíthatóság.

### 5. Timer nem perzisztál másodpercenként

**Probléma:** Másodpercenkénti írás túlterhelné a storage-ot és lassítaná az appot.  
**Megoldás:** `startedAt` + `durationSeconds` alapú újraszámolás.  
**Eredmény:** Oldalfrissítés után is helyes timer, minimális I/O.

### 6. Tartás számláló az aktív szettben

**Probléma:** Tartásnál nehéz fejből mérni az időt.  
**Megoldás:** Felfelé számláló + automatikus másodperc mentés Vége gombra.  
**Eredmény:** Egyszerűbb rögzítés plank, handstand stb. esetén.

### 7. Demó mód Firestore nélkül

**Probléma:** Új felhasználók nem akarnak azonnal regisztrálni.  
**Megoldás:** Vendég session + localStorage + helyi katalógus + minta edzések.  
**Eredmény:** Az app bemutatható és kipróbálható nulla backend setup mellett is.

### 8. Nincs külső chart library

**Probléma:** Chart lib növeli a bundle méretét, bonyolítja a buildet.  
**Megoldás:** Saját CSS oszlopdiagramok, trend listák, pont rács.  
**Eredmény:** Kisebb app, gyorsabb betöltés, MVP-hez elég.

### 9. Magyar felület

**Célközönség:** Magyar freestyle / calisthenics edzők.  
**Kivétel:** Kód, változónevek, Firestore mezők angolul (ipari konvenció).

---

## 21. Ismert korlátok és jövőbeli irányok

### Jelenlegi korlátok

| Terület | Korlát |
|---------|--------|
| Platform | Webes app, nincs natív mobil app |
| Offline | Teljes offline sync nincs (csak aktív edzés local-first) |
| Nyelvek | Csak magyar UI |
| Testsúly trend Progress-en | Profil oldalon van, Progress-en részleges |
| Demó | Saját gyakorlat létrehozás demóban nem mentődik Firestore-ba |
| Freestyle Index | Szándékosan nincs implementálva |

### Lehetséges jövőbeli fejlesztések

- PWA – telepíthető app, jobb offline támogatás
- Testsúly alakulás a Progress oldalon
- Több nyelv (angol UI)
- Edzés export (CSV / PDF)
- Saját gyakorlat illusztrációk
- Push értesítések pihenő végére
- Közösségi funkciók, edzés megosztás
- TypeScript migráció

---

## Kapcsolódó dokumentumok

| Fájl | Tartalom |
|------|----------|
| `README.md` | Telepítés, Firebase setup, seed, hibaelhárítás |
| `docs/DOKUMENTACIO.md` | Ez a fájl – alkalmazás és funkciók |
| `src/content/scoringGuide.js` | Pontszám magyarázat az appban megjelenítve |

---

*Copyright (c) 2026 Komoróczy Donát. A dokumentáció az alkalmazás 2026. júniusi MVP+ állapotát tükrözi.*

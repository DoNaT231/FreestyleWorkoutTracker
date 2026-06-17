# Freestyle Workout Tracker – Alkalmazás dokumentáció

**Szerző:** Komoróczy Donát  
**Email:** donatkomoroczy@gmail.com  
**Verzió:** 0.0.0 (MVP+)  
**Nyelv:** magyar UI, angol kód / változónevek

---

## 1. Mi ez az alkalmazás?

A **Freestyle Workout Tracker** egy mobilra optimalizált edzésnapló freestyle / calisthenics edzésekhez. Nem előre megírt edzéstervet követ, hanem azt támogatja, amikor a felhasználó spontán választ gyakorlatokat, szetteket csinál, és gyorsan szeretné rögzíteni az eredményt.

**Fő célok:**

- Gyors edzésrögzítés edzés közben (timer, pihenő, ismétlésszám)
- Local-first mentés – az edzés ne vesszen el kapcsolat hiba miatt
- Felhőben tárolt napló bejelentkezett felhasználóknak (Firebase)
- Értelmes statisztikák és pontszámítás (edzésterhelés, erőszint, tartás)
- Demó mód regisztráció nélkül – mások is kipróbálhatják az appot

---

## 2. Technológiai stack

| Réteg | Technológia | Verzió (package.json) |
|--------|-------------|------------------------|
| UI keretrendszer | **React** | 19.x |
| Build eszköz | **Vite** | 8.x |
| Nyelv | **JavaScript** (ES modules) | — |
| Stílus | **Tailwind CSS** | 4.x (`@tailwindcss/vite`) |
| Routing | **React Router** | 7.x |
| Autentikáció | **Firebase Authentication** | Email / jelszó |
| Adatbázis | **Cloud Firestore** | NoSQL |
| Admin / seed | **Firebase Admin SDK** | Node.js script |
| Kliens cache | **localStorage** | Aktív edzés, demó adatok |
| Kliens session | **sessionStorage** | Utolsó befejezett edzés (összegzés) |
| Hang | **Web Audio API** | Pihenő vége jelzés |

**Nincs használva:** külső chart library, Redux, TypeScript (jelenleg), natív mobil keretrendszer.

---

## 3. Architektúra – röviden

```
┌─────────────────────────────────────────────────────────┐
│  React UI (pages + components)                          │
│  magyar felület, mobil-first layout (max ~512px)      │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│  Hooks + Context                                      │
│  useAuth, useActiveWorkout, useWorkoutHistory,          │
│  useUserProfile, useWeightLog, useExercises, useWorkoutTimer │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        ▼            ▼            ▼
   Services      Utils/scoring   localStorage
   (Firestore)   (számítások)    (local-first)
```

**Provider rétegek** (`main.jsx`):

1. `BrowserRouter` – URL navigáció
2. `AuthProvider` – bejelentkezés / vendég mód
3. `ActiveWorkoutProvider` – aktív edzés állapot
4. `App` – route-ok

---

## 4. Funkciók – teljes lista

### 4.1 Felhasználói fiók

- Regisztráció email + jelszóval
- Bejelentkezés / kijelentkezés
- **Demó (vendég) mód** – regisztráció nélkül, „Demó kipróbálása” gomb
- Védett route-ok – csak bejelentkezve vagy demó módban érhetők el az oldalak

### 4.2 Profil

- Testsúly és magasság megadása
- Testsúly napló idővel (mérések listája, törlés)
- Testsúly trend egyszerű CSS oszlopdiagrammal
- **Testsúly snapshot edzés indításakor** (`bodyWeightKgAtWorkout`) – a régi edzések pontszámai nem változnak, ha később fogyasz/hízol

### 4.3 Gyakorlatok

- **Alap gyakorlatok** – globális katalógus (~37 db calisthenics gyakorlat)
- **Saját gyakorlatok** – felhasználónként Firestore-ban
- Kategóriák: húzó, toló, core, láb, skill, cardio, teljes test
- Típusok: ismétléses (`reps`) vagy idő alapú (`time`)
- Szűrés kategória szerint, saját gyakorlat szerkesztés / törlés

**Gyakorlat betöltés forrásai:**

- Bejelentkezett user: Firestore `defaultExercises` (+ fallback helyi fájl)
- Demó mód: helyi `scripts/data/defaultExercises.js` katalógus (Firestore nélkül is működik)

### 4.4 Edzés rögzítés (core flow)

1. **Új edzés** – opcionális név, automatikus „Edzés N”
2. **Gyakorlat választás** a katalógusból
3. **Felkészülés** – 10 mp visszaszámláló (kihagyható)
4. **Aktív szett** – „Vége” gomb
5. **Pihenő** – visszaszámláló, +15 / +30 mp, hangjelzés végekor
6. **Ismétlés / másodperc** – görgethető számválasztó; pihenő alatt automatikus mentés
7. További szettek vagy **gyakorlat befejezése**
8. **Összegzés** – szettek átnézése, mentés
9. **Edzés befejezése** → poszt-edzés összegző képernyő

**Local-first:** minden fontos lépés először `localStorage`-ba kerül, majd Firestore sync (ha be van jelentkezve).

### 4.5 Edzésnapló

- Korábbi edzések listája dátum szerint
- Edzés részletei (gyakorlatok, szettek)
- Edzés törlése megerősítéssel

### 4.6 Pontszámítás és összegzés

Három külön mutató (nem egy összevont „rejtélyes pont”):

| Mutató | Jelentés | Mikor használatos |
|--------|----------|-------------------|
| **Edzésterhelés** | Összes munka / volume | Ismétléses gyakorlatok |
| **Erőszint** | Becsült 1RM (Epley) | Ismétléses gyakorlatok |
| **Relatív erő** | 1RM / testsúly | Összehasonlítás |
| **Statikus tartás pont** | Tartási teljesítmény | Plank, handstand, stb. |

**Poszt-edzés összegző** (`/workout/done`):

- Edzésterhelés, legjobb erőszint, relatív erő, tartás pont
- Kategória bontás, kiemelések, heti összegzés
- Összehasonlítás előző alkalommal
- Link a pontszám magyarázatához

**Útmutató** (`/guide/scoring`): barátságos magyarázat „Tovább olvasok” részekkel, képletekkel és példákkal.

### 4.7 Progress oldal (`/progress`)

Időszak választó: 4 hét / 3 hónap / 6 hónap / összes.

Szekciók:

1. **Fejlődésed** – edzésszám, szettek, ismétlések, edzésterhelés, új rekordok
2. **Relatív erő** – kiemelt gyakorlat (alapból húzódzkodás), trend
3. **Erőszint** – becsült 1RM, megbízhatóság
4. **Heti edzésterhelés** – CSS oszlopdiagram
5. **Aktivitás** – összesítő kártyák
6. **Kategória bontás** – vízszintes sávok
7. **Kiemelt gyakorlat fejlődése** – tabok, trend lista
8. **Statikus tartások**
9. **Rekordok**
10. **Rendszeresség** – 7/30 napos edzésszám, hét sorozat, 30 napos pont rács

### 4.8 Demó (vendég) mód

| Adat | Hol tárolódik |
|------|----------------|
| Befejezett edzések | `localStorage` (`fwt_guest_workouts`) |
| Aktív edzés | `localStorage` (`fwt_guest_active_workout`) |
| 6 minta edzés | Ugyanott, `isDemo: true` jelöléssel |
| Saját demó edzés | `isDemo: false`, ID: `guest-*` |
| Gyakorlatok | Helyi katalógus fájl (nem Firestore) |
| Profil / testsúly | Memóriában, demo értékek |

- **Nincs Firestore írás** demó módban
- Progress oldalon **sárga figyelmeztetés**: hány minta vs. saját edzés szerepel a statisztikában
- Regisztráció után a demó session törlődik, éles adatok Firestore-ban

---

## 5. Pontszámítás – technikai részletek

Forrás: `src/utils/scoring/`

### Edzésterhelés (`loadScore.js`)

```
effektív terhelés = testsúly × bodyweightLoadFactor + extra súly
szett terhelés = ismétlések × effektív terhelés
```

- **Nincs** `difficultyMultiplier` szorzás
- Testsúly: `bodyWeightKgAtWorkout` (edzés pillanatában rögzítve)

### Erőszint (`strengthScore.js`)

```
becsült 1RM = effektív terhelés × (1 + ismétlések / 30)   // Epley
relatív erő = becsült 1RM / testsúly
```

Megbízhatóság: 1–5 ism. → magas, 6–10 → közepes, 11+ → alacsony

### Statikus tartás (`holdScore.js`)

```
tartás pont = másodperc × testsúly × staticHoldFactor × difficultyMultiplier
```

### Segédek

- `loadDefaults.js` – hiányzó load faktorok pótlása seed katalógusból
- `workoutSummary.js` – edzés szintű aggregáció
- `weeklySummary.js` – heti / havi összesítés
- `records.js` – személyes rekordok
- `src/utils/progress/` – Progress oldal statisztikák

---

## 6. Adattárolás

### Firestore struktúra

```text
defaultExercises/{exerciseId}     ← globális gyakorlatok (seed)
users/{userId}/
  profile/main                    ← testsúly, magasság
  weightLog/{entryId}             ← testsúly napló
  exercises/{exerciseId}          ← saját gyakorlatok
  workouts/{workoutId}            ← befejezett edzések
```

### Edzés dokumentum (jellemző mezők)

- `name`, `status`, `startedAt`, `finishedAt`, `durationSeconds`
- `bodyWeightKgAtWorkout`, `heightCmAtWorkout`
- `exercises[]` – snapshot (név, típus, load faktorok, szettek)
- Szett: `reps`, `additionalWeightKg`, `status`

### localStorage kulcsok

| Kulcs | Tartalom |
|-------|----------|
| `activeWorkout` | Éles user aktív edzése |
| `fwt_guest_session` | Demó mód aktív |
| `fwt_guest_workouts` | Demó edzések (minta + saját) |
| `fwt_guest_active_workout` | Demó aktív edzés |

---

## 7. Oldalak és route-ok

| Útvonal | Oldal | Leírás |
|---------|-------|--------|
| `/` | Dashboard | Főoldal, edzés indítás |
| `/login` | Bejelentkezés | + demó gomb |
| `/register` | Regisztráció | |
| `/exercises` | Gyakorlatok | Lista, szűrés |
| `/exercises/new` | Új gyakorlat | |
| `/exercises/:id/edit` | Szerkesztés | |
| `/workout/new` | Új edzés | |
| `/workout/active` | Aktív edzés | Timer flow |
| `/workout/summary` | Gyakorlat összegzés | Mentés előtt |
| `/workout/done` | Poszt-edzés | Pontszámok, kiemelések |
| `/history` | Napló | |
| `/history/:id` | Edzés részlet | |
| `/progress` | Statisztikák | |
| `/profile` | Profil | Testsúly, trend |
| `/guide/scoring` | Pontszám útmutató | |

**Navigáció:** alsó sáv – Főoldal, Progress, Gyakorlatok, Napló

---

## 8. Projekt mappa struktúra

```text
freestyle-workout-tracker/
├── src/
│   ├── pages/              # Képernyők (route-onként 1)
│   ├── components/         # UI komponensek (layout, workout, summary, progress…)
│   ├── hooks/              # React hookok (adat, timer)
│   ├── context/            # Auth + aktív edzés provider
│   ├── services/           # Firestore, localStorage, guest
│   ├── utils/
│   │   ├── scoring/        # Pontszámítás
│   │   └── progress/       # Progress statisztikák
│   ├── data/               # Demo adatok, helyi gyakorlat katalógus
│   ├── content/            # Statikus szövegek (scoring útmutató)
│   └── constants/          # Konstansok, címkék
├── scripts/
│   ├── data/defaultExercises.js   # Gyakorlat seed adat
│   └── seedDefaultExercises.js    # Firestore feltöltő
├── docs/
│   └── DOKUMENTACIO.md     # Ez a fájl
├── package.json
└── README.md               # Telepítési útmutató
```

---

## 9. Futtatás és parancsok

```bash
npm install              # Függőségek
npm run dev              # Fejlesztői szerver (localhost:5173)
npm run build            # Production build → dist/
npm run seed:exercises   # Gyakorlatok feltöltése Firestore-ba
```

**Környezeti változók** (`.env`): `VITE_FIREBASE_*` mezők – lásd `README.md`.

---

## 10. Döntések és megfontolások

1. **Local-first** – edzés közben a legfontosabb, hogy ne vesszen el adat; a felhő sync másodlagos.
2. **Snapshot** – edzés indításakor a gyakorlat load faktorai bemásolódnak; későbbi DB változás nem írja át a régi edzéseket.
3. **Külön pontszámok** – volume, erő és tartás nem keveredik egyetlen mutatóba.
4. **Demó mód** – bemutató célra, localStorage + helyi gyakorlatok, Firestore nélkül is működik.
5. **Nincs chart library** – egyszerű CSS oszlopok és listák (kisebb bundle, gyorsabb MVP).
6. **Magyar UI** – célközönség magyar freestyle / calisthenics edzők.

---

## 11. Jövőbeli bővítési lehetőségek

- Progress oldal további grafikonjai (már van alap)
- Freestyle Index (szándékosan nincs implementálva)
- Több nyelv
- PWA / offline teljes támogatás
- Social / megosztás

---

*Utolsó frissítés: 2026 – a dokumentáció az alkalmazás aktuális MVP+ állapotát tükrözi.*

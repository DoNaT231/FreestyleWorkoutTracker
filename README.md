# Freestyle Workout Tracker

Mobilbarát freestyle edzéskövető alkalmazás saját testsúlyos, kondiparkos és calisthenics edzések gyors naplózására.

Az alkalmazás azoknak készül, akik nem feltétlenül előre megírt edzésterv alapján edzenek, hanem lemennek a kondiparkba vagy edzőterembe, kiválasztanak egy gyakorlatot, megcsinálnak néhány szettet, majd szeretnék gyorsan és biztonságosan eltárolni az eredményeiket.

A projekt fő célja egy egyszerű, gyors és megbízható edzésnapló létrehozása, amely local-first mentési logikával működik, majd Firebase Firestore adatbázissal szinkronizál.

## Fő funkciók

- Email/jelszavas regisztráció és bejelentkezés Firebase Authenticationnel
- Cloud Firestore adatbázis-integráció
- Alapértelmezett gyakorlatlista saját testsúlyos és calisthenics edzésekhez
- Mobilra optimalizált edzésrögzítési folyamat
- Opcionális edzésnév
- Automatikus edzésnév-generálás, például „Edzés 15”
- Gyakorlatonként eltérő alap pihenőidő
- 10 másodperces felkészülési visszaszámláló szettek előtt
- Pihenőidőzítő szettek között
- Görgethető ismétlésszám-választó mobilos használathoz
- Local-first aktív edzésmentés localStorage használatával
- Firestore szinkronizáció mentett edzésekhez
- Hiányzó ismétlésszámok rugalmas kezelése freestyle edzésekhez
- Gyakorlat végi összegző képernyő mentés előtt
- Felhasználónként elkülönített edzésadatok Firestore Security Rules segítségével

## Technológiai stack

- React
- Vite
- JavaScript
- Tailwind CSS
- Firebase Authentication
- Cloud Firestore
- Firebase Admin SDK seed scriptekhez
- localStorage az aktív edzés biztonsági mentéséhez

## Projekt státusza

A projekt jelenleg korai MVP fejlesztési fázisban van.

Aktuális fókusz:

- Firebase projekt beállítása
- Alap gyakorlatok seedelése Firestore-ba
- Regisztráció és bejelentkezés
- Védett útvonalak
- Edzésindítási folyamat
- Local-first aktív edzésmentés
- Firestore szinkronizáció

## Alap működési logika

A felhasználó bejelentkezés után új edzést indíthat. Az edzés neve opcionális. Ha nem ad meg nevet, az alkalmazás automatikus nevet generál, például „Edzés 15”.

Az edzés indítása után a felhasználó kiválaszt egy gyakorlatot, például:

- Szűk fogású húzódzkodás
- Normál húzódzkodás
- Tolódzkodás
- Fekvőtámasz
- Plank
- Handstand hold
- Tuck front lever hold

Minden gyakorlat rendelkezik alapértelmezett pihenőidővel és felkészülési idővel. A felhasználó az adott edzésen belül módosíthatja a pihenőidőt.

A gyakorlat indításakor elindul egy 10 másodperces felkészülési visszaszámláló. Ezután a felhasználó elvégzi a szettet, majd a „Vége” gombbal lezárja azt. A pihenőidő alatt megadhatja, hány ismétlés sikerült, de ez nem kötelező. Ha nem adja meg időben, az app később is engedi kitölteni vagy módosítani az adatot.

## Local-first mentési logika

Az alkalmazás egyik legfontosabb elve, hogy az edzés ne vesszen el internetkapcsolat megszakadása, oldalfrissítés, appbezárás vagy Firebase-hiba miatt.

Ezért az aktuális edzés minden fontos változtatása először localStorage-ba kerül. Ezután az alkalmazás megpróbálja Firestore-ba is szinkronizálni az adatokat.

Fontos események:

- Edzés létrehozása
- Gyakorlat hozzáadása
- Pihenőidő módosítása
- Szett indítása
- Szett lezárása
- Ismétlésszám megadása vagy módosítása
- Gyakorlat befejezése
- Edzés befejezése

A timer nem ír másodpercenként Firestore-ba. Ehelyett az app a timer állapotát `phase`, `startedAt` és `durationSeconds` mezőkkel tárolja.

## Firestore adatstruktúra

Javasolt adatstruktúra:

```text
users
  {userId}
    profile
    exercises
      {exerciseId}
    workouts
      {workoutId}

defaultExercises
  {exerciseId}

## Telepítési és setup útmutató

Ez a rész bemutatja, hogyan lehet lokálisan elindítani a projektet, hogyan kell beállítani a Firebase kapcsolatot, és hogyan lehet feltölteni az alapértelmezett gyakorlatokat a Firestore adatbázisba.

## 1. Projekt klónozása

A projekt letöltése GitHubról:

```bash
git clone https://github.com/DoNaT231/FreestyleWorkoutTracker.git
```

Belépés a projekt mappájába:

```bash
cd FreestyleWorkoutTracker
```

## 2. Függőségek telepítése

A szükséges npm csomagok telepítése:

```bash
npm install
```

Ha külön szükséges a Firebase csomag telepítése:

```bash
npm install firebase
```

Ha a seed script Firebase Admin SDK-t használ, akkor szükséges lehet:

```bash
npm install firebase-admin
```

## 3. Firebase projekt létrehozása

A projekt Firebase Authenticationt és Cloud Firestore adatbázist használ.

Firebase Console-ban hozz létre egy új projektet:

```text
Firebase Console
→ Create project
```

Projekt neve például:

```text
freestyle-workout-tracker
```

A Google Analytics az MVP-hez nem kötelező, ezért első körben kihagyható.

## 4. Web App hozzáadása Firebase-ben

Firebase Console-ban:

```text
Project Overview
→ Add app
→ Web
```

App nickname például:

```text
freestyle-workout-tracker
```

A Firebase Hosting bekapcsolása nem kötelező, ha az alkalmazás később például Vercelen fog futni.

A regisztráció után a Firebase ad egy config objektumot. Ezeket az adatokat kell majd a `.env` fájlba másolni.

## 5. Környezeti változók beállítása

A projekt gyökerében hozz létre egy `.env` fájlt.

```text
.env
```

Tartalma:

```env
VITE_FIREBASE_API_KEY=ide_jon_az_api_key
VITE_FIREBASE_AUTH_DOMAIN=ide_jon_az_auth_domain
VITE_FIREBASE_PROJECT_ID=ide_jon_a_project_id
VITE_FIREBASE_STORAGE_BUCKET=ide_jon_a_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=ide_jon_a_messaging_sender_id
VITE_FIREBASE_APP_ID=ide_jon_az_app_id
VITE_FIREBASE_MEASUREMENT_ID=ide_jon_a_measurement_id
```

Fontos: a `.env` fájlt nem szabad feltölteni GitHubra.

A `.gitignore` fájlban szerepeljen:

```gitignore
.env
```

## 6. Firebase inicializálása a projektben

A Firebase inicializálása a következő fájlban történik:

```text
src/firebase.js
```

Példa tartalom:

```js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
```

## 7. Firebase Authentication beállítása

Firebase Console-ban:

```text
Build
→ Authentication
→ Get started
→ Sign-in method
→ Email/Password
→ Enable
→ Save
```

Az MVP-ben csak az email/jelszavas belépés szükséges.

## 8. Firestore Database létrehozása

Firebase Console-ban:

```text
Build
→ Firestore Database
→ Create database
```

Javasolt mód:

```text
Start in production mode
```

Régióként európai régiót érdemes választani, például:

```text
europe-central2 (Warsaw)
```

Ezután létrejön a Cloud Firestore adatbázis.

## 9. Firestore Security Rules beállítása

Firebase Console-ban:

```text
Firestore Database
→ Rules
```

A szabályok:

```js
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    match /defaultExercises/{exerciseId} {
      allow read: if request.auth != null;
      allow write: if false;
    }
  }
}
```

Ez biztosítja, hogy minden felhasználó csak a saját adatait tudja olvasni és írni.

A `defaultExercises` collection csak olvasható bejelentkezett felhasználóknak, kliensoldalról nem írható.

## 10. Firebase Admin SDK service account beállítása

Az alapértelmezett gyakorlatok seedeléséhez a projekt Firebase Admin SDK-t használ.

Firebase Console-ban:

```text
Project settings
→ Service accounts
→ Generate new private key
```

Ez letölt egy JSON fájlt.

A fájlt nevezd át erre:

```text
firebase-service-account.json
```

Majd tedd a projekt gyökerébe:

```text
FreestyleWorkoutTracker/
  firebase-service-account.json
  package.json
  scripts/
  src/
```

Fontos: ezt a fájlt soha nem szabad feltölteni GitHubra.

A `.gitignore` fájlban szerepeljen:

```gitignore
firebase-service-account.json
```

Ha a projekt egyedi elérési utat használ, akkor `.env` fájlban megadható:

```env
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
```

## 11. Alapértelmezett gyakorlatok feltöltése

A projekt tartalmaz egy seed scriptet, amely feltölti az alap gyakorlatokat a Firestore `defaultExercises` collectionjébe.

A gyakorlatok adatai itt találhatók:

```text
scripts/data/defaultExercises.js
```

A seed script:

```text
scripts/seedDefaultExercises.js
```

Futtatás:

```bash
npm run seed:exercises
```

Sikeres futás esetén a konzolban hasonló kimenet jelenik meg:

```text
Default exercises seed indul...
✓ normal_pullup – Normál húzódzkodás
✓ close_grip_pullup – Szűk fogású húzódzkodás
...
37 alap gyakorlat feltöltve/frissítve a defaultExercises collection-ben.
```

A script fix dokumentumazonosítókat használ, ezért többször is biztonságosan futtatható. A meglévő dokumentumokat frissíti, nem hoz létre duplikált random dokumentumokat.

## 12. Lokális fejlesztői szerver indítása

A projekt indítása fejlesztői módban:

```bash
npm run dev
```

Vite esetén az alkalmazás általában ezen a címen érhető el:

```text
http://localhost:5173
```

## 13. Build készítése

Production build készítése:

```bash
npm run build
```

A buildelt fájlok a következő mappába kerülnek:

```text
dist/
```

A `dist` mappát nem szükséges GitHubra feltölteni.

A `.gitignore` fájlban szerepeljen:

```gitignore
dist
```

## 14. Fontos `.gitignore` beállítások

A projekt `.gitignore` fájljában mindenképp szerepeljen:

```gitignore
node_modules
dist
.env
firebase-service-account.json
```

Ezek közül különösen fontos:

* `.env` – Firebase web app config és környezeti változók miatt;
* `firebase-service-account.json` – Firebase Admin jogosultságokat tartalmaz;
* `node_modules` – újratelepíthető npm-ből;
* `dist` – buildelt fájlok.

## 15. Első ellenőrzési lista

A setup akkor tekinthető sikeresnek, ha:

* az `npm install` hiba nélkül lefut;
* a `.env` fájl tartalmazza a Firebase web app config adatokat;
* a Firebase Authenticationben az Email/Password provider be van kapcsolva;
* a Firestore Database létrejött;
* a Firestore Rules be vannak állítva;
* a `firebase-service-account.json` a projekt gyökerében van;
* a `npm run seed:exercises` feltölti az alap gyakorlatokat;
* a `defaultExercises` collectionben megjelennek a gyakorlatok;
* az `npm run dev` után az app elérhető a `localhost:5173` címen.

## 16. Gyakori hibák

### `Cannot find module firebase-admin`

Megoldás:

```bash
npm install firebase-admin
```

### `firebase-service-account.json not found`

Ellenőrizd, hogy a service account fájl a projekt gyökerében van-e.

Helyes példa:

```text
FreestyleWorkoutTracker/
  firebase-service-account.json
  package.json
```

### `Missing Firebase environment variables`

Ellenőrizd, hogy létezik-e `.env` fájl, és minden `VITE_FIREBASE_...` változó ki van-e töltve.

### `Permission denied` Firestore olvasásnál

Ellenőrizd, hogy:

* be vagy-e jelentkezve az appban;
* a Firestore Rules engedi-e az adott collection olvasását;
* a `defaultExercises` olvasása engedélyezett-e bejelentkezett felhasználóknak.

### `npm run dev` után nem nyílik meg az app

Nézd meg, mit ír ki a terminál. Vite esetén általában ezt a címet kell megnyitni:

```text
http://localhost:5173
```

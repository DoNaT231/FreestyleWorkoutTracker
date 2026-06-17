/**
 * Freestyle Workout Tracker – pontszámítás útmutató tartalom (HU)
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 */

export const SCORING_GUIDE_INTRO = {
  title: 'Mit mérnek az új pontszámok?',
  summary:
    'Nem egyetlen „rejtélyes számot” kapsz, hanem három külön értéket: mennyit dolgoztál (edzésterhelés), milyen erőt mutattál (erőszint), és mennyire volt nehéz egy tartás (statikus tartás pont). Mindegyik más kérdésre válaszol.',
}

export const SCORING_GUIDE_SECTIONS = [
  {
    id: 'training-load',
    title: 'Edzésterhelés',
    badge: 'Volume',
    accent: 'emerald',
    summary:
      'Az edzés összes „munkáját” mutatja: hány ismétlést csináltál, és mennyi terheléssel. Minél több szettet és ismétlést viszel végig reális nehézségen, annál magasabb lesz. Ideális összehasonlításra két hasonló edzés között.',
    details: [
      {
        type: 'paragraph',
        text: 'Ismétléses gyakorlatoknál minden szettre külön számoljuk, majd összeadjuk az egész edzésre.',
      },
      {
        type: 'formula',
        label: 'Számítás egy szettre',
        lines: [
          'effektív terhelés (kg) = testsúly × testsúly-tényező + extra súly',
          'edzésterhelés (szett) = ismétlések × effektív terhelés',
        ],
      },
      {
        type: 'example',
        title: 'Példa – húzódzkodás',
        lines: [
          'Testsúly az edzésnél: 80 kg',
          'Testsúly-tényező: 1,0 (teljes testsúly)',
          'Extra súly: 0 kg',
          'Ismétlések: 10',
          '',
          '→ effektív terhelés = 80 × 1,0 + 0 = 80 kg',
          '→ szett terhelés = 10 × 80 = 800 pont',
        ],
      },
      {
        type: 'example',
        title: 'Példa – fekvőtámasz',
        lines: [
          'Testsúly: 80 kg',
          'Testsúly-tényező: 0,65 (a testsúly ~65%-a megy a karokra)',
          'Ismétlések: 20',
          '',
          '→ effektív terhelés = 80 × 0,65 = 52 kg',
          '→ szett terhelés = 20 × 52 = 1040 pont',
        ],
      },
      {
        type: 'tip',
        text: 'A nehézségi szorzó (pl. muscle-up) nem szorozza az edzésterhelést – az a volume mérése, nem a trükk nehézsége.',
      },
    ],
  },
  {
    id: 'strength',
    title: 'Erőszint (becsült 1RM)',
    badge: 'Erő',
    accent: 'blue',
    summary:
      'Megbecsüli, mekkora maximális súlyt tudnál elvileg egyszeri ismétlésre – anélkül, hogy tényleg maxolni kellene. A legjobb szetted alapján számoljuk, Epley-formula szerint.',
    details: [
      {
        type: 'paragraph',
        text: 'Csak ismétléses gyakorlatokra értelmes. Ha sok ismétlésed van egy szettben (pl. 15+), a becslés kevésbé pontos – ezért jelezzük a megbízhatóságot is.',
      },
      {
        type: 'formula',
        label: 'Számítás',
        lines: [
          'effektív terhelés (kg) = testsúly × testsúly-tényező + extra súly',
          'becsült 1RM (kg) = effektív terhelés × (1 + ismétlések / 30)',
        ],
      },
      {
        type: 'example',
        title: 'Példa – 8 ismétlés, 80 kg effektív terhelés',
        lines: [
          'becsült 1RM = 80 × (1 + 8/30)',
          'becsült 1RM = 80 × 1,267 ≈ 101 kg',
          '',
          'Ha a testsúlyod 80 kg, ez kb. 1,26× relatív erőt jelent.',
        ],
      },
      {
        type: 'paragraph',
        text: 'A „Legjobb erőszint” az edzésen elért legmagasabb becsült 1RM. Ha több gyakorlatod is volt, a legjobb szett számít.',
      },
    ],
  },
  {
    id: 'relative-strength',
    title: 'Relatív erő',
    badge: 'Arány',
    accent: 'violet',
    summary:
      'Az erődet a testsúlyodhoz viszonyítja. Könnyebb testsúlynál és nehezebb testsúlynál is összehasonlítható – nem csak a nyers kg számít.',
    details: [
      {
        type: 'formula',
        label: 'Számítás',
        lines: ['relatív erő = becsült 1RM / testsúly az edzésnél'],
      },
      {
        type: 'example',
        title: 'Példa',
        lines: [
          'Becsült 1RM: 101 kg',
          'Testsúly az edzésnél: 80 kg',
          '',
          '→ relatív erő = 101 / 80 = 1,26×',
          '',
          'Ez azt jelenti: a becslés szerint ~1,26-szoros testsúlyt tudnál egyszer elvinni.',
        ],
      },
      {
        type: 'tip',
        text: 'A testsúly az edzés pillanatában rögzült érték (profil snapshot), nem a későbbi mérlegelés – így a régi edzések eredményei nem torzulnak.',
      },
    ],
  },
  {
    id: 'reliability',
    title: 'Megbízhatóság',
    badge: 'Info',
    accent: 'amber',
    summary:
      'Jelzi, mennyire lehet bízni a becsült 1RM-ben. Kevesebb ismétlés = pontosabb becslés, sok ismétlés = inkább állóképesség, mint max erő.',
    details: [
      {
        type: 'list',
        title: 'Szabály',
        items: [
          '1–5 ismétlés → Magas megbízhatóság',
          '6–10 ismétlés → Közepes megbízhatóság',
          '11+ ismétlés → Alacsony megbízhatóság',
        ],
      },
      {
        type: 'example',
        title: 'Miért számít?',
        lines: [
          '5 ismétlés @ 80 kg → erős, „max-közeli” becslés',
          '20 ismétlés @ 80 kg → ugyanabból a formulából jön ki magas 1RM, de valójában inkább tartóssági munka volt',
          '',
          'Az alacsony megbízhatóság nem hiba – csak emlékeztet, hogy az értéket óvatosan értelmezd.',
        ],
      },
    ],
  },
  {
    id: 'hold-score',
    title: 'Statikus tartás pont',
    badge: 'Tartás',
    accent: 'cyan',
    summary:
      'Plank, dead hang, handstand hold és hasonló gyakorlatok teljesítménye. Figyelembe veszi a tartási időt, a testsúlyt és a gyakorlat nehézségét.',
    details: [
      {
        type: 'paragraph',
        text: 'Idő alapú gyakorlatoknál nem az edzésterhelés a fő mutató, hanem ez a pont.',
      },
      {
        type: 'formula',
        label: 'Számítás egy szettre',
        lines: [
          'tartás pont = másodperc × testsúly × tartás-tényező × nehézségi szorzó',
        ],
      },
      {
        type: 'example',
        title: 'Példa – plank 60 mp',
        lines: [
          'Testsúly: 80 kg',
          'Tartás-tényező: 0,03',
          'Nehézségi szorzó: 1,0',
          'Tartási idő: 60 mp',
          '',
          '→ tartás pont = 60 × 80 × 0,03 × 1,0 = 144 pont',
        ],
      },
      {
        type: 'example',
        title: 'Példa – handstand hold 30 mp',
        lines: [
          'Testsúly: 80 kg',
          'Tartás-tényező: 0,035',
          'Nehézségi szorzó: 1,4 (nehezebb skill)',
          'Tartási idő: 30 mp',
          '',
          '→ tartás pont = 30 × 80 × 0,035 × 1,4 = 118 pont',
        ],
      },
      {
        type: 'tip',
        text: 'Itt a nehézségi szorzó számít – egy nehezebb tartás több pontot ér ugyanannyi időért.',
      },
    ],
  },
  {
    id: 'duration',
    title: 'Edzés időtartama',
    badge: 'Idő',
    accent: 'slate',
    summary:
      'Az edzés kezdetétől a befejezéséig eltelt idő – pihenőkkel együtt. Nem keveredik össze a tartás-gyakorlatok másodperceivel.',
    details: [
      {
        type: 'paragraph',
        text: 'Az edzés indításakor rögzítjük a kezdést, befejezéskor a végét. Ha a mentett idő hiányzik, a két időpont különbségéből számoljuk.',
      },
      {
        type: 'list',
        title: 'Különbség',
        items: [
          'Edzés időtartama = mennyi ideig tartott az egész edzés',
          'Tartás összesen = csak az idő-alapú gyakorlatok (plank stb.) másodperceinek összege',
        ],
      },
    ],
  },
  {
    id: 'body-weight',
    title: 'Testsúly az edzésnél',
    badge: 'Profil',
    accent: 'rose',
    summary:
      'Az edzés indításakor a profilodból másoljuk a testsúlyt. Ez alapján számolunk – későbbi fogyás/hízás nem írja át a régi edzések pontszámait.',
    details: [
      {
        type: 'paragraph',
        text: 'Ha nincs megadva testsúly a profilban, az edzésterhelés és erőszint nem számolható (a szettek és ismétlések ettől még látszanak).',
      },
      {
        type: 'tip',
        text: 'A testsúly-követés a Profil oldalon külön trend – az edzés-pontszámokhoz mindig az adott edzés pillanatában mentett érték kell.',
      },
    ],
  },
]

export const SCORING_GUIDE_FOOTER =
  'A pontszámok összehasonlításra és trendekhez valók – nem orvosi vagy versenyeredmény. A lényeg: konzisztensen edzeni és látni a fejlődést.'

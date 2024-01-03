# Vefforritun 2, 2023, verkefni 3: kennsluskráar vefþjónustur

Verkefnið er framhald af verkefni 1 og snýst um að útbúa vefþjónustur ofan á „okkar eigin kennsluskrá“.

## Markmið

Markmið verkefnisins:

- Búa til og hanna vefþjónustu.
- Framkvæma _CRUD_ aðgerðir gegnum vefþjónustlag með staðfestingu og hreinsun gagna.
- Nota TypeScript.
- Prófanir og debug á vefþjónustum ásamt því að skrifa „integration test“ fyrir vefþjónustur.

### Vefþjónustur

Útbúa skal vefþjónustur fyrir „okkar eigin kennsluskrá“,
þ.e.a.s. þjónusta sem notar HTTP
og JSON til að skila gögnum fyrir deildir og áfanga þeirra.
Viðeigandi slóð og HTTP svör eru gefin fyrir deildir en útfæra þarf fyrir áfanga.
Gera skal vefþjónustur eins _restful_ og hægt er (sjá námsefni).

Fyrir aðrar slóðir skal skila `404`. Ef villa kemur upp skal almennt skila `500`.

Athugið að **ekki** þarf að útfæra notendaumsjón, allar aðgerðir eru opnar (sem er almennt ekki æskilegt en sleppum í þessu verkefni).

**Ekki** þarf að útfæra framenda, það verður gert með React í verkefni 4.

Deildir:

- `GET /departments` skilar lista af deildum:
  - `200 OK` skilað með gögnum.
- `GET /departments/:slug` skilar stakri deild:
  - `200 OK` skilað með gögnum ef deild er til.
  - `404 Not Found` skilað ef deild er ekki til.
- `POST /departments` býr til nýja deild:
  - `200 OK` skilað ásamt upplýsingum um deild.
  - `400 Bad Request` skilað ef gögn sem send inn eru ekki rétt (vantar gögn, gögn á röngu formi eða innihald þeirra ólöglegt).
- `PATCH /departments/:slug` uppfærir deild:
  - `200 OK` skilað með uppfærðri deild ef gekk.
  - `400 Bad Request` skilað ef gögn sem send inn eru ekki rétt.
  - `404 Not Found` skilað ef deild er ekki til.
  - `500 Internal Error` skilað ef villa kom upp.
- `DELETE /departments/:slug` eyðir deild:
  - `204 No Content` skilað ef gekk.
  - `404 Not Found` skilað ef deild er ekki til.
  - `500 Internal Error` skilað ef villa kom upp.

Áfangar:

Skilgreina þarf (líkt og fyrir deildir) vefþjónustur til að geta:

- Skoðað áfanga.
- Búa til áfanga.
- Breyta áfanga.
- Uppfæra áfanga.

### Gögn og gagnagrunnur

Fyrir gögn skal staðfesta (_validation_) og hreinsa (_sanitization_) þau samkvæmt lýsingu. Ef gögn eru send inn sem standast ekki staðfestingu skal skila viðeigandi HTTP villu ásamt þeim villum sem komu upp, t.d. ef skilgreina þarf `title` og `description` en hvorugt er sent þarf að senda svar um að _bæði_ vantar (þ.e.a.s. ekki ætti að þurfa að senda gögn, fá eina villu, laga hana og senda uppfært og fá þá nýja villu sem var til staðar í fyrstu sendingu.)

Nota skal gögn sambærileg þeim úr verkefni 1 og eru í `data/` möppunni fyrir a.m.k. tvær deildir og skulu þau vera sett í gagnagrunn.

Útbúa þarf skema fyrir gögn í gagnagrunni út frá gögnum.

Hann var med
id
title
slug
description
created
updated
links {
self {
href
},
courses {
href
}
}

Um gögnin gildir:

- Deild verður að eiga:
  - Titil sem er einstakur. Út frá titli skal útbúa `slug` sem er notaður til að vísa í og sækja deild.
  - Lýsingu, ekki tómur strengur.
- Áfangi verður að eiga:
  - Númer sem er einstakt, ekki þarf að staðfesta form þess sérstaklega, aðeins að það sé ekki tómi strengurinn.
  - Heiti sem er einstakt. Út frá titli skal útbúa `slug` sem er notaður til að vísa í og sækja áfanga.
  - Einingar sem er rauntala, stærri en 0.
  - Kennslumisseri skal aðeins vera `Vor`, `Sumar`, `Haust` eða `Heilsárs`.
  - Námsstig, valfrjálst strengur.
  - Slóð í kennsluskrá, valfrjáls strengur (ekki þarf að staðfesta að gild slóð.)

Gögn sem gefin eru í verkefni 1 innihalda áfanga sem uppfylla þetta ekki (númer og heiti er ekki einstakt og myndu þurfa flóknari _primary_ lykil) og skal sleppa þeim áföngum þar sem áður var kominn áfangi með sama númer eða titil (þ.e.a.s. hunsa `Key already exists` villur frá postgres.)

### TypeScript

Gefinn er grunnur sem notar `ts-node` til að keyra verkefnið sem TypeScript. Skilgreina skal týpur þar sem við á og ekki nota `any` (stillt sérstaklega í `tsconfig.json` og skal ekki breyta).

### Tæki, tól og test

Setja þarf upp `eslint` og `jest` eins og í fyrri verkefnum. Setja skal `eslint` upp þ.a. það [sé með TypeScript stuðning](https://typescript-eslint.io/getting-started). Ekki ættu að vera neinar `eslint` villur og öll test ættu að keyra.

Setja skal upp a.m.k. fimm test sem prófa vefþjónustur _keyrandi_, sjá [dæmi í verkefni 3 frá 2022](https://github.com/vefforritun/vef2-2022-v3-synilausn/tree/main/src/test/integration) og í [sýnilausn að hópverkefni 1 frá 2021](https://github.com/vefforritun/vef2-2021-h1-synilausn/tree/main/src/tests).

$$
Aðeins skal nota ECMAScript modules (ESM) og ekki CommonJS.

Leyfilegt er að nota ORM (t.d. [Prisma](https://www.prisma.io/)) við lausn á verkefninu.

## Gefinn grunnur

Það sem er gefið er grunnur sem keyrir nodemon í dev og notar `ts-node` í keyrslu.

Búið er að keyra:

```bash
npm init -y
npm install --save ts-node express
npm install --save-dev nodemon @types/express
```

og:

- Búa til `nodemon.json` sem keyrir `ts-node` sem `loader`.
- Setja inn `dev` og `start` script í `package.json`.

## GitHub og hýsing

Setja skal upp vefinn á Render, Railway eða Heroku (ath að uppsetning á Heroku mun kosta) tengt við GitHub með postgres settu upp.

## Mat

- 40% Vefþjónustur útfærðar.
- 20% Gagnagrunnur og gögn.
- 20% TypeScript notað.
- 20% Tæki, tól og test, verkefni sett upp í hýsingu.

## Sett fyrir

Verkefni sett fyrir í fyrirlestri mánudaginn 20. febrúar 2023.

## Skil

Skila skal í Canvas í seinasta lagi fyrir lok dags fimmtudaginn 9. mars 2023.

Skil skulu innihalda:

- Slóð á verkefni keyrandi í hýsingu.
- Slóð á GitHub repo fyrir verkefni. Dæmatímakennurum skal hafa verið boðið í repo. Notendanöfn þeirra eru:
  - `MarzukIngi`
  - `ofurtumi`
  - `osk`

---

> Útgáfa 0.2

| Útgáfa | Breyting                       |
|--------|--------------------------------|
| 0.1    | Fyrsta útgáfa                  |
| 0.2    | Nánari lýsing, bæta við gögnum |
$$

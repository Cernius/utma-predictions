# UTMA #19 — spėjimų žaidimas

**Live: https://cernius.github.io/utma-predictions/**

Unofficial fan prediction game for the [UTMA #19](https://stats.uniquetma.com/fightcard/20/main-card)
main card and [prelims](https://stats.uniquetma.com/fightcard/20/prelims). Visitors enter a name, then for every fight pick the winner, the victory type
(knockout or points) and — for a knockout — the round. Everyone's picks stream in live and the
crowd split is revealed per fight once your own prediction is complete.

Static Next.js export hosted on GitHub Pages, with predictions in Firebase Realtime Database.

## Local development

```bash
npm install
cp .env.example .env.local   # optional, see below
npm run dev
```

Without Firebase credentials the app still works end to end — predictions are kept in
`localStorage` so you can build and click through the whole flow offline.

## Firebase setup

The live project is **`utma-predictions`** ([console](https://console.firebase.google.com/project/utma-predictions/overview)),
with its Realtime Database at `https://utma-predictions-default-rtdb.firebaseio.com` (us-central1).
`firebase deploy --only database` publishes `database.rules.json` to it. To recreate it elsewhere:

1. Create a Firebase project and add a **Realtime Database** (not Firestore).
2. Copy the web app config values into `.env.local` using `.env.example` as the template.
   `NEXT_PUBLIC_FIREBASE_DATABASE_URL` and `NEXT_PUBLIC_FIREBASE_API_KEY` are the two the app
   checks before switching off the localStorage fallback.
3. Publish `database.rules.json` as the database rules (Realtime Database → Rules).

The rules allow unauthenticated reads and writes under `predictions/<eventId>/<voterId>`, with
validation on the shape of each pick. That is deliberate for a public fan game with no login:
anyone who knows a voter id could overwrite that ballot. If the game needs to be tamper-proof,
enable Anonymous Authentication and tighten the write rule to `auth.uid === $voterId`.

Stored shape:

```
predictions/utma-19/<voterId>
  name: "TITAS"
  updatedAt: 1758520000000
  picks/<fightId>
    corner: "red" | "blue"
    method: "ko" | "points"
    round: 1…N        // only present for a knockout
```

Ballots written before victory types existed (`picks/<fightId>: "red"`) are still read correctly
and simply count as incomplete until the method is filled in.

## Deploying to GitHub Pages

Already configured for this repo: Pages source is **GitHub Actions** and the five
`NEXT_PUBLIC_FIREBASE_*` values are stored as Actions secrets. They are inlined into the client
bundle at build time, which is expected — Firebase web config is public, and the database rules
are what protect the data.

For a fresh fork:

1. Push the repo to GitHub.
2. Settings → Pages → **Source: GitHub Actions**.
3. Settings → Secrets and variables → Actions: add the five `NEXT_PUBLIC_FIREBASE_*` values.
4. Add the Pages URL to Firebase → Authentication → Settings → Authorised domains if you later
   enable auth.

Every push to `main` runs `.github/workflows/deploy.yml`, which builds the static export and
publishes `out/`. The workflow passes `NEXT_PUBLIC_BASE_PATH=/<repo>` so assets resolve under the
project-site sub-path; delete that line if you deploy to a `<user>.github.io` repo or a custom
domain served from the root.

## Admin page

`/admin` (e.g. `https://cernius.github.io/utma-predictions/admin/`) lists every ballot — name,
how many picks are complete, when it was last touched, and an expandable per-fight breakdown —
and can delete one player's votes or all of them. It is not linked from anywhere and is served
with `robots: noindex, nofollow`.

Entry is gated by `NEXT_PUBLIC_ADMIN_CODE` (an Actions secret in this repo, `.env.local` for
local dev). Be clear-eyed about what that buys: the code is inlined into the public JS bundle at
build time, and the database rules already allow unauthenticated writes, so the gate deters a
curious visitor rather than a determined one. Deleting votes has never required this page — a
`curl -X DELETE` against the database does the same thing.

To make it genuinely privileged, enable Firebase Authentication and switch the rules from
`".write": true` to something like `".write": "auth.uid === $voterId || auth.uid === '<adminUid>'"`,
signing players in anonymously and the admin in with a password.

## Resetting a device

Append `#reset` to the URL (e.g. `https://cernius.github.io/utma-predictions/#reset`) to reveal a
reset button in the footer. After a confirmation it deletes this voter's ballot from the database,
drops the `localStorage` fallback store — including predictions left over from before Firebase was
wired up — and forgets the saved name, so the app returns to the name gate. It only ever touches
your own ballot; other players are unaffected.

## Updating the fight card

`src/data/event.ts` holds the event metadata and the fights, in display order (prelims, then
the main card; last fight of each card first). Fighter portraits live in
`public/fighters/<slug>.png`; set `photo: null` when UTMA has no portrait and the silhouette
placeholder is used instead. The number of selectable knockout rounds comes from each fight's
`rounds` value.

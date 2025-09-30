# Dickson Super Cup — PDF generation helpers

This repository contains utilities to generate A4 PDF signup forms for teams.

Files added/updated:
- `scripts/generate-pdfs.js` — Puppeteer-based batch generator. Can read teams from a local JSON file or from Firestore using a service account.
- `src/pages/ViewTeamsPage.jsx` — client-side controls for downloading signup forms and A4 PDFs (uses html2canvas/jsPDF when run in a browser).
- `package.json` — new npm scripts to help run the generator.

Usage

1) Generate PDFs from a local teams JSON

Create a `teams.json` file (an array of team objects with at least `teamName` or `name`). Then run:

```powershell
npm run generate-pdfs
```

This calls: `node scripts/generate-pdfs.js --teams teams.json` and writes PDFs to `generated-pdfs/`.

2) Generate a single team's PDF by ID or name

```powershell
node scripts/generate-pdfs.js --teams teams.json --teamId "My Team Name"
```

or (via npm, pass the ID after the script):

```powershell
npm run generate-pdfs:one -- "--teamId=team-id-or-name" 
```

3) Generate PDFs by fetching teams from Firestore

Prepare a Firebase service account JSON and save it as `serviceAccount.json` (or another path). Then run:

```powershell
npm run generate-pdfs:firestore
# or
node scripts/generate-pdfs.js --serviceAccount ./serviceAccount.json
```

The script will fetch documents from the `teams` collection and generate PDFs for each document.

Notes
- Puppeteer downloads a Chromium binary during installation. If you prefer to use an existing Chrome install, set the `PUPPETEER_EXECUTABLE_PATH` env var.
- Server-side Firestore access requires a service account with read permissions for the `teams` collection.
- For client-side PDF generation, open the app (`npm start`) and use the "Download PDF (A4)" buttons on the Registered Teams page. The client uses `html2canvas` + `jsPDF` for rendering; consider using the server-side script for batch exports or for higher-fidelity output.

Troubleshooting
- If Chromium fails to install, try `npm i puppeteer --force` or set `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD` and provide your own Chrome.
- If PDFs look slightly different, tweak CSS in `scripts/generate-pdfs.js` or the `signupFormTemplate` in `src/pages/ViewTeamsPage.jsx`.

License: MIT

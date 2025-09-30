/**
 * scripts/generate-pdfs.js
 *
 * Enhanced generator:
 * - Usage: node scripts/generate-pdfs.js [--teams teams.json] [--teamId <id>] [--serviceAccount /path/to/serviceAccount.json]
 * - If --serviceAccount is provided, the script will use Firebase Admin SDK to fetch teams from Firestore.
 * - Otherwise, supply --teams teams.json (an array of team objects).
 * - Output PDFs will be written to ./generated-pdfs
 */
const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");

let admin = null; // will lazy-require when needed

async function render(html, outPath) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });
  // ensure print CSS is applied
  await page.emulateMediaType("print");
  await page.pdf({
    path: outPath,
    format: "A4",
    printBackground: true,
    margin: { top: "12mm", bottom: "12mm", left: "12mm", right: "12mm" },
  });
  await browser.close();
}

function signupHtml(team, logoDataUrl) {
  const safeTeam = team.teamName || team.name || "";
  const manager = team.managerName || team.coach || team.manager || "";
  // improved CSS for crisper print: slightly larger fonts, tighter margins, logo scaled
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${safeTeam} - Signup</title><style>
    @page { size: A4; margin: 12mm }
    body{font-family: "Segoe UI", Roboto, Arial, Helvetica, sans-serif; margin:0; padding:0; color:#111}
    .page{width:210mm; padding:8mm 12mm; background:#fff}
    header{display:flex; align-items:center; gap:12px; border-bottom: 6px solid #ffd400; padding-bottom:8px}
    .logo img{width:72px; height:72px; object-fit:contain}
    h1{font-size:22px; margin:0; color:#d32f2f; font-weight:800}
    .subtitle{font-size:12px; color:#444}
    .meta{display:flex; justify-content:space-between; margin-top:10px; font-size:13px}
    table{width:100%; border-collapse:collapse; margin-top:12px}
    th,td{padding:8px 6px; border-bottom:1px dashed rgba(0,0,0,0.08); font-size:13px}
    thead th{background:#e53935; color:#fff; font-weight:700}
    td .line{display:block; height:14px; border-bottom:1px solid rgba(0,0,0,0.2)}
  </style></head><body><div class="page"><header><div class="logo"><img src="${
    logoDataUrl || ""
  }" alt="logo"></div><div style="flex:1"><h1>Dickson Super Cup Classic</h1><div class="subtitle">Player Sign-up — Please fill clearly. One row per player.</div></div><div style="min-width:120px;text-align:right"><div style="font-size:12px;font-weight:700">Event</div><div style="font-size:12px">Dickson Super Cup Classic</div></div></header><div class="meta"><div><strong>Date:</strong> ____________________</div><div><strong>Club / Team:</strong> ${safeTeam}<div style="margin-top:6px"><strong>Coach / Manager:</strong> ${
    manager || "____________________"
  }</div></div></div><table><thead><tr><th style="width:5%">No.</th><th style="width:28%">Player Name</th><th style="width:18%">Area</th><th style="width:18%">Team</th><th style="width:12%">Phone</th><th style="width:10%">ID No</th><th style="width:9%">Signature</th></tr></thead><tbody>${Array.from(
    { length: 20 }
  )
    .map(
      (_, i) =>
        `<tr><td style="text-align:center">${
          i + 1
        }</td><td><span class="line"></span></td><td><span class="line"></span></td><td><span class="line"></span></td><td><span class="line"></span></td><td><span class="line"></span></td><td><span class="line" style="width:90px;display:inline-block"></span></td></tr>`
    )
    .join("")}</tbody></table></div></body></html>`;
}

async function fetchTeamsFromFirestore(serviceAccountPath) {
  if (!admin) admin = require("firebase-admin");
  const saPath = path.resolve(serviceAccountPath);
  if (!fs.existsSync(saPath))
    throw new Error("Service account file not found: " + saPath);
  const sa = require(saPath);
  if (!admin.apps.length) {
    admin.initializeApp({ credential: admin.credential.cert(sa) });
  }
  const db = admin.firestore();
  const snap = await db.collection("teams").orderBy("createdAt", "desc").get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

async function main() {
  // minimal arg parser to avoid extra dependency
  function parseArgs(arr) {
    const out = {};
    for (let i = 0; i < arr.length; i++) {
      const a = arr[i];
      if (a.startsWith("--")) {
        const eq = a.indexOf("=");
        if (eq !== -1) {
          const k = a.slice(2, eq);
          out[k] = a.slice(eq + 1);
        } else {
          const k = a.slice(2);
          const next = arr[i + 1];
          if (next && !next.startsWith("--")) {
            out[k] = next;
            i++;
          } else {
            out[k] = true;
          }
        }
      }
    }
    return out;
  }
  const argv = parseArgs(process.argv.slice(2));
  const outDir = path.resolve("generated-pdfs");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

  // load logo if present
  let logoData = "";
  const logoPath = path.resolve("src/assets/SL.png");
  if (fs.existsSync(logoPath)) {
    const buf = fs.readFileSync(logoPath);
    logoData = `data:image/png;base64,${buf.toString("base64")}`;
  }

  let teams = [];
  if (argv.serviceAccount) {
    console.log(
      "Fetching teams from Firestore using service account:",
      argv.serviceAccount
    );
    teams = await fetchTeamsFromFirestore(argv.serviceAccount);
  } else if (argv.teams) {
    const jsonPath = path.resolve(argv.teams);
    if (!fs.existsSync(jsonPath)) {
      console.error("Teams file not found:", jsonPath);
      process.exit(1);
    }
    teams = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  } else {
    console.error(
      "Provide --serviceAccount /path/to/sa.json or --teams teams.json"
    );
    process.exit(1);
  }

  if (argv.teamId) {
    teams = teams.filter(
      (t) =>
        t.id === argv.teamId ||
        (t.teamName || t.name || "").toString() === argv.teamId
    );
    if (teams.length === 0) {
      console.error("No team matches --teamId", argv.teamId);
      process.exit(1);
    }
  }

  for (const team of teams) {
    const html = signupHtml(team, logoData);
    const safeName = (team.teamName || team.name || "team").replace(
      /[^a-z0-9\-\_ ]/gi,
      "_"
    );
    const outPath = path.join(outDir, `${safeName}-signup.pdf`);
    console.log("Rendering", safeName, "->", outPath);
    await render(html, outPath);
  }

  console.log("Done. PDFs written to", outDir);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

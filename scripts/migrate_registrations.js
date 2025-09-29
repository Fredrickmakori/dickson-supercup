// Migration script to move documents from `registrations` to players/coaches/managers and attach them to teams
// Usage: node scripts/migrate_registrations.js /path/to/serviceAccountKey.json

const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

async function main() {
  const keyPath = process.argv[2];
  if (!keyPath) {
    console.error(
      "Usage: node migrate_registrations.js /path/to/serviceAccountKey.json"
    );
    process.exit(1);
  }

  const serviceAccount = require(path.resolve(keyPath));

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  const db = admin.firestore();

  console.log("Fetching registrations...");
  const regsSnap = await db.collection("registrations").get();
  console.log(`Found ${regsSnap.size} registrations`);

  for (const doc of regsSnap.docs) {
    const data = doc.data();
    const role = (data.role || "").toLowerCase();
    try {
      if (role === "player") {
        const pRef = await db.collection("players").add({
          ...data,
          migratedFrom: doc.id,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log(`Migrated player ${pRef.id}`);
        // Attach to team if team or teamName present
        if (data.team || data.teamId || data.teamName) {
          const teamId = await resolveTeamId(
            db,
            data.team || data.teamId || data.teamName
          );
          if (teamId) {
            await db
              .collection("teams")
              .doc(teamId)
              .collection("players")
              .add({
                ...data,
                playerId: pRef.id,
                migratedFrom: doc.id,
                addedAt: admin.firestore.FieldValue.serverTimestamp(),
              });
            await db.collection("players").doc(pRef.id).update({ teamId });
            console.log(` - attached to team ${teamId}`);
          }
        }
      } else if (role === "coach") {
        const cRef = await db.collection("coaches").add({
          ...data,
          migratedFrom: doc.id,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log(`Migrated coach ${cRef.id}`);
        if (data.team || data.teamId || data.teamName) {
          const teamId = await resolveTeamId(
            db,
            data.team || data.teamId || data.teamName
          );
          if (teamId) {
            await db
              .collection("teams")
              .doc(teamId)
              .collection("coaches")
              .add({
                ...data,
                coachId: cRef.id,
                migratedFrom: doc.id,
                addedAt: admin.firestore.FieldValue.serverTimestamp(),
              });
            await db.collection("coaches").doc(cRef.id).update({ teamId });
            console.log(` - attached to team ${teamId}`);
          }
        }
      } else if (role === "manager") {
        const mRef = await db.collection("managers").add({
          ...data,
          migratedFrom: doc.id,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log(`Migrated manager ${mRef.id}`);
        if (data.team || data.teamId || data.teamName) {
          const teamId = await resolveTeamId(
            db,
            data.team || data.teamId || data.teamName
          );
          if (teamId) {
            await db
              .collection("teams")
              .doc(teamId)
              .collection("managers")
              .add({
                ...data,
                managerId: mRef.id,
                migratedFrom: doc.id,
                addedAt: admin.firestore.FieldValue.serverTimestamp(),
              });
            await db.collection("managers").doc(mRef.id).update({ teamId });
            console.log(` - attached to team ${teamId}`);
          }
        }
      } else {
        // fallback: keep in registrations or move to a generic collection
        console.log(`Skipping registration ${doc.id} with role=${role}`);
      }
    } catch (err) {
      console.error("Error migrating doc", doc.id, err);
    }
  }

  console.log("Migration done.");
  process.exit(0);
}

async function resolveTeamId(db, identifier) {
  if (!identifier) return null;
  // if doc exists with id
  try {
    const snap = await db.collection("teams").doc(identifier).get();
    if (snap.exists) return snap.id;
  } catch (e) {}
  // try by teamName
  const byName = await db
    .collection("teams")
    .where("teamName", "==", identifier)
    .limit(1)
    .get();
  if (!byName.empty) return byName.docs[0].id;
  const byName2 = await db
    .collection("teams")
    .where("name", "==", identifier)
    .limit(1)
    .get();
  if (!byName2.empty) return byName2.docs[0].id;
  return null;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

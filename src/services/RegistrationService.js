import { db } from "../firebase";
import {
  collection,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { setDoc } from "firebase/firestore";

export default class RegistrationService {
  constructor(firestoreDb = db) {
    this.db = firestoreDb;
  }

  // Create a team document in 'teams' collection
  // createTeam optionally accepts a user object (from auth) so we can persist
  // the canonical user profile under users/{uid} and store only the uid on the team
  async createTeam(teamData, user = null) {
    // if user provided, persist minimal profile under users/{uid}
    if (user && user.uid) {
      try {
        const userRef = doc(this.db, "users", user.uid);
        await setDoc(
          userRef,
          {
            uid: user.uid,
            email: user.email || null,
            displayName: user.displayName || teamData.managerName || null,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
        // attach uploaderId to teamData as foreign key
        teamData = { ...teamData, uploaderId: user.uid };
        // if role info provided, mark coachId/managerId accordingly
        if (teamData.role === "coach") teamData.coachId = user.uid;
        if (teamData.role === "manager" || teamData.role === "team")
          teamData.managerId = user.uid;
      } catch (e) {
        console.warn("createTeam: failed to save user profile", e);
      }
    }

    const ref = await addDoc(collection(this.db, "teams"), {
      ...teamData,
      createdAt: serverTimestamp(),
    });

    // Create a starter 'messages' subcollection document so team-scoped collections exist
    try {
      await addDoc(collection(this.db, "teams", ref.id, "messages"), {
        type: "created",
        text: `Team ${teamData.teamName || teamData.name || ref.id} registered`,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      // non-fatal
      console.warn("could not create initial team message", err);
    }

    return ref.id;
  }

  // Add a message/note to a team's messages subcollection (e.g., verification messages)
  async addTeamMessage(
    teamId,
    { text, author = null, type = "note", metadata = {} } = {}
  ) {
    if (!teamId) throw new Error("teamId is required");
    const payload = {
      text,
      author,
      type,
      metadata,
      createdAt: serverTimestamp(),
    };
    const ref = await addDoc(
      collection(this.db, "teams", teamId, "messages"),
      payload
    );
    return { id: ref.id, ...payload };
  }

  // Add a payment proof to a team's paymentProofs subcollection
  async addPaymentProof(
    teamId,
    proof = { text: null, url: null, submittedBy: null }
  ) {
    if (!teamId) throw new Error("teamId is required");
    const payload = { ...proof, submittedAt: serverTimestamp() };
    const ref = await addDoc(
      collection(this.db, "teams", teamId, "paymentProofs"),
      payload
    );
    return { id: ref.id, ...payload };
  }

  // Fetch all payment proofs for a team (returns array)
  async getTeamProofs(teamId) {
    if (!teamId) return [];
    const snaps = await getDocs(
      collection(this.db, "teams", teamId, "paymentProofs")
    );
    return snaps.docs.map((d) => ({ id: d.id, ...d.data() }));
  }

  // Find teams by contact email (returns array of team docs)
  async findTeamsByEmail(email) {
    if (!email) return [];
    const q = query(
      collection(this.db, "teams"),
      where("contactEmail", "==", email)
    );
    const snaps = await getDocs(q);
    return snaps.docs.map((d) => ({ id: d.id, ...d.data() }));
  }

  // Add a player to the top-level 'players' collection
  async addPlayer(playerData) {
    // signature: addPlayer(playerData, user = null)
    const user = arguments.length > 1 ? arguments[1] : null;
    if (user && user.uid) {
      try {
        const userRef = doc(this.db, "users", user.uid);
        await setDoc(
          userRef,
          {
            uid: user.uid,
            email: user.email || null,
            displayName: user.displayName || playerData.fullName || null,
            role: playerData.role || "player",
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
        playerData.userId = user.uid;
      } catch (e) {
        console.warn("addPlayer: failed to save user profile", e);
      }
    }
    const ref = await addDoc(collection(this.db, "players"), {
      ...playerData,
      role: playerData.role || "player",
      createdAt: serverTimestamp(),
    });
    return ref.id;
  }

  // Add an existing player document to a team's players subcollection.
  // Accepts either a playerId (string) or a playerData object.
  async addPlayerToTeam(teamId, playerOrId) {
    if (!teamId) throw new Error("teamId is required");

    // allow teamId to be a team name; try to resolve
    const resolvedTeamId = await this.resolveTeamId(teamId);
    if (!resolvedTeamId) throw new Error("team not found");
    teamId = resolvedTeamId;

    if (typeof playerOrId === "string") {
      const playerSnap = await getDoc(doc(this.db, "players", playerOrId));
      if (!playerSnap.exists()) throw new Error("player not found");
      const pdata = playerSnap.data();
      await addDoc(collection(this.db, "teams", teamId, "players"), {
        ...pdata,
        playerId: playerOrId,
        addedAt: serverTimestamp(),
      });
      // also update player doc with teamId for easy lookup
      await updateDoc(doc(this.db, "players", playerOrId), { teamId });
      return playerOrId;
    } else {
      // create new player and attach
      const newPlayerRef = await addDoc(collection(this.db, "players"), {
        ...playerOrId,
        role: playerOrId.role || "player",
        createdAt: serverTimestamp(),
      });
      await addDoc(collection(this.db, "teams", teamId, "players"), {
        ...playerOrId,
        playerId: newPlayerRef.id,
        addedAt: serverTimestamp(),
      });
      await updateDoc(doc(this.db, "players", newPlayerRef.id), { teamId });
      return newPlayerRef.id;
    }
  }

  // Resolve a team identifier (id or name) to a teamId if possible
  async resolveTeamId(teamIdentifier) {
    if (!teamIdentifier) return null;
    // If a document with this id exists, return it
    try {
      const snap = await getDoc(doc(this.db, "teams", teamIdentifier));
      if (snap.exists()) return snap.id;
    } catch (e) {
      // ignore
    }

    // Otherwise, try to find by name fields
    try {
      const q = query(
        collection(this.db, "teams"),
        where("teamName", "==", teamIdentifier)
      );
      const snaps = await getDocs(q);
      if (!snaps.empty) return snaps.docs[0].id;

      // try alternative field 'name'
      const q2 = query(
        collection(this.db, "teams"),
        where("name", "==", teamIdentifier)
      );
      const snaps2 = await getDocs(q2);
      if (!snaps2.empty) return snaps2.docs[0].id;
    } catch (err) {
      console.warn("resolveTeamId error", err);
    }
    return null;
  }

  // Find teams linked to a user id (uploaderId, managerId or coachId)
  async findTeamsByUser(userId) {
    if (!userId) return [];
    const res = [];
    try {
      // query uploaderId
      const q1 = query(
        collection(this.db, "teams"),
        where("uploaderId", "==", userId)
      );
      const snaps1 = await getDocs(q1);
      snaps1.forEach((d) => res.push({ id: d.id, ...d.data() }));
    } catch (e) {
      // ignore
    }
    try {
      const q2 = query(
        collection(this.db, "teams"),
        where("managerId", "==", userId)
      );
      const snaps2 = await getDocs(q2);
      snaps2.forEach((d) => res.push({ id: d.id, ...d.data() }));
    } catch (e) {}
    try {
      const q3 = query(
        collection(this.db, "teams"),
        where("coachId", "==", userId)
      );
      const snaps3 = await getDocs(q3);
      snaps3.forEach((d) => res.push({ id: d.id, ...d.data() }));
    } catch (e) {}

    // dedupe by id
    const map = new Map();
    for (const t of res) map.set(t.id, t);
    return Array.from(map.values());
  }

  // Return true if the user already has a player record for the given team
  async hasPlayerInTeam(userId, teamId) {
    if (!userId || !teamId) return false;
    try {
      const q = query(
        collection(this.db, "players"),
        where("userId", "==", userId),
        where("teamId", "==", teamId)
      );
      const snaps = await getDocs(q);
      return !snaps.empty;
    } catch (e) {
      console.warn("hasPlayerInTeam check failed", e);
      return false;
    }
  }

  // Add a coach to 'coaches' collection
  async addCoach(coachData) {
    // signature: addCoach(coachData, user = null)
    const user = arguments.length > 1 ? arguments[1] : null;
    if (user && user.uid) {
      try {
        const userRef = doc(this.db, "users", user.uid);
        await setDoc(
          userRef,
          {
            uid: user.uid,
            email: user.email || null,
            displayName: user.displayName || coachData.fullName || null,
            role: coachData.role || "coach",
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
        coachData.userId = user.uid;
      } catch (e) {
        console.warn("addCoach: failed to save user profile", e);
      }
    }
    const ref = await addDoc(collection(this.db, "coaches"), {
      ...coachData,
      role: coachData.role || "coach",
      createdAt: serverTimestamp(),
    });
    return ref.id;
  }

  // Attach coach to team subcollection and update coach doc with teamId
  async addCoachToTeam(teamId, coachOrId) {
    if (!teamId) throw new Error("teamId is required");
    if (typeof coachOrId === "string") {
      const snap = await getDoc(doc(this.db, "coaches", coachOrId));
      if (!snap.exists()) throw new Error("coach not found");
      const data = snap.data();
      await addDoc(collection(this.db, "teams", teamId, "coaches"), {
        ...data,
        coachId: coachOrId,
        addedAt: serverTimestamp(),
      });
      await updateDoc(doc(this.db, "coaches", coachOrId), { teamId });
      return coachOrId;
    } else {
      const ref = await addDoc(collection(this.db, "coaches"), {
        ...coachOrId,
        role: coachOrId.role || "coach",
        createdAt: serverTimestamp(),
      });
      await addDoc(collection(this.db, "teams", teamId, "coaches"), {
        ...coachOrId,
        coachId: ref.id,
        addedAt: serverTimestamp(),
      });
      await updateDoc(doc(this.db, "coaches", ref.id), { teamId });
      return ref.id;
    }
  }

  // Add manager to 'managers' collection and link to team
  async addManager(managerData) {
    // signature: addManager(managerData, user = null)
    const user = arguments.length > 1 ? arguments[1] : null;
    if (user && user.uid) {
      try {
        const userRef = doc(this.db, "users", user.uid);
        await setDoc(
          userRef,
          {
            uid: user.uid,
            email: user.email || null,
            displayName: user.displayName || managerData.fullName || null,
            role: managerData.role || "manager",
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
        managerData.userId = user.uid;
      } catch (e) {
        console.warn("addManager: failed to save user profile", e);
      }
    }
    const ref = await addDoc(collection(this.db, "managers"), {
      ...managerData,
      role: managerData.role || "manager",
      createdAt: serverTimestamp(),
    });
    return ref.id;
  }

  async addManagerToTeam(teamId, managerOrId) {
    if (!teamId) throw new Error("teamId is required");
    if (typeof managerOrId === "string") {
      const snap = await getDoc(doc(this.db, "managers", managerOrId));
      if (!snap.exists()) throw new Error("manager not found");
      const data = snap.data();
      await addDoc(collection(this.db, "teams", teamId, "managers"), {
        ...data,
        managerId: managerOrId,
        addedAt: serverTimestamp(),
      });
      await updateDoc(doc(this.db, "managers", managerOrId), { teamId });
      return managerOrId;
    } else {
      const ref = await addDoc(collection(this.db, "managers"), {
        ...managerOrId,
        role: managerOrId.role || "manager",
        createdAt: serverTimestamp(),
      });
      await addDoc(collection(this.db, "teams", teamId, "managers"), {
        ...managerOrId,
        managerId: ref.id,
        addedAt: serverTimestamp(),
      });
      await updateDoc(doc(this.db, "managers", ref.id), { teamId });
      return ref.id;
    }
  }
}

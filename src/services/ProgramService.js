import {
  collection,
  doc,
  getDocs,
  query,
  where,
  addDoc,
  orderBy,
} from "firebase/firestore";

export default class ProgramService {
  constructor(firestoreDb, programId) {
    this.db = firestoreDb;
    this.programId = programId;
  }

  // Helper to ensure programId exists
  ensureProgramId() {
    if (!this.programId) {
      throw new Error("ProgramService: programId is required but missing.");
    }
  }

  // Helper to reference the program document
  programRef() {
    this.ensureProgramId();
    return doc(this.db, "programs", this.programId);
  }

  // ✅ Safe wrapper for collection
  safeCollection(path, ...segments) {
    if (!path || typeof path !== "string" || path.trim() === "") {
      throw new Error(
        "Firestore collection path is required and cannot be empty."
      );
    }
    return collection(this.db, path, ...segments);
  }

  // List teams that belong to this program
  async listTeams({ order = "createdAt", direction = "desc" } = {}) {
    this.ensureProgramId();
    const q = query(
      this.safeCollection("teams"),
      where("programId", "==", this.programId),
      orderBy(order, direction)
    );
    const snaps = await getDocs(q);
    return snaps.docs.map((d) => ({ id: d.id, ...d.data() }));
  }

  // List users (players/coaches/managers) linked to this program
  async listMembers(kind = "players") {
    this.ensureProgramId();
    if (!kind || kind.trim() === "") {
      throw new Error("listMembers: kind (collection name) is required.");
    }
    const q = query(
      this.safeCollection(kind),
      where("programId", "==", this.programId)
    );
    const snaps = await getDocs(q);
    return snaps.docs.map((d) => ({ id: d.id, ...d.data() }));
  }

  // List registrations (legacy collection) for this program
  async listRegistrations() {
    this.ensureProgramId();
    const q = query(
      this.safeCollection("registrations"),
      where("programId", "==", this.programId)
    );
    const snaps = await getDocs(q);
    return snaps.docs.map((d) => ({ id: d.id, ...d.data() }));
  }

  // Approvals (admin approvals) for program
  async listApprovals() {
    this.ensureProgramId();
    const q = query(
      this.safeCollection("approvals"),
      where("programId", "==", this.programId)
    );
    const snaps = await getDocs(q);
    return snaps.docs.map((d) => ({ id: d.id, ...d.data() }));
  }

  // Create a program-scoped notification
  async createNotification(payload) {
    this.ensureProgramId();
    return await addDoc(this.safeCollection("notifications"), {
      programId: this.programId,
      ...payload,
      createdAt: new Date(),
    });
  }

  // Generic helper to fetch a subcollection under a team in this program
  async listTeamSubcollection(teamId, subcollectionName) {
    this.ensureProgramId();
    if (!teamId || !subcollectionName) {
      throw new Error(
        "listTeamSubcollection: teamId and subcollectionName are required."
      );
    }
    const q = query(this.safeCollection("teams", teamId, subcollectionName));
    const snaps = await getDocs(q);
    return snaps.docs.map((d) => ({ id: d.id, ...d.data() }));
  }
}

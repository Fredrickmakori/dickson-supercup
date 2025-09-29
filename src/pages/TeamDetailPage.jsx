import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  getFirestore,
  doc,
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  getDocs,
} from "firebase/firestore";
import { app } from "../firebase";
import RegistrationService from "../services/RegistrationService";
import { motion } from "framer-motion";

export default function TeamDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const db = getFirestore(app);
  const [team, setTeam] = useState(null);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [proofText, setProofText] = useState("");
  const [submittingProof, setSubmittingProof] = useState(false);
  const regSvc = new RegistrationService();

  useEffect(() => {
    if (!id) return;
    const ref = doc(db, "teams", id);
    let unsubTeam = () => {};
    let unsubPlayers = () => {};

    // listen team
    (async () => {
      try {
        unsubTeam = onSnapshot(ref, (snap) => {
          if (snap.exists()) setTeam({ id: snap.id, ...snap.data() });
          else setTeam(null);
        });
      } catch (e) {
        console.error("team listen", e);
      }
    })();

    // listen players subcollection if present
    try {
      const playersCol = collection(db, "teams", id, "players");
      unsubPlayers = onSnapshot(
        playersCol,
        (snap) => {
          setPlayers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
          setLoading(false);
        },
        (err) => {
          console.error("players listen", err);
          setLoading(false);
        }
      );
    } catch (e) {
      console.warn("players subcollection not available", e);
    }

    return () => {
      try {
        unsubTeam();
        unsubPlayers();
      } catch (e) {}
    };
  }, [id, db]);

  async function createPlayersFromRegistrations() {
    // copy matching registrations into teams/{id}/players
    const regsSnap = await getDocs(collection(db, "registrations"));
    const regs = regsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
    const matches = regs.filter(
      (r) =>
        r.teamId === id ||
        r.team === id ||
        r.teamName === (team && (team.teamName || team.name))
    );
    await Promise.all(
      matches.map(async (m) => {
        try {
          await addDoc(collection(db, "teams", id, "players"), {
            ...m,
            importedFrom: m.id,
          });
        } catch (e) {
          console.error("import failed", e);
        }
      })
    );
    alert(`Imported ${matches.length} players into team.`);
  }

  if (!team)
    return (
      <div className="container py-5">
        <div className="alert alert-warning">Team not found.</div>
        <Link to="/teams" className="btn btn-outline-secondary">
          Back to Teams
        </Link>
      </div>
    );

  return (
    <div className="container py-5">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div>
            <h2 className="mb-0">{team.teamName || team.name}</h2>
            <div className="small text-muted">
              Manager:{" "}
              {team.managerName || team.manager || team.contactName || "—"}
            </div>
            <div className="small text-muted">
              Contact: {team.contactPhone || team.phone || "—"}
            </div>
          </div>
          <div className="text-end">
            <button
              className="btn btn-warning me-2"
              onClick={() =>
                navigate(
                  `/register/player?teamId=${
                    team.id
                  }&teamName=${encodeURIComponent(
                    team.teamName || team.name || ""
                  )}`
                )
              }
            >
              Register Player
            </button>
            <button
              className="btn btn-outline-secondary"
              onClick={createPlayersFromRegistrations}
            >
              Import from registrations
            </button>
          </div>
        </div>

        <div className="card mb-3">
          <div className="card-body">
            <h5 className="mb-2">Team Players</h5>
            {loading ? (
              <div>Loading players...</div>
            ) : players.length === 0 ? (
              <div className="text-muted">No players in this team yet.</div>
            ) : (
              <ul className="list-unstyled">
                {players.map((p) => (
                  <li
                    key={p.id}
                    className="py-2 border-bottom d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <div className="fw-bold">
                        {p.fullName || p.name || p.playerName || "Player"}
                      </div>
                      <div className="small text-muted">
                        Position: {p.position || p.role || "—"}
                      </div>
                    </div>
                    <div className="small text-muted">
                      {p.phone || p.contact || "—"}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="card mb-3">
          <div className="card-body">
            <h5 className="mb-2">Payment Proof (M-Pesa)</h5>
            <div className="mb-2 text-muted small">
              If you've made payment, paste the M-Pesa confirmation message or
              transaction ID below and submit. Admins will review and verify the
              payment.
            </div>
            <textarea
              rows={4}
              className="form-control mb-2"
              placeholder="Paste M-Pesa message or transaction ID here"
              value={proofText}
              onChange={(e) => setProofText(e.target.value)}
            />
            <div className="d-flex gap-2">
              <button
                className="btn btn-warning"
                onClick={async () => {
                  if (!proofText.trim())
                    return alert(
                      "Please paste the M-Pesa message or transaction ID."
                    );
                  try {
                    setSubmittingProof(true);
                    // use RegistrationService to add proof with server timestamp
                    await regSvc.addPaymentProof(id, {
                      text: proofText.trim(),
                      submittedBy: null,
                    });
                    // mark team as submitted for admin review
                    const tref = doc(db, "teams", id);
                    await updateDoc(tref, { paymentStatus: "submitted" });
                    setProofText("");
                    alert(
                      "✔️ Proof submitted. Admins will review and verify the payment."
                    );
                  } catch (e) {
                    console.error("submit proof", e);
                    alert("Failed to submit proof. Try again.");
                  } finally {
                    setSubmittingProof(false);
                  }
                }}
                disabled={submittingProof}
              >
                Submit Proof
              </button>
              <button
                className="btn btn-outline-secondary"
                onClick={() => setProofText("")}
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

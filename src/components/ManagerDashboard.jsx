import React, { useState, useEffect } from "react";
import {
  getFirestore,
  collection,
  doc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  getDocs,
} from "firebase/firestore";
import { app } from "../firebase";

function ManagerDashboard({ onEdit }) {
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const db = getFirestore(app);
    // listen for teams this manager owns (some registries use 'managerId' or 'userId')
    const q = query(collection(db, "teams"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setTeams(list);
        setLoading(false);
      },
      (err) => {
        console.error("teams listen", err);
        setLoading(false);
      }
    );

    // also listen to players collection to compute totals per team
    const qPlayers = query(collection(db, "players"));
    const unsubPlayers = onSnapshot(
      qPlayers,
      (snap) => {
        setPlayers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      },
      (err) => console.error("players listen", err)
    );

    return () => {
      unsub();
      unsubPlayers();
    };
  }, []);

  // compute players count for a team id
  function playersForTeam(teamId) {
    return players.filter((p) => (p.teamId || p.team || "") === teamId).length;
  }

  async function toggleApprove(id) {
    const db = getFirestore(app);
    const ref = doc(db, "teams", id);
    const t = teams.find((x) => x.id === id);
    const newApproved = !(t && (t.approved || t.paymentStatus === "approved"));
    try {
      await updateDoc(ref, {
        approved: newApproved,
        paymentStatus: newApproved ? "approved" : "pending",
      });
      setTeams(
        teams.map((x) =>
          x.id === id
            ? {
                ...x,
                approved: newApproved,
                paymentStatus: newApproved ? "approved" : "pending",
              }
            : x
        )
      );
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="container my-4">
      <h2 className="mb-3">Manager Dashboard</h2>

      <div className="row mb-3">
        <div className="col-md-4">
          <div className="card mb-2">
            <div className="card-body">
              <h5 className="card-title">Team Management</h5>
              <p className="card-text">
                Manage team rosters, schedules, and performance.
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card mb-2">
            <div className="card-body">
              <h5 className="card-title">Player Transfers</h5>
              <p className="card-text">
                Handle player transfers between teams.
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card mb-2">
            <div className="card-body">
              <h5 className="card-title">Coach Management</h5>
              <p className="card-text">Assign and manage coaches for teams.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Team</th>
              <th>Coach</th>
              <th>Players</th>
              <th>Paid</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6}>Loading...</td>
              </tr>
            )}
            {!loading && teams.length === 0 && (
              <tr>
                <td colSpan={6}>No teams yet.</td>
              </tr>
            )}
            {teams.map((t) => (
              <tr key={t.id}>
                <td>{t.teamName || t.name}</td>
                <td>{t.coachName || t.coach || "\u2014"}</td>
                <td>{playersForTeam(t.id) || t.membersCount || 0}</td>
                <td>
                  {t.paymentStatus === "approved" || t.paid
                    ? "KES 2,000"
                    : "\u2014"}
                </td>
                <td>
                  {t.paymentStatus === "approved" || t.approved ? (
                    <span className="badge bg-success">Approved</span>
                  ) : (
                    <span className="badge bg-warning text-dark">Pending</span>
                  )}
                </td>
                <td>
                  <button
                    className="btn btn-sm btn-outline-primary me-2"
                    onClick={() => onEdit && onEdit(t.id)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => toggleApprove(t.id)}
                  >
                    {t.paymentStatus === "approved" || t.approved
                      ? "Revoke"
                      : "Approve"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ManagerDashboard;

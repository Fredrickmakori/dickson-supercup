import React, { useEffect, useState } from "react";
import {
  getFirestore,
  collection,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import { app } from "../firebase";

export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem("dsc_user") || "null");
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const db = getFirestore(app);
    let q;
    try {
      q = query(collection(db, "registrations"), orderBy("createdAt", "desc"));
    } catch (e) {
      q = collection(db, "registrations");
    }
    const unsub = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setRegistrations(list);
        setLoading(false);
      },
      (err) => {
        console.error("listen error", err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [user]);

  if (!user)
    return (
      <div className="container my-4">
        <div className="alert alert-warning">
          Please login to see your dashboard
        </div>
      </div>
    );

  const myTeams = registrations.filter(
    (r) =>
      r.managerId === (user?.uid || user?.id) ||
      r.ownerId === (user?.uid || user?.id) ||
      r.userId === (user?.uid || user?.id)
  );

  return (
    <div className="container my-4">
      <header className="mb-3">
        <h4>
          Welcome, {user.user || user.displayName || user.email} ({user.role})
        </h4>
      </header>

      <div className="row g-3">
        {user.role === "manager" && (
          <div className="col-md-6">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Your Teams</h5>
                <ul className="list-unstyled mb-0">
                  {myTeams.map((t) => (
                    <li key={t.id}>
                      {t.teamName || t.name} —{" "}
                      {(t.players && t.players.length) || t.membersCount || 0}{" "}
                      players
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {user.role === "player" && (
          <div className="col-md-6">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Player Feed</h5>
                <p>Recent updates and notices from your team.</p>
                <ul>
                  {myTeams.length === 0 && <li>No team assignments found.</li>}
                  {myTeams.map((t) => (
                    <li key={t.id}>{t.teamName || t.name}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {user.role === "coach" && (
          <>
            <div className="col-md-4">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">Coach Tools</h5>
                  <p>Manage rosters and tactics for your assigned teams.</p>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">Team Formation</h5>
                  <p>Visualize and adjust team formations.</p>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">Player Position Management</h5>
                  <p>Assign and manage player positions for match day.</p>
                </div>
              </div>
            </div>
          </>
        )}

        <div className="col-12 col-md-6">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Registrations</h5>
              <p>Total registrations: {registrations.length}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

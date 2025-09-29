import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebase";
import { getDoc } from "firebase/firestore";
import { FaDownload } from "react-icons/fa";
import * as XLSX from "xlsx";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { Card, CardContent } from "../ui/card";
import { doc, updateDoc } from "firebase/firestore";

export default function CoachDashboard() {
  const { user } = useAuth();
  const [players, setPlayers] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [injuries, setInjuries] = useState([]);
  const [performance, setPerformance] = useState(null);

  useEffect(() => {
    if (!user) return;

    // 👇 Fetch players assigned to this coach
    const qPlayers = query(
      collection(db, "players"),
      where("coachId", "==", user.uid)
    );
    const unsubPlayers = onSnapshot(qPlayers, (snap) => {
      setPlayers(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    // 👇 Fetch training sessions
    const qSessions = query(
      collection(db, "sessions"),
      where("coachId", "==", user.uid)
    );
    const unsubSessions = onSnapshot(qSessions, (snap) => {
      setSessions(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    // 👇 Fetch injury reports
    const qInjuries = query(
      collection(db, "injuries"),
      where("coachId", "==", user.uid)
    );
    const unsubInjuries = onSnapshot(qInjuries, (snap) => {
      setInjuries(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    // 👇 Fetch performance ratings
    const qPerf = query(
      collection(db, "performance"),
      where("coachId", "==", user.uid)
    );
    const unsubPerf = onSnapshot(qPerf, (snap) => {
      if (snap.empty) {
        setPerformance(0);
      } else {
        const avg =
          snap.docs.reduce((acc, d) => acc + (d.data().rating || 0), 0) /
          snap.docs.length;
        setPerformance(avg.toFixed(1));
      }
    });

    return () => {
      unsubPlayers();
      unsubSessions();
      unsubInjuries();
      unsubPerf();
    };
  }, [user]);

  // Also fetch teams assigned to this coach
  const [teams, setTeams] = useState([]);
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "teams"), where("coachId", "==", user.uid));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setTeams(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      },
      (err) => console.error("teams listen", err)
    );
    return () => unsub();
  }, [user]);

  return (
    <div className="container py-4">
      <h3 className="fw-bold mb-4">⚽ Coach Dashboard</h3>

      <div className="row g-4">
        {/* Players Trained */}
        <div className="col-md-3">
          <Card className="shadow-sm">
            <CardContent>
              <h6 className="text-muted">Players Trained</h6>
              <div className="h4">{players.length || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Sessions */}
        <div className="col-md-3">
          <Card className="shadow-sm">
            <CardContent>
              <h6 className="text-muted">Sessions</h6>
              <div className="h4">{sessions.length || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Injuries */}
        <div className="col-md-3">
          <Card className="shadow-sm">
            <CardContent>
              <h6 className="text-muted">Injuries Reported</h6>
              <div className="h4">{injuries.length || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Performance */}
        <div className="col-md-3">
          <Card className="shadow-sm">
            <CardContent>
              <h6 className="text-muted">Performance Rating</h6>
              <div className="h4">{performance || 0}</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Teams managed by this coach */}
      <div className="mt-4">
        <h5 className="mb-3">Your Teams</h5>
        {teams.length === 0 ? (
          <div className="text-muted">No teams assigned to you.</div>
        ) : (
          <div className="row g-3">
            {teams.map((t) => (
              <div key={t.id} className="col-md-4">
                <div className="card">
                  <div className="card-body">
                    <h6 className="mb-1">{t.teamName || t.name}</h6>
                    <div className="small text-muted">
                      Players:{" "}
                      {t.players ? t.players.length : t.membersCount || 0}
                    </div>
                    <div className="small text-muted">
                      Region: {t.region || "—"}
                    </div>
                    <div className="mt-2">
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={async () => {
                          try {
                            const snap = await getDoc(doc(db, "teams", t.id));
                            if (!snap.exists()) return alert("Team not found.");
                            const payload = { id: snap.id, ...snap.data() };
                            const ws = XLSX.utils.json_to_sheet([payload]);
                            const wb = XLSX.utils.book_new();
                            XLSX.utils.book_append_sheet(wb, ws, "Team");
                            XLSX.writeFile(
                              wb,
                              `${t.teamName || t.name}-team.xlsx`
                            );
                          } catch (err) {
                            console.error(err);
                            alert("Failed to download team form.");
                          }
                        }}
                      >
                        <FaDownload className="me-1" /> Download Form
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Player list with inline position management */}
      <div className="mt-4">
        <h5 className="mb-3">Players (manage positions)</h5>
        {players.length === 0 ? (
          <div className="text-muted">No players assigned.</div>
        ) : (
          <div className="list-group">
            {players.map((p) => (
              <div
                key={p.id}
                className="list-group-item d-flex align-items-center justify-content-between"
              >
                <div>
                  <div className="fw-bold">
                    {p.fullName || p.name || "Player"}
                  </div>
                  <div className="small text-muted">
                    Team: {p.teamName || p.team || "—"}
                  </div>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <select
                    value={p.position || ""}
                    onChange={async (e) => {
                      const newPos = e.target.value;
                      try {
                        const ref = doc(db, "players", p.id);
                        await updateDoc(ref, { position: newPos });
                      } catch (err) {
                        console.error("failed update position", err);
                      }
                    }}
                    className="form-select form-select-sm"
                  >
                    <option value="">— position —</option>
                    <option value="GK">GK</option>
                    <option value="CB">CB</option>
                    <option value="LB">LB</option>
                    <option value="RB">RB</option>
                    <option value="CM">CM</option>
                    <option value="CAM">CAM</option>
                    <option value="LM">LM</option>
                    <option value="RM">RM</option>
                    <option value="LW">LW</option>
                    <option value="RW">RW</option>
                    <option value="ST">ST</option>
                    <option value="CF">CF</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import {
  collection,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

export default function PlayersForm({ defaultTeamId = null }) {
  const [teams, setTeams] = useState([]);
  const [teamId, setTeamId] = useState(defaultTeamId || "");
  const [players, setPlayers] = useState([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "teams"), (snap) => {
      setTeams(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!teamId) return;
    const col = collection(db, "teams", teamId, "players");
    const unsub = onSnapshot(col, (snap) =>
      setPlayers(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    return () => unsub();
  }, [teamId]);

  async function addPlayer() {
    if (!teamId) return alert("Select a team first");
    if (!name.trim()) return alert("Enter player name");
    try {
      await addDoc(collection(db, "teams", teamId, "players"), {
        fullName: name.trim(),
        phone: phone.trim(),
        createdAt: serverTimestamp(),
      });
      setName("");
      setPhone("");
      alert("Player added");
    } catch (e) {
      console.error(e);
      alert("Failed to add player");
    }
  }

  return (
    <div>
      <div className="mb-3 d-flex gap-2">
        <select
          className="form-select"
          value={teamId}
          onChange={(e) => setTeamId(e.target.value)}
        >
          <option value="">-- Select team --</option>
          {teams.map((t) => (
            <option value={t.id} key={t.id}>
              {t.teamName || t.name || t.id}
            </option>
          ))}
        </select>
        <input
          className="form-control"
          placeholder="Player name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="form-control"
          placeholder="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <button className="btn btn-primary" onClick={addPlayer}>
          Add
        </button>
      </div>

      <div>
        <h6>Players for team</h6>
        <ul className="list-group">
          {players.map((p) => (
            <li
              key={p.id}
              className="list-group-item d-flex justify-content-between align-items-center"
            >
              <div>
                <div className="fw-bold">{p.fullName || p.name}</div>
                <div className="small text-muted">{p.phone || p.contact}</div>
              </div>
              <div className="small text-muted">
                {new Date(
                  p.createdAt && p.createdAt.seconds
                    ? p.createdAt.seconds * 1000
                    : Date.now()
                ).toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

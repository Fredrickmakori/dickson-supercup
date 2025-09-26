import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  where,
  collection,
  query,
  onSnapshot,
  doc,
  updateDoc,
  addDoc,
  getDocs,
} from "firebase/firestore";
import { db } from "../../firebase";
import { Card, CardContent } from "../ui/card";

export default function PlayerDashboard() {
  const { user } = useAuth();
  const [players, setPlayers] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [teams, setTeams] = useState([]);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "players"), where("uid", "==", user.uid));
    const unsub = onSnapshot(
      q,
      (snap) => setPlayers(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      (err) => console.error("players listen", err)
    );
    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    // only registrations where role === 'player'
    const q = query(
      collection(db, "registrations"),
      where("userId", "==", user.uid),
      where("role", "==", "player")
    );
    const unsub = onSnapshot(
      q,
      (snap) =>
        setRegistrations(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      (err) => console.error("registrations listen", err)
    );
    return () => unsub();
  }, [user]);

  useEffect(() => {
    const q = query(collection(db, "teams"));
    const unsub = onSnapshot(
      q,
      (snap) => setTeams(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      (err) => console.error("teams listen", err)
    );
    return () => unsub();
  }, []);

  const player =
    (players && players[0]) || (registrations && registrations[0]) || null;

  useEffect(() => {
    if (player) {
      setFormData({
        fullName: player.fullName || player.name || "",
        position: player.position || "",
        strength: player.strength || player.skill || "",
        preferredFoot: player.preferredFoot || player.strongFoot || "",
        strongFootRating: player.strongFootRating || player.strongFoot || "",
        weakFoot: player.weakFoot || "",
        phone: player.phone || player.contact || "",
        email: player.email || player.contactEmail || "",
        teamId: player.teamId || player.team || player.team || "",
      });
    } else {
      setFormData({});
    }
  }, [player]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((s) => ({ ...s, [name]: value }));
  };

  const handleSave = async () => {
    try {
      // update registration if exists
      if (registrations && registrations[0]) {
        const regRef = doc(db, "registrations", registrations[0].id);
        await updateDoc(regRef, {
          fullName: formData.fullName,
          position: formData.position,
          strength: formData.strength,
          preferredFoot: formData.preferredFoot,
          strongFootRating: formData.strongFootRating,
          weakFoot: formData.weakFoot,
          phone: formData.phone,
          contactEmail: formData.email,
          team: formData.teamId,
        });
      }

      // update or create players doc
      let playerDocId = null;
      if (players && players[0]) {
        const playerRef = doc(db, "players", players[0].id);
        await updateDoc(playerRef, {
          fullName: formData.fullName,
          position: formData.position,
          strength: formData.strength,
          preferredFoot: formData.preferredFoot,
          strongFootRating: formData.strongFootRating,
          weakFoot: formData.weakFoot,
          phone: formData.phone,
          email: formData.email,
          teamId: formData.teamId,
        });
        playerDocId = players[0].id;
      } else {
        const ref = await addDoc(collection(db, "players"), {
          uid: user.uid,
          fullName: formData.fullName,
          position: formData.position,
          strength: formData.strength,
          preferredFoot: formData.preferredFoot,
          strongFootRating: formData.strongFootRating,
          weakFoot: formData.weakFoot,
          phone: formData.phone,
          email: formData.email,
          teamId: formData.teamId,
          createdAt: new Date(),
        });
        playerDocId = ref.id;
      }

      // if team changed, recompute membersCount for affected teams (old and new)
      const prevTeam =
        player?.teamId ||
        player?.team ||
        (registrations && registrations[0] && registrations[0].team) ||
        null;
      const newTeam = formData.teamId || null;
      if (prevTeam !== newTeam) {
        // helper to recompute and write membersCount
        async function updateTeamCount(teamId) {
          if (!teamId) return;
          try {
            const snap = await getDocs(
              query(collection(db, "players"), where("teamId", "==", teamId))
            );
            const count = snap.size;
            const teamRef = doc(db, "teams", teamId);
            await updateDoc(teamRef, { membersCount: count });
          } catch (e) {
            // ignore if team doc missing
            // console.error('updateTeamCount', e);
          }
        }

        await Promise.all([
          updateTeamCount(prevTeam),
          updateTeamCount(newTeam),
        ]);
      }

      setEditing(false);
      alert("Profile updated");
    } catch (err) {
      console.error("save failed", err);
      alert("Failed to save profile");
    }
  };

  return (
    <div className="container py-4">
      <h3 className="fw-bold mb-4">Player Dashboard</h3>

      {/* Header: avatar, name, team */}
      <div className="card mb-3 bg-dark text-light">
        <div className="card-body d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center">
            <div
              className="rounded-circle bg-secondary me-3"
              style={{ width: 88, height: 88, overflow: "hidden" }}
            >
              {player && (player.photoURL || player.avatar) ? (
                <img
                  src={player.photoURL || player.avatar}
                  alt="avatar"
                  style={{ width: 88, height: 88, objectFit: "cover" }}
                />
              ) : (
                <div
                  className="d-flex align-items-center justify-content-center text-white"
                  style={{ width: 88, height: 88 }}
                >
                  P
                </div>
              )}
            </div>
            <div>
              <h4 className="mb-0">
                {player?.fullName ||
                  player?.name ||
                  player?.displayName ||
                  "Player"}
              </h4>
              <div className="small text-muted">
                {player?.teamName || player?.team || "Unassigned"}
              </div>
            </div>
          </div>

          <div className="text-end">
            <div className="small text-muted">Position</div>
            <div className="fw-bold">{player?.position || "—"}</div>
          </div>
        </div>
      </div>

      {/* Stats panel */}
      <div className="card mb-3 bg-dark text-light">
        <div className="card-body">
          <div className="row">
            <div className="col-md-4">
              <div className="small text-muted">Strength / Skill</div>
              {editing ? (
                <input
                  name="strength"
                  value={formData.strength || ""}
                  onChange={handleChange}
                  className="form-control"
                />
              ) : (
                <div className="h5">
                  {player?.strength || player?.skill || "—"}
                </div>
              )}
            </div>

            <div className="col-md-4">
              <div className="small text-muted">Preferred Foot</div>
              {editing ? (
                <select
                  name="preferredFoot"
                  value={formData.preferredFoot || ""}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="">-- select --</option>
                  <option value="Right">Right</option>
                  <option value="Left">Left</option>
                  <option value="Both">Both</option>
                </select>
              ) : (
                <div className="h5">
                  {player?.preferredFoot || player?.preferredFoot || "—"}
                </div>
              )}
            </div>

            <div className="col-md-4">
              <div className="small text-muted">Phone</div>
              {editing ? (
                <input
                  name="phone"
                  value={formData.phone || ""}
                  onChange={handleChange}
                  className="form-control"
                />
              ) : (
                <div className="h5">
                  {player?.phone || player?.contact || "—"}
                </div>
              )}
            </div>
          </div>

          <hr className="my-3" />

          <div className="row">
            <div className="col-md-3">
              <div className="small text-muted">Strong Foot Rating</div>
              {editing ? (
                <input
                  name="strongFootRating"
                  value={formData.strongFootRating || ""}
                  onChange={handleChange}
                  className="form-control"
                />
              ) : (
                <div className="h5">
                  {player?.strongFootRating || player?.strongFoot || "—"}
                </div>
              )}
            </div>
            <div className="col-md-3">
              <div className="small text-muted">Weak Foot Rating</div>
              {editing ? (
                <input
                  name="weakFoot"
                  value={formData.weakFoot || ""}
                  onChange={handleChange}
                  className="form-control"
                />
              ) : (
                <div className="h5">{player?.weakFoot || "—"}</div>
              )}
            </div>
            <div className="col-md-6">
              <div className="small text-muted">Email</div>
              {editing ? (
                <input
                  name="email"
                  value={formData.email || ""}
                  onChange={handleChange}
                  className="form-control"
                />
              ) : (
                <div className="h5">
                  {player?.email || player?.contactEmail || "—"}
                </div>
              )}
            </div>
          </div>

          <div className="d-flex justify-content-end mt-3">
            {editing ? (
              <>
                <button
                  className="btn btn-outline-light me-2"
                  onClick={() => setEditing(false)}
                >
                  Cancel
                </button>
                <button className="btn btn-warning" onClick={handleSave}>
                  Save
                </button>
              </>
            ) : (
              <button
                className="btn btn-outline-warning"
                onClick={() => setEditing(true)}
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Available teams list (table-like) */}
      <div className="card bg-dark text-light">
        <div className="card-body">
          <h5 className="mb-3">Available Teams</h5>
          {teams.length === 0 ? (
            <div className="text-muted">No teams available</div>
          ) : (
            <div className="list-group">
              {teams.map((t) => (
                <div
                  key={t.id}
                  className="list-group-item list-group-item-dark d-flex justify-content-between align-items-center"
                >
                  <div>
                    <div className="fw-bold">{t.teamName || t.name}</div>
                    <div className="small text-muted">
                      Manager: {t.managerName || t.contactName || "—"}
                    </div>
                  </div>
                  <div className="small text-muted">
                    Players:{" "}
                    {t.players ? t.players.length : t.membersCount || 0}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

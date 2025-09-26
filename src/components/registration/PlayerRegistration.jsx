import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { saveRegistration } from "../../firebase";
import { FaFutbol } from "react-icons/fa";
import RegistrationSuccess from "./RegistrationSuccess";
import {
  getFirestore,
  collection,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import { app } from "../../firebase";
import { useLocation } from "react-router-dom";

export default function PlayerRegistration() {
  const [formData, setFormData] = useState({
    fullName: "",
    age: "",
    idNumber: "",
    position: "",
    team: "",
    email: "",
    phone: "",
    role: "player", // 🔑 role auto-set
  });

  const [showSuccess, setShowSuccess] = useState(false); // 👈 controls modal
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);
  const [acceptedPolicy, setAcceptedPolicy] = useState(false);

  useEffect(() => {
    const db = getFirestore(app);
    let q;
    try {
      q = query(collection(db, "teams"), orderBy("createdAt", "desc"));
    } catch (e) {
      q = collection(db, "teams");
    }
    const unsub = onSnapshot(
      q,
      (snap) => {
        setTeams(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      },
      (err) => console.error("teams listen", err)
    );
    return () => unsub();
  }, []);

  // prefill team if coming from team detail page using query param
  const location = useLocation();
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const teamId = params.get("teamId");
    const teamName = params.get("teamName");
    if (teamId && teamName) {
      // store the team id (not name) so we can link on registration
      setFormData((s) => ({ ...s, team: teamId }));
    }
  }, [location.search]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!acceptedPolicy) {
      return alert("You must accept the Terms & Policy to register.");
    }

    try {
      await saveRegistration("player", formData);
      setShowSuccess(true); // ✅ show modal
    } catch (err) {
      alert("❌ Registration failed. Try again.");
    }
  };

  return (
    <div className="container py-5">
      <h2 className="fw-bold text-warning text-center mb-4">
        <FaFutbol className="me-2" />
        Player Registration
      </h2>
      <form
        className="card p-4 bg-dark text-light shadow-lg"
        onSubmit={handleSubmit}
      >
        <input
          type="text"
          name="fullName"
          placeholder="Full Name"
          value={formData.fullName}
          onChange={handleChange}
          className="form-control mb-3"
          required
        />
        <input
          type="number"
          name="age"
          placeholder="Age"
          value={formData.age}
          onChange={handleChange}
          className="form-control mb-3"
          required
        />
        <input
          type="number"
          name="idNumber"
          placeholder="National ID"
          value={formData.idNumber}
          onChange={handleChange}
          className="form-control mb-3"
          required
        />
        <label className="form-label">Preferred Position</label>
        <select
          name="position"
          value={formData.position}
          onChange={handleChange}
          className="form-select mb-3"
          required
        >
          <option value="">-- Select position --</option>
          <option value="GK">Goalkeeper (GK)</option>
          <option value="RB">Right Back (RB)</option>
          <option value="RWB">Right Wing Back (RWB)</option>
          <option value="CB">Center Back (CB)</option>
          <option value="LB">Left Back (LB)</option>
          <option value="LWB">Left Wing Back (LWB)</option>
          <option value="CDM">Defensive Midfielder (CDM)</option>
          <option value="CM">Central Midfielder (CM)</option>
          <option value="CAM">Attacking Midfielder (CAM)</option>
          <option value="RW">Right Winger (RW)</option>
          <option value="LW">Left Winger (LW)</option>
          <option value="ST">Striker (ST)</option>
          <option value="CF">Center Forward (CF)</option>
        </select>
        <label className="form-label">Select Team (optional)</label>
        <select
          name="team"
          value={formData.team}
          onChange={handleChange}
          className="form-select mb-3"
        >
          <option value="">-- Choose a team --</option>
          {teams.map((t) => (
            <option key={t.id} value={t.teamName || t.name || t.id}>
              {t.teamName || t.name}
            </option>
          ))}
        </select>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="form-control mb-3"
        />
        <input
          type="tel"
          name="phone"
          placeholder="Phone"
          value={formData.phone}
          onChange={handleChange}
          className="form-control mb-3"
        />

        <div className="form-check form-switch mb-3 text-start">
          <input
            className="form-check-input"
            type="checkbox"
            id="acceptPolicy"
            checked={acceptedPolicy}
            onChange={(e) => setAcceptedPolicy(e.target.checked)}
          />
          <label className="form-check-label small ms-2" htmlFor="acceptPolicy">
            I agree to the{" "}
            <a href="/policy" target="_blank" rel="noopener noreferrer">
              Terms &amp; Policy
            </a>
          </label>
        </div>

        <button type="submit" className="btn btn-warning fw-bold">
          Register Player
        </button>
      </form>
      <RegistrationSuccess
        show={showSuccess}
        onClose={() => setShowSuccess(false)}
        role={formData.role}
      />
    </div>
  );
}

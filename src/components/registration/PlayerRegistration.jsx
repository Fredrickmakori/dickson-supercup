import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { saveRegistration } from "../../firebase";
import { FaFutbol } from "react-icons/fa";
import RegistrationSuccess from "./RegistrationSuccess";

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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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
        <input
          type="text"
          name="position"
          placeholder="Preferred Position"
          value={formData.position}
          onChange={handleChange}
          className="form-control mb-3"
          required
        />
        <input
          type="text"
          name="team"
          placeholder="Team"
          value={formData.team}
          onChange={handleChange}
          className="form-control mb-3"
        />
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

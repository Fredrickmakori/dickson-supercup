import React, { useState } from "react";
import { saveRegistration } from "../../firebase";
import { FaUserTie } from "react-icons/fa";
import RegistrationSuccess from "./RegistrationSuccess";

export default function ManagerRegistration() {
  const [formData, setFormData] = useState({
    fullName: "",
    clubName: "",
    region: "",
    email: "",
    idNumber: "",
    phone: "",
    role: "manager", // 👈 stays fixed for managers
  });

  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await saveRegistration(formData);
      setShowSuccess(true); // ✅ show modal on success
    } catch (err) {
      alert("❌ Registration failed. Please try again.");
      console.error(err);
    }
  };

  return (
    <div className="container py-5">
      <h2 className="fw-bold text-warning text-center mb-4">
        <FaUserTie className="me-2" /> Manager Registration
      </h2>

      <form
        className="card p-4 bg-dark text-light shadow-lg"
        onSubmit={handleSubmit}
      >
        <input
          name="fullName"
          placeholder="Full Name"
          onChange={handleChange}
          className="form-control mb-3"
          required
        />
        <input
          name="idNumber"
          placeholder="Your ID Number"
          onChange={handleChange}
          className="form-control mb-3"
          required
        />
        <input
          name="clubName"
          placeholder="Club/Team Name"
          onChange={handleChange}
          className="form-control mb-3"
        />
        <input
          name="region"
          placeholder="Region"
          onChange={handleChange}
          className="form-control mb-3"
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          onChange={handleChange}
          className="form-control mb-3"
          required
        />
        <input
          name="phone"
          type="tel"
          placeholder="Phone"
          onChange={handleChange}
          className="form-control mb-3"
          required
        />
        <button type="submit" className="btn btn-warning fw-bold">
          Register Manager
        </button>
      </form>

      {/* ✅ Success Modal */}
      <RegistrationSuccess
        show={showSuccess}
        onClose={() => setShowSuccess(false)}
        role={formData.role} // 👈 sends "manager"
      />
    </div>
  );
}

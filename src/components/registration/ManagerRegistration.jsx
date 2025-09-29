import React, { useState } from "react";
import RegistrationService from "../../services/RegistrationService";
import { useAuth } from "../../context/AuthContext";
import { FaUserTie } from "react-icons/fa";
import RegistrationSuccess from "./RegistrationSuccess";

const regService = new RegistrationService();

export default function ManagerRegistration() {
  const { user } = useAuth();
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
  const [lastRegistrationId, setLastRegistrationId] = useState(null);
  const [acceptedPolicy, setAcceptedPolicy] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!acceptedPolicy)
      return alert("You must accept the Terms & Policy to register.");
    try {
      const managerId = await regService.addManager(formData, user || null);
      setLastRegistrationId(managerId);
      if (formData.team) {
        const resolvedId = await regService.resolveTeamId(formData.team);
        if (resolvedId) {
          await regService.addManagerToTeam(resolvedId, managerId);
        } else {
          console.warn("Team not found for manager attachment:", formData.team);
        }
      }
      setShowSuccess(true);
    } catch (err) {
      console.error(err);
      alert("❌ Registration failed. Please try again.");
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
        <div className="form-check form-switch mb-3 text-start">
          <input
            className="form-check-input"
            type="checkbox"
            id="acceptPolicyMgr"
            checked={acceptedPolicy}
            onChange={(e) => setAcceptedPolicy(e.target.checked)}
          />
          <label
            className="form-check-label small ms-2"
            htmlFor="acceptPolicyMgr"
          >
            I agree to the{" "}
            <a href="/policy" target="_blank" rel="noopener noreferrer">
              Terms &amp; Policy
            </a>
          </label>
        </div>

        <button type="submit" className="btn btn-warning fw-bold">
          Register Manager
        </button>
      </form>

      {/* ✅ Success Modal */}
      <RegistrationSuccess
        show={showSuccess}
        onClose={() => setShowSuccess(false)}
        role={formData.role} // 👈 sends "manager"
        registrationId={lastRegistrationId}
        teamId={formData.team || null}
        teamName={formData.clubName || formData.team || null}
      />
    </div>
  );
}

import React, { useState } from "react";
import RegistrationService from "../../services/RegistrationService";
import { useAuth } from "../../context/AuthContext";
import { FaChalkboardTeacher } from "react-icons/fa";
import RegistrationSuccess from "./RegistrationSuccess";

const regService = new RegistrationService();

export default function CoachRegistration() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    fullName: "",
    experience: "",
    certification: "",
    idNumber: "",
    team: "",
    email: "",
    phone: "",
    role: "coach", // 👈 fixed role
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
      const coachId = await regService.addCoach(formData, user || null);
      setLastRegistrationId(coachId);
      if (formData.team) {
        const resolvedId = await regService.resolveTeamId(formData.team);
        if (resolvedId) {
          await regService.addCoachToTeam(resolvedId, coachId);
        } else {
          console.warn("Team not found for coach attachment:", formData.team);
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
        <FaChalkboardTeacher className="me-2" /> Coach Registration
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
          type="number"
          name="idNumber"
          placeholder="Your ID Number"
          onChange={handleChange}
          className="form-control mb-3"
        />
        <input
          name="experience"
          placeholder="Years of Experience"
          onChange={handleChange}
          className="form-control mb-3"
        />
        <input
          name="certification"
          placeholder="Coaching Certification"
          onChange={handleChange}
          className="form-control mb-3"
        />
        <input
          name="team"
          placeholder="Team (if assigned)"
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
            id="acceptPolicyCoach"
            checked={acceptedPolicy}
            onChange={(e) => setAcceptedPolicy(e.target.checked)}
          />
          <label
            className="form-check-label small ms-2"
            htmlFor="acceptPolicyCoach"
          >
            I agree to the{" "}
            <a href="/policy" target="_blank" rel="noopener noreferrer">
              Terms &amp; Policy
            </a>
          </label>
        </div>

        <button type="submit" className="btn btn-warning fw-bold">
          Register Coach
        </button>
      </form>

      {/* ✅ Success Modal */}
      <RegistrationSuccess
        show={showSuccess}
        onClose={() => setShowSuccess(false)}
        role={formData.role} // 👈 ensures redirect to `/admin/coach`
        registrationId={lastRegistrationId}
        teamId={formData.team || null}
        teamName={formData.team || null}
      />
    </div>
  );
}

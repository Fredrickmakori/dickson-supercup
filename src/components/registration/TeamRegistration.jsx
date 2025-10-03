import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUsers,
  FaMoneyBillWave,
  FaCheckCircle,
  FaClipboardList,
  FaMobileAlt,
  FaLink,
} from "react-icons/fa";

// Firestore imports
import RegistrationService from "../../services/RegistrationService";
import { useAuth } from "../../context/AuthContext";

const regService = new RegistrationService();

export default function TeamRegistration() {
  const [formData, setFormData] = useState({
    teamName: "",
    region: "",
    category: "Men",
    managerName: "",
    contactEmail: "",
    contactPhone: "",
    role: "team",
  });

  const navigate = useNavigate();
  const [acceptedPolicy, setAcceptedPolicy] = useState(false);
  const [existingTeams, setExistingTeams] = useState([]);
  const { user } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!acceptedPolicy)
      return alert("You must accept the Terms & Policy to register.");

    try {
      // Prevent duplicate team registration by same authenticated user
      if (user && user.uid) {
        try {
          const teamsFound = await regService.findTeamsByUser(user.uid);
          if (teamsFound && teamsFound.length > 0) {
            // show inline list of teams to the user instead of an alert
            setExistingTeams(teamsFound);
            // scroll to top so the user sees the message
            try {
              window.scrollTo({ top: 0, behavior: "smooth" });
            } catch (e) {}
            return;
          }
        } catch (e) {
          console.warn("duplicate team check failed", e);
        }
      }
      // Check for duplicate by teamName or contactEmail
      const existingByName = await regService.resolveTeamId(formData.teamName);
      if (existingByName) {
        return alert(
          "A team with this name already exists. Please check the teams list or contact support."
        );
      }

      // Additionally check by contact email (simple linear scan via query)
      try {
        const teamsMatchingEmail = await regService.findTeamsByEmail(
          formData.contactEmail
        );
        if (teamsMatchingEmail && teamsMatchingEmail.length > 0) {
          return alert(
            "A team with this contact email already exists. If this is your team, please contact the organizer."
          );
        }
      } catch (e) {
        console.warn("email check failed", e);
      }

      // Save to Firestore using service and pass current authenticated user so
      // we persist the user's profile under users/{uid} and only store uid refs on team
      const teamId = await regService.createTeam(
        {
          ...formData,
          paymentStatus: "pending",
        },
        user || null
      );
      console.log("✅ Team data saved with ID:", teamId);

      // Open M-Changa in a new tab
      window.open(
        "https://www.mchanga.africa/fundraiser/120550",
        "_blank",
        "noopener,noreferrer"
      );
    } catch (error) {
      console.error("❌ Error saving team:", error);
      alert("Failed to register team. Please try again.");
    }
  };

  const handleAlreadyPaid = () => {
    navigate("/verify-payment");
  };

  return (
    <div className="container py-5">
      <h2 className="fw-bold text-warning text-center mb-4">
        <FaUsers className="me-2" /> Team Registration
      </h2>

      <p className="lead text-center text-muted mb-4">
        Please complete the registration form below to register your team.
      </p>

      {/* Registration Form */}
      <form
        className="card p-4 bg-dark text-light shadow-lg"
        onSubmit={handleSubmit}
      >
        <input
          name="teamName"
          placeholder="Team Name"
          onChange={handleChange}
          className="form-control mb-3"
          required
        />
        <input
          name="region"
          placeholder="Region"
          onChange={handleChange}
          className="form-control mb-3"
        />
        <select
          name="category"
          onChange={handleChange}
          className="form-select mb-3"
        >
          <option>Men</option>
          <option>Women</option>
          <option>Youth</option>
        </select>
        <input
          name="managerName"
          placeholder="Manager's Name"
          onChange={handleChange}
          className="form-control mb-3"
        />
        <input
          name="contactEmail"
          type="email"
          placeholder="Contact Email"
          onChange={handleChange}
          className="form-control mb-3"
          required
        />
        <input
          name="contactPhone"
          type="tel"
          placeholder="Contact Phone"
          onChange={handleChange}
          className="form-control mb-3"
          required
        />
        <div className="form-check form-switch mb-3 text-start">
          <input
            className="form-check-input"
            type="checkbox"
            id="acceptPolicyTeam"
            checked={acceptedPolicy}
            onChange={(e) => setAcceptedPolicy(e.target.checked)}
          />
          <label
            className="form-check-label small ms-2"
            htmlFor="acceptPolicyTeam"
          >
            I agree to the{" "}
            <a href="/policy" target="_blank" rel="noopener noreferrer">
              Terms &amp; Policy
            </a>
          </label>
        </div>

        <button type="submit" className="btn btn-warning fw-bold w-100">
          Register Team
        </button>
      </form>
    </div>
  );
}

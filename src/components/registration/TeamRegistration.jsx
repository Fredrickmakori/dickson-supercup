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
import { Modal, Button } from "react-bootstrap";

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
  const { user, signInWithGoogle } = useAuth();

  // detect if the currently authenticated user signed in with Google
  const isGoogleUser =
    user && Array.isArray(user.providerData)
      ? user.providerData.some((p) => p.providerId === "google.com")
      : false;

  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [registeredTeamId, setRegisteredTeamId] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!acceptedPolicy)
      return alert("You must accept the Terms & Policy to register.");

    // require Google authentication for registration
    if (!isGoogleUser) {
      return alert("Please sign in with Google to register a team.");
    }

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
      const teamPayload = {
        ...formData,
        paymentStatus: "pending",
        authProvider: isGoogleUser ? "google" : user ? "email" : "anonymous",
        registeredBy: user ? user.uid : null,
      };

      const teamId = await regService.createTeam(teamPayload, user || null);
      console.log("✅ Team data saved with ID:", teamId);

      // Open M-Changa in a new tab
      window.open(
        "https://www.mchanga.africa/fundraiser/120550",
        "_blank",
        "noopener,noreferrer"
      );

      // Show success modal to user and keep them on page until they close it
      setRegisteredTeamId(teamId);
      setSuccessModalOpen(true);
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
        Please sign in with Google to register a team. This helps verify your
        identity and speeds up verification.
      </p>

      {!isGoogleUser && (
        <div className="text-center mb-4">
          <button
            className="btn btn-outline-danger fw-bold"
            onClick={async () => {
              try {
                await signInWithGoogle();
              } catch (err) {
                console.error("Google sign-in failed", err);
                alert("Google sign-in failed. Please try again.");
              }
            }}
          >
            Sign in with Google
          </button>
        </div>
      )}

      {/* Registration Form */}
      <form
        className="card p-4 bg-dark text-light shadow-lg"
        onSubmit={handleSubmit}
        hidden={!isGoogleUser}
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

      {/* Success Modal */}
      <Modal
        show={successModalOpen}
        onHide={() => {
          setSuccessModalOpen(false);
          navigate("/");
        }}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Registration Submitted</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-2">
            Your team has been registered successfully. We have opened the
            payment page; once you complete payment please verify it on the
            verification page.
          </p>
          {registeredTeamId && (
            <p className="small text-muted">Team ID: {registeredTeamId}</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setSuccessModalOpen(false);
              navigate("/");
            }}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

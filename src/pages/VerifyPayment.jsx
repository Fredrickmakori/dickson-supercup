// src/pages/VerifyPayment.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { saveRegistration } from "../firebase";
import RegistrationSuccess from "../components/registration/RegistrationSuccess"; // <-- modal version

export default function VerifyPayment() {
  const navigate = useNavigate();
  const [option, setOption] = useState(""); // "mpesa" or "mchanga"
  const [file, setFile] = useState(null);
  const [link, setLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [role, setRole] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const dataJson = sessionStorage.getItem("pendingTeamRegistration");
    if (!dataJson) {
      navigate("/register");
      return;
    }

    const data = JSON.parse(dataJson);
    setRole(data.role);

    try {
      // ✅ You could upload file/link to Firestore/Storage here
      // For now, just simulate verification
      await new Promise((resolve) => setTimeout(resolve, 1500));

      await saveRegistration(data.role, {
        ...data,
        paymentProof: option === "mpesa" ? "Mpesa screenshot" : link,
      });

      sessionStorage.removeItem("pendingTeamRegistration");

      // Show success modal instead of redirect
      setShowSuccess(true);
    } catch (err) {
      console.error("Registration error:", err);
      alert("Error completing registration. Please contact support.");
      sessionStorage.removeItem("pendingTeamRegistration");
      navigate("/register");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <h2 className="fw-bold text-center mb-4 text-warning">Verify Payment</h2>

      {!showSuccess ? (
        <form className="card p-4 shadow-lg bg-dark text-light" onSubmit={handleSubmit}>
          <p className="mb-3">Please verify your payment method:</p>

          <div className="mb-3">
            <label className="form-check">
              <input
                type="radio"
                name="option"
                value="mpesa"
                checked={option === "mpesa"}
                onChange={(e) => setOption(e.target.value)}
                className="form-check-input"
                required
              />
              <span className="form-check-label">Upload Mpesa Message Screenshot</span>
            </label>
            {option === "mpesa" && (
              <input
                type="file"
                accept="image/*"
                className="form-control mt-2"
                onChange={(e) => setFile(e.target.files[0])}
                required
              />
            )}
          </div>

          <div className="mb-3">
            <label className="form-check">
              <input
                type="radio"
                name="option"
                value="mchanga"
                checked={option === "mchanga"}
                onChange={(e) => setOption(e.target.value)}
                className="form-check-input"
              />
              <span className="form-check-label">Enter M-Changa Payment Link</span>
            </label>
            {option === "mchanga" && (
              <input
                type="url"
                placeholder="https://mchanga.africa/payment/..."
                className="form-control mt-2"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                required
              />
            )}
          </div>

          <button type="submit" className="btn btn-warning fw-bold" disabled={loading}>
            {loading ? "Verifying..." : "Submit Verification"}
            {!showSuccess && <p className="lead">Verifying your payment...</p>}

      {/* Success Modal */}
      <RegistrationSuccess
        show={showSuccess}
        onClose={() => navigate("/")} // close modal → go home
      />
          </button>
        </form>
      ) : (
        <RegistrationSuccess show={true} onClose={() => navigate("/")} role={role} />
      )}
    </div>
  );
}

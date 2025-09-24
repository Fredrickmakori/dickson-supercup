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
import { db } from "../../firebase"; // <-- adjust the path if needed
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Save to Firestore
      const docRef = await addDoc(collection(db, "teams"), {
        ...formData,
        createdAt: serverTimestamp(),
        paymentStatus: "pending", // update later after verification
      });

      console.log("✅ Team data saved with ID:", docRef.id);
      console.log("Saved Data:", formData);

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

      {/* Directions Section */}
      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <div className="card shadow-sm border-0 h-100 text-center p-3">
            <FaClipboardList size={40} className="text-primary mb-3" />
            <h5 className="fw-bold">Step 1</h5>
            <p className="mb-0">Fill in all required team details below.</p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm border-0 h-100 text-center p-3">
            <FaMoneyBillWave size={40} className="text-success mb-3" />
            <h5 className="fw-bold">Step 2</h5>
            <p className="mb-0">
              Click <strong>Register Team</strong> and pay{" "}
              <span className="fw-bold">Ksh 2,000</span> via M-Changa.
            </p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm border-0 h-100 text-center p-3">
            <FaCheckCircle size={40} className="text-warning mb-3" />
            <h5 className="fw-bold">Step 3</h5>
            <p className="mb-0">Return here and verify your payment.</p>
          </div>
        </div>
      </div>

      {/* Already Paid Card */}
      <div className="card border-0 shadow-lg mb-4 bg-light">
        <div className="card-body text-center">
          <h5 className="fw-bold text-dark mb-3">💳 Already Paid?</h5>
          <p className="text-muted">
            If you have already completed payment via Mpesa or M-Changa, proceed
            to verify and complete your registration.
          </p>
          <div className="d-flex justify-content-center gap-3 mt-3">
            <button
              className="btn btn-outline-success fw-bold d-flex align-items-center"
              onClick={handleAlreadyPaid}
            >
              <FaMobileAlt className="me-2" /> Upload Mpesa Message
            </button>
            <button
              className="btn btn-outline-primary fw-bold d-flex align-items-center"
              onClick={handleAlreadyPaid}
            >
              <FaLink className="me-2" /> Enter M-Changa Link
            </button>
          </div>
        </div>
      </div>

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
        <button type="submit" className="btn btn-warning fw-bold w-100">
          Register Team
        </button>
      </form>
    </div>
  );
}

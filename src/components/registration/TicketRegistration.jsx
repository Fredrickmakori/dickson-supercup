import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { saveRegistration } from "../../firebase";
import { FaTicketAlt } from "react-icons/fa";
import RegistrationSuccess from "./RegistrationSuccess";

export default function TicketRegistration() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    ticketType: "Regular", // Regular / VIP
    quantity: 1,
    role: "ticket",
  });
  const [acceptedPolicy, setAcceptedPolicy] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastRegistrationId, setLastRegistrationId] = useState(null);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!acceptedPolicy)
      return alert("You must accept the Terms & Policy to continue.");
    try {
      const id = await saveRegistration(formData);
      setLastRegistrationId(id);
      setShowSuccess(true);
    } catch (err) {
      console.error("ticket registration failed", err);
      alert("Failed to submit.");
    }
  };

  return (
    <div className="container py-5">
      <h2 className="fw-bold text-warning text-center mb-4">
        <FaTicketAlt className="me-2" /> Ticket Registration
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
        <select
          name="ticketType"
          onChange={handleChange}
          className="form-select mb-3"
        >
          <option>Regular</option>
          <option>VIP</option>
        </select>
        <input
          name="quantity"
          type="number"
          min="1"
          value={formData.quantity}
          onChange={handleChange}
          className="form-control mb-3"
        />
        <div className="form-check form-switch mb-3 text-start">
          <input
            className="form-check-input"
            type="checkbox"
            id="acceptPolicyTicket"
            checked={acceptedPolicy}
            onChange={(e) => setAcceptedPolicy(e.target.checked)}
          />
          <label
            className="form-check-label small ms-2"
            htmlFor="acceptPolicyTicket"
          >
            I agree to the{" "}
            <a href="/policy" target="_blank" rel="noopener noreferrer">
              Terms &amp; Policy
            </a>
          </label>
        </div>

        <button type="submit" className="btn btn-warning fw-bold">
          Get Ticket
        </button>
      </form>
      <RegistrationSuccess
        show={showSuccess}
        onClose={() => {
          setShowSuccess(false);
          navigate("/");
        }}
        role={formData.role}
        registrationId={lastRegistrationId}
      />
    </div>
  );
}

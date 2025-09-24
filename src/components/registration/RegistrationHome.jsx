import React from "react";
import { Link } from "react-router-dom";
import {
  FaTicketAlt,
  FaFutbol,
  FaChalkboardTeacher,
  FaUserTie,
  FaTrophy,
} from "react-icons/fa";

export default function RegistrationHome() {
  return (
    <section className="container py-5 text-center">
      <h2 className="fw-bold mb-4 text-warning">Registration Portal</h2>
      <p className="mb-4 text-light fs-5">
        Choose your registration type for the Dickson Super Cup Classic:
      </p>
      <div className="d-flex flex-wrap gap-3 justify-content-center">
        <Link
          className="btn btn-danger btn-lg d-flex align-items-center gap-2"
          to="/register/ticket"
        >
          <FaTicketAlt size={22} /> Ticket Registration
        </Link>
        <Link
          className="btn btn-success btn-lg d-flex align-items-center gap-2"
          to="/register/player"
        >
          <FaFutbol size={22} /> Player Registration
        </Link>
        <Link
          className="btn btn-primary btn-lg d-flex align-items-center gap-2"
          to="/register/coach"
        >
          <FaChalkboardTeacher size={22} /> Coach Registration
        </Link>
        <Link
          className="btn btn-info btn-lg d-flex align-items-center gap-2 text-dark"
          to="/register/manager"
        >
          <FaUserTie size={22} /> Manager Registration
        </Link>
        <Link
          className="btn btn-warning btn-lg d-flex align-items-center gap-2 text-dark"
          to="/register/team"
        >
          <FaTrophy size={22} /> Team Registration
        </Link>
      </div>
    </section>
  );
}

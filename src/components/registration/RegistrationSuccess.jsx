import React from "react";
import { Link } from "react-router-dom";
import { FaHome, FaTachometerAlt, FaCheckCircle } from "react-icons/fa";

export default function RegistrationSuccess({
  show,
  onClose,
  role = "",
  registrationId = null,
  teamId = null,
  teamName = null,
}) {
  if (!show) return null;

  // 🔹 Map roles to dashboard routes (keeps names consistent with app)
  const dashboardLinks = {
    player: "/admin/player",
    coach: "/admin/coach",
    manager: "/admin/manager",
    admin: "/admin",
  };

  // fallback in case role is missing
  const dashboardPath = dashboardLinks[role] || "/";

  const dialogId = "registration-success-title";
  const descId = "registration-success-desc";

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      role="dialog"
      aria-labelledby={dialogId}
      aria-describedby={descId}
    >
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className="modal-content bg-dark text-light rounded-4 shadow-lg text-center p-3">
          {/* ✅ Header */}
          <div className="modal-header border-0 justify-content-center">
            <FaCheckCircle className="text-success me-2" size={28} />
            <h5 id={dialogId} className="modal-title text-success fw-bold mb-0">
              Registration Successful!
            </h5>
          </div>

          {/* 🎉 Body */}
          <div className="modal-body" id={descId}>
            <p className="lead mb-1">🎉 Welcome to the Super Cup Community!</p>
            <p className="text-muted small">
              Your registration has been saved successfully.
            </p>

            {/* Short summary: team name or registration id */}
            {teamName ? (
              <p className="mb-1">
                Registered for team: <strong>{teamName}</strong>
              </p>
            ) : registrationId ? (
              <p className="mb-1">
                Registration ID: <code>{registrationId}</code>
              </p>
            ) : null}
          </div>

          {/* 🔗 Footer with actions */}
          <div className="modal-footer border-0 justify-content-center gap-3 flex-wrap">
            <Link
              to="/"
              className="btn btn-outline-light fw-bold d-flex align-items-center"
              onClick={onClose}
            >
              <FaHome className="me-2" />
              Back to Home
            </Link>

            <Link
              to={dashboardPath}
              className="btn btn-success fw-bold d-flex align-items-center"
              onClick={onClose}
            >
              <FaTachometerAlt className="me-2" />
              Go to Dashboard
            </Link>

            {/* View team link when we have a team id */}
            {teamId && (
              <Link
                to={`/teams/${teamId}`}
                className="btn btn-outline-warning fw-bold d-flex align-items-center"
                onClick={onClose}
              >
                View my team
              </Link>
            )}

            <div className="w-100 text-center mt-2">
              <small className="text-muted d-block">
                How to reach admin panel
              </small>
              <small className="text-muted">
                If you have admin access, go to <code>/admin</code> or use the
                top navigation "Admin" link. Contact the event organizer to
                request admin privileges.
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Default props to avoid undefined role and keep callers lightweight
RegistrationSuccess.defaultProps = {
  role: "",
  registrationId: null,
  teamId: null,
  teamName: null,
};

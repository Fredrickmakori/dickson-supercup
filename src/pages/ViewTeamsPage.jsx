import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaListOl, FaPlusCircle } from "react-icons/fa";
import { Link } from "react-router-dom";
import {
  getFirestore,
  collection,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  doc,
  updateDoc,
} from "firebase/firestore";
import { app } from "../firebase"; // ensure firebase is initialized and exported from this module
import { mapPosition } from "../utils/positionMap";

export default function ViewTeamsPage() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const db = getFirestore(app);

  useEffect(() => {
    setLoading(true);
    let q;
    try {
      q = query(collection(db, "teams"), orderBy("createdAt", "desc"));
    } catch (e) {
      q = collection(db, "teams");
    }
    const unsub = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setTeams(list);
        setLoading(false);
      },
      (err) => {
        console.error("Error listening teams:", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [db]);

  function formatDate(value) {
    if (!value) return "—";
    if (value?.toDate && typeof value.toDate === "function")
      return value.toDate().toLocaleString();
    if (typeof value === "number") return new Date(value).toLocaleString();
    try {
      const d = new Date(value);
      if (!isNaN(d.getTime())) return d.toLocaleString();
    } catch (e) {}
    return String(value);
  }

  // Inline edit state + simple toast
  const [editingTeamId, setEditingTeamId] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [editErrors, setEditErrors] = useState({});
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "info",
  });

  function showToast(message, type = "success", ms = 3000) {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "info" }), ms);
  }

  function validate(values) {
    const errs = {};
    if (!values.managerName || values.managerName.trim().length < 2)
      errs.managerName = "Manager name is required";
    if (
      values.contactEmail &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.contactEmail)
    )
      errs.contactEmail = "Invalid email";
    if (values.contactPhone && !/^[0-9()+\-\s]{7,}$/.test(values.contactPhone))
      errs.contactPhone = "Invalid phone";
    return errs;
  }

  async function handleSave(teamId) {
    const errs = validate(editValues);
    setEditErrors(errs);
    if (Object.keys(errs).length > 0)
      return showToast("Fix validation errors before saving", "danger");

    try {
      const teamRef = doc(db, "teams", teamId);
      // only write the editable fields
      await updateDoc(teamRef, {
        managerName: editValues.managerName || null,
        contactEmail: editValues.contactEmail || null,
        contactPhone: editValues.contactPhone || null,
      });

      // reflect change locally for immediate feedback
      setTeams((prev) =>
        prev.map((t) => (t.id === teamId ? { ...t, ...editValues } : t))
      );
      setEditingTeamId(null);
      setEditValues({});
      setEditErrors({});
      showToast("Team saved", "success");
    } catch (e) {
      console.error("Save failed", e);
      showToast("Save failed: " + (e.message || "unknown error"), "danger");
    }
  }

  return (
    <div className="container py-5 text-light">
      <motion.div
        className="d-flex justify-content-center mb-4"
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div
          className="d-inline-flex align-items-center gap-3 px-4 py-2 rounded-3"
          style={{
            background: "linear-gradient(90deg,#1f1f1f,#121212)",
            border: "1px solid rgba(255,193,7,0.12)",
          }}
        >
          <div
            className="d-flex align-items-center justify-content-center"
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: "rgba(255,193,7,0.12)",
            }}
          >
            <FaListOl style={{ color: "#ffc107", fontSize: 20 }} />
          </div>
          <h2
            className="mb-0 fw-bold text-warning"
            style={{ fontSize: "1.25rem" }}
          >
            Registered Teams
          </h2>
        </div>
      </motion.div>

      {loading && (
        <div className="text-center my-5">
          <div className="spinner-border text-warning" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

      {error && (
        <div className="alert alert-danger">
          Failed to load teams. Please try again later.
        </div>
      )}

      {!loading && !error && (
        <div className="row g-3">
          {teams.length > 0 ? (
            teams.map((team, idx) => (
              <motion.div
                key={team.id}
                className="col-12 col-md-6 col-lg-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.06, duration: 0.4 }}
              >
                <div className="card bg-dark text-light shadow-sm h-100 rounded-3">
                  <div className="card-body d-flex align-items-center justify-content-between">
                    <div>
                      <h5 className="mb-0">
                        {team.teamName || team.name || "Unnamed Team"}
                      </h5>
                      <small className="text-muted d-block mb-1">
                        {team.managerName ||
                        team.coach ||
                        team.manager ||
                        team.contactName
                          ? `Manager: ${
                              team.managerName ||
                              team.coach ||
                              team.manager ||
                              team.contactName
                            }`
                          : "No manager listed"}
                      </small>
                      <div className="text-muted small">
                        Contact:{" "}
                        {team.contactPhone ||
                          team.phone ||
                          team.managerPhone ||
                          "—"}
                      </div>
                      <div className="text-muted small">
                        Email: {team.contactEmail || team.email || "—"}
                      </div>
                      <div className="text-muted small">
                        Status:{" "}
                        {team.paymentStatus ||
                          (team.paid ? "approved" : "pending")}
                      </div>
                      <div className="text-muted small">
                        Created: {formatDate(team.createdAt)}
                      </div>
                      <div className="text-muted small">
                        User ID: {team.userId || team.uid || team.owner || "—"}
                      </div>
                      {team.positionCode && (
                        <div className="text-muted small">
                          Primary position: {mapPosition(team.positionCode)}
                        </div>
                      )}
                    </div>
                    <div className="d-flex flex-column align-items-end gap-2">
                      <Link
                        to={`/teams/${team.id}`}
                        className="btn btn-sm btn-outline-warning"
                      >
                        View
                      </Link>
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => {
                            setEditingTeamId(team.id);
                            setEditValues({
                              managerName: team.managerName || "",
                              contactEmail: team.contactEmail || "",
                              contactPhone: team.contactPhone || "",
                            });
                            setEditErrors({});
                          }}
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>

                  {editingTeamId === team.id && (
                    <div className="card-footer bg-dark border-0">
                      <div className="d-flex flex-column gap-2">
                        <div>
                          <label className="form-label small text-muted">
                            Manager
                          </label>
                          <input
                            className={`form-control form-control-sm ${
                              editErrors.managerName ? "is-invalid" : ""
                            }`}
                            value={editValues.managerName || ""}
                            onChange={(e) =>
                              setEditValues((v) => ({
                                ...v,
                                managerName: e.target.value,
                              }))
                            }
                          />
                          {editErrors.managerName && (
                            <div className="invalid-feedback">
                              {editErrors.managerName}
                            </div>
                          )}
                        </div>
                        <div>
                          <label className="form-label small text-muted">
                            Email
                          </label>
                          <input
                            className={`form-control form-control-sm ${
                              editErrors.contactEmail ? "is-invalid" : ""
                            }`}
                            value={editValues.contactEmail || ""}
                            onChange={(e) =>
                              setEditValues((v) => ({
                                ...v,
                                contactEmail: e.target.value,
                              }))
                            }
                          />
                          {editErrors.contactEmail && (
                            <div className="invalid-feedback">
                              {editErrors.contactEmail}
                            </div>
                          )}
                        </div>
                        <div>
                          <label className="form-label small text-muted">
                            Phone
                          </label>
                          <input
                            className={`form-control form-control-sm ${
                              editErrors.contactPhone ? "is-invalid" : ""
                            }`}
                            value={editValues.contactPhone || ""}
                            onChange={(e) =>
                              setEditValues((v) => ({
                                ...v,
                                contactPhone: e.target.value,
                              }))
                            }
                          />
                          {editErrors.contactPhone && (
                            <div className="invalid-feedback">
                              {editErrors.contactPhone}
                            </div>
                          )}
                        </div>
                        <div className="d-flex gap-2 justify-content-end">
                          <button
                            className="btn btn-sm btn-outline-light"
                            onClick={() => {
                              setEditingTeamId(null);
                              setEditValues({});
                              setEditErrors({});
                            }}
                          >
                            Cancel
                          </button>
                          <button
                            className="btn btn-sm btn-warning"
                            onClick={() => handleSave(team.id)}
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          ) : (
            <p className="text-center text-muted">No teams registered yet.</p>
          )}
        </div>
      )}

      <motion.div
        className="text-center mt-5"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <Link
          to="/register"
          className="btn btn-warning fw-bold d-inline-flex align-items-center gap-2"
        >
          <FaPlusCircle /> Register a New Team
        </Link>
      </motion.div>

      {/* simple toast container */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="position-fixed"
        style={{ top: 20, right: 20, zIndex: 1060 }}
      >
        {toast.show && (
          <div
            className={`alert alert-${
              toast.type === "danger" ? "danger" : toast.type
            } shadow`}
            role="alert"
          >
            {toast.message}
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaListOl, FaPlusCircle } from "react-icons/fa";
import { FaCheckCircle, FaClock, FaTimes, FaUpload } from "react-icons/fa";
import { Link } from "react-router-dom";
import {
  getFirestore,
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  updateDoc,
} from "firebase/firestore";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
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
        const unique = dedupeTeams(list);
        setTeams(unique);
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

  // Remove obvious duplicate team registrations.
  // We consider teams duplicates when they share the same normalized team name
  // plus one of manager name, contact email, or uploader user id.
  function dedupeTeams(list) {
    const seen = new Set();
    return list.filter((t) => {
      const name = (t.teamName || t.name || "").toString().trim().toLowerCase();
      const manager = (t.managerName || t.manager || t.coach || "")
        .toString()
        .trim()
        .toLowerCase();
      const email = (t.contactEmail || t.email || "")
        .toString()
        .trim()
        .toLowerCase();
      const user = (t.userId || t.uid || t.owner || "").toString().trim();

      // Build a composite key from available identifying fields
      const parts = [];
      if (name) parts.push(name);
      if (manager) parts.push(manager);
      if (email) parts.push(email);
      if (user) parts.push(user);

      // If we have no meaningful identifying parts, fall back to the doc id
      const key = parts.length > 0 ? parts.join("|") : t.id;

      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
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

  // PDF export modal state
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [pdfTeam, setPdfTeam] = useState(null);
  const [manualFields, setManualFields] = useState({
    preparedBy: "",
    notes: "",
    extras: [],
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
                      {/* status icon */}
                      <div className="small mt-1">
                        {(() => {
                          const s = (
                            team.paymentStatus ||
                            (team.paid ? "verified" : "pending")
                          )
                            .toString()
                            .toLowerCase();
                          if (s === "verified" || s === "approved") {
                            return (
                              <span className="badge bg-success">
                                <FaCheckCircle className="me-1" /> Verified
                              </span>
                            );
                          }
                          if (s === "submitted") {
                            return (
                              <span className="badge bg-info text-dark">
                                <FaUpload className="me-1" /> Submitted
                              </span>
                            );
                          }
                          if (s === "rejected") {
                            return (
                              <span className="badge bg-danger">
                                <FaTimes className="me-1" /> Rejected
                              </span>
                            );
                          }
                          return (
                            <span className="badge bg-warning text-dark">
                              <FaClock className="me-1" />{" "}
                              {team.paymentStatus || "pending"}
                            </span>
                          );
                        })()}
                      </div>
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
                        <button
                          className="btn btn-sm btn-outline-primary"
                          title="Export team to PDF"
                          onClick={() => {
                            setPdfTeam(team);
                            setManualFields({
                              preparedBy: "",
                              notes: "",
                              extras: [],
                            });
                            setPdfModalOpen(true);
                          }}
                        >
                          Export PDF
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

      {/* PDF Export Modal */}
      {pdfModalOpen && pdfTeam && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Export Team to PDF</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setPdfModalOpen(false)}
                />
              </div>
              <div className="modal-body">
                <div className="mb-2">
                  <label className="form-label small">Prepared By</label>
                  <input
                    className="form-control"
                    value={manualFields.preparedBy}
                    onChange={(e) =>
                      setManualFields((m) => ({
                        ...m,
                        preparedBy: e.target.value,
                      }))
                    }
                    placeholder="Name or department preparing this export"
                  />
                </div>
                <div className="mb-2">
                  <label className="form-label small">Notes</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={manualFields.notes}
                    onChange={(e) =>
                      setManualFields((m) => ({ ...m, notes: e.target.value }))
                    }
                    placeholder="Any additional notes to include in the PDF"
                  />
                </div>

                <div className="mb-2">
                  <label className="form-label small">Additional Fields</label>
                  {manualFields.extras.map((ex, i) => (
                    <div key={i} className="d-flex gap-2 mb-2">
                      <input
                        className="form-control"
                        placeholder="Field name"
                        value={ex.key}
                        onChange={(e) => {
                          const copy = [...manualFields.extras];
                          copy[i] = { ...copy[i], key: e.target.value };
                          setManualFields((m) => ({ ...m, extras: copy }));
                        }}
                      />
                      <input
                        className="form-control"
                        placeholder="Value"
                        value={ex.value}
                        onChange={(e) => {
                          const copy = [...manualFields.extras];
                          copy[i] = { ...copy[i], value: e.target.value };
                          setManualFields((m) => ({ ...m, extras: copy }));
                        }}
                      />
                      <button
                        className="btn btn-outline-danger"
                        onClick={() => {
                          const copy = manualFields.extras.filter(
                            (_, idx) => idx !== i
                          );
                          setManualFields((m) => ({ ...m, extras: copy }));
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() =>
                      setManualFields((m) => ({
                        ...m,
                        extras: [...m.extras, { key: "", value: "" }],
                      }))
                    }
                  >
                    Add field
                  </button>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => setPdfModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    try {
                      // build rows for the PDF table
                      const team = pdfTeam;
                      const rows = [];
                      const push = (k, v) =>
                        rows.push([
                          k,
                          v === undefined || v === null ? "—" : String(v),
                        ]);

                      push(
                        "Team Name",
                        team.teamName || team.name || "Unnamed Team"
                      );
                      push(
                        "Manager",
                        team.managerName || team.manager || team.coach || "—"
                      );
                      push(
                        "Contact Phone",
                        team.contactPhone || team.phone || "—"
                      );
                      push(
                        "Contact Email",
                        team.contactEmail || team.email || "—"
                      );
                      push(
                        "Status",
                        team.paymentStatus ||
                          (team.paid ? "approved" : "pending")
                      );
                      push("Created", formatDate(team.createdAt));
                      push(
                        "User ID",
                        team.userId || team.uid || team.owner || "—"
                      );
                      if (team.positionCode)
                        push(
                          "Primary position",
                          mapPosition(team.positionCode)
                        );

                      // manual fields
                      push("Prepared By", manualFields.preparedBy || "");
                      if (manualFields.notes) push("Notes", manualFields.notes);
                      manualFields.extras.forEach((ex) => {
                        if (ex && ex.key) push(ex.key, ex.value);
                      });

                      const docPDF = new jsPDF();
                      docPDF.setFontSize(14);
                      docPDF.text(team.teamName || "Team Details", 14, 14);
                      autoTable(docPDF, {
                        startY: 22,
                        head: [["Field", "Value"]],
                        body: rows,
                        styles: { fontSize: 10 },
                        headStyles: { fillColor: [41, 128, 185] },
                      });

                      // sanitize filename
                      const safeName = (team.teamName || "team").replace(
                        /[^a-z0-9\-\_ ]/gi,
                        "_"
                      );
                      docPDF.save(`${safeName}-details.pdf`);
                      showToast("PDF exported", "success");
                    } catch (e) {
                      console.error("PDF export failed", e);
                      showToast("PDF export failed", "danger");
                    } finally {
                      setPdfModalOpen(false);
                      setPdfTeam(null);
                    }
                  }}
                >
                  Generate PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

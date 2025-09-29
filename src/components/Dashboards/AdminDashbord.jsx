import React, { useState } from "react";
import PlayersForm from "../Forms/PlayersForm";
import { useNavigate } from "react-router-dom";
import { useDashboardData } from "./userDashboardData";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { FaDownload } from "react-icons/fa";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useAuth } from "../../context/AuthContext";

// Badge helper
const getProofStatusBadge = (status) => {
  const badges = {
    approved: "bg-success",
    rejected: "bg-danger",
    pending: "bg-warning",
  };
  return badges[status] || "bg-secondary";
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // load collections individually to avoid passing an empty collection name
  const { data: teams = [], loading: teamsLoading } = useDashboardData("teams");
  const { data: players = [], loading: playersLoading } =
    useDashboardData("players");
  const { data: coaches = [], loading: coachesLoading } =
    useDashboardData("coaches");
  const { data: managers = [], loading: managersLoading } =
    useDashboardData("managers");
  const { data: programs = [], loading: programsLoading } =
    useDashboardData("programs");
  const loading =
    teamsLoading ||
    playersLoading ||
    coachesLoading ||
    managersLoading ||
    programsLoading;

  const [expandedProgram, setExpandedProgram] = useState(null);
  const [showNotify, setShowNotify] = useState(false);
  const [notifyMsg, setNotifyMsg] = useState("");
  const [notifyTarget, setNotifyTarget] = useState("all");
  const [proofModalOpen, setProofModalOpen] = useState(false);
  const [proofModalTeam, setProofModalTeam] = useState(null);
  const [toast, setToast] = useState(null);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [showPlayersForm, setShowPlayersForm] = useState(false);
  const [exportForm, setExportForm] = useState({
    type: "players",
    programId: null,
    teamId: null,
    teamName: null,
    filename: "export",
    includeDuplicates: false,
    preparedBy: currentUser?.email || "admin@example.com",
    purpose: "",
  });

  // Toast
  const showToast = (message, type = "success", timeout = 3000) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), timeout);
  };

  // Expand/collapse program
  const toggleProgram = (programId) => {
    setExpandedProgram(expandedProgram === programId ? null : programId);
  };

  // Proof modal handling
  const openProofModal = (teamId) => {
    const team = teams?.find((t) => t.id === teamId);
    setProofModalTeam(team);
    setProofModalOpen(true);
  };
  const closeProofModal = () => {
    setProofModalOpen(false);
    setProofModalTeam(null);
  };

  // Approve/reject proof
  const approveProof = async () => {
    try {
      if (proofModalTeam?.id && db) {
        const teamRef = doc(db, "teams", proofModalTeam.id);
        await updateDoc(teamRef, {
          proofStatus: "approved",
          approvedAt: new Date(),
          approvedBy: currentUser?.email || "admin",
        });
        showToast("Proof documents approved successfully!");
      }
    } catch (error) {
      console.error("Approval error:", error);
      showToast("Failed to approve proof. Please try again.", "danger");
    }
    closeProofModal();
  };
  const rejectProof = async () => {
    try {
      if (proofModalTeam?.id && db) {
        const teamRef = doc(db, "teams", proofModalTeam.id);
        await updateDoc(teamRef, {
          proofStatus: "rejected",
          rejectedAt: new Date(),
          rejectedBy: currentUser?.email || "admin",
        });
        showToast(
          "Proof documents rejected. Team has been notified.",
          "danger"
        );
      }
    } catch (error) {
      console.error("Rejection error:", error);
      showToast("Failed to reject proof. Please try again.", "danger");
    }
    closeProofModal();
  };

  // Export handler (simplified)
  const handleExport = () => {
    // Example: Only export if required IDs are present
    if (
      exportForm.type === "players" &&
      exportForm.teamId &&
      !exportForm.teamId.trim()
    ) {
      showToast("No team selected for export.", "danger");
      return;
    }
    // ...existing export logic (PDF, etc.)
    const docPDF = new jsPDF();
    docPDF.text("Export Report", 14, 10);
    autoTable(docPDF, {
      head: [["Type", "Program", "Team"]],
      body: [
        [
          exportForm.type,
          exportForm.programId || "-",
          exportForm.teamName || "-",
        ],
      ],
    });
    docPDF.save(`${exportForm.filename || "export"}.pdf`);
    showToast("Export successful!");
    setExportModalOpen(false);
  };

  if (loading) return <p>Loading dashboard...</p>;

  return (
    <div className="container mt-4">
      <h2>Admin Dashboard</h2>
      <button
        className="btn btn-outline-secondary mb-3"
        onClick={() => setShowPlayersForm(true)}
      >
        Open Player Form
      </button>
      {/* PlayersForm modal */}
      {showPlayersForm && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Player Registration Form</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowPlayersForm(false)}
                />
              </div>
              <div className="modal-body">
                <PlayersForm />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Programs list */}
      <div className="accordion" id="programsAccordion">
        {programs.map((program) => (
          <div className="accordion-item" key={program.id}>
            <h2 className="accordion-header">
              <button
                className="accordion-button"
                type="button"
                onClick={() => toggleProgram(program.id)}
              >
                {program.name}
              </button>
            </h2>
            <div
              className={`accordion-collapse collapse ${
                expandedProgram === program.id ? "show" : ""
              }`}
            >
              <div className="accordion-body">
                <p>{program.description}</p>
                <button
                  className="btn btn-primary me-2"
                  onClick={() =>
                    setExportForm((prev) => ({
                      ...prev,
                      programId: program.id,
                      filename: `${program.name}-report`,
                    })) || setExportModalOpen(true)
                  }
                >
                  <FaDownload /> Export
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Proof Modal */}
      {proofModalOpen && proofModalTeam && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Proof Documents</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeProofModal}
                />
              </div>
              <div className="modal-body">
                <p>Team: {proofModalTeam.name}</p>
                <p>Status: {proofModalTeam.proofStatus}</p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-success" onClick={approveProof}>
                  Approve
                </button>
                <button className="btn btn-danger" onClick={rejectProof}>
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {exportModalOpen && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Export Data</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setExportModalOpen(false)}
                />
              </div>
              <div className="modal-body">
                <input
                  type="text"
                  className="form-control mb-2"
                  placeholder="Filename"
                  value={exportForm.filename}
                  onChange={(e) =>
                    setExportForm({ ...exportForm, filename: e.target.value })
                  }
                />
                <textarea
                  className="form-control"
                  placeholder="Purpose"
                  value={exportForm.purpose}
                  onChange={(e) =>
                    setExportForm({ ...exportForm, purpose: e.target.value })
                  }
                />
              </div>
              <div className="modal-footer">
                <button className="btn btn-primary" onClick={handleExport}>
                  Export
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          className={`toast align-items-center text-white bg-${toast.type} border-0 show position-fixed bottom-0 end-0 m-3`}
        >
          <div className="d-flex">
            <div className="toast-body">{toast.message}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

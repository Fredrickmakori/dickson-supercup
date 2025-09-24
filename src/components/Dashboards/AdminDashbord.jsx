import React, { useState } from "react";
import { useDashboardData } from "./userDashboardData";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { Card, CardContent } from "../ui/card";
import { FaDownload, FaBell, FaChevronDown, FaChevronUp } from "react-icons/fa";
import * as XLSX from "xlsx";
import { useAuth } from "../../context/AuthContext"; // ✅ import auth

export default function AdminDashboard() {
  const { user, loading } = useAuth(); // ✅ check logged in user

  const allowedAdmins = [
    "fredrickmakori102@gmail.com",
    "dicksonomari4@gmail.com",
  ];

  const { data: programs, loading: programsLoading } = useDashboardData("programs");
  const { data: players } = useDashboardData("players");
  const { data: coaches } = useDashboardData("coaches");
  const { data: managers } = useDashboardData("managers");
  const { data: teams } = useDashboardData("teams");

  const [expandedProgram, setExpandedProgram] = useState(null);
  const [showNotify, setShowNotify] = useState(false);
  const [notifyMsg, setNotifyMsg] = useState("");
  const [notifyTarget, setNotifyTarget] = useState("all");

  if (loading || programsLoading) return <div className="p-5 text-center">Loading...</div>;

  // ✅ Restrict access
  if (!user || !allowedAdmins.includes(user.email)) {
    return (
      <div className="p-5 text-center">
        ❌ Access Denied. You are not authorized to view this page.
      </div>
    );
  }

  // 🔹 Filter data for program
  const getProgramData = (programId) => ({
    players: players.filter((p) => p.programId === programId),
    coaches: coaches.filter((c) => c.programId === programId),
    managers: managers.filter((m) => m.programId === programId),
    teams: teams.filter((t) => t.programId === programId),
  });

  // 🔹 Export dataset to Excel
  const exportData = (data, filename) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, `${filename}.xlsx`);
  };

  // 🔹 Send notification
  const sendNotification = async () => {
    if (!notifyMsg.trim()) return alert("Message cannot be empty!");

    await addDoc(collection(db, "notifications"), {
      message: notifyMsg,
      target: notifyTarget,
      createdAt: new Date(),
    });

    setNotifyMsg("");
    setShowNotify(false);
    alert("✅ Notification sent!");
  };

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold">📊 Admin Dashboard</h3>
        <button
          className="btn btn-warning d-flex align-items-center"
          onClick={() => setShowNotify(!showNotify)}
        >
          <FaBell className="me-2" />
          Send Notification
        </button>
      </div>

      {/* Notification Modal */}
      {showNotify && (
        <div className="card p-3 mb-4 shadow-sm">
          <h5>📢 Broadcast Notification</h5>
          <textarea
            rows="3"
            className="form-control mb-2"
            placeholder="Enter message..."
            value={notifyMsg}
            onChange={(e) => setNotifyMsg(e.target.value)}
          />
          <select
            className="form-select mb-2"
            value={notifyTarget}
            onChange={(e) => setNotifyTarget(e.target.value)}
          >
            <option value="all">All Users</option>
            <option value="players">Players</option>
            <option value="coaches">Coaches</option>
            <option value="managers">Managers</option>
            <option value="teams">Teams</option>
            {programs.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} (Program)
              </option>
            ))}
          </select>
          <button className="btn btn-success" onClick={sendNotification}>
            Send
          </button>
        </div>
      )}

      {/* Programs List */}
      <div className="row">
        {programs.map((program) => {
          const data = getProgramData(program.id);
          const isOpen = expandedProgram === program.id;

          return (
            <div key={program.id} className="col-md-6 mb-4">
              <Card>
                <CardContent className="p-3">
                  {/* Program Header */}
                  <div
                    className="d-flex justify-content-between align-items-center"
                    style={{ cursor: "pointer" }}
                    onClick={() =>
                      setExpandedProgram(isOpen ? null : program.id)
                    }
                  >
                    <h5 className="mb-0">{program.name}</h5>
                    {isOpen ? <FaChevronUp /> : <FaChevronDown />}
                  </div>

                  {/* Summary */}
                  <div className="mt-2 text-muted small">
                    Players: {data.players.length} • Teams: {data.teams.length} •
                    Coaches: {data.coaches.length} • Managers:{" "}
                    {data.managers.length}
                  </div>

                  {/* Expandable Details */}
                  {isOpen && (
                    <div className="mt-3">
                      <h6>📋 Registrations</h6>
                      <ul className="list-unstyled small">
                        <li>Players: {data.players.length}</li>
                        <li>Coaches: {data.coaches.length}</li>
                        <li>Managers: {data.managers.length}</li>
                        <li>Teams: {data.teams.length}</li>
                      </ul>

                      {/* Download Buttons */}
                      <div className="d-flex gap-2 mt-2 flex-wrap">
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() =>
                            exportData(data.players, `${program.name}-players`)
                          }
                        >
                          <FaDownload className="me-1" /> Players
                        </button>
                        <button
                          className="btn btn-sm btn-outline-success"
                          onClick={() =>
                            exportData(data.teams, `${program.name}-teams`)
                          }
                        >
                          <FaDownload className="me-1" /> Teams
                        </button>
                        <button
                          className="btn btn-sm btn-outline-warning"
                          onClick={() =>
                            exportData(data.coaches, `${program.name}-coaches`)
                          }
                        >
                          <FaDownload className="me-1" /> Coaches
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() =>
                            exportData(data.managers, `${program.name}-managers`)
                          }
                        >
                          <FaDownload className="me-1" /> Managers
                        </button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}

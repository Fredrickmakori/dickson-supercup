import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useAuth } from "../context/AuthContext";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase"

export default function DashboardLayout() {
  const { user, role, loading } = useAuth();
  const [stats, setStats] = useState({
    players: 0,
    teams: 0,
    programs: 0,
    coaches: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const playersSnap = await getDocs(collection(db, "players"));
      const teamsSnap = await getDocs(collection(db, "teams"));
      const programsSnap = await getDocs(collection(db, "programs"));
      const coachesSnap = await getDocs(collection(db, "coaches"));

      setStats({
        players: playersSnap.size,
        teams: teamsSnap.size,
        programs: programsSnap.size,
        coaches: coachesSnap.size,
      });
    };

    if (!loading) fetchStats();
  }, [loading]);

  if (loading) return <div className="text-center p-5">Loading dashboard...</div>;

  return (
    <div className="d-flex vh-100 bg-light">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-fill d-flex flex-column">
        <header className="bg-white shadow-sm">
          <div className="d-flex align-items-center justify-content-between p-3">
            <h5 className="mb-0">{role} Dashboard</h5>
            <div className="small text-muted">
              Welcome, {user?.displayName || user?.email}
            </div>
          </div>

          {/* Stats */}
          {role === "Admin" && (
            <div className="p-3 bg-light border-top">
              <div className="container-fluid">
                <div className="row g-3">
                  <div className="col-6 col-md-3">
                    <div className="card">
                      <div className="card-body">
                        <small className="text-muted">Total Players</small>
                        <div className="h4">{stats.players}</div>
                      </div>
                    </div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="card">
                      <div className="card-body">
                        <small className="text-muted">Active Teams</small>
                        <div className="h4">{stats.teams}</div>
                      </div>
                    </div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="card">
                      <div className="card-body">
                        <small className="text-muted">Programs</small>
                        <div className="h4">{stats.programs}</div>
                      </div>
                    </div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="card">
                      <div className="card-body">
                        <small className="text-muted">Coaches</small>
                        <div className="h4">{stats.coaches}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </header>

        {/* Main content */}
        <main className="flex-fill overflow-auto p-4">
          <div className="container">
            <div className="card p-3">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

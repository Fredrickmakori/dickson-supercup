import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaUsers, FaUserTie, FaPlusCircle, FaListOl } from "react-icons/fa";
import { Link } from "react-router-dom";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { app } from "../firebase"; // make sure firebase is initialized

export default function ViewTeamsPage() {
  const [teams, setTeams] = useState([]);
  const db = getFirestore(app);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const teamsSnapshot = await getDocs(collection(db, "teams"));
        const teamList = teamsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTeams(teamList);
      } catch (error) {
        console.error("Error fetching teams:", error);
      }
    };
    fetchTeams();
  }, [db]);

  return (
    <div className="container py-5 text-light">
      {/* Title */}
      <motion.h2
        className="fw-bold text-warning text-center mb-4 d-flex align-items-center justify-content-center gap-2"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <FaListOl /> Registered Teams
      </motion.h2>

      {/* Teams List */}
      <div className="row g-4">
        {teams.length > 0 ? (
          teams.map((team, idx) => (
            <motion.div
              key={team.id}
              className="col-md-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.6 }}
            >
              <div className="card bg-dark text-light shadow-lg h-100 rounded-4">
                <div className="card-body text-center">
                  <FaUsers size={40} className="text-warning mb-3" />
                  <h5 className="fw-bold">{team.name}</h5>
                  <p>
                    <FaUserTie className="me-2 text-success" />
                    Coach: {team.coach || "N/A"}
                  </p>
                  <p>
                    <FaUsers className="me-2 text-info" />
                    Members:{" "}
                    <span className="fw-bold">
                      {team.membersCount || 0}
                    </span>
                  </p>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <p className="text-center text-muted">No teams registered yet.</p>
        )}
      </div>

      {/* Register Button */}
      <motion.div
        className="text-center mt-5"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <Link
          to="/register"
          className="btn btn-warning fw-bold d-inline-flex align-items-center gap-2"
        >
          <FaPlusCircle /> Register a New Team
        </Link>
      </motion.div>
    </div>
  );
}

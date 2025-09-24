import React from "react";
import { Link } from "react-router-dom";
import { FaHome, FaUsers, FaFutbol, FaClipboardList, FaCogs, FaChalkboardTeacher, FaUserAlt } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

export default function Sidebar() {
  const { role } = useAuth();

  const menus = {
    Admin: [
      { label: "Dashboard", path: "/admin", icon: <FaHome /> },
      { label: "Manage Teams", path: "/admin/teams", icon: <FaUsers /> },
      { label: "Programs", path: "/admin/programs", icon: <FaClipboardList /> },
      { label: "Settings", path: "/admin/settings", icon: <FaCogs /> },
    ],
    "Team Manager": [
      { label: "Dashboard", path: "/manager", icon: <FaHome /> },
      { label: "My Teams", path: "/manager/teams", icon: <FaFutbol /> },
      { label: "Players", path: "/manager/players", icon: <FaUsers /> },
      { label: "Schedule", path: "/manager/schedule", icon: <FaClipboardList /> },
    ],
    Coach: [
      { label: "Dashboard", path: "/coach", icon: <FaHome /> },
      { label: "My Players", path: "/coach/players", icon: <FaUsers /> },
      { label: "Training", path: "/coach/training", icon: <FaChalkboardTeacher /> },
      { label: "Performance", path: "/coach/performance", icon: <FaClipboardList /> },
    ],
    Player: [
      { label: "Dashboard", path: "/player", icon: <FaHome /> },
      { label: "My Profile", path: "/player/profile", icon: <FaUserAlt /> },
      { label: "Matches", path: "/player/matches", icon: <FaFutbol /> },
      { label: "Training", path: "/player/training", icon: <FaChalkboardTeacher /> },
    ],
  };

  const menuItems = menus[role] || [];

  return (
    <aside className="bg-dark text-light p-3 vh-100" style={{ width: "220px" }}>
      <h5 className="text-warning mb-4">{role ? `${role} Menu` : "Loading..."}</h5>
      <ul className="nav flex-column">
        {menuItems.map((item, i) => (
          <li key={i} className="nav-item mb-2">
            <Link to={item.path} className="nav-link text-light d-flex align-items-center">
              <span className="me-2">{item.icon}</span> {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}

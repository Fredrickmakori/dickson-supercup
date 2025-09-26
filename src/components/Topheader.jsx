import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.png"; // ✅ safer import for bundlers

export default function TopHeader() {
  const { user, loading, signOutUser, role } = useAuth();

  return (
    <header>
      <nav
        className="navbar navbar-expand-lg navbar-light shadow-sm"
        style={{ backgroundColor: "#FFEF00" }}
      >
        <div className="container-fluid">
          {/* Brand Logo */}
          <NavLink
            to="/"
            className={({ isActive }) =>
              `navbar-brand d-flex align-items-center gap-2 ${
                isActive ? "fw-bold" : ""
              }`
            }
          >
            <img
              src={logo}
              alt="M-FOUNDATION"
              width={32}
              height={32}
              className="rounded-circle"
            />
            <span className="fw-bold">M-Foundation</span>
            {loading && <span className="small ms-2">Loading...</span>}
          </NavLink>

          {/* Toggle for mobile */}
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#mainNavbar"
            aria-controls="mainNavbar"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* Menu */}
          <div className="collapse navbar-collapse" id="mainNavbar">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <NavLink
                  to="/"
                  end
                  className={({ isActive }) =>
                    `nav-link ${isActive ? "active fw-bold" : ""}`
                  }
                >
                  Home
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink
                  to="/programs"
                  className={({ isActive }) =>
                    `nav-link ${isActive ? "active fw-bold" : ""}`
                  }
                >
                  Programs
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink
                  to="/register"
                  className={({ isActive }) =>
                    `nav-link ${isActive ? "active fw-bold" : ""}`
                  }
                >
                  Register
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink
                  to="/donate"
                  className={({ isActive }) =>
                    `nav-link ${isActive ? "active fw-bold" : ""}`
                  }
                >
                  PayNow
                </NavLink>
              </li>

              {/* Role-based Quick Links */}
              {user && role === "manager" && (
                <li className="nav-item">
                  <NavLink
                    to="/admin/manager"
                    className={({ isActive }) =>
                      `nav-link ${isActive ? "active fw-bold" : ""}`
                    }
                  >
                    Team Manager
                  </NavLink>
                </li>
              )}
              {user && role === "coach" && (
                <li className="nav-item">
                  <NavLink
                    to="/admin/coach"
                    className={({ isActive }) =>
                      `nav-link ${isActive ? "active fw-bold" : ""}`
                    }
                  >
                    Coach Panel
                  </NavLink>
                </li>
              )}
              {user && role === "player" && (
                <li className="nav-item">
                  <NavLink
                    to="/admin/player"
                    className={({ isActive }) =>
                      `nav-link ${isActive ? "active fw-bold" : ""}`
                    }
                  >
                    Player Dashboard
                  </NavLink>
                </li>
              )}
            </ul>

            {/* Right Side (Login/Profile) */}
            <div className="d-flex align-items-center">
              {!loading && !user && (
                <NavLink
                  to="/login"
                  className={({ isActive }) =>
                    `btn btn-outline-dark me-2 ${
                      isActive ? "active fw-bold" : ""
                    }`
                  }
                >
                  Login
                </NavLink>
              )}

              {!loading && user && (
                <div className="dropdown">
                  <button
                    className="btn btn-light dropdown-toggle d-flex align-items-center"
                    type="button"
                    id="userMenu"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <img
                      src={user.photoURL || logo}
                      alt="avatar"
                      className="rounded-circle me-2 border"
                      style={{ width: 28, height: 28, objectFit: "cover" }}
                    />
                    <span className="me-2 small">
                      {user.displayName || user.email}
                    </span>
                    <span className="badge bg-dark text-light small">
                      {role || "No role"}
                    </span>
                  </button>
                  <ul
                    className="dropdown-menu dropdown-menu-end shadow"
                    aria-labelledby="userMenu"
                  >
                    <li>
                      <NavLink className="dropdown-item" to="/profile">
                        Profile
                      </NavLink>
                    </li>
                    <li>
                      <hr className="dropdown-divider" />
                    </li>
                    <li>
                      <button
                        className="dropdown-item text-danger"
                        onClick={() => signOutUser()}
                      >
                        Sign out
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}

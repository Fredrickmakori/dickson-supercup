import React, { useEffect, useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.png"; // ✅ safer import for bundlers
import { db } from "../firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

export default function TopHeader() {
  const { user, loading, signOutUser, role, setRoleForUser } = useAuth();
  const [userRoles, setUserRoles] = useState([]);
  const [minimal, setMinimal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Admin emails that should always have admin access
  const allowedAdmins = [
    "fredrickmakori102@gmail.com",
    "dicksonomari4@gmail.com",
  ];

  useEffect(() => {
    let mounted = true;
    async function ensureUserDoc() {
      if (!user) return;

      try {
        const uRef = doc(db, "users", user.uid);
        const snap = await getDoc(uRef);
        if (!snap.exists()) {
          // first time: create user doc with basic demographics and initial role
          const initialRoles = allowedAdmins.includes(user.email)
            ? ["admin"]
            : ["guest"];
          const payload = {
            displayName: user.displayName || "",
            email: user.email || "",
            photoURL: user.photoURL || "",
            roles: initialRoles,
            createdAt: serverTimestamp(),
          };
          await setDoc(uRef, payload, { merge: true });
          if (mounted) setUserRoles(payload.roles);
          // Sync AuthContext role for backwards compatibility (pick first role)
          if (setRoleForUser) await setRoleForUser(user.uid, initialRoles[0]);
        } else {
          const data = snap.data();
          const roles =
            data.roles ||
            (allowedAdmins.includes(user.email) ? ["admin"] : ["guest"]);
          if (mounted) setUserRoles(roles);
          // keep AuthContext role in sync with users doc (first role)
          if (setRoleForUser) await setRoleForUser(user.uid, roles[0]);
        }
      } catch (err) {
        console.error("Error ensuring user doc:", err);
      }
    }

    ensureUserDoc();
    return () => {
      mounted = false;
    };
  }, [user?.uid]);

  // Collapse header into a minimal bar when user scrolls down; expand on focus
  useEffect(() => {
    let lastScroll = window.scrollY;
    function onScroll() {
      const cur = window.scrollY;
      // if scrolling down past 80px, enter minimal mode
      if (cur > 48 && cur > lastScroll) {
        setMinimal(true);
      } else if (cur <= 80 || cur < lastScroll) {
        // expand when near top or scrolling up
        setMinimal(false);
      }
      lastScroll = cur;
    }

    function onFocusIn(e) {
      // If any form control or selectable element receives focus, expand header
      const tag = (e.target && e.target.tagName) || "";
      if (["INPUT", "TEXTAREA", "SELECT", "BUTTON", "A"].includes(tag)) {
        setMinimal(false);
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("focusin", onFocusIn);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("focusin", onFocusIn);
    };
  }, []);

  function closeNavbar() {
    try {
      const el = document.getElementById("mainNavbar");
      if (el && el.classList.contains("show")) {
        el.classList.remove("show");
        // update toggler aria-expanded
        const toggler = document.querySelector(".navbar-toggler");
        if (toggler) toggler.setAttribute("aria-expanded", "false");
      }
    } catch (e) {
      // ignore
    }
  }

  function scrollToProgramsSmooth() {
    try {
      const target =
        document.getElementById("programs") ||
        document.querySelector("[data-section=programs]");
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        return true;
      }
    } catch (e) {}
    return false;
  }

  async function handleProgramsClick(e) {
    // If we're on the homepage, just scroll to the section.
    e && e.preventDefault();
    if (location.pathname === "/" || location.pathname === "") {
      const ok = scrollToProgramsSmooth();
      if (ok) closeNavbar();
      return;
    }
    // navigate to home first, then scroll after a short delay to allow DOM render
    try {
      await navigate("/");
      setTimeout(() => {
        scrollToProgramsSmooth();
        closeNavbar();
      }, 200);
    } catch (e) {
      // fallback: navigate normally
      navigate("/");
    }
  }

  function handleNavClick() {
    // close collapsed navbar on small screens after selection
    closeNavbar();
  }

  return (
    <header>
      <nav
        className={`navbar navbar-expand-lg navbar-light shadow-sm ${minimal ? "navbar-minimal" : ""}`}
        style={{ backgroundColor: "#FFEF00", position: "sticky", top: 0, zIndex: 1040 }}
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
              width={39}
              height={39}
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
                <a
                  href="/programs"
                  className="nav-link"
                  onClick={handleProgramsClick}
                >
                  Programs
                </a>
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
                <a
                  className="nav-link"
                  href="/donate"
                  target="_blank"
                  rel="noreferrer"
                  onClick={closeNavbar}
                >
                  PayNow
                </a>
              </li>

              {/* Role-based Quick Links (driven by users/{uid}.roles) */}
              {user && userRoles.includes("admin") && (
                <li className="nav-item">
                  <NavLink
                    to="/admin"
                    className={({ isActive }) =>
                      `nav-link ${isActive ? "active fw-bold" : ""}`
                    }
                    onClick={handleNavClick}
                  >
                    Admin Dashboard
                  </NavLink>
                </li>
              )}

              {user && userRoles.includes("manager") && (
                <li className="nav-item">
                  <NavLink
                    to="/admin/manager"
                    className={({ isActive }) =>
                      `nav-link ${isActive ? "active fw-bold" : ""}`
                    }
                    onClick={handleNavClick}
                  >
                    Team Manager
                  </NavLink>
                </li>
              )}

              {user && userRoles.includes("coach") && (
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

              {user && userRoles.includes("player") && (
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
                        onClick={() => {
                          signOutUser();
                          closeNavbar();
                        }}
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

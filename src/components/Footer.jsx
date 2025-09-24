import React from "react";
import { FaFacebookF, FaTwitter, FaInstagram, FaFootballBall } from "react-icons/fa";

export default function AppFooter() {
  return (
    <footer className="app-footer text-center p-4 text-light bg-dark mt-auto" id="app-footer"  >
      <div className="d-flex justify-content-center align-items-center gap-2 mb-2">
        <FaFootballBall className="text-warning" />
        <span className="fw-bold">M-FOUNDATION</span>
        <span>© {new Date().getFullYear()}</span>
      </div>

      {/* Socials */}
      <div className="d-flex justify-content-center gap-3">
        <a href="https://facebook.com" target="_blank" rel="noreferrer" className="text-light">
          <FaFacebookF size={18} />
        </a>
        <a href="https://twitter.com" target="_blank" rel="noreferrer" className="text-light">
          <FaTwitter size={18} />
        </a>
        <a href="https://instagram.com" target="_blank" rel="noreferrer" className="text-light">
          <FaInstagram size={18} />
        </a>
      </div>
    </footer>
  );
}

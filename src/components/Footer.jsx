import React from "react";
import { FaFacebookF, FaTwitter, FaInstagram, FaFootballBall } from "react-icons/fa";
import banick from "../assets/lgs/banick.jpeg";
import cleo from "../assets/lgs/cleo-super.jpeg";
import jabali from "../assets/lgs/Jabali-Digital-Logo.png";
import klik from "../assets/lgs/klik.jpeg";
import mcFoundational from "../assets/lgs/M-FOUNDATIONAL.jpg";
import pureFlames from "../assets/lgs/pure-flames.png";
import redCross from "../assets/lgs/red-cross.jpg";
import straightMedia from "../assets/lgs/straight-media.jpeg";
import transNzoia from "../assets/lgs/trans-nzoia.jpg";
import xtreme from "../assets/lgs/xtreme-media.jpg";

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

      {/* Sponsors (compact) */}
      <div className="d-flex justify-content-center align-items-center gap-3 mt-3 flex-wrap">
        {[banick, cleo, jabali, klik, mcFoundational, pureFlames, redCross, straightMedia, transNzoia, xtreme].map((s, i) => (
          <img key={i} src={s} alt={`footer-sponsor-${i}`} style={{maxWidth: 80, maxHeight: 40, objectFit: 'contain'}} />
        ))}
      </div>
    </footer>
  );
}

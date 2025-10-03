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
    <footer className="app-footer mt-auto" id="app-footer">
      <div className="footer-sponsors py-3 bg-light">
        <div className="container text-center mb-2">
          <h5 className="fw-bold mb-3">Our Sponsors</h5>
        </div>
        <div className="container d-flex flex-wrap justify-content-center align-items-center gap-3">
          {[banick, cleo, jabali, klik, mcFoundational, pureFlames, redCross, straightMedia, transNzoia, xtreme, require('../assets/lgs/every-moment.png')].map((s, i) => (
            <div key={i} className="d-flex align-items-center sponsor-item p-2">
              <img src={s} alt={`footer-sponsor-${i}`} className="sponsor-logo-footer" />
            </div>
          ))}
        </div>
      </div>

      <div className="footer-bar text-center text-light bg-dark py-3">
        <div className="d-flex justify-content-center align-items-center gap-2 mb-2 flex-column flex-md-row">
          <div className="d-flex align-items-center gap-2">
            <FaFootballBall className="text-warning" />
            <span className="fw-bold">M-FOUNDATION</span>
          </div>
          <div className="ms-md-3">© {new Date().getFullYear()}</div>
        </div>

        <div className="d-flex justify-content-center gap-3 mt-2">
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
      </div>
    </footer>
  );
}

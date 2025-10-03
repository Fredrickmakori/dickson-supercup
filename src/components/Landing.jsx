import React from "react";
import { Link } from "react-router-dom";
import heroBg from "../assets/hero-bg.jpg"; // ✅ import background image
import SL from "../assets/SL.png";
// well image removed because it's unused
import talent from "../assets/talent.jpg";
import empowerment from "../assets/empowerment.jpg";
import Objectives from "./Objectives";
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

export default function Landing() {
  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section
        className="py-5 text-center text-white d-flex align-items-center"
        style={{
          background: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${heroBg}) center/cover no-repeat fixed`,
          minHeight: "100vh",
        }}
      >
        <div className="container">
          <p className="display-5 ">
            Transforming Keiyo Ward into a vibrant, self-sustaining community
            where every vulnerable individual thrives through opportunity,
            talent, and resilient infrastructure.
          </p>
          <div className="d-flex justify-content-center gap-3">
            <a
              href="#programs-section"
              className="btn btn-primary btn-lg shadow"
            >
              Our Programs
            </a>
            <Link to="/donate" className="btn btn-success btn-lg shadow">
              Donate Now
            </Link>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-5">
        <div className="container">
          <div className="row">
            <div className="col-lg-8 mx-auto text-center">
              <h2>Our Mission</h2>
              <p className="lead">
                Founded in 2024, M-Foundation empowers vulnerable communities in
                Keiyo Ward, Trans Nzoia County, by fostering talent, enhancing
                infrastructure, and promoting sustainable development through
                programs like the Dickson Supercup Classic, Keiyo Ward Talent
                Show, and Keiyo Empowerment Programs, supported by
                contributions, donations, and grants.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section className="py-5 bg-white" id="programs-section">
        <div className="container">
          <h2 className="text-center mb-5 fw-bold">Our Programs</h2>
          <div className="row g-4">
            {/* Supercup */}
            <div className="col-md-4">
              <div className="card h-100 shadow-sm text-center">
                <img
                  src={SL}
                  className="card-img-top mx-auto mt-4"
                  alt="Dickson Supercup Classic"
                  style={{
                    width: "160px",
                    height: "160px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "4px solid #f8f9fa", // subtle border ring
                  }}
                />
                <div className="card-body">
                  <h5 className="card-title">Dickson Supercup Classic</h5>
                  <p className="card-text">
                    A football tournament showcasing local talent and nurturing
                    the skills of youth in Keiyo Ward.
                  </p>
                  <Link to="/supercup" className="btn btn-sm btn-primary">
                    Learn More
                  </Link>
                </div>
              </div>
            </div>

            {/* Talent Show */}
            <div className="col-md-4">
              <div className="card h-100 shadow-sm text-center">
                <img
                  src={talent}
                  className="card-img-top mx-auto mt-4"
                  alt="Keiyo Ward Talent Show"
                  style={{
                    width: "160px",
                    height: "160px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "4px solid #f8f9fa",
                  }}
                />
                <div className="card-body">
                  <h5 className="card-title">Keiyo Ward Talent Show</h5>
                  <p className="card-text">
                    A platform for music, dance, and art competitions to
                    celebrate and develop local artists.
                  </p>
                  <Link to="/talent-show" className="btn btn-sm btn-primary">
                    Learn More
                  </Link>
                </div>
              </div>
            </div>

            {/* Empowerment */}
            <div className="col-md-4">
              <div className="card h-100 shadow-sm text-center">
                <img
                  src={empowerment}
                  className="card-img-top mx-auto mt-4"
                  alt="Keiyo Empowerment Programs"
                  style={{
                    width: "160px",
                    height: "160px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "4px solid #f8f9fa",
                  }}
                />
                <div className="card-body">
                  <h5 className="card-title">Keiyo Empowerment Programs</h5>
                  <p className="card-text">
                    Initiatives to refurbish infrastructure like bridges and
                    wells, and provide training and mentorship.
                  </p>
                  <Link to="/empowerment" className="btn btn-sm btn-primary">
                    Learn More
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Objectives Section */}
      <Objectives />

      {/* Donation Appeal Section */}
      <section className="py-5 bg-light">
        <div className="container text-center">
          <h2>Support Our Cause</h2>
          <p className="lead">
            Your contributions rebuild bridges, empower youth, and fuel dreams
            in Keiyo Ward.
          </p>
          <Link to="/donate" className="btn btn-success btn-lg mb-3 shadow">
            Donate Now
          </Link>
          <div className="text-muted">
            <p className="mb-0">
              We are committed to transparency. Here’s how your donation is
              allocated:
            </p>
            <p>
              <strong>75%</strong> for programs, <strong>15%</strong> for
              operations, and <strong>10%</strong> for administration.
            </p>
          </div>
        </div>
      </section>

      {/* Sponsors Section (moved before Success Stories) */}
      <section className="py-4 sponsors-section">
        <div className="sponsors-wrap">
          <div className="sponsors-track">
            {[banick, cleo, jabali, klik, mcFoundational, pureFlames, redCross, straightMedia, transNzoia, xtreme].map((src, i) => (
              <div key={"a-" + i} className="d-flex align-items-center px-3">
                <img src={src} alt={`sponsor-a-${i}`} className="sponsor-logo" />
              </div>
            ))}
            {/* duplicate sequence to create an endless loop */}
            {[banick, cleo, jabali, klik, mcFoundational, pureFlames, redCross, straightMedia, transNzoia, xtreme].map((src, i) => (
              <div key={"b-" + i} className="d-flex align-items-center px-3">
                <img src={src} alt={`sponsor-b-${i}`} className="sponsor-logo" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories Section */}
      <section className="py-5">
        <div className="container">
          <h2 className="text-center mb-4">Success Stories</h2>
          <div className="row">
            <div className="col-md-6 mx-auto text-center">
              <div className="card shadow-sm">
                <div className="card-body">
                  <blockquote className="blockquote mb-0">
                    <p>
                      "Thanks to the Keiyo Ward Talent Show, my son secured a
                      scholarship to a prestigious music academy. M-Foundation
                      is changing lives."
                    </p>
                    <footer className="blockquote-footer">
                      A grateful parent
                    </footer>
                  </blockquote>
                </div>
              </div>
            </div>
            <div className="col-md-6 mx-auto text-center mt-3 mt-md-0">
              <div className="card shadow-sm">
                <div className="card-body">
                  <blockquote className="blockquote mb-0">
                    <p>
                      "The refurbished well in our village now serves over 100
                      families, providing clean and safe water for everyone.
                      Thank you, M-Foundation!"
                    </p>
                    <footer className="blockquote-footer">
                      A community member
                    </footer>
                  </blockquote>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* removed duplicate static sponsors grid; sponsors are shown in the animated marquee above */}
    </div>
  );
}

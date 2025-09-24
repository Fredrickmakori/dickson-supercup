import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import heroImg from "../assets/ft-bg.jpg"; // replace with your soccer image
import logo from "../assets/logo.png"; // replace with Dixon Super Cup logo

export default function SupercupLanding() {
  return (
    <section
      className="hero-section d-flex flex-column text-light"
      style={{
        background: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(${heroImg}) center/cover no-repeat`,
        minHeight: "100vh",
      }}
    >
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark px-4">
        <div className="container-fluid">
          <div>
            <Link to="/about" className="btn btn-outline-light me-2">
              About
            </Link>
            <Link to="/register" className="btn btn-warning text-dark fw-bold">
              Register
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Content */}
      <div className="container text-center my-auto">
        <motion.h5
          className="text-uppercase text-warning fw-bold"
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          Keiyo Ward’s Biggest
        </motion.h5>

        <motion.h1
          className="display-3 fw-bold"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <span className="text-white">Super Cup</span>{" "}
          <span className="text-warning">Classic</span>
        </motion.h1>

        {/* Lime Green Description */}
        <motion.p
          className="lead mt-3"
          style={{ color: "limegreen" }}
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          Bringing together players, coaches, and fans for the most exciting
          grassroots football tournament in Africa.
        </motion.p>

        {/* Buttons */}
        <motion.div
          className="mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <Link className="btn btn-warning text-dark btn-lg me-3" to="/learn">
            Learn More
          </Link>
          <Link className="btn btn-outline-light btn-lg" to="/teams">
            Join Teams
          </Link>
        </motion.div>
      </div>

      {/* Bottom Info Bar */}
      <motion.div
        className="hero-info-bar bg-dark bg-opacity-50 py-3 text-center mt-auto"
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.2 }}
      >
        <div className="container d-flex justify-content-around text-light flex-wrap gap-3">
          <div>
            <h6 className="fw-bold">⚽ After Football</h6>
            <p className="small">Youth Soccer Development</p>
          </div>
          <div>
            <h6 className="fw-bold">🌍 Impact</h6>
            <p className="small">Community Building & Mentorship</p>
          </div>
          <div>
            <h6 className="fw-bold">💳 Easy Payments</h6>
            <p className="small">M-Pesa Integration</p>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

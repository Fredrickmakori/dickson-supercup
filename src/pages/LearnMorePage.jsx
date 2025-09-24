import React from "react";
import { motion } from "framer-motion";
import {
  FaFootballBall,
  FaUsers,
  FaTrophy,
  FaHandshake,
  FaRegLightbulb,
  FaGlobeAfrica,
  FaArrowRight,
} from "react-icons/fa";

export default function LearnMorePage() {
  return (
    <div className="container py-5 text-light">
      {/* Page Title */}
      <motion.h2
        className="fw-bold text-warning text-center mb-4"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        ⚽ Learn More about the Dickson Supercup Classic 🏆
      </motion.h2>

      {/* Vision & Mission */}
      <motion.div
        className="bg-dark bg-opacity-50 rounded-4 p-4 shadow mb-5"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.7 }}
      >
        <h4 className="fw-bold text-warning mb-3">
          <FaRegLightbulb className="me-2" /> Our Vision & Mission
        </h4>
        <p>
          The Dickson Supercup Classic is more than just football — it’s a{" "}
          <span className="fw-bold">movement</span> that inspires hope, unity,
          and growth in{" "}
          <span className="text-success">Trans Nzoia County</span>. Our vision
          is to build a{" "}
          <span className="fw-bold">strong grassroots football foundation</span>{" "}
          where youth talent is nurtured, communities come together, and sports
          become a tool for empowerment.
        </p>
        <p>
          Our mission is to provide a platform for{" "}
          <span className="fw-bold">young footballers</span> to showcase their
          skills, promote{" "}
          <span className="fw-bold">fair play & discipline</span>, and celebrate
          the beautiful game while creating lasting opportunities.
        </p>
      </motion.div>

      {/* Why Participate */}
      <motion.div
        className="bg-warning text-dark rounded-4 p-4 shadow mb-5"
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.7 }}
      >
        <h4 className="fw-bold text-center mb-4">🌟 Why Join the Supercup?</h4>
        <div className="row g-4">
          <div className="col-md-4 text-center">
            <FaFootballBall size={40} className="text-dark mb-3" />
            <h6 className="fw-bold">Showcase Talent</h6>
            <p>
              Players get a chance to shine and be recognized for their skills
              on a big stage.
            </p>
          </div>
          <div className="col-md-4 text-center">
            <FaUsers size={40} className="text-dark mb-3" />
            <h6 className="fw-bold">Build Unity</h6>
            <p>
              Fans and communities come together, fostering unity and teamwork
              through football.
            </p>
          </div>
          <div className="col-md-4 text-center">
            <FaTrophy size={40} className="text-dark mb-3" />
            <h6 className="fw-bold">Win & Celebrate</h6>
            <p>
              Compete for glory, trophies, and unforgettable moments of victory.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Community Impact */}
      <motion.div
        className="bg-dark bg-opacity-50 rounded-4 p-4 shadow mb-5"
        initial={{ opacity: 0, y: 70 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.7 }}
      >
        <h4 className="fw-bold text-warning mb-3">
          <FaGlobeAfrica className="me-2" /> Community Impact
        </h4>
        <p>
          The tournament is designed not only to entertain but also to{" "}
          <span className="fw-bold">empower youth</span>, promote{" "}
          <span className="fw-bold">peace and unity</span>, and boost{" "}
          <span className="fw-bold">local economies</span> by drawing fans,
          vendors, and partners together.
        </p>
        <p>
          Through football, we are building bridges across{" "}
          <span className="fw-bold">villages, wards, and communities</span>,
          creating an environment of togetherness and opportunity.
        </p>
      </motion.div>

      {/* Call to Action */}
      <motion.div
        className="bg-warning text-dark rounded-4 p-4 shadow text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.2, duration: 0.7 }}
      >
        <h4 className="fw-bold mb-3">🚀 Be Part of the Journey!</h4>
        <p>
          Don’t just watch history —{" "}
          <span className="fw-bold">make history with us</span>! Join the
          Dickson Supercup Classic and be part of the football revolution.
        </p>
        <a
          href="/register"
          className="btn btn-dark fw-bold d-inline-flex align-items-center gap-2 mt-3"
        >
          Register Now <FaArrowRight />
        </a>
      </motion.div>
    </div>
  );
}

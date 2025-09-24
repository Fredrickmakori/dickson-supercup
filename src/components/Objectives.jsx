import React from "react";
import { motion } from "framer-motion";
import { FaUsers, FaTools, FaSeedling, FaHandHoldingUsd, FaFutbol, FaFemale } from "react-icons/fa";

export default function Objectives() {
  const objectives = [
    {
      icon: <FaFutbol className="text-warning me-2" />,
      title: "Nurture Local Talent",
      desc: "Organize events to identify, develop, and celebrate the skills of youth.",
    },
    {
      icon: <FaTools className="text-primary me-2" />,
      title: "Strengthen Community Infrastructure",
      desc: "Refurbish critical infrastructure like bridges and wells.",
    },
    {
      icon: <FaFemale className="text-danger me-2" />,
      title: "Empower Youth and Women",
      desc: "Provide training, mentorship, and microfinance opportunities.",
    },
    {
      icon: <FaUsers className="text-success me-2" />,
      title: "Promote Community Cohesion",
      desc: "Foster unity through cultural and sporting events.",
    },
    {
      icon: <FaSeedling className="text-success me-2" />,
      title: "Ensure Environmental Resilience",
      desc: "Support sustainable practices like water conservation.",
    },
    {
      icon: <FaHandHoldingUsd className="text-info me-2" />,
      title: "Secure Sustainable Funding",
      desc: "Actively pursue contributions, donations, and grants.",
    },
  ];

  return (
    <section className="py-5 bg-light">
      <div className="container">
        <motion.h2
          className="text-center mb-5 fw-bold"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Our Objectives
        </motion.h2>

        <div className="row g-4">
          {objectives.map((obj, index) => (
            <motion.div
              key={index}
              className="col-md-6"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
            >
              <div className="card shadow-sm border-0 h-100">
                <div className="card-body d-flex align-items-start">
                  {obj.icon}
                  <div>
                    <h5 className="card-title fw-bold">{obj.title}</h5>
                    <p className="card-text">{obj.desc}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

import React from "react";
import { motion } from "framer-motion";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import {
  FaFutbol,
  FaUsers,
  FaBalanceScale,
  FaMedkit,
  FaMoneyBillWave,
  FaHandshake,
  FaDownload,
  FaAward,
} from "react-icons/fa";
import { BsMegaphoneFill } from "react-icons/bs";

export default function AboutPage() {
  const rules = [
    {
      text: "All participating teams must be duly registered before the kick-off date.",
      icon: <FaUsers className="me-2 text-success" />,
    },
    {
      text: "Teams must report to the match venue at least 30 minutes before their scheduled match.",
      icon: <FaFutbol className="me-2 text-warning" />,
    },
    {
      text: "All players must have proper football gear: jersey, shorts, socks, shin guards, and boots.",
      icon: <FaAward className="me-2 text-info" />,
    },
    {
      text: "Rough play, violence, or misconduct on/off the pitch will not be tolerated.",
      icon: <FaHandshake className="me-2 text-danger" />,
    },
    {
      text: "The referee’s decision is final and must be respected at all times.",
      icon: <FaBalanceScale className="me-2 text-primary" />,
    },
    {
      text: "Protests must be submitted in writing within 30 minutes after the match.",
      icon: <BsMegaphoneFill className="me-2 text-warning" />,
    },
    {
      text: "Knockout stages will follow official FIFA rules unless otherwise stated.",
      icon: <FaFutbol className="me-2 text-success" />,
    },
    {
      text: "Registration fees are non-refundable once submitted.",
      icon: <FaMoneyBillWave className="me-2 text-success" />,
    },
    {
      text: "Medical emergencies will be handled by the official medical team on-site.",
      icon: <FaMedkit className="me-2 text-danger" />,
    },
    {
      text: "All teams and players must respect tournament sponsors and organizers.",
      icon: <FaHandshake className="me-2 text-primary" />,
    },
  ];

  return (
    <Container className="py-5 text-center text-light min-vh-100">
      {/* Title */}
      <motion.h1
        className="fw-bold text-warning mb-4"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        🏆⚽ Dickson Supercup Classic Football Tournament ⚽🏆
      </motion.h1>

      {/* Tournament Description */}
      <motion.p
        className="lead"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        Get ready for the ultimate football showdown! The{" "}
        <span className="fw-bold text-warning">Dickson Supercup Classic</span>{" "}
        is coming soon to{" "}
        <span className="fw-bold text-success">Trans Nzoia County</span>,
        promising thrilling action and unforgettable moments!
      </motion.p>

      {/* Invite Section */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.6 }}
      >
        <Card className="bg-dark bg-opacity-50 shadow-lg mb-5">
          <Card.Body>
            <h3 className="text-warning fw-bold">📢 Open Registration</h3>
            <p className="mt-2">
              All teams are invited to join the excitement! Register online now
              to secure your spot in this epic competition. Whether you're a{" "}
              <span className="fw-bold">player</span> or a{" "}
              <span className="fw-bold">fan</span>, prepare for heart-pounding
              matches, incredible talent, and a celebration of grassroots
              football like never before!
            </p>
          </Card.Body>
        </Card>
      </motion.div>

      {/* Sponsor Section */}
      <motion.div
        className="mb-5"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.6 }}
      >
        <h4 className="fw-bold">🎉 Proudly Sponsored By:</h4>
        <p className="fst-italic fs-5">
          Hon. <span className="fw-bold">Dickson Omari Mudaka</span>, the
          incoming MCA for Keiyo Ward, Trans Nzoia County (2027).
        </p>
      </motion.div>

      {/* Rules Section */}
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.7 }}
      >
        <Card className="bg-warning text-dark rounded-4 shadow p-4 text-start">
          <h4 className="fw-bold text-center mb-4">
            📜 Tournament Rules & Regulations
          </h4>
          <Row xs={1} md={2} lg={2} className="g-3">
            {rules.map((rule, index) => (
              <Col key={index}>
                <Card className="bg-light bg-opacity-75 border-0 shadow-sm h-100">
                  <Card.Body className="d-flex align-items-start fw-semibold">
                    {rule.icon}
                    <span>{rule.text}</span>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          {/* Download Button */}
          <div className="text-center mt-4">
            <Button
              variant="dark"
              className="fw-bold d-flex align-items-center justify-content-center gap-2 mx-auto"
              href="../../docs/DICKSON SUPERCUP CLASSIC -RULES AND REGULATIONS.pdf"
              target="_blank"
              download
            >
              <FaDownload /> Download Rules
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Call to Action */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.7 }}
      >
        <Card className="bg-warning text-dark rounded-4 shadow p-4 mt-5">
          <h4 className="fw-bold">🔥 Are you ready?</h4>
          <p>
            Don’t miss out on the chance to shine! Registration will be{" "}
            <span className="fw-bold">ONLINE</span>. Tighten your belts, lace up
            your boots, and get ready to make history. Let’s make the Dickson
            Supercup Classic a tournament to remember!
          </p>
        </Card>
      </motion.div>

      {/* Hashtags */}
      <motion.div
        className="mt-5"
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.8, duration: 0.7 }}
      >
        {[
          "#Keiyo001",
          "#Mca2027",
          "#DicksonSupercupClassic",
          "#TransNzoiaFootball",
          "#GetReady",
        ].map((tag, i) => (
          <p key={i} className="fw-bold text-success mb-1">
            {tag}
          </p>
        ))}
      </motion.div>
    </Container>
  );
}

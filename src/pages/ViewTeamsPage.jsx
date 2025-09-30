import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FaListOl,
  FaPlusCircle,
  FaCheckCircle,
  FaClock,
  FaTimes,
  FaUpload,
  FaSearch,
  FaFilePdf,
  FaDownload,
  FaEdit,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import {
  getFirestore,
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  updateDoc,
} from "firebase/firestore";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { app } from "../firebase";
import { mapPosition } from "../utils/positionMap";
import SL from "../assets/SL.png";

import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Form,
  InputGroup,
  Modal,
  Spinner,
  Toast,
} from "react-bootstrap";
import { useAuth } from "../context/AuthContext";

// Rewritten UI for ViewTeamsPage using React-Bootstrap classes
// - Toolbar with search + filters
// - Responsive card grid (1 / 2 / 3 columns using Bootstrap breakpoints)
// - Polished card design, pill badges, compact action buttons
// - Inline edit and modal preserved

export default function ViewTeamsPage() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [queryText, setQueryText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");

  const db = getFirestore(app);
  const { isAdmin } = useAuth();

  useEffect(() => {
    setLoading(true);
    let q;
    try {
      q = query(collection(db, "teams"), orderBy("createdAt", "desc"));
    } catch (e) {
      q = collection(db, "teams");
    }
    const unsub = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        const unique = dedupeTeams(list);
        setTeams(unique);
        setLoading(false);
      },
      (err) => {
        console.error("Error listening teams:", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [db]);

  function formatDate(value) {
    if (!value) return "—";
    if (value?.toDate && typeof value.toDate === "function")
      return value.toDate().toLocaleString();
    if (typeof value === "number") return new Date(value).toLocaleString();
    try {
      const d = new Date(value);
      if (!isNaN(d.getTime())) return d.toLocaleString();
    } catch (e) {}
    return String(value);
  }

  function dedupeTeams(list) {
    const seen = new Set();
    return list.filter((t) => {
      const name = (t.teamName || t.name || "").toString().trim().toLowerCase();
      const manager = (t.managerName || t.manager || t.coach || "")
        .toString()
        .trim()
        .toLowerCase();
      const email = (t.contactEmail || t.email || "")
        .toString()
        .trim()
        .toLowerCase();
      const user = (t.userId || t.uid || t.owner || "").toString().trim();

      const parts = [];
      if (name) parts.push(name);
      if (manager) parts.push(manager);
      if (email) parts.push(email);
      if (user) parts.push(user);

      const key = parts.length > 0 ? parts.join("|") : t.id;

      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  // inline edit state + toast
  const [editingTeamId, setEditingTeamId] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [editErrors, setEditErrors] = useState({});
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "info",
  });

  // PDF modal state
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [pdfTeam, setPdfTeam] = useState(null);
  const [manualFields, setManualFields] = useState({
    preparedBy: "",
    notes: "",
    extras: [],
  });

  function showToast(message, type = "success", ms = 3000) {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "info" }), ms);
  }

  const signupFormTemplate = (teamName = "", logoDataUrl = null, opts = {}) => {
    const safeTeam = teamName || "";
    const safeManager = (opts && opts.managerName) || "";
    const logoSrc = logoDataUrl || SL || "";

    const headerHtml =
      opts && opts.hideHeader
        ? ""
        : `
    <header>
      <div class="logo" aria-hidden="true"> <img src="${logoSrc}" alt="Super Cup logo"/></div>
      <div class="title"><h1>Dickson Super Cup Classic</h1><div class="subtitle">Player Sign-up — Please fill clearly. One row per player.</div></div>
      <div style="min-width:120px; text-align:right;"><div style="font-weight:700; font-size:12px;">Event:</div><div style="font-size:12px;">Dickson Super Cup Classic</div></div>
    </header>
    <div class="accent" aria-hidden="true"></div>
    `;

    return (
      `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Dickson Super Cup Classic - Player Sign-up Form</title>
  <style>
    @page { size: A4 portrait; margin: 12mm; }
    @media print { body { margin: 0; -webkit-print-color-adjust: exact; } .no-print { display: none; } }
  body { font-family: Arial, Helvetica, sans-serif; background: #ffffff; margin: 0; color: #222; -webkit-font-smoothing:antialiased; }
  .page { width:210mm; max-width:100%; margin:0 auto; background:white; border-radius:0; box-shadow:none; overflow:visible; padding:6mm 12mm 12mm; font-size:14px; line-height:1.25; }
    header { display:flex; gap:16px; align-items:center; padding:18px; background: linear-gradient(90deg,#e53935 0%, #d32f2f 40%); color:white; }
  .logo { width:84px; height:84px; flex:0 0 84px; background:white; border-radius:0; display:flex; align-items:center; justify-content:center; overflow:hidden; }
  .logo img { width:84px; height:84px; object-fit:contain; display:block; }
  .title { flex:1; text-align:center; }
  .title h1 { margin:0; font-size:26px; color: #ffdd00; text-shadow: 0 2px 6px rgba(0,0,0,0.4); font-weight:800; }
  .subtitle { margin-top:6px; font-size:13px; color:#fffde7; }
    .accent { height:12px; background: linear-gradient(90deg,#ffd400 0%, #ffec3d 60%); }
    .meta { display:flex; gap:12px; padding:12px 18px; align-items:center; justify-content:space-between; border-bottom:1px solid rgba(0,0,0,0.06); }
    .form-area { padding:12px 18px; }
    .signup-table { width:100%; border-collapse:collapse; margin-top:8px; table-layout:fixed; font-size:13px; }
    .signup-table thead th { background:#e53935; color:white; font-weight:700; padding:8px 6px; text-align:left; font-size:13px; vertical-align:middle; }
    .signup-table tbody td { padding:8px 6px; border-bottom:1px dashed rgba(0,0,0,0.06); vertical-align:middle; background:#fff; height:36px; }
    .col-no { width:5%; text-align:center; font-weight:700; }
    .col-name { width:28%; }
    .col-area { width:18%; }
    .col-team { width:18%; }
    .col-phone { width:12%; }
    .col-id { width:10%; }
    .col-signature { width:9%; text-align:center; }
    .line { border-bottom:1px solid rgba(0,0,0,0.25); display:inline-block; width:100%; height:16px; }
    .footer { margin-top:10px; padding:12px 18px; font-size:12px; color:#444; display:flex; justify-content:space-between; gap:12px; }
  </style>
</head>
<body>
      <div class="page" role="document">
    ${headerHtml}
    <div class="meta">
      <div class="meta-left"><div><strong>Date:</strong> ____________________</div><div style="margin-top:6px"><strong>Venue:</strong> ____________________</div></div>
      <div class="meta-right"><div><strong>Club / Team:</strong> ${safeTeam}</div><div style="margin-top:6px"><strong>Coach / Manager:</strong> ${
        safeManager || "____________________"
      }</div></div>
    </div>
    <div class="form-area">
      <table class="signup-table" aria-label="Player sign up table">
        <thead>
          <tr>
            <th class="col-no">No.</th>
            <th class="col-name">Player Name</th>
            <th class="col-area">Area</th>
            <th class="col-team">Team</th>
            <th class="col-phone">Phone</th>
            <th class="col-id">ID No</th>
            <th class="col-signature">Signature</th>
          </tr>
        </thead>
        <tbody>
` +
      (() => {
        let rows = "";
        for (let i = 1; i <= 20; i++) {
          rows += `<tr><td class="col-no">${i}</td><td class="col-name"><span class="line"></span></td><td class="col-area"><span class="line"></span></td><td class="col-team"><span class="line"></span></td><td class="col-phone"><span class="line"></span></td><td class="col-id"><span class="line"></span></td><td class="col-signature"><span class="line" style="width:90px; display:inline-block;"></span></td></tr>`;
        }
        return (
          rows +
          `</tbody></table></div><div class="footer"><div><small><strong>Note:</strong> By signing, the player confirms they meet age/eligibility requirements.</small></div><div style="text-align:right"><div><strong>Prepared by:</strong> ____________________</div><div style="margin-top:8px"><strong>Official signature:</strong> ____________________</div></div></div></div></body></html>`
        );
      })()
    );
  };

  async function urlToDataUrl(url) {
    try {
      const resp = await fetch(url);
      const blob = await resp.blob();
      return await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (e) {
      console.warn("Failed to convert logo to data URL", e);
      return url;
    }
  }

  const downloadSignupForm = async (teamName = "") => {
    try {
      let logoData = SL;
      if (SL) {
        logoData = await urlToDataUrl(SL).catch(() => SL);
      }
      const html = signupFormTemplate(teamName, logoData);
      const blob = new Blob([html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${(teamName || "tournament").replace(
        /[^a-z0-9\-\_ ]/gi,
        "_"
      )}-signup-form.html`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      showToast("Signup form downloaded", "success");
    } catch (e) {
      console.error("Download failed", e);
      showToast("Failed to download form", "danger");
    }
  };

  const downloadSignupPdfForTeam = async (team) => {
    try {
      let logoData = SL;
      if (SL) {
        logoData = await urlToDataUrl(SL).catch(() => SL);
      }

      const managerName = team.managerName || team.coach || team.manager || "";
      const html = signupFormTemplate(
        team.teamName || team.name || "",
        logoData,
        {
          hideHeader: false,
          managerName,
        }
      );

      const wrapper = document.createElement("div");
      wrapper.style.width = "210mm";
      wrapper.style.boxSizing = "border-box";
      wrapper.style.padding = "0";
      wrapper.style.margin = "0";
      wrapper.style.background = "white";
      wrapper.style.position = "fixed";
      wrapper.style.left = "-10000px";
      wrapper.innerHTML = html;
      document.body.appendChild(wrapper);

      try {
        const html2canvasMod = await import("html2canvas");
        const html2canvas =
          html2canvasMod && html2canvasMod.default
            ? html2canvasMod.default
            : html2canvasMod;

        const waitForImages = (node) =>
          Promise.all(
            Array.from(node.querySelectorAll("img")).map(
              (img) =>
                new Promise((res) => {
                  if (img.complete) return res();
                  img.onload = img.onerror = res;
                })
            )
          );

        await waitForImages(wrapper);
        const canvas = await html2canvas(wrapper, {
          scale: Math.max(1, window.devicePixelRatio || 2),
          useCORS: true,
          backgroundColor: "#ffffff",
        });

        const pdfDoc = new jsPDF({
          unit: "mm",
          format: "a4",
          orientation: "portrait",
        });
        const margin = 8; // mm
        const pdfWidth = pdfDoc.internal.pageSize.getWidth();
        const pdfHeight = pdfDoc.internal.pageSize.getHeight();

        const imgWidthMm = pdfWidth - margin * 2;
        const imgProps = { w: canvas.width, h: canvas.height };
        const imgHeightMm = (imgProps.h * imgWidthMm) / imgProps.w;
        const pxPerMm = imgProps.h / imgHeightMm;
        const pageHeightMm = pdfHeight - margin * 2;
        const segmentPx = Math.floor(pageHeightMm * pxPerMm);

        let yOffsetPx = 0;
        let page = 0;
        while (yOffsetPx < canvas.height) {
          const sliceHeight = Math.min(segmentPx, canvas.height - yOffsetPx);
          const tmpCanvas = document.createElement("canvas");
          tmpCanvas.width = canvas.width;
          tmpCanvas.height = sliceHeight;
          const ctx = tmpCanvas.getContext("2d");
          ctx.drawImage(
            canvas,
            0,
            yOffsetPx,
            canvas.width,
            sliceHeight,
            0,
            0,
            canvas.width,
            sliceHeight
          );
          const imgData = tmpCanvas.toDataURL("image/jpeg", 0.95);

          const sliceHeightMm = sliceHeight / pxPerMm;
          const renderHeightMm = sliceHeightMm;

          if (page > 0) pdfDoc.addPage();
          pdfDoc.addImage(
            imgData,
            "JPEG",
            margin,
            margin,
            imgWidthMm,
            renderHeightMm
          );
          yOffsetPx += sliceHeight;
          page++;
        }

        const safeName = (team.teamName || team.name || "signup").replace(
          /[^a-z0-9\-\_ ]/gi,
          "_"
        );
        pdfDoc.save(`${safeName}-signup-form.pdf`);
        document.body.removeChild(wrapper);
        showToast("Team PDF exported", "success");
        return;
      } catch (errHtml2) {
        console.warn(
          "html2canvas not available or failed, falling back to jsPDF.html",
          errHtml2
        );
      }

      // fallback to jsPDF.html
      const pdfDoc = new jsPDF({
        unit: "mm",
        format: "a4",
        orientation: "portrait",
      });
      await new Promise((resolve, reject) => {
        try {
          pdfDoc.html(wrapper, {
            x: 0,
            y: 0,
            html2canvas: { scale: window.devicePixelRatio || 2, useCORS: true },
            callback: (docInstance) => {
              try {
                const safeName = (
                  team.teamName ||
                  team.name ||
                  "signup"
                ).replace(/[^a-z0-9\-\_ ]/gi, "_");
                docInstance.save(`${safeName}-signup-form.pdf`);
                resolve();
              } catch (e) {
                reject(e);
              }
            },
          });
        } catch (e) {
          reject(e);
        }
      });

      document.body.removeChild(wrapper);
      showToast("Team PDF exported", "success");
    } catch (e) {
      console.warn(
        "Team PDF generation failed, falling back to HTML download",
        e
      );
      showToast(
        "PDF generation not available — downloading HTML instead",
        "warning"
      );
      try {
        await downloadSignupForm(team.teamName || team.name || "");
      } catch (err) {
        console.error("Fallback download failed", err);
        showToast("Download failed", "danger");
      }
    }
  };

  function validate(values) {
    const errs = {};
    if (!values.managerName || values.managerName.trim().length < 2)
      errs.managerName = "Manager name is required";
    if (
      values.contactEmail &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.contactEmail)
    )
      errs.contactEmail = "Invalid email";
    if (values.contactPhone && !/^[0-9()+\-\s]{7,}$/.test(values.contactPhone))
      errs.contactPhone = "Invalid phone";
    return errs;
  }

  async function handleSave(teamId) {
    const errs = validate(editValues);
    setEditErrors(errs);
    if (Object.keys(errs).length > 0)
      return showToast("Fix validation errors before saving", "danger");

    try {
      const teamRef = doc(db, "teams", teamId);
      await updateDoc(teamRef, {
        managerName: editValues.managerName || null,
        contactEmail: editValues.contactEmail || null,
        contactPhone: editValues.contactPhone || null,
      });

      setTeams((prev) =>
        prev.map((t) => (t.id === teamId ? { ...t, ...editValues } : t))
      );
      setEditingTeamId(null);
      setEditValues({});
      setEditErrors({});
      showToast("Team saved", "success");
    } catch (e) {
      console.error("Save failed", e);
      showToast("Save failed: " + (e.message || "unknown error"), "danger");
    }
  }

  // derived list from search + filter + sort
  const filtered = teams
    .filter((t) => {
      if (statusFilter !== "all") {
        const s = (t.paymentStatus || (t.paid ? "approved" : "pending") || "")
          .toString()
          .toLowerCase();
        if (
          statusFilter === "approved" &&
          !(s === "verified" || s === "approved")
        )
          return false;
        if (statusFilter === "pending" && s !== "pending") return false;
        if (statusFilter === "rejected" && s !== "rejected") return false;
      }
      if (queryText.trim() === "") return true;
      const q = queryText.trim().toLowerCase();
      return (
        (t.teamName || t.name || "").toString().toLowerCase().includes(q) ||
        (t.managerName || t.manager || t.coach || "")
          .toString()
          .toLowerCase()
          .includes(q) ||
        (t.contactEmail || t.email || "")
          .toString()
          .toLowerCase()
          .includes(q) ||
        (t.contactPhone || t.phone || "").toString().toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sortBy === "name")
        return (a.teamName || a.name || "") > (b.teamName || b.name || "")
          ? 1
          : -1;
      const ta = a.createdAt
        ? a.createdAt.toDate
          ? a.createdAt.toDate().getTime()
          : new Date(a.createdAt).getTime()
        : 0;
      const tb = b.createdAt
        ? b.createdAt.toDate
          ? b.createdAt.toDate().getTime()
          : new Date(b.createdAt).getTime()
        : 0;
      return tb - ta;
    });

  return (
    <Container className="py-4">
      {/* Toolbar */}
      <motion.div
        initial={{ y: -8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <Row className="align-items-center mb-3 gx-3">
          <Col xs={12} md={4} className="mb-2 mb-md-0">
            <div className="d-flex align-items-center gap-3 bg-dark rounded p-2">
              <div
                className="bg-warning bg-opacity-10 rounded d-flex align-items-center justify-content-center"
                style={{ width: 48, height: 48 }}
              >
                <FaListOl className="text-warning" />
              </div>
              <div>
                <h5 className="mb-0 text-warning">Registered Teams</h5>
                <small className="text-muted">
                  Manage teams, export forms & PDFs
                </small>
              </div>
            </div>
          </Col>

          <Col xs={12} md={8}>
            <Row className="g-2">
              <Col xs={12} lg={6}>
                <InputGroup>
                  <InputGroup.Text className="bg-white">
                    <FaSearch />
                  </InputGroup.Text>
                  <Form.Control
                    placeholder="Search by team, manager, email or phone"
                    value={queryText}
                    onChange={(e) => setQueryText(e.target.value)}
                    aria-label="Search teams"
                  />
                </InputGroup>
              </Col>

              <Col xs={6} md={3} lg={2}>
                <Form.Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  aria-label="Filter status"
                >
                  <option value="all">All</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                </Form.Select>
              </Col>

              <Col xs={6} md={3} lg={2}>
                <Form.Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  aria-label="Sort by"
                >
                  <option value="createdAt">Newest</option>
                  <option value="name">Name (A–Z)</option>
                </Form.Select>
              </Col>

              <Col xs={12} lg={2} className="d-flex gap-2 justify-content-end">
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => downloadSignupForm("")}
                >
                  {" "}
                  <FaDownload /> <span className="ms-2">Blank Form</span>
                </Button>
                <Button
                  variant="warning"
                  size="sm"
                  onClick={() => downloadSignupPdfForTeam({ teamName: "" })}
                >
                  <FaFilePdf className="me-2" />
                  Export A4
                </Button>
              </Col>
            </Row>
          </Col>
        </Row>
      </motion.div>

      {/* content */}
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="warning" />
        </div>
      ) : error ? (
        <div className="alert alert-danger">
          Failed to load teams. Please try again later.
        </div>
      ) : (
        <>
          {filtered.length === 0 ? (
            <div className="text-center text-muted py-4">
              No teams match your search.
            </div>
          ) : (
            <Row xs={1} md={2} lg={3} className="g-3">
              {filtered.map((team, idx) => (
                <Col key={team.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.02 }}
                  >
                    <Card
                      bg="dark"
                      text="light"
                      className="h-100 shadow-sm rounded"
                    >
                      <Card.Body>
                        <div className="d-flex justify-content-between">
                          <div>
                            <Card.Title className="mb-1">
                              {team.teamName || team.name || "Unnamed Team"}
                            </Card.Title>
                            <div className="small text-muted">
                              {team.managerName ||
                                team.coach ||
                                "No manager listed"}
                            </div>
                          </div>

                          <div className="text-end">
                            {isAdmin ? (
                              (() => {
                                const s = (
                                  team.paymentStatus ||
                                  (team.paid ? "verified" : "pending") ||
                                  ""
                                )
                                  .toString()
                                  .toLowerCase();
                                if (s === "verified" || s === "approved") {
                                  return (
                                    <Badge bg="success" pill>
                                      <FaCheckCircle className="me-1" /> Verified
                                    </Badge>
                                  );
                                }
                                if (s === "submitted") {
                                  return (
                                    <Badge bg="info" text="dark" pill>
                                      <FaUpload className="me-1" /> Submitted
                                    </Badge>
                                  );
                                }
                                if (s === "rejected") {
                                  return (
                                    <Badge bg="danger" pill>
                                      <FaTimes className="me-1" /> Rejected
                                    </Badge>
                                  );
                                }
                                return (
                                  <Badge bg="warning" text="dark" pill>
                                    <FaClock className="me-1" />{" "}
                                    {team.paymentStatus || "pending"}
                                  </Badge>
                                );
                              })()
                            ) : null}

                            <div className="text-muted small mt-2">
                              {formatDate(team.createdAt)}
                            </div>
                          </div>
                        </div>

                        <hr className="border-secondary" />

                        <Row className="text-muted small mb-2">
                          <Col xs={6}>
                            <div className="fw-semibold">Contact</div>
                            <div className="text-truncate">
                              {team.contactPhone || team.phone || "—"}
                            </div>
                          </Col>
                          <Col xs={6}>
                            <div className="fw-semibold">Email</div>
                            <div className="text-truncate">
                              {team.contactEmail || team.email || "—"}
                            </div>
                          </Col>
                          <Col xs={6} className="mt-2">
                            <div className="fw-semibold">User ID</div>
                            <div className="text-truncate">
                              {team.userId || team.uid || team.owner || "—"}
                            </div>
                          </Col>
                          <Col xs={6} className="mt-2">
                            <div className="fw-semibold">Position</div>
                            <div className="text-truncate">
                              {team.positionCode
                                ? mapPosition(team.positionCode)
                                : "—"}
                            </div>
                          </Col>
                        </Row>

                        <div className="d-flex justify-content-between align-items-center">
                          <div className="d-flex gap-2">
                            {isAdmin ? (
                              <Link
                                to={`/teams/${team.id}`}
                                className="btn btn-sm btn-outline-light"
                              >
                                View
                              </Link>
                            ) : null}

                            {isAdmin ? (
                              <Button
                                variant="outline-secondary"
                                size="sm"
                                onClick={() => {
                                  setEditingTeamId(team.id);
                                  setEditValues({
                                    managerName: team.managerName || "",
                                    contactEmail: team.contactEmail || "",
                                    contactPhone: team.contactPhone || "",
                                  });
                                  setEditErrors({});
                                }}
                              >
                                <FaEdit className="me-1" />
                                Edit
                              </Button>
                            ) : null}

                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() =>
                                downloadSignupForm(
                                  team.teamName || team.name || ""
                                )
                              }
                            >
                              <FaDownload className="me-1" />
                              Form
                            </Button>
                          </div>

                          <div className="d-flex gap-2">
                            <Button
                              variant="warning"
                              size="sm"
                              onClick={() => downloadSignupPdfForTeam(team)}
                            >
                              <FaFilePdf className="me-1" />
                              A4
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => {
                                setPdfTeam(team);
                                setManualFields({
                                  preparedBy: "",
                                  notes: "",
                                  extras: [],
                                });
                                setPdfModalOpen(true);
                              }}
                            >
                              Export
                            </Button>
                          </div>
                        </div>

                        {editingTeamId === team.id && (
                          <div className="mt-3 bg-secondary bg-opacity-10 p-3 rounded">
                            <Form>
                              <Row className="g-2">
                                <Col md>
                                  <Form.Group>
                                    <Form.Label className="small">
                                      Manager
                                    </Form.Label>
                                    <Form.Control
                                      size="sm"
                                      value={editValues.managerName || ""}
                                      onChange={(e) =>
                                        setEditValues((v) => ({
                                          ...v,
                                          managerName: e.target.value,
                                        }))
                                      }
                                      isInvalid={!!editErrors.managerName}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                      {editErrors.managerName}
                                    </Form.Control.Feedback>
                                  </Form.Group>
                                </Col>

                                <Col md>
                                  <Form.Group>
                                    <Form.Label className="small">
                                      Email
                                    </Form.Label>
                                    <Form.Control
                                      size="sm"
                                      value={editValues.contactEmail || ""}
                                      onChange={(e) =>
                                        setEditValues((v) => ({
                                          ...v,
                                          contactEmail: e.target.value,
                                        }))
                                      }
                                      isInvalid={!!editErrors.contactEmail}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                      {editErrors.contactEmail}
                                    </Form.Control.Feedback>
                                  </Form.Group>
                                </Col>

                                <Col md>
                                  <Form.Group>
                                    <Form.Label className="small">
                                      Phone
                                    </Form.Label>
                                    <Form.Control
                                      size="sm"
                                      value={editValues.contactPhone || ""}
                                      onChange={(e) =>
                                        setEditValues((v) => ({
                                          ...v,
                                          contactPhone: e.target.value,
                                        }))
                                      }
                                      isInvalid={!!editErrors.contactPhone}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                      {editErrors.contactPhone}
                                    </Form.Control.Feedback>
                                  </Form.Group>
                                </Col>
                              </Row>

                              <div className="d-flex justify-content-end gap-2 mt-2">
                                <Button
                                  variant="outline-light"
                                  size="sm"
                                  onClick={() => {
                                    setEditingTeamId(null);
                                    setEditValues({});
                                    setEditErrors({});
                                  }}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  variant="warning"
                                  size="sm"
                                  onClick={() => handleSave(team.id)}
                                >
                                  Save
                                </Button>
                              </div>
                            </Form>
                          </div>
                        )}
                      </Card.Body>
                    </Card>
                  </motion.div>
                </Col>
              ))}
            </Row>
          )}

          <div className="text-center mt-4">
            <Link to="/register" className="btn btn-warning btn-lg">
              <FaPlusCircle className="me-2" /> Register a New Team
            </Link>
          </div>
        </>
      )}

      {/* PDF modal */}
      <Modal show={pdfModalOpen} onHide={() => setPdfModalOpen(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Export Team to PDF</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Prepared By</Form.Label>
              <Form.Control
                value={manualFields.preparedBy}
                onChange={(e) =>
                  setManualFields((m) => ({ ...m, preparedBy: e.target.value }))
                }
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={manualFields.notes}
                onChange={(e) =>
                  setManualFields((m) => ({ ...m, notes: e.target.value }))
                }
              />
            </Form.Group>

            <div>
              <Form.Label className="mb-2">Additional Fields</Form.Label>
              {manualFields.extras.map((ex, i) => (
                <Row className="g-2 mb-2" key={i}>
                  <Col>
                    <Form.Control
                      placeholder="Field name"
                      value={ex.key}
                      onChange={(e) => {
                        const copy = [...manualFields.extras];
                        copy[i] = { ...copy[i], key: e.target.value };
                        setManualFields((m) => ({ ...m, extras: copy }));
                      }}
                    />
                  </Col>
                  <Col>
                    <Form.Control
                      placeholder="Value"
                      value={ex.value}
                      onChange={(e) => {
                        const copy = [...manualFields.extras];
                        copy[i] = { ...copy[i], value: e.target.value };
                        setManualFields((m) => ({ ...m, extras: copy }));
                      }}
                    />
                  </Col>
                  <Col xs="auto">
                    <Button
                      variant="danger"
                      onClick={() => {
                        const copy = manualFields.extras.filter(
                          (_, idx) => idx !== i
                        );
                        setManualFields((m) => ({ ...m, extras: copy }));
                      }}
                    >
                      Remove
                    </Button>
                  </Col>
                </Row>
              ))}

              <Button
                variant="light"
                onClick={() =>
                  setManualFields((m) => ({
                    ...m,
                    extras: [...m.extras, { key: "", value: "" }],
                  }))
                }
              >
                Add field
              </Button>
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setPdfModalOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              try {
                const team = pdfTeam;
                const rows = [];
                const push = (k, v) =>
                  rows.push([
                    k,
                    v === undefined || v === null ? "—" : String(v),
                  ]);

                push("Team Name", team.teamName || team.name || "Unnamed Team");
                push(
                  "Manager",
                  team.managerName || team.manager || team.coach || "—"
                );
                push("Contact Phone", team.contactPhone || team.phone || "—");
                push("Contact Email", team.contactEmail || team.email || "—");
                push(
                  "Status",
                  team.paymentStatus || (team.paid ? "approved" : "pending")
                );
                push("Created", formatDate(team.createdAt));
                push("User ID", team.userId || team.uid || team.owner || "—");
                if (team.positionCode)
                  push("Primary position", mapPosition(team.positionCode));

                push("Prepared By", manualFields.preparedBy || "");
                if (manualFields.notes) push("Notes", manualFields.notes);
                manualFields.extras.forEach((ex) => {
                  if (ex && ex.key) push(ex.key, ex.value);
                });

                const docPDF = new jsPDF();
                docPDF.setFontSize(14);
                docPDF.text(team.teamName || "Team Details", 14, 14);
                autoTable(docPDF, {
                  startY: 22,
                  head: [["Field", "Value"]],
                  body: rows,
                  styles: { fontSize: 10 },
                  headStyles: { fillColor: [41, 128, 185] },
                });

                const safeName = (team.teamName || "team").replace(
                  /[^a-z0-9\-\_ ]/gi,
                  "_"
                );
                docPDF.save(`${safeName}-details.pdf`);
                showToast("PDF exported", "success");
              } catch (e) {
                console.error("PDF export failed", e);
                showToast("PDF export failed", "danger");
              } finally {
                setPdfModalOpen(false);
                setPdfTeam(null);
              }
            }}
          >
            Generate PDF
          </Button>
        </Modal.Footer>
      </Modal>

      {/* toast */}
      <div style={{ position: "fixed", right: 16, bottom: 16, zIndex: 1060 }}>
        <Toast
          show={toast.show}
          bg={
            toast.type === "danger"
              ? "danger"
              : toast.type === "warning"
              ? "warning"
              : "success"
          }
          onClose={() => setToast({ show: false, message: "", type: "info" })}
          delay={3000}
          autohide
        >
          <Toast.Body
            className={toast.type === "danger" ? "text-white" : "text-dark"}
          >
            {toast.message}
          </Toast.Body>
        </Toast>
      </div>
    </Container>
  );
}

import React, { useState, useEffect } from "react";
import TransferModal from "./TransferModal";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  getDoc,
} from "firebase/firestore";
import { app } from "../firebase";

export default function AdminCaves() {
  const [teams, setTeams] = useState([]);
  const [query, setQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [transferData, setTransferData] = useState(null);

  useEffect(() => {
    // subscribe to registrations collection (real-time)
    const db = getFirestore(app);
    // try to order by createdAt if present, otherwise fall back to doc order
    let q;
    try {
      q = query(collection(db, "registrations"), orderBy("createdAt", "desc"));
    } catch (e) {
      q = collection(db, "registrations");
    }

    const unsub = onSnapshot(
      q,
      async (snapshot) => {
        const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        // fetch user docs for any userId / uid fields referenced in registrations
        const db = getFirestore(app);
        const ids = Array.from(
          new Set(
            list.map((r) => r.userId || r.uid || r.createdBy).filter(Boolean)
          )
        );
        const userMap = {};
        await Promise.all(
          ids.map(async (id) => {
            try {
              const ud = await getDoc(doc(db, "users", id));
              if (ud && ud.exists()) userMap[id] = { id: ud.id, ...ud.data() };
            } catch (e) {
              console.warn("Failed to load user", id, e);
            }
          })
        );
        const enriched = list.map((r) => ({
          ...r,
          _user: userMap[r.userId || r.uid || r.createdBy],
        }));
        setTeams(enriched);
      },
      (err) => {
        console.error("Failed to listen to registrations", err);
      }
    );

    return () => unsub();
  }, []);

  function save(next) {
    setTeams(next);
  }

  function formatDate(value) {
    if (!value) return "—";
    // Firebase Timestamp
    if (value?.toDate && typeof value.toDate === "function") {
      return value.toDate().toLocaleString();
    }
    // milliseconds
    if (typeof value === "number") {
      return new Date(value).toLocaleString();
    }
    // ISO/string
    try {
      const d = new Date(value);
      if (!isNaN(d.getTime())) return d.toLocaleString();
    } catch (e) {}
    return String(value);
  }

  async function approve(id) {
    const next = teams.map((t) =>
      t.id === id ? { ...t, approved: true, paymentStatus: "verified" } : t
    );
    setTeams(next);
    // update Firestore - set paymentStatus and optional approved flag
    const db = getFirestore(app);
    const ref = doc(db, "registrations", id);
    try {
      await updateDoc(ref, { paymentStatus: "verified", approved: true });
    } catch (err) {
      console.error("Approve failed", err);
    }
  }

  async function revoke(id) {
    const next = teams.map((t) =>
      t.id === id ? { ...t, approved: false, paymentStatus: "pending" } : t
    );
    setTeams(next);
    const db = getFirestore(app);
    const ref = doc(db, "registrations", id);
    try {
      await updateDoc(ref, { approved: false, paymentStatus: "pending" });
    } catch (err) {
      console.error("Revoke failed", err);
    }
  }

  async function bulkApprove() {
    const next = teams.map((t) => ({
      ...t,
      approved: true,
      paymentStatus: "verified",
    }));
    setTeams(next);
    const db = getFirestore(app);
    await Promise.all(
      teams.map((t) => {
        const ref = doc(db, "registrations", t.id);
        return updateDoc(ref, {
          approved: true,
          paymentStatus: "verified",
        }).catch(() => {});
      })
    );
  }

  function handleTransfer(payload) {
    // payload: { sourceId, targetId, playerIndex }
    const src = teams.find((t) => t.id === payload.sourceId);
    const tgt = teams.find((t) => t.id === payload.targetId);
    if (!src || !tgt) return;
    const player = src.players.splice(payload.playerIndex, 1)[0];
    tgt.players = tgt.players || [];
    tgt.players.push(player);
    const next = teams.map((t) =>
      t.id === src.id ? src : t.id === tgt.id ? tgt : t
    );
    save(next);
    setShowModal(false);
    setTransferData(null);
  }

  const total = teams.length;
  const approvedCount = teams.filter((t) => t.approved).length;
  const pendingCount = total - approvedCount;

  return (
    <div className="container my-4">
      <div className="mb-4">
        <div className="card bg-primary text-white">
          <div className="card-body d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <div
                className="bg-white text-primary rounded-circle d-flex align-items-center justify-content-center me-3"
                style={{ width: 64, height: 64 }}
              >
                <strong>AD</strong>
              </div>
              <div>
                <h4 className="mb-0">Administrator</h4>
                <div className="small opacity-75">
                  Manage programs, registrations and teams
                </div>
              </div>
            </div>
            <div className="text-end">
              <div className="h5 mb-0">{total} Teams</div>
              <div className="small">
                {approvedCount} approved • {pendingCount} pending
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3 mb-3">
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <small className="text-muted">Total Teams</small>
              <div className="h4">{total}</div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <small className="text-muted">Approved</small>
              <div className="h4">{approvedCount}</div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <small className="text-muted">Pending</small>
              <div className="h4">{pendingCount}</div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <small className="text-muted">Registrations</small>
              <div className="h4">
                {teams.reduce(
                  (s, t) => s + (t.players ? t.players.length : 0),
                  0
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="d-flex gap-2 mb-3 align-items-center">
        <input
          placeholder="Filter team"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="form-control w-50"
        />
        <button
          className="btn btn-secondary"
          onClick={() => {
            setTransferData(null);
            setShowModal(true);
          }}
        >
          Transfer Player
        </button>
        <button className="btn btn-primary" onClick={bulkApprove}>
          Bulk Approve
        </button>
      </div>

      <div className="row">
        <div className="col-lg-8">
          <div className="card mb-3">
            <div className="card-header">Team Approvals</div>
            <div className="card-body p-0">
              {total === 0 ? (
                <div className="p-3">No registrations yet</div>
              ) : (
                <ul className="list-unstyled mb-0">
                  {teams
                    .filter(
                      (t) =>
                        (t.teamName || t.team) &&
                        (t.teamName || t.team)
                          .toLowerCase()
                          .includes(query.toLowerCase())
                    )
                    .map((t) => (
                      <li
                        key={t.id}
                        className="d-flex justify-content-between align-items-center py-3 px-3 border-bottom"
                      >
                        <div className="d-flex align-items-center">
                          {t.manager &&
                          (t.manager.idUrl || t.manager.photoURL) ? (
                            <img
                              src={t.manager.idUrl || t.manager.photoURL}
                              alt="ID"
                              className="me-3 rounded"
                              style={{
                                width: 56,
                                height: 56,
                                objectFit: "cover",
                              }}
                            />
                          ) : (
                            <div
                              className="me-3 bg-secondary text-white rounded-circle d-flex align-items-center justify-content-center"
                              style={{ width: 56, height: 56 }}
                            >
                              TM
                            </div>
                          )}
                          <div>
                            <strong>
                              {t.teamName || t.team || "Untitled Team"}
                            </strong>
                            <div className="text-muted small">
                              {t.players ? `${t.players.length} players` : "—"}{" "}
                              • {t.category || t.role || "team"}
                            </div>
                            <div className="text-muted small">
                              Manager:{" "}
                              {t.managerName ||
                                (t.manager && t.manager.name) ||
                                "—"}
                            </div>
                            <div className="text-muted small">
                              Contact:{" "}
                              {t.contactPhone ||
                                (t.manager && t.manager.phone) ||
                                "—"}
                            </div>
                            <div className="text-muted small">
                              Email:{" "}
                              {t.contactEmail ||
                                (t.manager && t.manager.email) ||
                                "—"}
                            </div>
                            <div className="text-muted small">
                              Region: {t.region || "—"}
                            </div>
                            <div className="text-muted small">
                              Created: {formatDate(t.createdAt)}
                            </div>
                            <div className="text-muted small">
                              Doc ID: {t.id}
                            </div>
                            <div className="text-muted small">
                              User ID:{" "}
                              {t.userId ||
                                t.uid ||
                                t.createdBy ||
                                t.owner ||
                                "unknown"}
                            </div>
                          </div>
                        </div>
                        <div className="d-flex align-items-center">
                          <div className="me-3 text-muted small">
                            {t.paymentStatus === "approved" || t.approved ? (
                              <span className="badge bg-success">Approved</span>
                            ) : t.paymentStatus === "rejected" ? (
                              <span className="badge bg-danger">Rejected</span>
                            ) : (
                              <span className="badge bg-warning text-dark">
                                {t.paymentStatus || "pending"}
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => approve(t.id)}
                            className="btn btn-sm btn-success me-2"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => revoke(t.id)}
                            className="btn btn-sm btn-outline-danger me-2"
                          >
                            Revoke
                          </button>
                          <button
                            onClick={() => {
                              setTransferData(t);
                              setShowModal(true);
                            }}
                            className="btn btn-sm btn-outline-secondary me-2"
                          >
                            Transfer
                          </button>
                          <button
                            onClick={() => alert(JSON.stringify(t, null, 2))}
                            className="btn btn-sm btn-outline-info"
                          >
                            View JSON
                          </button>
                        </div>
                      </li>
                    ))}
                </ul>
              )}
            </div>
          </div>

          <div className="card mb-3">
            <div className="card-header">Upcoming Matches</div>
            <div className="card-body">
              <p className="text-muted small">
                No scheduled matches. Use Programs → Schedule to add matches.
              </p>
            </div>
          </div>

          <div className="card">
            <div className="card-header">Team Communication</div>
            <div className="card-body">
              <div className="mb-2">
                <strong>Announcements</strong>
              </div>
              <div className="text-muted small">
                Post announcements to teams and managers here.
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card mb-3">
            <div className="card-header">Payments</div>
            <div className="card-body">
              <div className="small text-muted">Payment center</div>
              <div className="mt-2">
                {teams.filter((t) => t.paid).length} teams paid
              </div>
            </div>
          </div>

          <div className="card mb-3">
            <div className="card-header">Reporting</div>
            <div className="card-body">
              <div className="small text-muted">Quick metrics</div>
              <ul className="list-unstyled mt-2 mb-0">
                <li>Total teams: {total}</li>
                <li>Approved: {approvedCount}</li>
                <li>Pending: {pendingCount}</li>
              </ul>
            </div>
          </div>

          <div className="card">
            <div className="card-header">Users</div>
            <div className="card-body">
              <div className="small text-muted">Managers</div>
              <ul className="list-unstyled mt-2 mb-0">
                {teams.slice(0, 5).map((t) => (
                  <li key={t.id} className="py-2 border-bottom">
                    <div className="d-flex align-items-center">
                      <div
                        className="me-2 bg-secondary text-white rounded-circle d-flex align-items-center justify-content-center"
                        style={{ width: 34, height: 34 }}
                      >
                        {t.manager && t.manager.name
                          ? t.manager.name.slice(0, 2).toUpperCase()
                          : "M"}
                      </div>
                      <div>
                        <div className="small fw-bold">
                          {t.manager && t.manager.name
                            ? t.manager.name
                            : "Manager"}
                        </div>
                        <div className="small text-muted">
                          {t.manager && t.manager.phone}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <TransferModal
          open={showModal}
          teams={teams}
          initialTeam={transferData}
          onClose={() => {
            setShowModal(false);
            setTransferData(null);
          }}
          onTransfer={handleTransfer}
        />
      )}
    </div>
  );
}

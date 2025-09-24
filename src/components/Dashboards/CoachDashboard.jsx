import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { Card, CardContent } from "../ui/card";

export default function CoachDashboard() {
  const { user } = useAuth();
  const [players, setPlayers] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [injuries, setInjuries] = useState([]);
  const [performance, setPerformance] = useState(null);

  useEffect(() => {
    if (!user) return;

    // 👇 Fetch players assigned to this coach
    const qPlayers = query(
      collection(db, "players"),
      where("coachId", "==", user.uid)
    );
    const unsubPlayers = onSnapshot(qPlayers, (snap) => {
      setPlayers(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    // 👇 Fetch training sessions
    const qSessions = query(
      collection(db, "sessions"),
      where("coachId", "==", user.uid)
    );
    const unsubSessions = onSnapshot(qSessions, (snap) => {
      setSessions(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    // 👇 Fetch injury reports
    const qInjuries = query(
      collection(db, "injuries"),
      where("coachId", "==", user.uid)
    );
    const unsubInjuries = onSnapshot(qInjuries, (snap) => {
      setInjuries(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    // 👇 Fetch performance ratings
    const qPerf = query(
      collection(db, "performance"),
      where("coachId", "==", user.uid)
    );
    const unsubPerf = onSnapshot(qPerf, (snap) => {
      if (snap.empty) {
        setPerformance(0);
      } else {
        const avg =
          snap.docs.reduce((acc, d) => acc + (d.data().rating || 0), 0) /
          snap.docs.length;
        setPerformance(avg.toFixed(1));
      }
    });

    return () => {
      unsubPlayers();
      unsubSessions();
      unsubInjuries();
      unsubPerf();
    };
  }, [user]);

  return (
    <div className="container py-4">
      <h3 className="fw-bold mb-4">⚽ Coach Dashboard</h3>

      <div className="row g-4">
        {/* Players Trained */}
        <div className="col-md-3">
          <Card className="shadow-sm">
            <CardContent>
              <h6 className="text-muted">Players Trained</h6>
              <div className="h4">{players.length || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Sessions */}
        <div className="col-md-3">
          <Card className="shadow-sm">
            <CardContent>
              <h6 className="text-muted">Sessions</h6>
              <div className="h4">{sessions.length || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Injuries */}
        <div className="col-md-3">
          <Card className="shadow-sm">
            <CardContent>
              <h6 className="text-muted">Injuries Reported</h6>
              <div className="h4">{injuries.length || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Performance */}
        <div className="col-md-3">
          <Card className="shadow-sm">
            <CardContent>
              <h6 className="text-muted">Performance Rating</h6>
              <div className="h4">{performance || 0}</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

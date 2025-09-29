import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import ProgramService from "../services/ProgramService";

const ProgramContext = createContext(null);

export function ProgramProvider({ initialProgramId = null, children }) {
  const [programId, setProgramId] = useState(initialProgramId);
  const [program, setProgram] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load single program when programId changes
  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!programId) {
        setProgram(null);
        return;
      }
      setLoading(true);
      try {
        const snap = await getDoc(doc(db, "programs", programId));
        if (mounted) {
          setProgram(snap.exists() ? { id: snap.id, ...snap.data() } : null);
        }
      } catch (err) {
        console.error("Program load failed", err);
        if (mounted) setProgram(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => (mounted = false);
  }, [programId]);

  // Load all programs (doesn't depend on programId)
  useEffect(() => {
    async function loadAll() {
      try {
        const snap = await getDocs(collection(db, "programs"));
        setPrograms(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error("Failed to load programs", err);
      }
    }
    loadAll();
  }, []);

  // ✅ Only create ProgramService if programId exists
  const service = useMemo(
    () => (programId ? new ProgramService(db, programId) : null),
    [programId]
  );

  const value = useMemo(
    () => ({ programId, setProgramId, program, programs, loading, service }),
    [programId, program, programs, loading, service]
  );

  return (
    <ProgramContext.Provider value={value}>{children}</ProgramContext.Provider>
  );
}

export function useProgram() {
  const ctx = useContext(ProgramContext);
  if (!ctx) throw new Error("useProgram must be used within a ProgramProvider");
  return ctx;
}

export default ProgramContext;

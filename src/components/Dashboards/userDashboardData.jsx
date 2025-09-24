import { useEffect, useState } from "react";
import { onSnapshot, collection, query, where } from "firebase/firestore";
import { db } from "../../firebase";


export function useDashboardData(collectionName, filters = []) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let q = collection(db, collectionName);

    // Apply filters if any (like managerId, playerId, etc.)
    if (filters.length > 0) {
      q = query(q, ...filters);
    }

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        setData(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching realtime data:", error);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [collectionName, JSON.stringify(filters)]);

  return { data, loading };
}

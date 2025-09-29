import React from "react";
import { useDashboardData } from "./userDashboardData";
import { useAuth } from "../../context/AuthContext";
import { Card, CardContent } from "../ui/card";
import { where } from "firebase/firestore";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { FaDownload } from "react-icons/fa";
import * as XLSX from "xlsx";

export default function ManagerDashboard() {
  const { user } = useAuth();

  const { data: teams } = useDashboardData("teams", [
    where("managerId", "==", user?.uid),
  ]);

  return (
    <div className="grid gap-4">
      <Card>
        <CardContent className="p-4">
          <h4 className="font-semibold mb-2">My Teams</h4>
          {teams.length === 0 ? (
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500">No teams found</p>
              <span className="h-3 w-3 rounded-full bg-red-500" />
            </div>
          ) : (
            <ul className="space-y-2">
              {teams.map((team) => (
                <li
                  key={team.id}
                  className="flex justify-between border-b py-2"
                >
                  <span>{team.teamName}</span>
                  <span className="px-2 py-1 rounded text-xs">
                    {team.paymentStatus === "verified" || team.approved ? (
                      <span className="bg-green-100 text-green-600 px-2 py-1 rounded">
                        Verified
                      </span>
                    ) : team.paymentStatus === "submitted" ? (
                      <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded">
                        Submitted
                      </span>
                    ) : team.paymentStatus === "rejected" ? (
                      <span className="bg-red-100 text-red-600 px-2 py-1 rounded">
                        Rejected
                      </span>
                    ) : (
                      <span className="bg-yellow-100 text-yellow-600 px-2 py-1 rounded">
                        Pending
                      </span>
                    )}
                  </span>
                  <button
                    className="btn btn-sm btn-outline-secondary ms-2"
                    onClick={async () => {
                      try {
                        const snap = await getDoc(doc(db, "teams", team.id));
                        if (!snap.exists()) return alert("Team not found");
                        const payload = { id: snap.id, ...snap.data() };
                        const ws = XLSX.utils.json_to_sheet([payload]);
                        const wb = XLSX.utils.book_new();
                        XLSX.utils.book_append_sheet(wb, ws, "Team");
                        XLSX.writeFile(wb, `${team.teamName}-team.xlsx`);
                      } catch (err) {
                        console.error(err);
                        alert("Failed to download team form.");
                      }
                    }}
                  >
                    <FaDownload />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

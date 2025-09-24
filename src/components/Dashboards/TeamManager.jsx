import React from "react";
import { useDashboardData } from "./userDashboardData";
import { useAuth } from "../../context/AuthContext";
import { Card, CardContent } from "../ui/card";
import { where } from "firebase/firestore";

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
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      team.approved
                        ? "bg-green-100 text-green-600"
                        : "bg-yellow-100 text-yellow-600"
                    }`}
                  >
                    {team.approved ? "Approved" : "Pending"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

import React from "react";
import { useAuth } from "../../context/AuthContext";
import { useDashboardData } from "./userDashboardData";
import { where } from "firebase/firestore";
import { Card, CardContent } from "../ui/card";

export default function PlayerDashboard() {
  const { user } = useAuth();
  const { data: playerData } = useDashboardData("players", [
    where("uid", "==", user?.uid),
  ]);

  const player = playerData[0];

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardContent className="p-4">
          <h4 className="font-semibold mb-2">Player Info</h4>
          {player ? (
            <>
              <p><strong>Name:</strong> {player.name}</p>
              <p><strong>Team:</strong> {player.team || "Unassigned"}</p>
              <p><strong>Position:</strong> {player.position}</p>
            </>
          ) : (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">No profile found</span>
              <span className="h-3 w-3 rounded-full bg-red-500"></span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

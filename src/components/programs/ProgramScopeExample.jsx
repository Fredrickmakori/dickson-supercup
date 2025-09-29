import React, { useEffect, useState } from "react";
import { ProgramProvider, useProgram } from "../../context/ProgramContext";
import useProgramService from "../../hooks/useProgramService";

function ProgramDetails() {
  const { program, loading, setProgramId } = useProgram();
  const service = useProgramService();
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    if (!service) return;
    (async () => {
      try {
        const t = await service.listTeams();
        setTeams(t);
      } catch (e) {
        console.error("failed list teams", e);
      }
    })();
  }, [service]);

  if (loading) return <div>Loading program...</div>;
  if (!program)
    return (
      <div>
        <p>No program selected</p>
        <button onClick={() => setProgramId("dickson-supercup-classic")}>
          Select Dickson Supercup
        </button>
      </div>
    );

  return (
    <div>
      <h3>{program.name}</h3>
      <p>{program.description}</p>
      <h5>Teams</h5>
      <ul>
        {teams.map((t) => (
          <li key={t.id}>{t.teamName || t.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default function ProgramScopeExample() {
  return (
    <ProgramProvider initialProgramId={null}>
      <ProgramDetails />
    </ProgramProvider>
  );
}

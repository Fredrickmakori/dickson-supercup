import { useProgram } from "../context/ProgramContext";

export default function useProgramService() {
  const { service } = useProgram();
  if (!service)
    throw new Error("useProgramService must be used within a ProgramProvider");
  return service;
}

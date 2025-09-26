// Simple mapping from FIFA-style position codes to full names
export const POSITION_MAP = {
  GK: "Goalkeeper",
  RB: "Right Back",
  LB: "Left Back",
  CB: "Center Back",
  RWB: "Right Wing Back",
  LWB: "Left Wing Back",
  DM: "Defensive Midfielder",
  CM: "Central Midfielder",
  CAM: "Central Attacking Midfielder",
  LM: "Left Midfielder",
  RM: "Right Midfielder",
  LW: "Left Winger",
  RW: "Right Winger",
  CF: "Center Forward",
  ST: "Striker",
  SS: "Second Striker",
};

export function mapPosition(code) {
  if (!code) return "Unknown";
  const cleaned = String(code).trim().toUpperCase();
  return POSITION_MAP[cleaned] || code;
}

// A tiny helper to merge team edits with existing record. Keeps only whitelisted keys.
export function mergeTeamEdits(existing = {}, edits = {}) {
  const allowed = ["managerName", "contactEmail", "contactPhone"];
  const out = { ...existing };
  for (const k of allowed) {
    if (k in edits) out[k] = edits[k];
  }
  return out;
}

export default mapPosition;

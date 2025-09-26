import { mapPosition, mergeTeamEdits } from "./positionMap";

test("mapPosition maps known codes to full names", () => {
  expect(mapPosition("CM")).toBe("Central Midfielder");
  expect(mapPosition("st")).toBe("Striker");
  expect(mapPosition("GK")).toBe("Goalkeeper");
});

test("mapPosition returns original code when unknown", () => {
  expect(mapPosition("XYZ")).toBe("XYZ");
  expect(mapPosition(null)).toBe("Unknown");
});

test("mergeTeamEdits merges only allowed fields", () => {
  const existing = {
    teamName: "A",
    managerName: "Old",
    contactEmail: "a@b.com",
    secret: "x",
  };
  const edits = { managerName: "New", contactPhone: "1234", secret: "y" };
  const merged = mergeTeamEdits(existing, edits);
  expect(merged.managerName).toBe("New");
  expect(merged.contactPhone).toBe("1234");
  expect(merged.secret).toBe("x"); // should not be overwritten
  expect(merged.teamName).toBe("A");
});

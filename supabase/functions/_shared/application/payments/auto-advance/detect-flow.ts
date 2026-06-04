export function isMotionFlow(
  step_data: Record<string, unknown>,
  current_step: number | null,
): boolean {
  const uscisResult = String(step_data.uscis_official_result || "").toLowerCase();
  const rfeResult = String(step_data.uscis_rfe_result || "").toLowerCase();
  return (
    uscisResult === "denied" ||
    uscisResult === "rejected" ||
    rfeResult === "denied" ||
    rfeResult === "rejected" ||
    (current_step ?? 0) >= 19
  );
}

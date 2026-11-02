// Every status the backend can emit, mapped to one of three visual tones.
// alert = needs attention now, warn = degraded, ok = settled, muted = neutral.
const TONES = {
  CRITICAL: "alert",
  ACTIVE: "alert",
  ERROR: "alert",
  HIGH: "alert",
  DEGRADED: "warn",
  WARNING: "warn",
  MEDIUM: "warn",
  HEALTHY: "ok",
  RESOLVED: "ok",
  NORMAL: "ok",
  LOW: "muted",
  INFO: "muted"
};

export function toneOf(status) {
  return TONES[String(status || "").toUpperCase()] || "muted";
}

export function rootCauseOf(analysis) {
  const raw = analysis?.root_cause_explanation || analysis?.root_cause;

  if (!raw || typeof raw === "string") {
    return raw
      ? {
          root_cause: raw,
          confidence: analysis?.confidence || "low",
          reason: analysis?.reason || "",
          evidence: analysis?.evidence || [],
          recommendations: analysis?.recommendations || [],
          rca_score: 0
        }
      : null;
  }

  return raw.root_cause ? raw : null;
}

import { rootCauseOf } from "../../lib/status";

/**
 * Plain, derived guidance for one service. Returns a list of strings.
 */
export function nextSteps({ service, isRootCause, analysis, services, topMessage }) {
  if (isRootCause) {
    const recommended = rootCauseOf(analysis)?.recommendations || [];

    if (recommended.length) {
      return recommended;
    }
  }

  const steps = [];

  const unhealthyUpstream = (service.depends_on || [])
    .map((name) => services.find((item) => item.service === name))
    .filter((item) => item && item.health !== "HEALTHY");

  for (const upstream of unhealthyUpstream) {
    steps.push(
      `Check ${upstream.service} first. It is ${upstream.health.toLowerCase()} and ${service.service} depends on it.`
    );
  }

  if (service.total_failures > 0 && topMessage) {
    steps.push(`Investigate the most frequent error: "${topMessage}".`);
  }

  if (!steps.length) {
    steps.push("No action needed. This service has no recorded failures.");
  }

  return steps;
}

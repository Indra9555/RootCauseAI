import { useEffect, useState } from "react";
import { getJson, incidentPaths } from "../api/client";

/**
 * Loads one incident (summary, timeline, RCA analysis).
 *
 * `refreshKey` changes on every dashboard poll so an open incident stays
 * live. A response is applied only if it still belongs to the incident
 * the user is looking at, so a slow request can never overwrite a newer one.
 */
export default function useIncidentDetail(incidentId, refreshKey) {
  const [state, setState] = useState({
    id: null,
    detail: null,
    notFound: false
  });

  useEffect(() => {
    if (!incidentId) {
      return undefined;
    }

    let cancelled = false;
    const paths = incidentPaths(incidentId);

    async function load() {
      try {
        const [incident, events, analysis] = await Promise.all([
          getJson(paths.summary),
          getJson(paths.events),
          getJson(paths.analysis)
        ]);

        if (!cancelled) {
          setState({
            id: incidentId,
            detail: { incident, events, analysis },
            notFound: false
          });
        }
      } catch (error) {
        if (!cancelled) {
          setState((previous) => ({
            id: incidentId,
            detail:
              previous.id === incidentId ? previous.detail : null,
            notFound: error?.response?.status === 404
          }));
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [incidentId, refreshKey]);

  const ready = Boolean(incidentId) && state.id === incidentId;

  return {
    detail: ready ? state.detail : null,
    notFound: ready && state.notFound,
    loading: Boolean(incidentId) && !ready
  };
}

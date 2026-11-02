import { useCallback, useEffect, useRef, useState } from "react";
import { getJson } from "../api/client";

export const POLL_INTERVAL_MS = 5000;

const EMPTY_SERVICES = {
  services: [],
  summary: { total: 0, healthy: 0, degraded: 0, critical: 0 }
};

const EMPTY_GRAPH = {
  root_cause: null,
  services: [],
  dependencies: []
};

const INITIAL = {
  analysis: null,
  logs: [],
  intelligence: null,
  incidents: [],
  services: EMPTY_SERVICES,
  graph: EMPTY_GRAPH,
  anomalies: null
};

// key in state -> endpoint
const SOURCES = [
  ["analysis", "/api/telemetry/analysis"],
  ["logs", "/api/telemetry/logs"],
  ["intelligence", "/api/telemetry/intelligence"],
  ["incidents", "/api/incidents"],
  ["services", "/api/services"],
  ["graph", "/api/dependencies"],
  ["anomalies", "/api/telemetry/anomalies"]
];

export default function useDashboardData() {
  const [data, setData] = useState(INITIAL);
  const [status, setStatus] = useState({
    loaded: false,
    online: false,
    updatedAt: null
  });
  const [refreshing, setRefreshing] = useState(false);

  const inFlight = useRef(false);

  const load = useCallback(async () => {
    // Several endpoints re-analyse all telemetry. Never start a new
    // round while the previous one is still running.
    if (inFlight.current) {
      return;
    }

    inFlight.current = true;

    try {
      const results = await Promise.allSettled(
        SOURCES.map(([, path]) => getJson(path))
      );

      const patch = {};
      let succeeded = 0;

      results.forEach((result, index) => {
        if (result.status === "fulfilled") {
          patch[SOURCES[index][0]] = result.value;
          succeeded += 1;
        }
      });

      if (succeeded > 0) {
        setData((previous) => ({ ...previous, ...patch }));
      }

      setStatus((previous) => ({
        loaded: true,
        online: succeeded > 0,
        updatedAt: succeeded > 0 ? new Date() : previous.updatedAt
      }));
    } finally {
      inFlight.current = false;
    }
  }, []);

  useEffect(() => {
    load();

    const timer = setInterval(() => {
      if (!document.hidden) {
        load();
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [load]);

  const refresh = useCallback(async () => {
    setRefreshing(true);

    try {
      await load();
    } finally {
      setRefreshing(false);
    }
  }, [load]);

  return { data, status, refreshing, refresh };
}

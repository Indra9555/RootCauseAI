import axios from "axios";

export const API_URL =
  import.meta.env?.VITE_API_URL || "http://127.0.0.1:8000";

const http = axios.create({
  baseURL: API_URL,
  timeout: 15000
});

export async function getJson(path) {
  const response = await http.get(path);
  return response.data;
}

export const incidentPaths = (id) => {
  const safe = encodeURIComponent(id);

  return {
    summary: `/api/incidents/${safe}`,
    events: `/api/incidents/${safe}/events`,
    analysis: `/api/incidents/${safe}/analysis`
  };
};

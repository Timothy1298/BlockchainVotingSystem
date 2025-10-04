import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_BASE_URL || "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
});

// Automatically attach token
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

// Specific API methods
export const getCandidates = () => API.get("/votes/candidates");
export const castVote = (candidateId) => API.post("/votes/vote", { candidateId });

export default API;

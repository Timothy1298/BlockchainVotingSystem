import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api", // your backend base URL
  headers: { "Content-Type": "application/json" }
});

// Attach token automatically if logged in
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

export const getCandidates = () => API.get("/votes/candidates");
export const castVote = (candidateId) => API.post("/votes/vote", { candidateId });
export default API;

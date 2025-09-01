import axios from "axios";

// For local dev → backend at port 5000
// Later in production → Render URL will replace this
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

export default API;

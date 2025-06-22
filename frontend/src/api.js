import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:5000/api",
});

export const fetchQuestions = () => API.get("/questions");
export const analyzeResponse = (response) => API.post("/analyze-response", { response });

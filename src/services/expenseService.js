import API from "./api";

export const getExpenses = () => API.get("/expenses");
export const createExpense = (data) => API.post("/expenses", data);
export const updateExpense = (id, data) => API.patch(`/expenses/${id}`, data);
export const deleteExpense = (id) => API.delete(`/expenses/${id}`);
export const getSummary = () => API.get("/expenses/summary/by-category");

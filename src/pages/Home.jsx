import { useEffect, useState } from "react";
import {
  getExpenses,
  createExpense,
  deleteExpense,
  updateExpense,
  getSummary,
} from "../services/expenseService";
import SummaryChart from "../components/SummaryChart";

export default function Home() {
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState([]);
  const [form, setForm] = useState({ title: "", amount: "", category: "food" });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const res = await getExpenses();
    setExpenses(res.data);
    const sum = await getSummary();
    setSummary(sum.data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || form.amount <= 0) {
      alert("Please enter a valid title and amount");
      return;
    }

    if (editingId) {
      await updateExpense(editingId, { ...form, amount: Number(form.amount) });
      setEditingId(null);
    } else {
      await createExpense({ ...form, amount: Number(form.amount) });
    }

    setForm({ title: "", amount: "", category: "food" });
    loadData();
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this expense?")) {
      await deleteExpense(id);
      loadData();
    }
  };

  const handleEdit = (exp) => {
    setForm({ title: exp.title, amount: exp.amount, category: exp.category });
    setEditingId(exp._id);
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">💰 Expense Tracker</h1>

      {/* Add / Edit Expense Form */}
      <form
        onSubmit={handleSubmit}
        className="mb-6 flex gap-2 bg-white shadow p-4 rounded"
      >
        <input
          type="text"
          placeholder="Title"
          className="border p-2 flex-1 rounded"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />
        <input
          type="number"
          placeholder="Amount"
          className="border p-2 w-28 rounded"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
          required
          min="1"
        />
        <select
          className="border p-2 rounded"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        >
          <option value="food">Food</option>
          <option value="transport">Transport</option>
          <option value="entertainment">Entertainment</option>
          <option value="utilities">Utilities</option>
          <option value="shopping">Shopping</option>
          <option value="health">Health</option>
          <option value="other">Other</option>
        </select>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded">
          {editingId ? "Update" : "Add"}
        </button>
      </form>

      {/* Expenses List */}
      <div className="bg-white shadow rounded p-4">
        <h2 className="text-xl font-semibold mb-3">📒 Expenses</h2>
        {loading ? (
          <p>Loading...</p>
        ) : expenses.length === 0 ? (
          <p className="text-gray-500">No expenses yet. Add one above!</p>
        ) : (
          <ul className="space-y-2">
            {expenses.map((exp) => (
              <li
                key={exp._id}
                className="flex justify-between items-center border p-2 rounded"
              >
                <span>
                  <span className="font-medium">{exp.title}</span> - ₹{exp.amount}{" "}
                  <span className="text-gray-500">({exp.category})</span>
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(exp)}
                    className="bg-yellow-500 text-white px-2 py-1 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(exp._id)}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Summary + Chart */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-2">📊 Summary</h2>
        <ul className="mb-4">
          {summary.map((s) => (
            <li key={s.category}>
              {s.category}: ₹{s.total}
            </li>
          ))}
        </ul>
        <SummaryChart data={summary} />
      </div>
    </div>
  );
}

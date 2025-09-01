import { useEffect, useState } from "react";
import {
  getExpenses,
  createExpense,
  deleteExpense,
  updateExpense,
  
} from "../services/expenseService";
import SummaryChart from "../components/SummaryChart";

export default function Home() {
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState([]);
  const [form, setForm] = useState({ 
    title: "", 
    amount: "", 
    category: "food",
    date: new Date().toISOString().split('T')[0]
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    category: "all",
    month: new Date().getMonth(),
    year: new Date().getFullYear()
  });
  const [view, setView] = useState("list"); // "list" or "chart"

  const categories = [
    "food", "transport", "entertainment", "utilities", 
    "shopping", "health", "other"
  ];

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getExpenses();
      let filteredExpenses = res.data;
      
      // Apply filters
      if (filter.category !== "all") {
        filteredExpenses = filteredExpenses.filter(exp => exp.category === filter.category);
      }
      
      // Filter by month and year if date exists
      filteredExpenses = filteredExpenses.filter(exp => {
        if (!exp.date) return true;
        const expDate = new Date(exp.date);
        return expDate.getMonth() === filter.month && expDate.getFullYear() === filter.year;
      });
      
      setExpenses(filteredExpenses);
      
      // Calculate summary from filtered expenses
      const categoryTotals = {};
      filteredExpenses.forEach(exp => {
        if (!categoryTotals[exp.category]) {
          categoryTotals[exp.category] = 0;
        }
        categoryTotals[exp.category] += exp.amount;
      });
      
      const formattedSummary = Object.keys(categoryTotals).map(category => ({
        category,
        total: categoryTotals[category]
      }));
      
      setSummary(formattedSummary);
    } catch (error) {
      console.error("Error loading data:", error);
      alert("Failed to load expenses");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [filter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || form.amount <= 0) {
      alert("Please enter a valid title and amount");
      return;
    }

    try {
      if (editingId) {
        await updateExpense(editingId, { 
          ...form, 
          amount: Number(form.amount),
          date: form.date ? new Date(form.date).toISOString() : new Date().toISOString()
        });
        setEditingId(null);
      } else {
        await createExpense({ 
          ...form, 
          amount: Number(form.amount),
          date: form.date ? new Date(form.date).toISOString() : new Date().toISOString()
        });
      }

      setForm({ title: "", amount: "", category: "food", date: new Date().toISOString().split('T')[0] });
      loadData();
    } catch (error) {
      console.error("Error saving expense:", error);
      alert("Failed to save expense");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this expense?")) {
      try {
        await deleteExpense(id);
        loadData();
      } catch (error) {
        console.error("Error deleting expense:", error);
        alert("Failed to delete expense");
      }
    }
  };

  const handleEdit = (exp) => {
    const expenseDate = exp.date ? new Date(exp.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    setForm({ 
      title: exp.title, 
      amount: exp.amount, 
      category: exp.category,
      date: expenseDate
    });
    setEditingId(exp._id);
  };

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const currentMonth = months[filter.month];
  
  // Generate years for filter (last 5 years)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">💰 Advanced Expense Tracker</h1>

      {/* Filters */}
      <div className="bg-white shadow p-4 rounded mb-6">
        <h2 className="text-xl font-semibold mb-3">🔍 Filters</h2>
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              className="border p-2 rounded"
              value={filter.category}
              onChange={(e) => setFilter({...filter, category: e.target.value})}
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Month</label>
            <select
              className="border p-2 rounded"
              value={filter.month}
              onChange={(e) => setFilter({...filter, month: parseInt(e.target.value)})}
            >
              {months.map((month, index) => (
                <option key={month} value={index}>{month}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Year</label>
            <select
              className="border p-2 rounded"
              value={filter.year}
              onChange={(e) => setFilter({...filter, year: parseInt(e.target.value)})}
            >
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Add / Edit Expense Form */}
      <form
        onSubmit={handleSubmit}
        className="mb-6 bg-white shadow p-4 rounded"
      >
        <h2 className="text-xl font-semibold mb-3">
          {editingId ? "✏️ Edit Expense" : "➕ Add New Expense"}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Expense Title"
            className="border p-2 rounded"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
          <input
            type="number"
            placeholder="Amount"
            className="border p-2 rounded"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            required
            min="1"
            step="0.01"
          />
          <select
            className="border p-2 rounded"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
            ))}
          </select>
          <input
            type="date"
            className="border p-2 rounded"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            required
          />
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded mt-4 w-full">
          {editingId ? "Update Expense" : "Add Expense"}
        </button>
        {editingId && (
          <button
            type="button"
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded mt-2 w-full"
            onClick={() => {
              setEditingId(null);
              setForm({ title: "", amount: "", category: "food", date: new Date().toISOString().split('T')[0] });
            }}
          >
            Cancel Edit
          </button>
        )}
      </form>

      {/* View Toggle */}
      <div className="flex justify-center mb-4">
        <div className="bg-white shadow rounded-full p-1">
          <button
            className={`px-4 py-2 rounded-full ${view === "list" ? "bg-blue-600 text-white" : "text-gray-700"}`}
            onClick={() => setView("list")}
          >
            List View
          </button>
          <button
            className={`px-4 py-2 rounded-full ${view === "chart" ? "bg-blue-600 text-white" : "text-gray-700"}`}
            onClick={() => setView("chart")}
          >
            Chart View
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="bg-white shadow rounded p-4 mb-6">
        <h2 className="text-xl font-semibold mb-3">📈 Summary - {currentMonth} {filter.year}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-blue-50 p-4 rounded">
            <div className="text-sm text-blue-600">Total Expenses</div>
            <div className="text-2xl font-bold">₹{totalExpenses.toFixed(2)}</div>
          </div>
          <div className="bg-green-50 p-4 rounded">
            <div className="text-sm text-green-600">Number of Expenses</div>
            <div className="text-2xl font-bold">{expenses.length}</div>
          </div>
          <div className="bg-purple-50 p-4 rounded">
            <div className="text-sm text-purple-600">Average per Expense</div>
            <div className="text-2xl font-bold">
              ₹{expenses.length > 0 ? (totalExpenses / expenses.length).toFixed(2) : "0.00"}
            </div>
          </div>
        </div>
        
        <div className="mb-4">
          <SummaryChart data={summary} />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {summary.map((s) => (
            <div key={s.category} className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <span className="capitalize font-medium">{s.category}</span>
              <span className="font-bold">₹{s.total.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Expenses List */}
      {view === "list" && (
        <div className="bg-white shadow rounded p-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-semibold">📒 Expenses</h2>
            <span className="text-sm text-gray-500">
              {expenses.length} {expenses.length === 1 ? 'expense' : 'expenses'}
            </span>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : expenses.length === 0 ? (
            <p className="text-gray-500 py-4 text-center">No expenses found for the selected filters.</p>
          ) : (
            <div className="space-y-3">
              {expenses.map((exp) => {
                const expenseDate = exp.date ? new Date(exp.date).toLocaleDateString() : "No date";
                return (
                  <div
                    key={exp._id}
                    className="flex justify-between items-center border p-3 rounded hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{exp.title}</div>
                      <div className="text-sm text-gray-600">
                        ₹{exp.amount.toFixed(2)} • {exp.category} • {expenseDate}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(exp)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(exp._id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
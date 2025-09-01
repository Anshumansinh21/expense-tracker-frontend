// src/components/SummaryChart.jsx
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#9b59b6", "#e74c3c"];

export default function SummaryChart({ data }) {
  return (
    <div className="bg-white shadow rounded p-4 mt-4">
      <h2 className="text-xl font-semibold mb-2">📊 Expense Breakdown</h2>
      <PieChart width={400} height={300}>
        <Pie
          data={data}
          dataKey="total"
          nameKey="category"
          cx="50%"
          cy="50%"
          outerRadius={100}
          label
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </div>
  );
}

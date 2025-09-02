// src/components/SummaryChart.jsx
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COLORS = [
  "rgba(0, 136, 254, 0.85)", 
  "rgba(0, 196, 159, 0.85)", 
  "rgba(255, 187, 40, 0.85)", 
  "rgba(255, 128, 66, 0.85)", 
  "rgba(155, 89, 182, 0.85)", 
  "rgba(231, 76, 60, 0.85)",
  "rgba(26, 188, 156, 0.85)",
  "rgba(52, 152, 219, 0.85)"
];

// Custom tooltip component
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 bg-opacity-80 backdrop-blur-sm text-white p-3 rounded-lg border border-gray-700 shadow-xl">
        <p className="font-semibold">{payload[0].name}</p>
        <p className="text-blue-300">₹{payload[0].value.toFixed(2)}</p>
        <p className="text-xs text-gray-400 mt-1">{((payload[0].payload.percent || 0) * 100).toFixed(1)}% of total</p>
      </div>
    );
  }
  return null;
};

// Custom legend component
const renderLegend = (props) => {
  const { payload } = props;

  return (
    <div className="flex flex-wrap justify-center gap-3 mt-4 px-2">
      {payload.map((entry, index) => (
        <div key={`legend-${index}`} className="flex items-center text-xs">
          <div 
            className="w-3 h-3 rounded-sm mr-2 shadow-sm"
            style={{ backgroundColor: entry.color }}
          ></div>
          <span className="text-gray-600">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function SummaryChart({ data }) {
  // Calculate total for percentage display
  const totalExpense = data.reduce((sum, item) => sum + item.total, 0);
  const dataWithPercentage = data.map(item => ({
    ...item,
    percent: item.total / totalExpense
  }));

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-5 shadow-lg border border-gray-200 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-gray-800 flex items-center">
          <span className="mr-2 text-2xl">📊</span>
          Expense Breakdown
        </h2>
        <div className="text-sm font-semibold bg-white py-1 px-3 rounded-full shadow-sm">
          Total: <span className="text-blue-600">${totalExpense.toFixed(2)}</span>
        </div>
      </div>
      
      <div className="h-64 md:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={dataWithPercentage}
              dataKey="total"
              nameKey="category"
              cx="50%"
              cy="50%"
              innerRadius={totalExpense > 0 ? "50%" : "0%"}
              outerRadius="80%"
              paddingAngle={1}
              cornerRadius={8}
              startAngle={90}
              endAngle={-270}
              labelLine={false}
              label={({ name, percent }) => 
                percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ''
              }
            >
              {dataWithPercentage.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]} 
                  stroke="white"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={renderLegend} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      {data.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 rounded-2xl">
          <div className="text-center text-gray-500 p-4">
            <div className="text-4xl mb-2">📊</div>
            <p>No expense data available</p>
          </div>
        </div>
      )}
    </div>
  );
}
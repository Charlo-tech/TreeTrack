"use client";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area, AreaChart } from "recharts";

export function NDVIChart({ data }: { data: Array<{ observation_date: string; ndvi: number | null }> }) {
  const chartData = data.map((d) => ({
    date: d.observation_date.slice(5),
    ndvi: d.ndvi,
  }));
  return (
    <div className="h-[220px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#6b7280" />
          <YAxis domain={[0, 1]} tick={{ fontSize: 11 }} stroke="#6b7280" />
          <Tooltip />
          <Area type="monotone" dataKey="ndvi" stroke="#059669" fill="#10b981" fillOpacity={0.18} strokeWidth={2} dot={{ r: 3 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

"use client";

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const data = [
  { name: 'Jan', households: 4000, alerts: 240 },
  { name: 'Feb', households: 6000, alerts: 139 },
  { name: 'Mar', households: 9800, alerts: 980 },
  { name: 'Apr', households: 12000, alerts: 390 },
  { name: 'May', households: 18000, alerts: 480 },
  { name: 'Jun', households: 23900, alerts: 380 },
  { name: 'Jul', households: 34900, alerts: 430 },
  { name: 'Aug', households: 45000, alerts: 12 },
];

export function AdminChart() {
  return (
    <div className="h-[300px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorHouseholds" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorAlerts" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f87171" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#f87171" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
          <XAxis dataKey="name" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" />
          <Tooltip 
            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
            itemStyle={{ color: '#e2e8f0' }}
          />
          <Area type="monotone" dataKey="households" stroke="#38bdf8" fillOpacity={1} fill="url(#colorHouseholds)" />
          <Area type="monotone" dataKey="alerts" stroke="#f87171" fillOpacity={1} fill="url(#colorAlerts)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

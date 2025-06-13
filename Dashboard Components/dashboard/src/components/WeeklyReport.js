import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatDuration } from '../utils';

const WeeklyReport = ({ data }) => {
  const chartData = [
    { name: 'Mon', productive: 0, unproductive: 0 },
    { name: 'Tue', productive: 0, unproductive: 0 },
    { name: 'Wed', productive: 0, unproductive: 0 },
    { name: 'Thu', productive: 0, unproductive: 0 },
    { name: 'Fri', productive: 0, unproductive: 0 },
    { name: 'Sat', productive: 0, unproductive: 0 },
    { name: 'Sun', productive: 0, unproductive: 0 }
  ];

  const dayMap = { 1: 'Sun', 2: 'Mon', 3: 'Tue', 4: 'Wed', 5: 'Thu', 6: 'Fri', 7: 'Sat' };

  data.forEach(item => {
    const dayName = dayMap[item.day];
    const dayIndex = chartData.findIndex(d => d.name === dayName);
    if (dayIndex !== -1) {
      chartData[dayIndex].productive = item.productiveTime / 3600;
      chartData[dayIndex].unproductive = item.unproductiveTime / 3600;
    }
  });

  return (
    <div className="report-card">
      <h2>Weekly Productivity Report</h2>
      <div style={{ height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
            <Tooltip formatter={(value) => [`${value} hours`, value > 1 ? 'Productive' : 'Unproductive']} />
            <Legend />
            <Bar dataKey="productive" fill="#2ecc71" name="Productive" />
            <Bar dataKey="unproductive" fill="#e74c3c" name="Unproductive" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default WeeklyReport;

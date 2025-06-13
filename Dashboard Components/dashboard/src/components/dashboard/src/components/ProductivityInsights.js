import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatDuration } from '../utils';

const COLORS = ['#2ecc71', '#e74c3c'];

const ProductivityInsights = ({ data }) => {
  const pieData = [
    { name: 'Productive', value: data.totalProductive },
    { name: 'Unproductive', value: data.totalUnproductive }
  ];

  return (
    <div className="insights-card">
      <h2>Productivity Breakdown</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        <div style={{ width: '50%', height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatDuration(value)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div style={{ width: '50%', padding: '20px' }}>
          <h3>Top Productive Sites</h3>
          <ul>
            {data.topProductive.map((site, index) => (
              <li key={index}>
                {site.domain}: {formatDuration(site.duration)}
              </li>
            ))}
          </ul>

          <h3>Top Unproductive Sites</h3>
          <ul>
            {data.topUnproductive.map((site, index) => (
              <li key={index}>
                {site.domain}: {formatDuration(site.duration)}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ProductivityInsights;

import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

const COMPARISON_DATA = [
  { name: 'Follower Growth', you: 12, competitorA: 8, competitorB: 15 },
  { name: 'Engagement %', you: 5.8, competitorA: 3.2, competitorB: 4.5 },
  { name: 'Avg Reach (k)', you: 125, competitorA: 98, competitorB: 140 },
  { name: 'Posts/Week', you: 5, competitorA: 7, competitorB: 3 },
];

const CompetitorComparison: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Competitor Analysis</h1>
        <p className="text-slate-400">Benchmark your performance against top competitors.</p>
      </div>

      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-6">Head-to-Head Comparison</h3>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={COMPARISON_DATA} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                cursor={{fill: '#334155', opacity: 0.2}}
                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
              />
              <Legend />
              <Bar name="You" dataKey="you" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar name="Competitor A" dataKey="competitorA" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
              <Bar name="Competitor B" dataKey="competitorB" fill="#475569" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default CompetitorComparison;
'use client';

const MOCK_LEADERBOARD = [
  { rank: 1, address: 'erd1qqqqqqqqqqqqqpgq...abcd', score: 15420, tier: 'Diamond', icon: '💎', orders: 142 },
  { rank: 2, address: 'erd1spy...7x2q', score: 8210, tier: 'Gold', icon: '🥇', orders: 89 },
  { rank: 3, address: 'erd1xza...p9nm', score: 7150, tier: 'Gold', icon: '🥇', orders: 76 },
  { rank: 4, address: 'erd1v4r...3d8k', score: 3420, tier: 'Silver', icon: '🥈', orders: 41 },
  { rank: 5, address: 'erd1m9q...l5tw', score: 950, tier: 'Bronze', icon: '🥉', orders: 12 },
];

export default function LeaderboardView() {
  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-800 bg-gray-950 flex justify-between items-center">
        <h2 className="font-bold flex items-center gap-2">
          <span>🏅</span> Global Agent Leaderboard
        </h2>
        <span className="text-xs text-gray-400">On-chain Trust Scores</span>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-800/50 text-gray-400">
            <tr>
              <th className="px-4 py-3 font-medium">Rank</th>
              <th className="px-4 py-3 font-medium">Agent Address</th>
              <th className="px-4 py-3 font-medium">Tier</th>
              <th className="px-4 py-3 font-medium text-right">Completed Orders</th>
              <th className="px-4 py-3 font-medium text-right">Trust Score (XP)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {MOCK_LEADERBOARD.map((agent) => (
              <tr key={agent.rank} className="hover:bg-gray-800/30 transition-colors">
                <td className="px-4 py-4 font-bold text-gray-300">#{agent.rank}</td>
                <td className="px-4 py-4 font-mono text-blue-400">{agent.address}</td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-1.5">
                    <span>{agent.icon}</span>
                    <span>{agent.tier}</span>
                  </div>
                </td>
                <td className="px-4 py-4 text-right">{agent.orders}</td>
                <td className="px-4 py-4 text-right font-bold text-green-400">{agent.score.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

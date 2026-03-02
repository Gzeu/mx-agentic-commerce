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
    <div className="bg-[#1A1D24] rounded-3xl border border-white/5 overflow-hidden shadow-2xl relative">
      
      {/* Decorative Blur */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="px-8 py-6 border-b border-white/5 bg-black/20 flex justify-between items-center relative z-10">
        <div>
          <h2 className="text-2xl font-extrabold flex items-center gap-3 text-white">
            <span className="p-2 bg-white/5 rounded-xl border border-white/10">🏅</span> 
            Global Agent Leaderboard
          </h2>
          <p className="text-sm text-white/50 mt-1 ml-14">Ranked by On-chain Trust Scores</p>
        </div>
      </div>
      
      <div className="overflow-x-auto relative z-10">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-black/40 text-white/40 uppercase text-xs tracking-wider font-semibold">
            <tr>
              <th className="px-8 py-4">Rank</th>
              <th className="px-8 py-4">Agent Identity</th>
              <th className="px-8 py-4">Tier</th>
              <th className="px-8 py-4 text-right">Orders</th>
              <th className="px-8 py-4 text-right">Trust Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {MOCK_LEADERBOARD.map((agent) => (
              <tr key={agent.rank} className="hover:bg-white/5 transition-colors group">
                <td className="px-8 py-5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${
                    agent.rank === 1 ? 'bg-yellow-500/20 text-yellow-400' :
                    agent.rank === 2 ? 'bg-gray-300/20 text-gray-300' :
                    agent.rank === 3 ? 'bg-amber-700/20 text-amber-500' :
                    'bg-white/5 text-white/50'
                  }`}>
                    #{agent.rank}
                  </div>
                </td>
                <td className="px-8 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10"></div>
                    <span className="font-mono text-blue-400 group-hover:text-blue-300 transition-colors">{agent.address}</span>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <div className="flex items-center gap-2 bg-black/40 w-fit px-3 py-1.5 rounded-lg border border-white/5">
                    <span className="text-lg">{agent.icon}</span>
                    <span className="font-medium text-white/80">{agent.tier}</span>
                  </div>
                </td>
                <td className="px-8 py-5 text-right font-medium text-white/80">{agent.orders}</td>
                <td className="px-8 py-5 text-right">
                  <span className="text-lg font-bold text-green-400">{agent.score.toLocaleString()}</span>
                  <span className="text-xs text-white/30 ml-1">XP</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface ChampionEntry {
  id: string;
  username: string;
  timeTaken: number;
  totalGuesses: number;
  category: string;
  team: string;
  created_at: string;
}

interface ChampionData {
  id: string;
  timetaken: number;
  totalguesses: number;
  created_at: string;
  users: {
    username: string;
  }[];
  categories: {
    name: string;
  }[];
  teams: {
    name: string;
  }[];
}

export function WallOfChampions() {
  const [entries, setEntries] = useState<ChampionEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChampions = async () => {
      try {
        const { data, error } = await supabase
          .from('champions')
          .select(`
            id,
            timetaken,
            totalguesses,
            created_at,
            users:userid (username),
            categories:categoryid (name),
            teams:teamid (name)
          `)
          .order('timetaken', { ascending: true })
          .limit(10);

        if (error) throw error;

        const formattedEntries = (data as ChampionData[]).map(champion => ({
          id: champion.id,
          username: champion.users[0]?.username || 'Anonymous',
          timeTaken: champion.timetaken,
          totalGuesses: champion.totalguesses,
          category: champion.categories[0]?.name || 'Unknown',
          team: champion.teams[0]?.name || 'Unknown',
          created_at: champion.created_at
        }));

        setEntries(formattedEntries);
      } catch (err) {
        console.error('Error fetching champions:', err);
        setError('Failed to load wall of champions');
      } finally {
        setIsLoading(false);
      }
    };

    fetchChampions();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading wall of champions...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6">Wall of Champions</h2>
      <p className="text-gray-600 mb-4">
        These players have successfully guessed all 10 players in their category!
      </p>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rank
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Player
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Guesses
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Team
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {entries.map((entry, index) => (
              <tr key={entry.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  #{index + 1}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {entry.username}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {Math.floor(entry.timeTaken / 60)}:{(entry.timeTaken % 60).toString().padStart(2, '0')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {entry.totalGuesses}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {entry.category}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {entry.team}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(entry.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 
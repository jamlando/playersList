import { useState, useEffect } from 'react';
import { Category, Team } from '../types/database';
import { supabase } from '../lib/supabase';

interface CategorySelectProps {
  onSelect: (categoryId: string, teamId: string, timeLimit: number) => void;
}

export function CategorySelect({ onSelect }: CategorySelectProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*');
      
      if (error) {
        console.error('Error fetching categories:', error);
        setError('Failed to load categories');
        return;
      }

      console.log('Fetched categories:', data);
      setCategories(data || []);
    } catch (err) {
      console.error('Unexpected error fetching categories:', err);
      setError('An unexpected error occurred');
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchTeams = async (categoryId: string) => {
    try {
      console.log('Fetching teams for category:', categoryId);
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('categoryid', categoryId);
      
      if (error) {
        console.error('Error fetching teams:', error);
        setError('Failed to load teams');
        return;
      }

      console.log('Fetched teams:', data);
      setTeams(data || []);
    } catch (err) {
      console.error('Unexpected error fetching teams:', err);
      setError('An unexpected error occurred');
    }
  };

  const handleCategoryChange = (categoryId: string) => {
    console.log('Category changed to:', categoryId);
    setSelectedCategory(categoryId);
    setSelectedTeam('');
    setError(null);
    
    if (categoryId) {
      fetchTeams(categoryId);
    } else {
      setTeams([]);
    }
  };

  const handleStartGame = () => {
    if (selectedCategory && selectedTeam) {
      onSelect(selectedCategory, selectedTeam, 1); // Fixed 1-minute time limit
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">How to Play</h3>
          <ul className="list-disc pl-5 space-y-2 text-gray-700">
            <li>Select a category and team from the dropdowns below</li>
            <li>You'll have 1 minute to guess as many players as possible</li>
            <li>Type a player's name and press Enter or click Guess</li>
            <li>Correct guesses will reveal the player on the list</li>
            <li>You can give up at any time by clicking the Give Up button</li>
            <li>If you guess all 10 players correctly, you'll be added to the Wall of Champions!</li>
          </ul>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {selectedCategory && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Team</label>
              <select
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">Select a team</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={handleStartGame}
            disabled={!selectedCategory || !selectedTeam}
            className="w-full rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:bg-gray-400"
          >
            Start Game (1 Minute)
          </button>
        </div>
      </div>
    </div>
  );
} 
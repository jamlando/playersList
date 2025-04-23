import { useState, useEffect, useCallback } from 'react';
import type { Player, Game } from '../types/database';
import { supabase } from '../lib/supabase';
import { LeaderboardModal } from './LeaderboardModal';

interface GameProps {
  categoryId: string;
  teamId: string;
  timeLimit: number;
  onGameEnd: (game: Game) => void;
  onNewGame: () => void;
}

interface RecentGuess {
  guess: string;
  isCorrect: boolean;
  playerName?: string;
}

export function Game({ categoryId, teamId, timeLimit, onGameEnd, onNewGame }: GameProps) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [guessedPlayers, setGuessedPlayers] = useState<Set<string>>(new Set());
  const [currentGuess, setCurrentGuess] = useState('');
  const [timeLeft, setTimeLeft] = useState(timeLimit * 60);
  const [game, setGame] = useState<Game | null>(null);
  const [correctGuesses, setCorrectGuesses] = useState(0);
  const [incorrectGuesses, setIncorrectGuesses] = useState(0);
  const [recentGuesses, setRecentGuesses] = useState<RecentGuess[]>([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [revealedPlayers, setRevealedPlayers] = useState<Set<string>>(new Set());
  const [isLeaderboardModalOpen, setIsLeaderboardModalOpen] = useState(false);

  const endGame = useCallback(async () => {
    if (!game) return;

    const { data, error } = await supabase
      .from('games')
      .update({
        endtime: new Date(),
        status: 'completed',
        score: correctGuesses - incorrectGuesses,
        correctguesses: correctGuesses,
        incorrectguesses: incorrectGuesses,
      })
      .eq('id', game.id)
      .select()
      .single();

    if (error) {
      console.error('Error ending game:', error);
      return;
    }

    setIsGameOver(true);
    onGameEnd(data);
  }, [game, correctGuesses, incorrectGuesses, onGameEnd]);

  useEffect(() => {
    if (timeLeft <= 0) {
      endGame();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, endGame]);

  useEffect(() => {
    const fetchPlayers = async () => {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('teamid', teamId)
        .order('position', { ascending: true });
      
      if (error) {
        console.error('Error fetching players:', error);
        return;
      }

      setPlayers(data || []);
    };

    const createGame = async () => {
      const { data, error } = await supabase
        .from('games')
        .insert({
          categoryid: categoryId,
          teamid: teamId,
          timelimit: timeLimit,
          starttime: new Date(),
          status: 'in_progress',
          score: 0,
          correctguesses: 0,
          incorrectguesses: 0,
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating game:', error);
        return;
      }

      setGame(data);
    };

    fetchPlayers();
    createGame();
  }, [categoryId, teamId, timeLimit]);

  const handleGuess = async () => {
    if (!currentGuess.trim() || !game || isGameOver) return;

    const guess = currentGuess.trim().toLowerCase();
    const player = players.find(
      (p) => p.name.toLowerCase() === guess || p.name.toLowerCase().endsWith(guess)
    );

    const isCorrect = !!player && !guessedPlayers.has(player.id);

    if (isCorrect) {
      setGuessedPlayers((prev) => new Set([...prev, player.id]));
      setCorrectGuesses((prev) => prev + 1);
    } else {
      setIncorrectGuesses((prev) => prev + 1);
    }

    setRecentGuesses(prev => [
      { guess: currentGuess.trim(), isCorrect, playerName: player?.name },
      ...prev.slice(0, 4)
    ]);

    await supabase.from('game_guesses').insert({
      gameid: game.id,
      playerid: player?.id,
      guess,
      iscorrect: isCorrect,
      timestamp: new Date(),
    });

    setCurrentGuess('');
  };

  const revealPlayer = (playerId: string) => {
    setRevealedPlayers(prev => new Set([...prev, playerId]));
  };

  const handleLeaderboardClick = () => {
    setIsLeaderboardModalOpen(true);
  };

  const handleLeaderboardSuccess = () => {
    setIsLeaderboardModalOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold">
          {isGameOver ? 'Game Over!' : `Time Left: ${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}`}
        </h2>
        <p className="text-lg">
          Correct: {correctGuesses} | Incorrect: {incorrectGuesses}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">Top 10 List</h3>
          <div className="space-y-2">
            {players.map((player) => (
              <div
                key={player.id}
                className={`p-3 rounded-md ${
                  guessedPlayers.has(player.id) || revealedPlayers.has(player.id)
                    ? 'bg-green-100'
                    : 'bg-gray-100'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-medium">#{player.position}</span>
                    <span className="ml-2">
                      {guessedPlayers.has(player.id) || revealedPlayers.has(player.id)
                        ? player.name
                        : '?????'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {(guessedPlayers.has(player.id) || revealedPlayers.has(player.id)) && (
                      <div className="text-sm text-gray-600">
                        <div>{player.points} points</div>
                        <div>{player.yearsplayed}</div>
                      </div>
                    )}
                    {isGameOver && !guessedPlayers.has(player.id) && !revealedPlayers.has(player.id) && (
                      <button
                        onClick={() => revealPlayer(player.id)}
                        className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                      >
                        Reveal
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Recent Guesses</h3>
          <div className="space-y-2">
            {recentGuesses.map((guess, index) => (
              <div
                key={index}
                className={`p-2 rounded-md ${
                  guess.isCorrect ? 'bg-green-100' : 'bg-red-100'
                }`}
              >
                <span className="font-medium">{guess.guess}</span>
                {guess.isCorrect && guess.playerName && (
                  <span className="text-sm text-gray-600 ml-2">
                    → {guess.playerName}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex space-x-2">
        <input
          type="text"
          value={currentGuess}
          onChange={(e) => setCurrentGuess(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleGuess()}
          placeholder={isGameOver ? "Game Over" : "Enter player name..."}
          disabled={isGameOver}
          className={`flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
            isGameOver ? 'bg-gray-100' : ''
          }`}
        />
        <button
          onClick={handleGuess}
          disabled={isGameOver}
          className={`px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 ${
            isGameOver ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          Guess
        </button>
      </div>

      {isGameOver && (
        <div className="flex justify-center space-x-4 mt-4">
          <button
            onClick={onNewGame}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Play Another Game
          </button>
          <button
            onClick={handleLeaderboardClick}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            View Leaderboard
          </button>
        </div>
      )}

      <LeaderboardModal
        isOpen={isLeaderboardModalOpen}
        onClose={() => setIsLeaderboardModalOpen(false)}
        onSuccess={handleLeaderboardSuccess}
      />
    </div>
  );
} 
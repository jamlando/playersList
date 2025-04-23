'use client';

import { useState } from 'react';
import { CategorySelect } from './components/CategorySelect';
import { Game } from './components/Game';
import type { Game as GameType } from './types/database';

export default function Home() {
  const [gameState, setGameState] = useState<{
    categoryId: string;
    teamId: string;
    timeLimit: number;
  } | null>(null);
  const [completedGame, setCompletedGame] = useState<GameType | null>(null);

  const handleGameStart = (categoryId: string, teamId: string, timeLimit: number) => {
    setGameState({ categoryId, teamId, timeLimit });
    setCompletedGame(null);
  };

  const handleGameEnd = (game: GameType) => {
    setCompletedGame(game);
  };

  const handleNewGame = () => {
    setGameState(null);
    setCompletedGame(null);
  };

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">The Players List</h1>
        
        {!gameState && !completedGame && (
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">Start a New Game</h2>
            <CategorySelect onSelect={handleGameStart} />
          </div>
        )}

        {gameState && (
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <Game
              categoryId={gameState.categoryId}
              teamId={gameState.teamId}
              timeLimit={gameState.timeLimit}
              onGameEnd={handleGameEnd}
              onNewGame={handleNewGame}
            />
          </div>
        )}

        {completedGame && (
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">Game Over!</h2>
            <div className="space-y-4">
              <p className="text-lg">
                Final Score: {completedGame.score}
              </p>
              <p className="text-lg">
                Correct Guesses: {completedGame.correctGuesses}
              </p>
              <p className="text-lg">
                Incorrect Guesses: {completedGame.incorrectGuesses}
              </p>
              <button
                onClick={() => setCompletedGame(null)}
                className="w-full rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
              >
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

import { useEffect, useState } from 'react';

export function Celebration() {
  const [confetti, setConfetti] = useState<Array<{ x: number; y: number; color: string }>>([]);

  useEffect(() => {
    // Create initial confetti
    const initialConfetti = Array.from({ length: 50 }, () => ({
      x: Math.random() * window.innerWidth,
      y: -20,
      color: `hsl(${Math.random() * 360}, 50%, 50%)`
    }));
    setConfetti(initialConfetti);

    // Animation
    const interval = setInterval(() => {
      setConfetti(prev => 
        prev.map(c => ({
          ...c,
          y: c.y + 5,
          x: c.x + (Math.random() - 0.5) * 2
        })).filter(c => c.y < window.innerHeight)
      );
    }, 50);

    // Cleanup after 3 seconds
    const timeout = setTimeout(() => {
      clearInterval(interval);
      setConfetti([]);
    }, 3000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {confetti.map((c, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            left: c.x,
            top: c.y,
            backgroundColor: c.color,
            transform: 'translate(-50%, -50%)'
          }}
        />
      ))}
    </div>
  );
} 
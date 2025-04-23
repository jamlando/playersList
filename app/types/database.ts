export type Category = {
  id: string;
  name: string;
  description: string;
  teams: Team[];
};

export type Team = {
  id: string;
  name: string;
  categoryid: string;
  players: Player[];
};

export type Player = {
  id: string;
  name: string;
  teamid: string;
  position: number;
  points: number;
  yearsplayed: string;
};

export type Game = {
  id: string;
  userid: string;
  categoryid: string;
  teamid: string;
  timelimit: number;
  starttime: Date;
  endtime: Date | null;
  score: number;
  correctguesses: number;
  incorrectguesses: number;
  status: 'pending' | 'in_progress' | 'completed';
};

export type GameGuess = {
  id: string;
  gameid: string;
  playerid: string;
  guess: string;
  iscorrect: boolean;
  timestamp: Date;
}; 
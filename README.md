# The Players List

A sports trivia game where users guess players from their favorite teams within a time limit.

## Features

- Select from different sports categories (NBA, NFL, MLB, NHL)
- Choose specific teams within each category
- Set custom time limits (3, 5, or 10 minutes)
- Real-time scoring and feedback
- Track correct and incorrect guesses
- Mobile-friendly interface

## Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- Supabase (Database & Authentication)
- shadcn/ui Components

## Prerequisites

- Node.js 18+ installed
- Supabase account and project
- npm or yarn package manager

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/players-list.git
cd players-list
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up the database:
   - Create a new Supabase project
   - Run the following SQL in the Supabase SQL editor:

```sql
-- Create categories table
CREATE TABLE categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT
);

-- Create teams table
CREATE TABLE teams (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  categoryId UUID REFERENCES categories(id)
);

-- Create players table
CREATE TABLE players (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  teamId UUID REFERENCES teams(id),
  position INTEGER NOT NULL,
  points INTEGER NOT NULL
);

-- Create games table
CREATE TABLE games (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  userId UUID REFERENCES auth.users(id),
  categoryId UUID REFERENCES categories(id),
  teamId UUID REFERENCES teams(id),
  timeLimit INTEGER NOT NULL,
  startTime TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  endTime TIMESTAMP WITH TIME ZONE,
  score INTEGER DEFAULT 0,
  correctGuesses INTEGER DEFAULT 0,
  incorrectGuesses INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending'
);

-- Create game_guesses table
CREATE TABLE game_guesses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  gameId UUID REFERENCES games(id),
  playerId UUID REFERENCES players(id),
  guess TEXT NOT NULL,
  isCorrect BOOLEAN NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new).

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

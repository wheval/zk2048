# ZK2048 Frontend

A blockchain-enabled 2048 game built with Next.js and Starknet integration.

## 🎮 Features

- **Classic 2048 Gameplay**: Move tiles and combine numbers to reach 2048
- **Blockchain Integration**: Connect your Starknet wallet to save high scores on-chain
- **Leaderboard**: Compete with other players on a global leaderboard
- **Player Stats**: Track your best scores, moves, and games played
- **Responsive Design**: Beautiful UI that works on desktop and mobile

## 🚀 Deployed Contract

The game is connected to a deployed Starknet contract on Sepolia testnet:

**Contract Address**: `0x0489559e3ad7ea6591efb79e0f4a3ff4c7485c8895fce10ebb45fad339fc519d`

## 🔧 Getting Started

### Prerequisites

- Node.js 18+ and npm/pnpm
- A Starknet wallet (ArgentX or Braavos)
- Some ETH on Starknet Sepolia testnet (for gas fees)

### Installation

   ```bash
# Install dependencies
npm install
# or
   pnpm install

# Run development server
npm run dev
# or
   pnpm dev
   ```

Open [http://localhost:3000](http://localhost:3000) to play the game.

## 🎯 How to Play

1. **Local Play**: You can play without connecting a wallet. Scores are saved locally.

2. **Blockchain Play**: 
   - Click "Connect Wallet" to connect your Starknet wallet
   - Make sure you're on Starknet Sepolia testnet
   - Your high scores will be saved to the blockchain
   - View the global leaderboard to see how you rank

3. **Game Controls**:
   - Use arrow keys or WASD to move tiles
   - Combine tiles with the same number to reach 2048
   - Game ends when no more moves are possible

## 🔗 Blockchain Features

### Smart Contract Functions

- **save_player_score**: Save your current game score
- **mark_game_completed**: Mark a completed game with final score
- **get_player_best_score**: Retrieve your best score from the blockchain
- **get_leaderboard**: View top 10 players globally
- **get_player_stats**: Get detailed player statistics

### On-Chain Data

- ✅ Player high scores
- ✅ Global leaderboard (top 10)
- ✅ Player statistics (current score, best score, moves)
- ✅ Game completion tracking

## 🛠 Development

### Build

   ```bash
npm run build
```

### Deploy

The app is deployed automatically to Vercel. Any push to the main branch triggers a new deployment.

## 📝 Technical Details

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Blockchain**: Starknet (Cairo smart contracts)
- **State Management**: Zustand
- **Animations**: Framer Motion
- **Wallet Integration**: get-starknet-core

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License. 
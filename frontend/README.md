# ZK2048 - Starknet Frontend Integration

A 2048 game with Starknet blockchain integration for on-chain score storage, leaderboards, and wallet-based player sessions.

## 🌟 Features

- **Wallet Connection**: Connect with Argent X or Braavos wallet
- **On-chain Score Storage**: Save your game scores to Starknet
- **Global Leaderboard**: Compete with players worldwide
- **Real-time Updates**: Live transaction status and leaderboard updates
- **Player Statistics**: Track your best scores and game history

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- A Starknet wallet (Argent X or Braavos)
- Some ETH on Starknet Sepolia testnet for transactions

### Installation

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Deploy the smart contract first:**
   ```bash
   cd ../contract
   scarb build
   # Deploy to Starknet (see contract README for details)
   ```

3. **Update contract configuration:**
   Edit `lib/contract-config.ts` and update the contract address:
   ```typescript
   export const CONTRACT_ADDRESSES = {
     ZK2048_GAME: "0xYOUR_DEPLOYED_CONTRACT_ADDRESS", // Update this!
   }
   ```

4. **Start the development server:**
   ```bash
   pnpm dev
   ```

## 🎮 How to Play

1. **Connect Wallet**: Click "Connect" to connect your Starknet wallet
2. **Play the Game**: Use arrow keys to move tiles and reach 2048
3. **Save Score**: Click "Save to Starknet" to store your score on-chain
4. **View Leaderboard**: Check your ranking among all players
5. **Track Stats**: Monitor your best scores and game history

## 🔧 Architecture

### Components Structure

- **Game Components**:
  - `Game`: Main game component with wallet integration
  - `GameBoard`: The 2048 game board
  - `WalletStatus`: Wallet connection and player stats
  - `Leaderboard`: Global player rankings

### Hooks

- **`useWallet`**: Wallet connection and player data
- **`useSaveScore`**: Score saving with transaction handling
- **`useLeaderboard`**: Leaderboard data and rankings

### State Management

- **Game Store** (`useGameStore`): 2048 game logic and state
- **Starknet Store** (`useStarknetStore`): Blockchain interactions

## 🌐 Smart Contract Integration

### Contract Functions

- `save_player_score(score: u256, moves: u256)`: Save game score
- `get_player_best_score(player: ContractAddress)`: Get player's best score
- `get_player_stats(player: ContractAddress)`: Get detailed player statistics
- `get_leaderboard()`: Get top 10 global scores

### Events

- `NewHighScore`: Emitted when a player sets a new personal best
- `GameCompleted`: Emitted when a game session is completed
- `LeaderboardUpdated`: Emitted when leaderboard rankings change

## 🛠️ Development

### Environment Setup

1. **Install Starknet Dependencies**:
   ```bash
   pnpm add starknet get-starknet-core
   ```

2. **Configure Network**:
   The app is configured to use Starknet Sepolia testnet. Update `lib/contract-config.ts` for different networks.

### Testing

- **Game Logic**: Test 2048 game mechanics locally
- **Wallet Integration**: Test with Starknet wallet in browser
- **Contract Calls**: Verify smart contract interactions

### Deployment

1. **Build for production**:
   ```bash
   pnpm build
   ```

2. **Deploy to hosting platform** (Vercel, Netlify, etc.)

## 📱 Mobile Support

The game is fully responsive and supports:
- Touch controls for mobile devices
- Wallet connection on mobile browsers
- Optimized UI for small screens

## 🔐 Security

- **Wallet Security**: Only connects to approved Starknet wallets
- **Transaction Safety**: All transactions require user approval
- **Data Validation**: Input validation on both frontend and contract

## 🎯 Transaction Flow

1. **Player Action**: Complete a game and click "Save to Starknet"
2. **Wallet Prompt**: Wallet asks for transaction approval
3. **Contract Call**: Execute `save_player_score` function
4. **Confirmation**: Wait for transaction confirmation
5. **Update UI**: Refresh leaderboard and player stats

## 📊 Error Handling

- **Wallet Not Connected**: Clear prompts to connect wallet
- **Transaction Failures**: Retry options and error messages
- **Network Issues**: Graceful fallbacks and status indicators

## 🔄 Real-time Updates

- **Transaction Status**: Live updates during blockchain interactions
- **Leaderboard Refresh**: Automatic updates after score submissions
- **Player Stats**: Real-time synchronization with contract data

## 🌍 Network Configuration

Currently configured for **Starknet Sepolia Testnet**:
- Chain ID: `0x534e5f5345504f4c4941`
- RPC: Uses public Starknet Sepolia endpoints

## 📝 Notes

- Ensure your contract is deployed before running the frontend
- Update contract addresses in the configuration file
- Test with small amounts on testnet before mainnet deployment
- Keep wallet browser extension updated for best compatibility

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the MIT License. 
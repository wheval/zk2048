use starknet::ContractAddress;

// Define the contract interface
#[starknet::interface]
pub trait IZK2048Game<TContractState> {
    // Player score management
    fn save_player_score(ref self: TContractState, current_score: u32, moves: u32);
    fn get_player_best_score(self: @TContractState, player: ContractAddress) -> u32;
    fn get_player_stats(self: @TContractState, player: ContractAddress) -> (u32, u32, u32); // (current_score, best_score, moves)
    
    // Leaderboard functions
    fn get_leaderboard(self: @TContractState) -> Array<(ContractAddress, u32)>; // Top 10 players
    fn get_leaderboard_position(self: @TContractState, player: ContractAddress) -> u32; // 0 if not in top 10
    
    // Game completion
    fn mark_game_completed(ref self: TContractState, final_score: u32, moves: u32);
    
    // Admin functions
    fn reset_leaderboard(ref self: TContractState);
    fn get_total_games_played(self: @TContractState) -> u32;
}

// Define the contract module
#[starknet::contract]
pub mod ZK2048Game {
    use starknet::ContractAddress;
    use starknet::storage::{
        Map, StoragePointerReadAccess, StoragePointerWriteAccess, 
        StorageMapReadAccess, StorageMapWriteAccess
    };
    use starknet::get_caller_address;

    // Player statistics structure
    #[derive(Drop, Serde, starknet::Store)]
    pub struct PlayerStats {
        current_score: u32,
        best_score: u32,
        moves: u32,
        games_played: u32,
    }

    // Leaderboard entry structure
    #[derive(Drop, Serde, starknet::Store)]
    pub struct LeaderboardEntry {
        player: ContractAddress,
        score: u32,
    }

    // Define storage variables
    #[storage]
    pub struct Storage {
        // Player data mapping
        player_stats: Map<ContractAddress, PlayerStats>,
        
        // Leaderboard (top 10 players)
        leaderboard: Map<u8, LeaderboardEntry>, // index 0-9 for top 10
        leaderboard_size: u8, // current number of entries (max 10)
        
        // Global statistics
        total_games_played: u32,
        
        // Contract admin (deployer)
        admin: ContractAddress,
    }

    // Events
    #[event]
    #[derive(Drop, starknet::Event)]
    pub enum Event {
        NewHighScore: NewHighScore,
        GameCompleted: GameCompleted,
        LeaderboardUpdated: LeaderboardUpdated,
    }

    #[derive(Drop, starknet::Event)]
    pub struct NewHighScore {
        player: ContractAddress,
        old_score: u32,
        new_score: u32,
        moves: u32,
    }

    #[derive(Drop, starknet::Event)]
    pub struct GameCompleted {
        player: ContractAddress,
        final_score: u32,
        moves: u32,
        is_best_score: bool,
    }

    #[derive(Drop, starknet::Event)]
    pub struct LeaderboardUpdated {
        player: ContractAddress,
        score: u32,
        position: u8, // 1-10
    }

    // Constructor
    #[constructor]
    fn constructor(ref self: ContractState) {
        let deployer = get_caller_address();
        self.admin.write(deployer);
        self.leaderboard_size.write(0);
        self.total_games_played.write(0);
    }

    // Implement the contract interface
    #[abi(embed_v0)]
    pub impl ZK2048GameImpl of super::IZK2048Game<ContractState> {
        fn save_player_score(ref self: ContractState, current_score: u32, moves: u32) {
            let caller = get_caller_address();
            assert!(current_score > 0, "Score must be greater than 0");
            assert!(moves > 0, "Moves must be greater than 0");
            
            // Get current player stats
            let mut stats = self.player_stats.read(caller);
            let old_best_score = stats.best_score;
            
            // Update player stats
            stats.current_score = current_score;
            stats.moves = moves;
            
            // Check if it's a new best score
            let is_new_best = current_score > stats.best_score;
            if is_new_best {
                stats.best_score = current_score;
                
                // Emit new high score event
                self.emit(Event::NewHighScore(NewHighScore {
                    player: caller,
                    old_score: old_best_score,
                    new_score: current_score,
                    moves: moves,
                }));
                
                // Update leaderboard if score is high enough
                self._update_leaderboard(caller, current_score);
            }
            
            // Save updated stats
            self.player_stats.write(caller, stats);
        }

        fn get_player_best_score(self: @ContractState, player: ContractAddress) -> u32 {
            self.player_stats.read(player).best_score
        }

        fn get_player_stats(self: @ContractState, player: ContractAddress) -> (u32, u32, u32) {
            let stats = self.player_stats.read(player);
            (stats.current_score, stats.best_score, stats.moves)
        }

        fn get_leaderboard(self: @ContractState) -> Array<(ContractAddress, u32)> {
            let mut leaderboard_array = array![];
            let size = self.leaderboard_size.read();
            
            let mut i: u8 = 0;
            loop {
                if i >= size {
                    break;
                }
                let entry = self.leaderboard.read(i);
                leaderboard_array.append((entry.player, entry.score));
                i += 1;
            };
            
            leaderboard_array
        }

        fn get_leaderboard_position(self: @ContractState, player: ContractAddress) -> u32 {
            let size = self.leaderboard_size.read();
            
            let mut i: u8 = 0;
            let mut position = 0_u32;
            
            loop {
                if i >= size {
                    break;
                }
                let entry = self.leaderboard.read(i);
                if entry.player == player {
                    position = i.into() + 1; // Position is 1-indexed
                    break;
                }
                i += 1;
            };
            
            position // 0 if not in leaderboard
        }

        fn mark_game_completed(ref self: ContractState, final_score: u32, moves: u32) {
            let caller = get_caller_address();
            assert!(final_score > 0, "Final score must be greater than 0");
            assert!(moves > 0, "Moves must be greater than 0");
            
            // Update player stats
            let mut stats = self.player_stats.read(caller);
            let old_best_score = stats.best_score;
            stats.current_score = final_score;
            stats.moves = moves;
            stats.games_played += 1;
            
            let is_best_score = final_score > old_best_score;
            if is_best_score {
                stats.best_score = final_score;
                
                // Emit new high score event
                self.emit(Event::NewHighScore(NewHighScore {
                    player: caller,
                    old_score: old_best_score,
                    new_score: final_score,
                    moves: moves,
                }));
                
                // Update leaderboard
                self._update_leaderboard(caller, final_score);
            }
            
            // Save updated stats
            self.player_stats.write(caller, stats);
            
            // Update global stats
            let total_games = self.total_games_played.read();
            self.total_games_played.write(total_games + 1);
            
            // Emit game completed event
            self.emit(Event::GameCompleted(GameCompleted {
                player: caller,
                final_score: final_score,
                moves: moves,
                is_best_score: is_best_score,
            }));
        }

        fn reset_leaderboard(ref self: ContractState) {
            let caller = get_caller_address();
            let admin = self.admin.read();
            assert!(caller == admin, "Only admin can reset leaderboard");
            
            // Clear leaderboard
            self.leaderboard_size.write(0);
        }

        fn get_total_games_played(self: @ContractState) -> u32 {
            self.total_games_played.read()
        }
    }

    // Private helper functions
    #[generate_trait]
    impl InternalFunctions of InternalFunctionsTrait {
        fn _update_leaderboard(ref self: ContractState, player: ContractAddress, score: u32) {
            let max_leaderboard_size: u8 = 10;
            let current_size = self.leaderboard_size.read();
            
            // Find the position where this score should be inserted
            let mut insert_position: u8 = current_size;
            let mut i: u8 = 0;
            
            loop {
                if i >= current_size {
                    break;
                }
                let entry = self.leaderboard.read(i);
                if score > entry.score {
                    insert_position = i;
                    break;
                }
                // Check if player already exists in leaderboard
                if entry.player == player {
                    // Player already in leaderboard, remove old entry
                    self._remove_leaderboard_entry(i);
                    insert_position = i;
                    break;
                }
                i += 1;
            };
            
            // If leaderboard is full and score doesn't qualify, don't insert
            if insert_position >= max_leaderboard_size {
                return;
            }
            
            // Shift entries down to make room for new entry
            let mut j = if current_size < max_leaderboard_size { current_size } else { max_leaderboard_size - 1 };
            loop {
                if j <= insert_position {
                    break;
                }
                let entry = self.leaderboard.read(j - 1);
                self.leaderboard.write(j, entry);
                j -= 1;
            };
            
            // Insert new entry
            let new_entry = LeaderboardEntry {
                player: player,
                score: score,
            };
            self.leaderboard.write(insert_position, new_entry);
            
            // Update leaderboard size
            if current_size < max_leaderboard_size {
                self.leaderboard_size.write(current_size + 1);
            }
            
            // Emit leaderboard updated event
            self.emit(Event::LeaderboardUpdated(LeaderboardUpdated {
                player: player,
                score: score,
                position: insert_position + 1, // 1-indexed position
            }));
        }

        fn _remove_leaderboard_entry(ref self: ContractState, position: u8) {
            let current_size = self.leaderboard_size.read();
            
            // Shift all entries after the removed position up
            let mut i = position;
            loop {
                if i >= current_size - 1 {
                    break;
                }
                let next_entry = self.leaderboard.read(i + 1);
                self.leaderboard.write(i, next_entry);
                i += 1;
            };
            
            // Decrease leaderboard size
            self.leaderboard_size.write(current_size - 1);
        }
    }
}

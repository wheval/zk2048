use starknet::ContractAddress;
use starknet::contract_address_const;

use snforge_std::{declare, ContractClassTrait, DeclareResultTrait, start_cheat_caller_address, stop_cheat_caller_address};

use contract::IZK2048GameSafeDispatcher;
use contract::IZK2048GameSafeDispatcherTrait;
use contract::IZK2048GameDispatcher;
use contract::IZK2048GameDispatcherTrait;

fn deploy_contract(name: ByteArray) -> ContractAddress {
    let contract = declare(name).unwrap().contract_class();
    let (contract_address, _) = contract.deploy(@ArrayTrait::new()).unwrap();
    contract_address
}

#[test]
fn test_get_player_best_score_initial() {
    let contract_address = deploy_contract("ZK2048Game");
    let dispatcher = IZK2048GameDispatcher { contract_address };
    let player1 = contract_address_const::<0x123>();

    let best_score = dispatcher.get_player_best_score(player1);
    assert(best_score == 0, 'Initial best score should be 0');
}

#[test]
fn test_save_and_get_player_score() {
    let contract_address = deploy_contract("ZK2048Game");
    let dispatcher = IZK2048GameDispatcher { contract_address };
    let player1 = contract_address_const::<0x123>();

    // Save a score as player1
    start_cheat_caller_address(contract_address, player1);
    dispatcher.save_player_score(1000, 50);
    stop_cheat_caller_address(contract_address);

    // Check best score
    let best_score = dispatcher.get_player_best_score(player1);
    assert(best_score == 1000, 'Best score should be 1000');
}

#[test]
fn test_total_games_initial() {
    let contract_address = deploy_contract("ZK2048Game");
    let dispatcher = IZK2048GameDispatcher { contract_address };

    let total_games = dispatcher.get_total_games_played();
    assert(total_games == 0, 'Initial total should be 0');
}

#[test]
fn test_mark_game_completed() {
    let contract_address = deploy_contract("ZK2048Game");
    let dispatcher = IZK2048GameDispatcher { contract_address };
    let player1 = contract_address_const::<0x123>();

    // Mark game completed
    start_cheat_caller_address(contract_address, player1);
    dispatcher.mark_game_completed(2048, 100);
    stop_cheat_caller_address(contract_address);

    // Check updated total games
    let total_games = dispatcher.get_total_games_played();
    assert(total_games == 1, 'Total games should be 1');

    // Check best score
    let best_score = dispatcher.get_player_best_score(player1);
    assert(best_score == 2048, 'Best score should be 2048');
}

#[test]
fn test_leaderboard_empty_initial() {
    let contract_address = deploy_contract("ZK2048Game");
    let dispatcher = IZK2048GameDispatcher { contract_address };

    let leaderboard = dispatcher.get_leaderboard();
    assert(leaderboard.len() == 0, 'Leaderboard should be empty');
}

#[test]
fn test_leaderboard_position_not_found() {
    let contract_address = deploy_contract("ZK2048Game");
    let dispatcher = IZK2048GameDispatcher { contract_address };
    let player1 = contract_address_const::<0x123>();

    let position = dispatcher.get_leaderboard_position(player1);
    assert(position == 0, 'Position should be 0');
}

#[test]
#[feature("safe_dispatcher")]
fn test_invalid_score_zero() {
    let contract_address = deploy_contract("ZK2048Game");
    let safe_dispatcher = IZK2048GameSafeDispatcher { contract_address };
    let player1 = contract_address_const::<0x123>();

    start_cheat_caller_address(contract_address, player1);

    match safe_dispatcher.save_player_score(0, 10) {
        Result::Ok(_) => core::panic_with_felt252('Should have panicked'),
        Result::Err(panic_data) => {
            assert(*panic_data.at(0) == 'Score must be greater than 0', 'Wrong error');
        }
    };

    stop_cheat_caller_address(contract_address);
}

#[test]
#[feature("safe_dispatcher")]
fn test_invalid_moves_zero() {
    let contract_address = deploy_contract("ZK2048Game");
    let safe_dispatcher = IZK2048GameSafeDispatcher { contract_address };
    let player1 = contract_address_const::<0x123>();

    start_cheat_caller_address(contract_address, player1);

    match safe_dispatcher.save_player_score(100, 0) {
        Result::Ok(_) => core::panic_with_felt252('Should have panicked'),
        Result::Err(panic_data) => {
            assert(*panic_data.at(0) == 'Moves must be greater than 0', 'Wrong error');
        }
    };

    stop_cheat_caller_address(contract_address);
}

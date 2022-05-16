// SPDX-Licence-Identifier: MIT

pragma solidity ^0.8.4;

import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


contract Lottery is VRFConsumerBase, Ownable{
    address[] public players;
    uint8 maxPlayers;
    bool public gameStarted;
    uint256 entryFee;
    uint256 public gameId;

    // Verifiable random function (VRF) variables
    bytes32 internal keyHash; // identifies which Chainlink oracle to use
    uint internal fee;       // fee to get random number (link is to chainlink what gas is to ethereum)


    event GameStarted(uint256 gameId, uint8 maxPlayers, uint256 entryFee);
    event PlayerJoined(uint256 gameId, address player);
    event GameEnded(uint256 gameId, address winner,bytes32 requestId);



    constructor(address vrfCoordinator, address linkToken,
        bytes32 vrfKeyHash, uint256 vrfFee)
    VRFConsumerBase(vrfCoordinator, linkToken
    ) {
        keyHash = vrfKeyHash ;
        fee = vrfFee;
        gameStarted = false;
    }

    function getRandomWinner() public returns (bytes32 requestId) {
        require(LINK.balanceOf(address(this)) >= fee, "Not enough LINK in the contract");
        return requestRandomness(keyHash, fee);
    }

    function startGame(uint8 _maxPlayers, uint256 _entryFee) public onlyOwner {
        require(!gameStarted, "Game is currently running");
        delete players;
        maxPlayers = _maxPlayers;
        gameStarted = true;
        entryFee = _entryFee;
        gameId += 1;
        emit GameStarted(gameId, maxPlayers, entryFee);
    }

    function joinGame() public payable {
        require(gameStarted, "Game has not been started yet");
        require(msg.value == entryFee, "Value sent is not equal to entryFee");
        require(players.length < maxPlayers, "Game is full");
        players.push(msg.sender);
        emit PlayerJoined(gameId, msg.sender);
        if(players.length == maxPlayers) {
            getRandomWinner();
        }
    }

    function fulfillRandomness(bytes32 requestId, uint randomness) internal override {
        uint256 winnerIndex = randomness % players.length;
        address winner = players[winnerIndex];
        (bool sent,) = winner.call{value: address(this).balance}("");
        require(sent, "Failed to send Ether");
        emit GameEnded(gameId, winner,requestId);
        gameStarted = false;
    }

    function getBalance() public view returns (uint) {
        return address(this).balance;
    }


    function enter() public payable {
        require(msg.value >=  .01 ether, "Didn't pay enough ether!");
        players.push(payable(msg.sender));
    }

//    function getRandomNumber() public view returns (uint) {
//        return uint(keccak256(abi.encodePacked(owner, block.timestamp))); // abi.encodePacker adds strings together (can't do s = s1 + s2)
//    }



}

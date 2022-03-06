// SPDX-Licence-Identifier: MIT

pragma solidity ^0.8.0;

contract Lottery {
    address public owner;
    address payable[] public players;
    uint public lotteryId;
    mapping (uint => address payable) public lotteryHistory;

    constructor() {
        owner = msg.sender;
        lotteryId = 1;
    }

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    function getBalance() public view returns (uint) {
        return address(this).balance;
    }

    function getPlayers() public view returns (address payable[] memory) {
        return players;
    }

    function getWinnerByLottery(uint lottery_id) public view returns(address payable) {
        return lotteryHistory[lottery_id];
    }

    function enter() public payable {
        require(msg.value >=  .01 ether, "Didn't pay enough ether!");
        players.push(payable(msg.sender));
    }

    function getRandomNumber() public view returns (uint) {
        return uint(keccak256(abi.encodePacked(owner, block.timestamp))); // abi.encodePacker adds strings together (can't do s = s1 + s2)
    }

    function pickWinner() public onlyOwner {
        uint index = getRandomNumber() % players.length;
        players[index].transfer(address(this).balance);
        lotteryHistory[lotteryId] = players[index];
        lotteryId += 1;
        players = new address payable[](0);
    }

}

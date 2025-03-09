// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {Types} from "./lib/Types.sol";
import {IRevenue} from "./interfaces/IRevenue.sol";

contract Revenue is IRevenue {
    mapping(address => Types.Revenue) private balances;

    constructor() {}

    function fund(address to) external payable override {
        require(msg.value > 0, "Must send some coin");

        balances[to].unClaimed += msg.value;

        emit Funded(to, msg.value);
    }

    function withdraw(uint256 amount) external override {
        require(
            amount <= balances[msg.sender].unClaimed,
            "Insufficient balance"
        );

        balances[msg.sender].unClaimed -= amount;
        balances[msg.sender].claimed += amount;

        payable(msg.sender).transfer(amount);

        emit Withdrawn(msg.sender, amount);
    }

    function balanceOf(
        address user
    ) external view override returns (Types.Revenue memory) {
        return balances[user];
    }
}

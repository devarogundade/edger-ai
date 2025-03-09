// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {Types} from "../lib/Types.sol";

interface IRevenue {
    event Funded(address indexed user, uint256 amount);

    event Withdrawn(address indexed user, uint256 amount);

    function fund(address to) external payable;

    function withdraw(uint256 amount) external;

    function balanceOf(
        address user
    ) external view returns (Types.Revenue memory);
}

// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {Enums} from "../lib/Enums.sol";
import {IPoolAdmin} from "./IPoolAdmin.sol";

interface IMultiTokenPool is IPoolAdmin {
    event TokensDeposited(address indexed lp, address token, uint256 amount);

    event TokensWithdrawn(
        address indexed lp,
        address[] tokens,
        uint256[] amounts
    );

    event TokensDonated(address indexed donor, address token, uint256 amount);

    function deposit(address token, uint256 amount) external;

    function depositETH(uint256 amount) external payable;

    function withdraw(uint256 lpAmount) external;

    function withdrawSingle(address tokenOut, uint256 lpAmount) external;

    function withdrawSingleETH(uint256 lpAmount) external;

    function donate(address token, uint256 amount) external;

    function donateETH(uint256 amount) external payable;

    function getTokens() external view returns (address[] memory);

    function getBalances() external view returns (uint256[] memory);

    function getSplitRatio() external view returns (uint256[] memory);

    function getDepositUsdMin() external view returns (uint256);

    function getAllowedActions()
        external
        view
        returns (Enums.ActionCall[] memory);
}

// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {Enums} from "../lib/Enums.sol";

interface IFactory {
    event StrategyCreated(
        address strategy,
        address creator,
        address[] tokens,
        uint256[] splitRatio,
        Enums.Visibility visibility,
        uint256 depositUsdMin,
        uint256 forkCost,
        Enums.ActionCall[] allowedActions
    );

    event StrategyForked(address base, address fork, address forker);

    function createStrategy(
        address[] memory tokens,
        uint256[] memory splitRatio,
        Enums.Visibility visibility,
        uint256 depositUsdMin,
        uint256 forkCost,
        Enums.ActionCall[] memory allowedActions
    ) external returns (address);

    function forkStrategy(address strategy) external payable returns (address);

    function getRevenueAddress() external view returns (address);

    function getSwapRouterAddress() external view returns (address);

    function getPriceOracleAddress() external view returns (address);

    function edger() external view returns (address);
}

// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {Enums} from "./lib/Enums.sol";
import {Strategy} from "./Strategy.sol";
import {IFactory} from "./interfaces/IFactory.sol";

contract Factory is IFactory {
    address internal _revenue;
    address internal _dataFeed;
    address internal _swapRouter;

    address internal constant EDGER =
        0x3E646e062F05e01e1860eA53a6DC81e7E9162DE6;

    constructor(address revenue_, address dataFeed_, address swapRouter_) {
        _revenue = revenue_;
        _dataFeed = dataFeed_;
        _swapRouter = swapRouter_;
    }

    function createStrategy(
        address[] memory tokens,
        uint256[] memory splitRatio,
        Enums.Visibility visibility,
        uint256 depositUsdMin,
        uint256 forkCost,
        Enums.ActionCall[] memory allowedActions
    ) external returns (address) {
        Strategy strategy = new Strategy(
            address(this),
            msg.sender,
            visibility,
            depositUsdMin,
            forkCost,
            tokens,
            splitRatio,
            allowedActions
        );

        emit StrategyCreated(
            address(strategy),
            msg.sender,
            tokens,
            splitRatio,
            visibility,
            depositUsdMin,
            forkCost,
            allowedActions
        );

        return address(strategy);
    }

    function forkStrategy(address strategy) external payable returns (address) {
        Strategy base = Strategy(payable(strategy));

        Strategy fork = new Strategy(
            address(this),
            msg.sender,
            Enums.Visibility.Private,
            base.getDepositUsdMin(),
            0, // forkCost
            base.getTokens(),
            base.getSplitRatio(),
            base.getAllowedActions()
        );

        base.onFork{value: msg.value}();

        emit StrategyForked(strategy, address(fork), msg.sender);

        return address(strategy);
    }

    function getRevenueAddress() external view override returns (address) {
        return _revenue;
    }

    function getSwapRouterAddress() external view override returns (address) {
        return _swapRouter;
    }

    function getPriceOracleAddress() external view override returns (address) {
        return _dataFeed;
    }

    function edger() external pure override returns (address) {
        return EDGER;
    }
}

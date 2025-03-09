// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {Enums} from "./lib/Enums.sol";
import {Types} from "./lib/Types.sol";
import {Params} from "./lib/Params.sol";
import {IStrategy} from "./interfaces/IStrategy.sol";
import {MultiTokenPool} from "./pool/MultiTokenPool.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IFactory} from "./interfaces/IFactory.sol";
import {IRevenue} from "./interfaces/IRevenue.sol";

contract Strategy is MultiTokenPool, IStrategy {
    uint256 internal _forkCost;
    Enums.Visibility internal _visibility;

    constructor(
        address factory_,
        address creator_,
        Enums.Visibility visibility_,
        uint256 depositUsdMin_,
        uint256 forkCost_,
        address[] memory initialTokens_,
        uint256[] memory initialSplitRatio_,
        Enums.ActionCall[] memory allowedActions_
    )
        MultiTokenPool(
            factory_,
            creator_,
            depositUsdMin_,
            initialTokens_,
            initialSplitRatio_,
            allowedActions_
        )
    {
        _visibility = visibility_;
        _forkCost = forkCost_;
    }

    function onFork() external payable override onlyFactor {
        require(_visibility == Enums.Visibility.Public, "Disallowed");
        require(_forkCost <= msg.value, "Insufficient fork cost");

        IRevenue(IFactory(_factory).getRevenueAddress()).fund{value: msg.value}(
            owner()
        );
    }

    function executeCall(
        Params.ExecuteCall memory call
    ) external override onlyEdger {
        require(_isAllowedAction(call.action), "Action not allowed");

        if (call.action == Enums.ActionCall.AdjustSplitRatio) {
            uint256[] memory ratio = abi.decode(call.data, (uint256[]));

            super._adjustSplitRatio(ratio);
        }

        if (call.action == Enums.ActionCall.SwapToSingle) {
            (address[] memory tokensIn, address tokenOut) = abi.decode(
                call.data,
                (address[], address)
            );

            super._swapToSingle(tokensIn, tokenOut);
        }

        if (call.action == Enums.ActionCall.SwapToMany) {
            (address tokenIn, address[] memory tokensOut) = abi.decode(
                call.data,
                (address, address[])
            );

            super._swapToMany(tokenIn, tokensOut);
        }

        emit ExecuteCalled(call);
    }

    ////////////////////////////////////////////////
    //// INTERNAL FUNCTIONS                     ////
    ////////////////////////////////////////////////

    function _isAllowedAction(
        Enums.ActionCall action
    ) internal view returns (bool allowed) {
        allowed = false;

        for (uint i = 0; i < _allowedActions.length; i++) {
            if (_allowedActions[i] == action) {
                allowed = true;
                break;
            }
        }
    }

    ////////////////////////////////////////////////
    //// VIEW FUNCTIONS                         ////
    ////////////////////////////////////////////////

    function creator() external view override returns (address) {
        return owner();
    }

    function factory() external view override returns (address) {
        return _factory;
    }

    function getForkCost() external view override returns (uint256) {
        return _forkCost;
    }

    ////////////////////////////////////////////////
    //// MODIFIERS                              ////
    ////////////////////////////////////////////////

    modifier onlyFactor() {
        require(msg.sender == _factory, "Only factory is allowed");
        _;
    }

    modifier onlyEdger() {
        require(
            msg.sender == IFactory(_factory).edger(),
            "Only edger is allowed"
        );
        _;
    }
}

// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {IChainlink} from "../interfaces/IChainlink.sol";
import {IPriceOracle} from "../interfaces/IPriceOracle.sol";

contract PriceOracle is IPriceOracle {
    IChainlink internal immutable _chainlink;

    constructor(IChainlink chainlink) {
        _chainlink = chainlink;
    }

    function getAmountOutInUsd(
        uint256 amountIn,
        address tokenIn
    ) public view override returns (uint256 amountOut) {
        (uint256 price, uint80 decimal) = _chainlink.getPrice(tokenIn);

        amountOut = (price * amountIn) / (10 ** decimal);
    }

    function getAmountsOutInUsd(
        uint256[] memory amountIns,
        address[] memory tokenIns
    ) public view override returns (uint256 amountOut) {
        require(amountIns.length == tokenIns.length, "Mismatched arrays");
        for (uint256 i = 0; i < amountIns.length; i++) {
            amountOut += getAmountOutInUsd(amountIns[i], tokenIns[i]);
        }
    }

    function getAmountOut(
        uint256 amountIn,
        address tokenIn,
        address tokenOut
    ) public view override returns (uint256 amountOut) {
        if (tokenIn == tokenOut) return amountIn;

        (uint256 basePrice, uint80 baseDecimal) = _chainlink.getPrice(tokenIn);
        (uint256 quotePrice, uint80 quoteDecimal) = _chainlink.getPrice(
            tokenOut
        );

        amountOut =
            (basePrice * amountIn * (10 ** quoteDecimal)) /
            (quotePrice * (10 ** baseDecimal));
    }

    function getAmountsOut(
        uint256[] memory amountIns,
        address[] memory tokenIns,
        address tokenOut
    ) public view override returns (uint256 amountOut) {
        require(amountIns.length == tokenIns.length, "Mismatched arrays");
        for (uint256 i = 0; i < amountIns.length; i++) {
            amountOut += getAmountOut(amountIns[i], tokenIns[i], tokenOut);
        }
    }
}

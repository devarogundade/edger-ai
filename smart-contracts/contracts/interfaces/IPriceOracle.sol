// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

interface IPriceOracle {
    function getAmountOutInUsd(
        uint256 amountIn,
        address tokenIn
    ) external view returns (uint256 amountOut);

    function getAmountsOutInUsd(
        uint256[] memory amountIns,
        address[] memory tokenIns
    ) external view returns (uint256 amountOut);

    function getAmountOut(
        uint256 amountIn,
        address tokenIn,
        address tokenOut
    ) external view returns (uint256 amountOut);

    function getAmountsOut(
        uint256[] memory amountIns,
        address[] memory tokenIns,
        address tokenOut
    ) external view returns (uint256 amountOut);
}

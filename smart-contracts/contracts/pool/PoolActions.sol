// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {Enums} from "../lib/Enums.sol";
import {IWETH} from "../interfaces/IWETH.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IUniswapV2Router02} from "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";

abstract contract PoolActions {
    IUniswapV2Router02 internal immutable _swapRouter;
    address internal immutable _factory;

    uint256 internal _depositUsdMin;

    uint256[] internal _splitRatio;
    address[] internal _underlyingTokens;

    Enums.ActionCall[] internal _allowedActions;

    mapping(address => bool) internal _isUnderlyingToken;

    uint256 constant DIVISOR = 10_000;
    address constant SONIC_COIN = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;

    function _swapToSingle(
        address[] memory tokensIn,
        address tokenOut
    ) internal {
        require(_isUnderlyingToken[tokenOut], "Invalid token");

        for (uint256 i = 0; i < tokensIn.length; i++) {
            address tokenIn = tokensIn[i];
            uint256 amountIn = getBalance(tokenIn);

            if (amountIn == 0) continue;

            address[] memory path = new address[](2);

            path[0] = tokenIn == SONIC_COIN ? _swapRouter.WETH() : tokenIn;
            path[1] = tokenOut == SONIC_COIN ? _swapRouter.WETH() : tokenOut;

            if (tokenIn == tokenOut) {
                continue;
            } else if (tokenIn == SONIC_COIN) {
                _swapRouter.swapExactETHForTokens{value: amountIn}(
                    0, // amountOutMin
                    path,
                    address(this),
                    block.timestamp + 1
                );
            } else {
                IERC20(tokenIn).approve(address(_swapRouter), amountIn);

                _swapRouter.swapExactTokensForTokens(
                    amountIn,
                    0, // amountOutMin
                    path,
                    address(this),
                    block.timestamp + 1
                );
            }
        }

        if (IERC20(_swapRouter.WETH()).balanceOf(address(this)) > 0) {
            IWETH(_swapRouter.WETH()).withdraw(
                IERC20(_swapRouter.WETH()).balanceOf(address(this))
            );
        }
    }

    function _swapToMany(address tokenIn, address[] memory tokensOut) internal {
        require(_isUnderlyingToken[tokenIn], "Invalid token");

        uint256 amountIns = tokenIn == SONIC_COIN
            ? address(this).balance
            : IERC20(tokenIn).balanceOf(address(this));

        if (amountIns == 0) return;

        uint256 amountIn = (amountIns / tokensOut.length);

        for (uint256 i = 0; i < tokensOut.length; i++) {
            address tokenOut = tokensOut[i];
            require(_isUnderlyingToken[tokenOut], "Invalid token");

            address[] memory path = new address[](2);

            path[0] = tokenIn == SONIC_COIN ? _swapRouter.WETH() : tokenIn;
            path[1] = tokenOut == SONIC_COIN ? _swapRouter.WETH() : tokenOut;

            if (tokenIn == tokenOut) {
                continue;
            } else if (tokenIn == SONIC_COIN) {
                _swapRouter.swapExactETHForTokens{value: amountIn}(
                    0, // amountOutMin
                    path,
                    address(this),
                    block.timestamp + 1
                );
            } else {
                IERC20(tokenIn).approve(address(_swapRouter), amountIn);

                _swapRouter.swapExactTokensForTokens(
                    amountIn,
                    0, // amountOutMin
                    path,
                    address(this),
                    block.timestamp + 1
                );
            }
        }

        if (IERC20(_swapRouter.WETH()).balanceOf(address(this)) > 0) {
            IWETH(_swapRouter.WETH()).withdraw(
                IERC20(_swapRouter.WETH()).balanceOf(address(this))
            );
        }
    }

    function _adjustSplitRatio(uint256[] memory newRatios) internal {
        require(newRatios.length == _underlyingTokens.length, "Invalid length");

        uint256 totalRatio = 0;
        for (uint256 i = 0; i < newRatios.length; i++) {
            totalRatio += newRatios[i];
        }

        require(totalRatio == DIVISOR, "Invalid ratio sum");

        _splitRatio = newRatios;
    }

    function getBalance(address token) internal view returns (uint256) {
        return
            token == SONIC_COIN
                ? address(this).balance
                : IERC20(token).balanceOf(address(this));
    }
}

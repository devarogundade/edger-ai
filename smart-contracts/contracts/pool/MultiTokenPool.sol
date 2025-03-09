// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {Enums} from "../lib/Enums.sol";
import {IFactory} from "../interfaces/IFactory.sol";
import {IPriceOracle} from "../interfaces/IPriceOracle.sol";
import {IMultiTokenPool} from "../interfaces/IMultiTokenPool.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IUniswapV2Router02} from "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";

import {PoolActions} from "./PoolActions.sol";

contract MultiTokenPool is ERC20, PoolActions, IMultiTokenPool, Ownable {
    constructor(
        address factory_,
        address creator_,
        uint256 depositUsdMin_,
        address[] memory initialTokens_,
        uint256[] memory initialSplitRatio_,
        Enums.ActionCall[] memory allowedActions_
    ) ERC20("LPToken", "LP") Ownable(creator_) {
        require(
            initialTokens_.length == initialSplitRatio_.length,
            "Mismatched arrays"
        );

        _factory = factory_;

        address swapRouter = IFactory(_factory).getSwapRouterAddress();
        _swapRouter = IUniswapV2Router02(swapRouter);

        _depositUsdMin = depositUsdMin_;

        _underlyingTokens = initialTokens_;
        _splitRatio = initialSplitRatio_;

        _allowedActions = allowedActions_;

        uint256 totalRatio = 0;
        for (uint256 i = 0; i < initialSplitRatio_.length; i++) {
            totalRatio += initialSplitRatio_[i];
            _isUnderlyingToken[initialTokens_[i]] = true;
        }

        require(totalRatio == DIVISOR, "Invalid ratio sum");
    }

    ////////////////////////////////////////////////
    //// POOL FUNCTIONS                         ////
    ////////////////////////////////////////////////

    function deposit(
        address token,
        uint256 amount
    ) external override onlyOwner {
        require(_isUnderlyingToken[token], "ETH not supported");

        address priceOracle = IFactory(_factory).getPriceOracleAddress();
        uint256 amountUsd = IPriceOracle(priceOracle).getAmountOutInUsd(
            amount,
            token
        );

        require(
            amountUsd >= _depositUsdMin,
            "Insufficient deposit amount in usd"
        );

        IERC20(token).transferFrom(msg.sender, address(this), amount);

        _mint(msg.sender, amountUsd);

        emit TokensDeposited(msg.sender, token, amount);
    }

    function depositETH(uint256 amount) external payable override onlyOwner {
        require(msg.value == amount, "Incorrect ETH amount");
        require(_isUnderlyingToken[SONIC_COIN], "ETH not supported");

        address priceOracle = IFactory(_factory).getPriceOracleAddress();

        uint256 amountUsd = IPriceOracle(priceOracle).getAmountOutInUsd(
            amount,
            SONIC_COIN
        );

        require(
            amountUsd >= _depositUsdMin,
            "Insufficient deposit amount in usd"
        );

        _mint(msg.sender, amountUsd);

        emit TokensDeposited(msg.sender, SONIC_COIN, amount);
    }

    function withdraw(uint256 lpAmount) external override {
        require(lpAmount > 0, "Invalid amount");

        uint256 totalSupply = totalSupply();
        require(totalSupply > 0, "No liquidity");

        for (uint256 i = 0; i < _underlyingTokens.length; i++) {
            address tokenOut = _underlyingTokens[i];
            uint256 amountOut = (getBalance(tokenOut) * lpAmount) / totalSupply;

            if (tokenOut == SONIC_COIN) {
                (bool _success, ) = payable(msg.sender).call{value: amountOut}(
                    ""
                );

                require(_success, "ETH transfer failed");
            } else {
                IERC20(tokenOut).transfer(msg.sender, amountOut);
            }
        }

        _burn(msg.sender, lpAmount);
    }

    function withdrawSingle(address token, uint256 lpAmount) external override {
        _withdrawSingle(token, lpAmount);
    }

    function withdrawSingleETH(uint256 lpAmount) external override {
        _withdrawSingle(SONIC_COIN, lpAmount);
    }

    function _withdrawSingle(address tokenOut, uint256 lpAmount) internal {
        require(lpAmount > 0, "Invalid amount");
        require(_isUnderlyingToken[tokenOut], "Invalid token");

        uint256 totalSupply = totalSupply();
        require(totalSupply > 0, "No liquidity");

        for (uint256 i = 0; i < _underlyingTokens.length; i++) {
            address tokenIn = _underlyingTokens[i];
            uint256 amountIn = (getBalance(tokenIn) * lpAmount) / totalSupply;

            address[] memory path = new address[](2);

            path[0] = tokenIn == SONIC_COIN ? _swapRouter.WETH() : tokenIn;
            path[1] = tokenOut == SONIC_COIN ? _swapRouter.WETH() : tokenOut;

            if (tokenIn == tokenOut && tokenOut == SONIC_COIN) {
                (bool _success, ) = payable(msg.sender).call{value: amountIn}(
                    ""
                );

                require(_success, "ETH transfer failed");
            } else if (tokenIn == tokenOut) {
                IERC20(tokenIn).transfer(msg.sender, amountIn);
            } else if (tokenIn == SONIC_COIN) {
                _swapRouter.swapExactETHForTokens{value: amountIn}(
                    0, // amountOutMin
                    path,
                    msg.sender,
                    block.timestamp + 1
                );
            } else {
                IERC20(tokenIn).approve(address(_swapRouter), amountIn);

                _swapRouter.swapExactTokensForTokens(
                    amountIn,
                    0, // amountOutMin
                    path,
                    msg.sender,
                    block.timestamp + 1
                );
            }
        }

        _burn(msg.sender, lpAmount);
    }

    function donate(address token, uint256 amount) external override {
        require(_isUnderlyingToken[token], "Invalid token");
        IERC20(token).transferFrom(msg.sender, address(this), amount);

        emit TokensDonated(msg.sender, token, amount);
    }

    function donateETH(uint256 amount) external payable override {
        require(_isUnderlyingToken[SONIC_COIN], "ETH not supported");
        require(msg.value == amount, "Incorrect ETH amount");

        emit TokensDonated(msg.sender, SONIC_COIN, amount);
    }

    ////////////////////////////////////////////////
    //// VIEW FUNCTIONS                         ////
    ////////////////////////////////////////////////

    // Get the list of underlying tokens in the pool
    function getTokens() external view override returns (address[] memory) {
        return _underlyingTokens;
    }

    // Get the balances of all underlying tokens in the pool
    function getBalances() external view override returns (uint256[] memory) {
        uint256[] memory balances = new uint256[](_underlyingTokens.length);
        for (uint256 i = 0; i < _underlyingTokens.length; i++) {
            balances[i] = getBalance(_underlyingTokens[i]);
        }
        return balances;
    }

    function getSplitRatio() external view override returns (uint256[] memory) {
        return _splitRatio;
    }

    function getDepositUsdMin() external view override returns (uint256) {
        return _depositUsdMin;
    }

    function getAllowedActions()
        external
        view
        override
        returns (Enums.ActionCall[] memory)
    {
        return _allowedActions;
    }

    ////////////////////////////////////////////////
    //// ADMIN FUNCTIONS                        ////
    ////////////////////////////////////////////////

    function addToken(
        address token,
        uint256 ratio
    ) external override onlyOwner {
        require(!_isUnderlyingToken[token], "Token exists");

        _underlyingTokens.push(token);
        _splitRatio.push(ratio);

        _isUnderlyingToken[token] = true;
    }

    function removeToken(address token) external override onlyOwner {
        require(_isUnderlyingToken[token], "Token not found");
        require(
            IERC20(token).balanceOf(address(this)) == 0,
            "Non-zero balance"
        );

        for (uint256 i = 0; i < _underlyingTokens.length; i++) {
            if (_underlyingTokens[i] == token) {
                _underlyingTokens[i] = _underlyingTokens[
                    _underlyingTokens.length - 1
                ];
                _underlyingTokens.pop();
                _splitRatio[i] = _splitRatio[_splitRatio.length - 1];
                _splitRatio.pop();
                _isUnderlyingToken[token] = false;
                break;
            }
        }
    }
}

// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

interface IPoolAdmin {
    function addToken(address token, uint256 ratio) external;

    function removeToken(address token) external;
}

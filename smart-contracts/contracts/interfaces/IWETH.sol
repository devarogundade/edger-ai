// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

interface IWETH {
    function depositFor(address account) external payable returns (bool);

    function withdrawTo(address account, uint256 value) external returns (bool);

    function deposit() external payable;

    function withdraw(uint value) external;
}

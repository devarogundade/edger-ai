// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {Enums} from "../lib/Enums.sol";
import {Params} from "../lib/Params.sol";

interface IStrategy {
    event ExecuteCalled(Params.ExecuteCall call);

    function onFork() external payable;

    function executeCall(Params.ExecuteCall memory call) external;

    function creator() external view returns (address);

    function factory() external view returns (address);

    function getForkCost() external view returns (uint256);
}

// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {Enums} from "./Enums.sol";

library Params {
    struct ExecuteCall {
        Enums.ActionCall action;
        bytes data;
    }
}

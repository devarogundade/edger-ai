// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

library Enums {
    enum Visibility {
        Public,
        Private
    }

    enum ActionCall {
        AdjustSplitRatio,
        SwapToSingle,
        SwapToMany,
        None
        // SupplyToAave,
        // BorrowFromAave,
        // BridgeToken
    }
}

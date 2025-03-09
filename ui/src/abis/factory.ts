export const factoryAbi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "revenue_",
        type: "address",
      },
      {
        internalType: "address",
        name: "priceOracle_",
        type: "address",
      },
      {
        internalType: "address",
        name: "swapRouter_",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "strategy",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "creator",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address[]",
        name: "tokens",
        type: "address[]",
      },
      {
        indexed: false,
        internalType: "uint256[]",
        name: "splitRatio",
        type: "uint256[]",
      },
      {
        indexed: false,
        internalType: "enum Enums.Visibility",
        name: "visibility",
        type: "uint8",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "depositUsdMin",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "forkCost",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "enum Enums.ActionCall[]",
        name: "allowedActions",
        type: "uint8[]",
      },
    ],
    name: "StrategyCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "base",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "fork",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "forker",
        type: "address",
      },
    ],
    name: "StrategyForked",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address[]",
        name: "tokens",
        type: "address[]",
      },
      {
        internalType: "uint256[]",
        name: "splitRatio",
        type: "uint256[]",
      },
      {
        internalType: "enum Enums.Visibility",
        name: "visibility",
        type: "uint8",
      },
      {
        internalType: "uint256",
        name: "depositUsdMin",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "forkCost",
        type: "uint256",
      },
      {
        internalType: "enum Enums.ActionCall[]",
        name: "allowedActions",
        type: "uint8[]",
      },
    ],
    name: "createStrategy",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "strategy",
        type: "address",
      },
    ],
    name: "forkStrategy",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "getPriceOracleAddress",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getRevenueAddress",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getSwapRouterAddress",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];
